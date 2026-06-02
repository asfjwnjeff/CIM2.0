const fs = require('fs');
const data = JSON.parse(fs.readFileSync('scripts/gen-output.json', 'utf8'));

// ======== 1. Update sample-data.ts ========
let sample = fs.readFileSync('src/lib/sample-data.ts', 'utf8');

// initialBillingEntities
const beStart = sample.indexOf('export const initialBillingEntities');
const beEnd = sample.indexOf('];', beStart) + 2;
const beLines = data.entities.map(e =>
  "  { id: '" + e.id + "', name: '" + e.name + "', code: '" + e.code + "', status: '" + e.status + "', createdAt: '" + e.createdAt + "' },"
);
sample = sample.substring(0, beStart) + 'export const initialBillingEntities: BillingEntity[] = [\n' + beLines.join('\n') + '\n];' + sample.substring(beEnd);

// initialBillingRules
const brStart = sample.indexOf('export const initialBillingRules');
const brEnd = sample.indexOf('];', brStart) + 2;
const brLines = data.rules.map(r => {
  const itemLines = r.conditionGroup.items.map(item => {
    const cond = item.condition;
    return "        { id: '" + item.id + "', type: '" + item.type + "', condition: { field: '" + cond.field + "', operator: '" + cond.operator + "', value: '" + cond.value + "' } },";
  }).join('\n');
  return "  {\n" +
    "    id: '" + r.id + "',\n" +
    "    name: '" + r.name + "',\n" +
    "    customerId: '" + r.customerId + "',\n" +
    "    customerName: '" + r.customerName + "',\n" +
    "    targetBillingEntity: '" + r.targetBillingEntity + "',\n" +
    "    priority: " + r.priority + ",\n" +
    "    status: '" + r.status + "',\n" +
    "    conditionGroup: {\n" +
    "      id: '" + r.conditionGroup.id + "',\n" +
    "      logic: '" + r.conditionGroup.logic + "',\n" +
    "      items: [\n" + itemLines + "\n      ] as any[],\n" +
    "    },\n" +
    "    createdAt: '" + r.createdAt + "',\n" +
    "  },"
});
sample = sample.substring(0, brStart) + 'export const initialBillingRules: BillingRule[] = [\n' + brLines.join('\n') + '\n];' + sample.substring(brEnd);

fs.writeFileSync('src/lib/sample-data.ts', sample);
console.log('sample-data.ts updated: ' + data.entities.length + ' entities, ' + data.rules.length + ' rules');

// ======== 2. Update customer-billing-fields/page.tsx ========
let bf = fs.readFileSync('src/app/customer-billing-fields/page.tsx', 'utf8');

const cfStart = bf.indexOf('const initialCustomerFields');
const cfEnd = bf.indexOf('];', cfStart) + 2;
const cfLines = data.fields.map(f => {
  const opts = f[4].map(o => "'" + String(o).replace(/'/g, "\'") + "'").join(', ');
  return "  { id: 'cbf-" + f[0] + "', customerId: '" + f[1] + "', customerName: '" + f[2] + "', name: '" + f[3] + "', options: [" + opts + "], createdAt: Date.now() - 86400000 * 5, updatedAt: Date.now() - 86400000 },"
});
bf = bf.substring(0, cfStart) + 'const initialCustomerFields: CustomerBillingField[] = [\n' + cfLines.join('\n') + '\n];' + bf.substring(cfEnd);

fs.writeFileSync('src/app/customer-billing-fields/page.tsx', bf);
console.log('customer-billing-fields/page.tsx updated: ' + data.fields.length + ' fields');
