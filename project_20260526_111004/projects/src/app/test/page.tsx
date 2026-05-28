'use client';

import React, { useState } from 'react';
import { useApp, BillingRule, BillingEntity, RuleGroup } from '@/lib/store';

interface MatchResult {
  matched: boolean;
  matchedRule: BillingRule | null;
  targetEntity: BillingEntity | null;
  process: Array<{
    ruleName: string;
    conditionIndex: number;
    field: string;
    operator: string;
    expected: string;
    actual: string;
    passed: boolean;
  }>;
}

// 操作符标签映射
const operatorLabels: Record<string, string> = {
  equals: '等于',
  not_equals: '不等于',
  contains: '包含',
  not_contains: '不包含',
  in: '在列表中',
  not_in: '不在列表中',
  any: '任意值',
  empty: '为空',
  not_empty: '不为空',
};

export default function TestPage() {
  const { customers, splitFields, billingRules, billingEntities } = useApp();
  
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [testParams, setTestParams] = useState<Record<string, string>>({});
  const [testResult, setTestResult] = useState<MatchResult | null>(null);
  const [matchProcess, setMatchProcess] = useState<Array<{
    ruleName: string;
    conditions: Array<{ field: string; operator: string; value: string; actual: string; passed: boolean }>;
    result: boolean;
  }>>([]);

  // 获取当前客户的规则
  const customerRules = billingRules.filter(r => r.customerId === selectedCustomerId);

  // 评估单个条件
  const evaluateCondition = (
    operator: string,
    expectedValues: string[],
    actualValue: string
  ): boolean => {
    const actual = actualValue || '';
    
    switch (operator) {
      case 'equals':
        return actual === expectedValues[0];
      case 'not_equals':
        return actual !== expectedValues[0];
      case 'contains':
        return actual.includes(expectedValues[0]);
      case 'not_contains':
        return !actual.includes(expectedValues[0]);
      case 'in':
        return expectedValues.includes(actual);
      case 'not_in':
        return !expectedValues.includes(actual);
      case 'any':
        return true;
      case 'empty':
        return actual === '';
      case 'not_empty':
        return actual !== '';
      default:
        return false;
    }
  };

  // 评估分组（递归）
  const evaluateGroup = (group: RuleGroup, params: Record<string, string>): { passed: boolean; details: Array<{ type: 'condition' | 'group'; name: string; passed: boolean }> } => {
    const details: Array<{ type: 'condition' | 'group'; name: string; passed: boolean }> = [];
    let passed = true;

    for (const item of (group.items || [])) {
      if (item.type === 'group' && item.group) {
        // 子分组
        const childResult = evaluateGroup(item.group, params);
        details.push({ type: 'group', name: `(${item.group.logic})`, passed: childResult.passed });
        if (item.group.logic === 'AND') {
          passed = passed && childResult.passed;
        } else {
          passed = passed || childResult.passed;
        }
      } else if (item.condition) {
        // 单个条件
        const fieldKey = item.condition.fieldKey || item.condition.field || '';
        const actualValue = params[fieldKey] || '';
        const expectedValues = item.condition.value.split(',').map(v => v.trim());
        const condPassed = evaluateCondition(item.condition.operator, expectedValues, actualValue);
        details.push({ type: 'condition', name: `${fieldKey} ${item.condition.operator} ${item.condition.value}`, passed: condPassed });
        if (group.logic === 'AND') {
          passed = passed && condPassed;
        } else {
          passed = passed || condPassed;
        }
      }
    }

    return { passed, details };
  };

  // 执行匹配测试
  const handleTest = () => {
    const process: MatchResult['process'] = [];
    const ruleProcess: Array<{
      ruleName: string;
      conditions: Array<{ field: string; operator: string; value: string; actual: string; passed: boolean }>;
      result: boolean;
    }> = [];

    // 按顺序测试每条规则
    for (const rule of customerRules) {
      if (rule.status !== 'active') continue;

      const ruleConditions: Array<{ field: string; operator: string; value: string; actual: string; passed: boolean }> = [];
      const result = evaluateGroup(rule.conditionGroup || { logic: 'AND', items: [] }, testParams);
      let allPassed = result.passed;

      // 扁平化条件详情用于显示
      const flattenDetails = (group: RuleGroup, params: Record<string, string>) => {
        for (const item of (group.items || [])) {
          if (item.type === 'group' && item.group) {
            flattenDetails(item.group, params);
          } else if (item.condition) {
            const fieldKey = item.condition.fieldKey || item.condition.field || '';
            const actualValue = params[fieldKey] || '';
            const expectedValues = item.condition.value.split(',').map(v => v.trim());
            const condPassed = evaluateCondition(item.condition.operator, expectedValues, actualValue);
            ruleConditions.push({
              field: fieldKey,
              operator: item.condition.operator,
              value: item.condition.value,
              actual: actualValue,
              passed: condPassed,
            });
          }
        }
      };
      flattenDetails(rule.conditionGroup || { logic: 'AND', items: [] }, testParams);

      ruleProcess.push({
        ruleName: rule.name,
        conditions: ruleConditions,
        result: allPassed,
      });

      // 找到匹配的规则
      if (allPassed) {
        const targetEntity = billingEntities.find(e => e.id === rule.targetBillingEntity || e.name === rule.targetBillingEntity);
        setTestResult({
          matched: true,
          matchedRule: rule,
          targetEntity: targetEntity || null,
          process,
        });
        setMatchProcess(ruleProcess);
        return;
      }
    }

    // 没有匹配
    setTestResult({
      matched: false,
      matchedRule: null,
      targetEntity: null,
      process,
    });
    setMatchProcess(ruleProcess);
  };

  // 重置测试
  const handleReset = () => {
    setTestParams({});
    setTestResult(null);
    setMatchProcess([]);
  };

  // 处理参数变化
  const handleParamChange = (fieldKey: string, value: string) => {
    setTestParams(prev => ({ ...prev, [fieldKey]: value }));
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* 页面标题 */}
      <div>
        <h1 className="text-2xl font-bold text-[#0A0A0A]">规则匹配测试</h1>
        <p className="text-gray-500 mt-1">测试账单主体规则匹配效果</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 左侧：参数输入 */}
        <div className="max-w-7xl mx-auto space-y-6">
          {/* 选择客户 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-[#0A0A0A] mb-4">1. 选择客户</h2>
            <select
              value={selectedCustomerId}
              onChange={(e) => {
                setSelectedCustomerId(e.target.value);
                setTestParams({});
                setTestResult(null);
                setMatchProcess([]);
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">请选择客户</option>
              {customers.map(customer => (
                <option key={customer.id} value={customer.id}>
                  {customer.name}
                </option>
              ))}
            </select>
            
            {selectedCustomerId && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  该客户共有 <strong>{customerRules.length}</strong> 条规则
                </p>
              </div>
            )}
          </div>

          {/* 输入测试参数 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-[#0A0A0A] mb-4">2. 输入测试参数</h2>
            
            {!selectedCustomerId ? (
              <p className="text-gray-500 text-center py-8">请先选择客户</p>
            ) : (
              <div className="space-y-4">
                {splitFields.map(field => {
                  const key = field.fieldKey || field.id;
                  return (
                  <div key={key}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {field.name}
                    </label>
                    {field.type === 'text' ? (
                      <input
                        type="text"
                        value={testParams[key] || ''}
                        onChange={(e) => handleParamChange(key, e.target.value)}
                        placeholder={`输入${field.name}`}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    ) : (
                      <select
                        value={testParams[key] || ''}
                        onChange={(e) => handleParamChange(key, e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">请选择{field.name}</option>
                        {field.options?.map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    )}
                  </div>
                );
                })}
              </div>
            )}

            {/* 操作按钮 */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleTest}
                disabled={!selectedCustomerId}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                执行测试
              </button>
              <button
                onClick={handleReset}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                重置
              </button>
            </div>
          </div>
        </div>

        {/* 右侧：测试结果 */}
        <div className="max-w-7xl mx-auto space-y-6">
          {/* 匹配结果 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-[#0A0A0A] mb-4">匹配结果</h2>
            
            {!testResult ? (
              <div className="text-center py-12 text-gray-400">
                <svg className="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <p>点击「执行测试」查看匹配结果</p>
              </div>
            ) : testResult.matched ? (
              <div className="space-y-4">
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="font-semibold text-green-800">匹配成功</span>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-green-700">匹配的规则：</span>
                      <span className="font-medium text-green-800">{testResult.matchedRule?.name}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-green-700">分配账单主体：</span>
                      <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full font-medium">
                        {testResult.targetEntity?.name}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <span className="font-semibold text-red-800">未匹配到任何规则</span>
                </div>
                <p className="text-sm text-red-700 mt-2">请检查输入参数是否符合任何规则的匹配条件</p>
              </div>
            )}
          </div>

          {/* 匹配过程 */}
          {matchProcess.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-[#0A0A0A] mb-4">匹配过程</h2>
              
              <div className="space-y-4">
                {matchProcess.map((rule, ruleIndex) => (
                  <div key={ruleIndex} className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className={`px-4 py-2 ${rule.result ? 'bg-green-100' : 'bg-gray-100'}`}>
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-[#0A0A0A]">{rule.ruleName}</span>
                        <span className={`px-2 py-0.5 text-xs rounded ${rule.result ? 'bg-green-500 text-white' : 'bg-gray-400 text-white'}`}>
                          {rule.result ? '通过' : '未通过'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="p-3 space-y-2">
                      {rule.conditions.map((cond, condIndex) => (
                        <div key={condIndex} className="flex items-center gap-3 text-sm">
                          <span className={`w-5 h-5 flex items-center justify-center rounded-full text-xs font-medium ${cond.passed ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                            {cond.passed ? '✓' : '✗'}
                          </span>
                          <span className="text-gray-600">{cond.field}</span>
                          <span className="text-gray-400">{operatorLabels[cond.operator] || cond.operator}</span>
                          <span className="text-gray-600">&quot;{cond.value}&quot;</span>
                          <span className="text-gray-400">→</span>
                          <span className={`font-medium ${cond.passed ? 'text-green-600' : 'text-red-600'}`}>
                            &quot;{cond.actual || '(空)'}&quot;
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
