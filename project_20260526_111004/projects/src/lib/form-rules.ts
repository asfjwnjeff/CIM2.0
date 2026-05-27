/**
 * 声明式表单验证规则系统
 * 每个字段在 rules 数组中定义验证规则，在失焦时触发，而非在 submit 时集中判断
 */

export type RuleType = 'required' | 'maxLength' | 'minLength' | 'pattern' | 'min' | 'max' | 'custom';

export interface ValidationRule {
  type: RuleType;
  value?: number | RegExp | ((value: unknown, formData?: Record<string, unknown>) => boolean);
  message: string;
}

export interface FieldValidation {
  isValid: boolean;
  errors: string[];
}

/** 验证单个值 */
export function validateValue(
  value: unknown,
  rules: ValidationRule[],
  formData?: Record<string, unknown>
): FieldValidation {
  const errors: string[] = [];

  for (const rule of rules) {
    switch (rule.type) {
      case 'required': {
        if (value === undefined || value === null || value === '') {
          errors.push(rule.message);
        }
        if (Array.isArray(value) && value.length === 0) {
          errors.push(rule.message);
        }
        break;
      }
      case 'maxLength': {
        if (typeof value === 'string' && typeof rule.value === 'number' && value.length > rule.value) {
          errors.push(rule.message);
        }
        break;
      }
      case 'minLength': {
        if (typeof value === 'string' && typeof rule.value === 'number' && value.length < rule.value) {
          errors.push(rule.message);
        }
        break;
      }
      case 'pattern': {
        if (typeof value === 'string' && rule.value instanceof RegExp && !rule.value.test(value)) {
          errors.push(rule.message);
        }
        break;
      }
      case 'min': {
        if (typeof value === 'number' && typeof rule.value === 'number' && value < rule.value) {
          errors.push(rule.message);
        }
        break;
      }
      case 'max': {
        if (typeof value === 'number' && typeof rule.value === 'number' && value > rule.value) {
          errors.push(rule.message);
        }
        break;
      }
      case 'custom': {
        if (typeof rule.value === 'function' && !rule.value(value, formData)) {
          errors.push(rule.message);
        }
        break;
      }
    }
  }

  return { isValid: errors.length === 0, errors };
}

/** 验证整个表单，返回字段到错误的映射 */
export function validateForm(
  formData: Record<string, unknown>,
  fieldRules: Record<string, ValidationRule[]>
): Record<string, FieldValidation> {
  const result: Record<string, FieldValidation> = {};
  for (const [field, rules] of Object.entries(fieldRules)) {
    result[field] = validateValue(formData[field], rules, formData);
  }
  return result;
}

/** 是否有任何字段校验失败 */
export function hasErrors(validationResult: Record<string, FieldValidation>): boolean {
  return Object.values(validationResult).some(v => !v.isValid);
}

/** 获取第一个错误字段名 */
export function getFirstErrorField(validationResult: Record<string, FieldValidation>): string | null {
  for (const [field, result] of Object.entries(validationResult)) {
    if (!result.isValid) return field;
  }
  return null;
}

/* ====== 常用验证规则 ====== */

export const COMMON_RULES = {
  /** 客户名称 */
  customerName: [
    { type: 'required' as RuleType, message: '客户名称不能为空' },
    { type: 'maxLength' as RuleType, value: 100, message: '客户名称不能超过100个字符' },
  ],

  /** 信用代码 (18位大写字母或数字) */
  creditCode: [
    { type: 'pattern' as RuleType, value: /^[A-Z0-9]{18}$/, message: '信用代码为18位大写字母或数字' },
  ],

  /** 手机号码 */
  phone: [
    { type: 'pattern' as RuleType, value: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码' },
  ],

  /** 邮箱 */
  email: [
    { type: 'pattern' as RuleType, value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: '请输入正确的邮箱地址' },
  ],

  /** 必填通用 */
  required: (label: string): ValidationRule => ({
    type: 'required',
    message: `${label}不能为空`,
  }),
};
