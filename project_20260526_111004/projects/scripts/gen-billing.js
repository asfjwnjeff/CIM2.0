const XLSX = require('xlsx');
const fs = require('fs');
const wb = XLSX.readFile('d:/金融组文件/CIM2.0/账单拆分规则.xlsx');
const data = XLSX.utils.sheet_to_json(wb.Sheets['拆分账单'], {header: 1});
const rows = data.slice(2).filter(r => r[0] || r[1]);

const customerMap = {};
rows.forEach(r => {
  const abbr = String(r[0]||'').trim();
  const f1 = r[2] ? String(r[2]).trim() : '';
  const f2 = r[3] ? String(r[3]).trim() : '';
  const f3 = r[4] ? String(r[4]).trim() : '';
  const output = String(r[5]||'').trim();
  if (!abbr) return;
  if (!customerMap[abbr]) customerMap[abbr] = { rules: [], dnSet: new Set(), plantSet: new Set(), locSet: new Set(), outputs: new Set() };
  const c = customerMap[abbr];
  if (f1) c.dnSet.add(f1); 
  if (f2) c.plantSet.add(String(f2).trim());
  // Location: only keep numeric values (0002, 0004), NOT natural language
  if (f3 && /^\d+$/.test(String(f3).trim())) c.locSet.add(String(f3).trim());
  if (output) c.outputs.add(output);
  c.rules.push({f1,f2,f3,output});
});

// Clean DN: only keep '有值' and '空', use for rule operators
// For field config: DN has no options (uses is_empty/not_empty)

const fieldConfig = {
  AMTS: { f1: 'DN', f2: 'Plant', f3: 'Location' },
  FEIS: { f1: '客户部门' }, EBARA: { f1: '客户部门' },
  SUSS: { f1: '客户部门' }, CTPT: { f1: '客户部门' },
  HLJC: { f1: '货物属性' }, DJQY: { f1: '货物属性' },
};
const custIdMap = {
  AMTS: ['cust-001','应用材料（中国）有限公司'],
  FEIS: ['cust-002','飞雅贸易（上海）有限公司'],
  EBARA: ['cust-008','上海荏原精密机械有限公司'],
  SUSS: ['cust-005','苏斯贸易（上海）有限公司'],
  CTPT: ['cust-006','昇先创科技(上海)有限公司'],
  HLJC: ['cust-007','上海华力集成电路制造有限公司'],
  DJQY: ['cust-009','岛津企业管理（中国）有限公司'],
};

// ===== Entities =====
const allOutputs = new Set();
Object.values(customerMap).forEach(c => c.outputs.forEach(o => allOutputs.add(o)));
const entities = Array.from(allOutputs).map((name, idx) => ({
  id: 'be-' + (30 + idx), name, code: name.substring(0, 10), status: 'active', createdAt: '2026-05-15T08:00:00Z',
}));

// ===== Field values =====
let fid = 100;
const fields = [];
Object.entries(custIdMap).forEach(([abbr, cust]) => {
  const c = customerMap[abbr]; if (!c) return;
  const cfg = fieldConfig[abbr]; if (!cfg) return;
  const [custId, custName] = cust;
  // DN field: NO options (uses is_empty/not_empty in rules)
  if (cfg.f1 === 'DN') {
    fields.push([fid++, custId, custName, 'DN', []]);
  } else {
    const vals = Array.from(c.dnSet).filter(v => v && !/^(有值|空|非|任意|或|且)/.test(v));
    fields.push([fid++, custId, custName, cfg.f1, vals]);
  }
  // Plant: actual codes
  if (cfg.f2) fields.push([fid++, custId, custName, cfg.f2, Array.from(c.plantSet)]);
  // Location: only numeric values (0002, 0004)
  if (cfg.f3) fields.push([fid++, custId, custName, cfg.f3, Array.from(c.locSet)]);
  // 账单主体
  fields.push([fid++, custId, custName, '账单主体', Array.from(c.outputs)]);
});

// ===== Rules with proper operators and items structure =====
let rid = 0;
const rules = [];

// Helper: determine operator from Excel value text
function getOperator(fieldName, excelValue) {
  if (!excelValue || excelValue === '') return ['is_empty', ''];
  if (excelValue === '有值') return ['not_empty', ''];
  if (excelValue.includes('非') && excelValue.includes('且')) {
    // "非0002 且 非0004" -> not_in_list
    const val = excelValue.replace(/非/g,'').replace(/且/g,',').replace(/\s/g,'');
    return ['not_in_list', val];
  }
  if (excelValue.includes('或')) {
    const val = excelValue.replace(/或/g,',').replace(/\s/g,'');
    return ['in_list', val];
  }
  if (excelValue.includes('任意') || excelValue.includes('不为空')) {
    return ['not_empty', ''];
  }
  // Plain value: equals
  return ['equals', excelValue];
}

Object.entries(custIdMap).forEach(([abbr, cust]) => {
  const c = customerMap[abbr]; if (!c) return;
  const cfg = fieldConfig[abbr]; if (!cfg) return;
  const [custId, custName] = cust;
  const byOutput = {};
  c.rules.forEach(r => { if (!byOutput[r.output]) byOutput[r.output] = []; byOutput[r.output].push(r); });

  Object.entries(byOutput).forEach(([output, ruleList]) => {
    rid++;
    const items = [];
    let ciId = 0;
    const rule = ruleList[0]; // Use first rule as representative

    // Add conditions based on field config
    if (cfg.f1) {
      ciId++;
      const [op, val] = getOperator(cfg.f1, rule.f1);
      items.push({ id: 'ci-' + String(rid).padStart(3,'0') + '-' + ciId, type: 'condition', condition: { field: cfg.f1, operator: op, value: val } });
    }
    if (cfg.f2 && rule.f2) {
      // Group same f2 values
      const f2Vals = new Set(ruleList.map(r => r.f2).filter(Boolean));
      ciId++;
      if (f2Vals.size === 1) {
        items.push({ id: 'ci-' + String(rid).padStart(3,'0') + '-' + ciId, type: 'condition', condition: { field: cfg.f2, operator: 'equals', value: Array.from(f2Vals)[0] } });
      } else {
        items.push({ id: 'ci-' + String(rid).padStart(3,'0') + '-' + ciId, type: 'condition', condition: { field: cfg.f2, operator: 'in_list', value: Array.from(f2Vals).join(',') } });
      }
    }
    if (cfg.f3 && rule.f3) {
      ciId++;
      const [op, val] = getOperator(cfg.f3, rule.f3);
      items.push({ id: 'ci-' + String(rid).padStart(3,'0') + '-' + ciId, type: 'condition', condition: { field: cfg.f3, operator: op, value: val } });
    }

    rules.push({
      id: 'rule-' + String(rid).padStart(3,'0'),
      name: custName + '-' + output,
      customerId: custId, customerName: custName,
      targetBillingEntity: output,
      priority: rid + 10, status: 'active',
      conditionGroup: { id: 'cg-' + String(rid).padStart(3,'0'), logic: 'AND', items },
      createdAt: '2026-06-02T08:00:00Z', createdBy: 'system',
    });
  });
});

console.log('Entities:', entities.length, 'Fields:', fields.length, 'Rules:', rules.length);
fs.writeFileSync('scripts/gen-output.json', JSON.stringify({entities, fields, rules}, null, 2));
console.log('Written to scripts/gen-output.json');
