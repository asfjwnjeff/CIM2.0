'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/store';
import { MOCK_USERS, PROGRESS_STATUS_LABELS } from '@/lib/sample-data';
import type { ProgressStatus, IndustryChainLevel, IndustryChainRole, CustomerStatus } from '@/lib/types';
import { ArrowLeft, Plus, X, ChevronsUpDown, Check, Search as SearchIcon } from 'lucide-react';
import { SearchableSelect } from '@/components/ui/searchable-select';
import type { SelectOption } from '@/components/ui/searchable-select';
import { SearchableMultiSelect } from '@/components/ui/searchable-multi-select';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { FIELD_STYLES } from '@/lib/ui-constants';

type TabType = 'basic' | 'business' | 'semiconductor' | 'relations' | 'products' | 'config' | 'billing' | 'followup' | 'opportunities' | 'approvals' | 'logs';

const TAB_LABELS: Record<TabType, string> = {
  basic: '企业基本信息',
  business: '工商资质全景',
  semiconductor: '半导体产业链定位',
  relations: '上下游关联关系',
  products: '经营商品档案',
  config: '客户信息配置',
  billing: '账单主体配置',
  followup: '跟进记录',
  opportunities: '商机',
  approvals: '风控审批记录',
  logs: '操作日志',
};

interface FormData {
  name: string;
  customerCode: string;
  signingEntityIds: string[];
  serviceEntityIds: string[];
  settlementEntityIds: string[];
  status: CustomerStatus;
  createdBy: string;
  responsiblePersons: string[];
  collaborators: string[];
  progressStatus: ProgressStatus;
  // basicInfo
  unifiedSocialCreditCode: string;
  phone: string;
  registrationStatus: string;
  legalRepresentative: string;
  email: string;
  enterpriseScale: string;
  registeredCapital: string;
  website: string;
  establishmentDate: string;
  countryRegion: string;
  industryTags: string[];
  // businessInfo
  paidInCapital: string;
  organizationCode: string;
  businessRegistrationNumber: string;
  taxpayerIdentificationNumber: string;
  enterpriseType: string;
  businessTerm: string;
  taxpayerQualification: string;
  staffSize: string;
  insuredNumber: string;
  approvalDate: string;
  region: string;
  registrationAuthority: string;
  englishName: string;
  registeredAddress: string;
  correspondenceAddress: string;
  businessScope: string;
  // semiconductorInfo
  industryChainLevel: IndustryChainLevel | '';
  industryChainRole: IndustryChainRole | '';
  semiIndustryTags: string[];
}

// ==================== 通用选项数据 ====================

const INDUSTRY_CHAIN_LEVEL_OPTIONS: SelectOption[] = [
  { value: 'upstream', label: '上游' },
  { value: 'midstream', label: '中游' },
  { value: 'downstream', label: '下游' },
];

const INDUSTRY_CHAIN_ROLE_OPTIONS: SelectOption[] = [
  { value: 'equipment_manufacturer', label: '设备制造商' },
  { value: 'material_supplier', label: '材料供应商' },
  { value: 'ip_provider', label: 'IP 企业' },
  { value: 'eda_vendor', label: 'EDA 企业' },
  { value: 'foundry', label: '晶圆代工' },
  { value: 'fabless', label: '芯片设计(Fabless)' },
  { value: 'idf', label: '晶圆厂(IDM)' },
  { value: 'osat', label: '封测厂(IDM)' },
  { value: 'sip', label: '封测代工' },
  { value: 'distributor', label: '分销代理商' },
  { value: 'system_integrator', label: '系统集成商' },
  { value: 'terminal_manufacturer', label: '终端应用厂商' },
  { value: 'consumer', label: '消费者' },
  { value: 'equipment_supplier', label: '设备供应商' },
  { value: 'distributor_agent', label: '分销代理' },
  { value: 'wafer_foundry', label: '晶圆代工' },
  { value: 'chip_design', label: '芯片设计' },
];

const ENTERPRISE_SCALE_OPTIONS: SelectOption[] = ['微型', '小型', '中型', '大型', '超大型'].map((v) => ({ value: v, label: v }));
const REGISTRATION_STATUS_OPTIONS: SelectOption[] = ['存续', '在业', '吊销', '注销', '停业', '清算'].map((v) => ({ value: v, label: v }));
const ENTERPRISE_TYPE_OPTIONS: SelectOption[] = ['有限责任公司', '股份有限公司', '合伙企业', '个人独资企业', '外商投资企业', '国有企业', '集体企业'].map((v) => ({ value: v, label: v }));
const TAXPAYER_QUALIFICATION_OPTIONS: SelectOption[] = ['一般纳税人', '小规模纳税人', '简易征收'].map((v) => ({ value: v, label: v }));
const INDUSTRY_TAG_OPTIONS: SelectOption[] = ['半导体', '集成电路', '芯片设计', '晶圆制造', '封装测试', 'EDA', 'IP', '半导体材料', '半导体设备', '新能源', '汽车电子', '消费电子', '工业控制', '通信', '计算机', '医疗电子', '国防科技'].map((v) => ({ value: v, label: v }));
const CUSTOMER_STATUS_OPTIONS: SelectOption<CustomerStatus>[] = [
  { value: 'active', label: '正常' },
  { value: 'inactive', label: '停用' },
  { value: 'potential', label: '潜在' },
  { value: 'frozen', label: '冻结' },
];

const PROGRESS_STATUS_OPTIONS: SelectOption[] = Object.entries(PROGRESS_STATUS_LABELS).map(([value, label]) => ({ value, label }));

const USER_OPTIONS: SelectOption[] = MOCK_USERS.map((u) => ({ value: u.id, label: u.name }));

function getSigningEntityOptions(signingEntities: ReturnType<typeof useApp>['signingEntities']): SelectOption[] {
  return signingEntities.map((e) => ({ value: e.id, label: e.name }));
}
function getServiceEntityOptions(serviceEntities: ReturnType<typeof useApp>['serviceEntities']): SelectOption[] {
  return serviceEntities.map((e) => ({ value: e.id, label: e.name }));
}
function getSettlementEntityOptions(settlementEntities: ReturnType<typeof useApp>['settlementEntities']): SelectOption[] {
  return settlementEntities.map((e) => ({ value: e.id, label: e.name }));
}

const EMPTY_FORM: FormData = {
  name: '',
  customerCode: '',
  signingEntityIds: [],
  serviceEntityIds: [],
  settlementEntityIds: [],
  status: 'active',
  createdBy: 'user-1',
  responsiblePersons: [],
  collaborators: [],
  progressStatus: 'newly_acquired',
  unifiedSocialCreditCode: '',
  phone: '',
  registrationStatus: '',
  legalRepresentative: '',
  email: '',
  enterpriseScale: '',
  registeredCapital: '',
  website: '',
  establishmentDate: '',
  countryRegion: '',
  industryTags: [],
  paidInCapital: '',
  organizationCode: '',
  businessRegistrationNumber: '',
  taxpayerIdentificationNumber: '',
  enterpriseType: '',
  businessTerm: '',
  taxpayerQualification: '',
  staffSize: '',
  insuredNumber: '',
  approvalDate: '',
  region: '',
  registrationAuthority: '',
  englishName: '',
  registeredAddress: '',
  correspondenceAddress: '',
  businessScope: '',
  industryChainLevel: '',
  industryChainRole: '',
  semiIndustryTags: [],
};

function getUserById(id: string) {
  return MOCK_USERS.find((u) => u.id === id);
}

function UserAvatar({ userId, size }: { userId: string; size?: 'sm' | 'md' }) {
  const user = getUserById(userId);
  const initial = user ? user.name.charAt(0) : '?';
  const sizeClass = size === 'sm' ? 'w-6 h-6 text-xs' : 'w-8 h-8 text-sm';
  return (
    <div className={`${sizeClass} rounded-full bg-[#2D3BFF] text-white flex items-center justify-center font-medium shrink-0`}>
      {initial}
    </div>
  );
}

function UserOptionRender({ userId }: { userId: string }) {
  const user = getUserById(userId);
  if (!user) return <span className="text-sm">{userId}</span>;
  return (
    <div className="flex items-center gap-2">
      <UserAvatar userId={userId} size="sm" />
      <div className="flex-1"><div className="text-sm">{user.name}</div><div className="text-xs text-[#999999]">{user.department}</div></div>
    </div>
  );
}

function UserBadgeRender({ userId, onRemove }: { userId: string; onRemove: () => void }) {
  const user = getUserById(userId);
  return (
    <Badge key={userId} variant="secondary" className="gap-1 pr-1">
      <UserAvatar userId={userId} size="sm" />
      <span className="text-xs">{user?.name ?? userId}</span>
      <button type="button" onClick={onRemove} className="ml-0.5 rounded-full hover:bg-gray-300 p-0.5"><X className="w-3 h-3" /></button>
    </Badge>
  );
}

export default function NewCustomerPage() {
  const router = useRouter();
  const { addCustomer, addLog, signingEntities, serviceEntities, settlementEntities } = useApp();
  const [activeTab, setActiveTab] = useState<TabType>('basic');
  const [form, setForm] = useState<FormData>({ ...EMPTY_FORM });
  const [isDirty, setIsDirty] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isQichachaLoading, setIsQichachaLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const hasShownWarning = useRef(false);

  const updateField = useCallback(<K extends keyof FormData>(key: K, value: FormData[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setIsDirty(true);
  }, []);

  // Unsaved changes warning
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  // Mock 企查查 fetch
  const handleQichachaFetch = useCallback(async () => {
    if (!form.unifiedSocialCreditCode || form.unifiedSocialCreditCode.length < 10) return;
    setIsQichachaLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    setForm((prev) => ({
      ...prev,
      name: prev.name || '示例企业名称（企查查拉取）',
      legalRepresentative: prev.legalRepresentative || '法定代表人（示例）',
      registeredCapital: prev.registeredCapital || '1000万人民币',
      establishmentDate: prev.establishmentDate || '2020-01-01',
      registrationStatus: prev.registrationStatus || '存续',
      phone: prev.phone || '010-88888888',
      email: prev.email || 'contact@example.com',
      enterpriseScale: prev.enterpriseScale || '中型',
      website: prev.website || 'www.example.com',
      countryRegion: prev.countryRegion || '中国',
      registeredAddress: prev.registeredAddress || '北京市朝阳区示例路100号',
    }));
    setIsDirty(true);
    setIsQichachaLoading(false);
  }, [form.unifiedSocialCreditCode]);

  const handleSubmit = useCallback(async () => {
    if (!form.name.trim()) { setErrorMessage('请填写客户名称'); return; }
    if (form.responsiblePersons.length === 0) { setErrorMessage('请选择负责人（必填）'); return; }

    setIsSubmitting(true);
    setErrorMessage('');

    const newCustomer = {
      name: form.name.trim(),
      customerCode: form.customerCode.trim() || undefined,
      signingEntityIds: form.signingEntityIds.length > 0 ? form.signingEntityIds : undefined,
      serviceEntityIds: form.serviceEntityIds.length > 0 ? form.serviceEntityIds : undefined,
      settlementEntityIds: form.settlementEntityIds.length > 0 ? form.settlementEntityIds : undefined,
      status: form.status,
      level: undefined,
      relationshipLoyalty: undefined,
      createdBy: form.createdBy,
      responsiblePersons: form.responsiblePersons,
      collaborators: form.collaborators,
      progressStatus: form.progressStatus,
      basicInfo: {
        unifiedSocialCreditCode: form.unifiedSocialCreditCode.trim() || undefined,
        phone: form.phone.trim() || undefined,
        registrationStatus: form.registrationStatus || undefined,
        legalRepresentative: form.legalRepresentative.trim() || undefined,
        email: form.email.trim() || undefined,
        enterpriseScale: form.enterpriseScale || undefined,
        registeredCapital: form.registeredCapital.trim() || undefined,
        website: form.website.trim() || undefined,
        establishmentDate: form.establishmentDate.trim() || undefined,
        countryRegion: form.countryRegion.trim() || undefined,
        industryTags: form.industryTags.length > 0 ? form.industryTags : undefined,
      },
      businessInfo: {
        paidInCapital: form.paidInCapital.trim(),
        organizationCode: form.organizationCode.trim(),
        businessRegistrationNumber: form.businessRegistrationNumber.trim(),
        taxpayerIdentificationNumber: form.taxpayerIdentificationNumber.trim(),
        enterpriseType: form.enterpriseType,
        businessTerm: form.businessTerm.trim(),
        taxpayerQualification: form.taxpayerQualification,
        staffSize: form.staffSize.trim(),
        insuredNumber: form.insuredNumber.trim(),
        approvalDate: form.approvalDate.trim(),
        region: form.region.trim(),
        registrationAuthority: form.registrationAuthority.trim(),
        englishName: form.englishName.trim(),
        registeredAddress: form.registeredAddress.trim(),
        correspondenceAddress: form.correspondenceAddress.trim(),
        businessScope: form.businessScope.trim(),
      },
      semiconductorInfo: form.industryChainLevel ? {
        industryChainLevel: form.industryChainLevel as IndustryChainLevel,
        industryChainRole: form.industryChainRole as IndustryChainRole | '',
        industryTags: form.semiIndustryTags,
      } : undefined,
    };

    addCustomer(newCustomer as Parameters<typeof addCustomer>[0]);

    const name = form.name.trim();
    addLog({
      action: 'create',
      operator: '系统管理员',
      targetType: 'customer',
      targetName: name,
      details: `创建新客户: ${name}`,
    });

    router.push('/customers');
  }, [form, addCustomer, addLog, router]);

  const handleBack = useCallback(() => {
    if (isDirty && !hasShownWarning.current) {
      hasShownWarning.current = true;
      if (!window.confirm('您有未保存的更改，确定要离开吗？')) return;
    }
    router.push('/customers');
  }, [isDirty, router]);

  const requiredStar = FIELD_STYLES.requiredStar;

  return (
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Page header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={handleBack} className="p-2 text-[#5A5A5A] hover:text-[#0A0A0A] hover:bg-[#F5F5F5] rounded-lg transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-2xl font-bold text-[#0A0A0A]">新增客户</h1>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={handleBack} className="px-4 py-2 border border-[#D5D5D5] text-[#5A5A5A] hover:bg-[#F5F5F5] rounded-lg text-sm font-medium transition-colors">
              取消
            </button>
            <button onClick={handleSubmit} disabled={isSubmitting} className="px-6 py-2 bg-[#2D3BFF] text-white hover:bg-[#4338CA] rounded-lg text-sm font-semibold transition-colors disabled:opacity-50">
              {isSubmitting ? '保存中...' : '提交'}
            </button>
          </div>
        </div>

        {/* Error message */}
        {errorMessage && (
          <div className="bg-[#FFEBEE] border border-[#FFCDD2] rounded-lg text-[#D63031] px-4 py-3 text-sm">
            {errorMessage}
          </div>
        )}

        {/* Tabs */}
        <div className="border-b border-[#EBEBEB]">
          <div className="flex overflow-x-auto">
            {(Object.keys(TAB_LABELS) as TabType[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-sm whitespace-nowrap transition-colors ${
                  activeTab === tab ? 'text-[#2D3BFF] font-semibold border-b-2 border-[#2D3BFF] bg-transparent' : 'text-[#5A5A5A] font-normal hover:text-[#0A0A0A]'
                }`}
              >
                {TAB_LABELS[tab]}
              </button>
            ))}
          </div>
        </div>

        {/* Tab content */}
        <div className="pb-8">
          {/* Tab 1: Basic Info */}
          {activeTab === 'basic' && (
            <div className="space-y-6">
              {/* 协同管理信息 */}
              <div className="bg-white rounded-2xl border border-[#EBEBEB] shadow-[0_2px_8px_rgba(0,0,0,0.06)] p-6">
                <h3 className="text-[16px] font-semibold text-[#0A0A0A] mb-4">协同管理信息</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className={FIELD_STYLES.label}>创建人</label>
                    <div className="flex items-center gap-2 px-3 py-2 bg-[#F5F5F5] border border-[#D5D5D5] rounded-lg">
                      <UserAvatar userId={form.createdBy} size="sm" />
                      <span className="text-sm text-[#999999]">{getUserById(form.createdBy)?.name || '-'}（自动填入）</span>
                    </div>
                  </div>
                  <div>
                    <label className={FIELD_STYLES.label}>负责人{requiredStar}</label>
                    <SearchableMultiSelect
                      values={form.responsiblePersons}
                      onChange={(ids) => updateField('responsiblePersons', ids)}
                      options={USER_OPTIONS}
                      placeholder="请选择负责人（必填）"
                      searchPlaceholder="搜索用户..."
                      emptyText="未找到用户"
                      renderOption={(opt, isSelected) => <UserOptionRender userId={opt.value} />}
                      renderBadge={(opt, onRemove) => <UserBadgeRender userId={opt.value} onRemove={onRemove} />}
                    />
                  </div>
                  <div>
                    <label className={FIELD_STYLES.label}>协同人</label>
                    <SearchableMultiSelect
                      values={form.collaborators}
                      onChange={(ids) => updateField('collaborators', ids)}
                      options={USER_OPTIONS}
                      placeholder="搜索并选择协同人..."
                      searchPlaceholder="搜索用户..."
                      emptyText="未找到用户"
                      renderOption={(opt, isSelected) => <UserOptionRender userId={opt.value} />}
                      renderBadge={(opt, onRemove) => <UserBadgeRender userId={opt.value} onRemove={onRemove} />}
                    />
                  </div>
                  <div>
                    <label className={FIELD_STYLES.label}>跟进进度</label>
                    <SearchableSelect value={form.progressStatus} onChange={(v) => updateField('progressStatus', v as ProgressStatus)} options={PROGRESS_STATUS_OPTIONS} placeholder="请选择跟进进度" />
                  </div>
                  <div>
                    <label className={FIELD_STYLES.label}>客户名称{requiredStar}</label>
                    <input type="text" className={FIELD_STYLES.input} value={form.name} onChange={(e) => updateField('name', e.target.value)} placeholder="请输入客户名称（必填）" />
                  </div>
                  <div>
                    <label className={FIELD_STYLES.label}>客户代码</label>
                    <input type="text" className={FIELD_STYLES.input} value={form.customerCode} onChange={(e) => updateField('customerCode', e.target.value)} placeholder="请输入客户代码" />
                  </div>
                  <div>
                    <label className={FIELD_STYLES.label}>客户状态</label>
                    <SearchableSelect<CustomerStatus> value={form.status} onChange={(v) => updateField('status', v)} options={CUSTOMER_STATUS_OPTIONS} placeholder="请选择客户状态" />
                  </div>
                  <div>
                    <label className={FIELD_STYLES.label}>签约主体</label>
                    <SearchableMultiSelect
                      values={form.signingEntityIds}
                      onChange={(ids) => updateField('signingEntityIds', ids)}
                      options={getSigningEntityOptions(signingEntities)}
                      placeholder="搜索并选择签约主体..."
                      searchPlaceholder="搜索签约主体..."
                      emptyText="未找到签约主体"
                    />
                  </div>
                  <div>
                    <label className={FIELD_STYLES.label}>服务主体</label>
                    <SearchableMultiSelect
                      values={form.serviceEntityIds}
                      onChange={(ids) => updateField('serviceEntityIds', ids)}
                      options={getServiceEntityOptions(serviceEntities)}
                      placeholder="搜索并选择服务主体..."
                      searchPlaceholder="搜索服务主体..."
                      emptyText="未找到服务主体"
                    />
                  </div>
                  <div>
                    <label className={FIELD_STYLES.label}>结算主体</label>
                    <SearchableMultiSelect
                      values={form.settlementEntityIds}
                      onChange={(ids) => updateField('settlementEntityIds', ids)}
                      options={getSettlementEntityOptions(settlementEntities)}
                      placeholder="搜索并选择结算主体..."
                      searchPlaceholder="搜索结算主体..."
                      emptyText="未找到结算主体"
                    />
                  </div>
                </div>
              </div>

              {/* 企业基本信息 */}
              <div className="bg-white rounded-2xl border border-[#EBEBEB] shadow-[0_2px_8px_rgba(0,0,0,0.06)] p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[16px] font-semibold text-[#0A0A0A]">企业基本信息</h3>
                  <button
                    type="button"
                    onClick={handleQichachaFetch}
                    disabled={isQichachaLoading || !form.unifiedSocialCreditCode}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#2D3BFF] border border-[#2D3BFF] rounded-lg hover:bg-[#E8EBFF] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <SearchIcon className="w-3 h-3" />
                    {isQichachaLoading ? '拉取中...' : '企查查拉取'}
                  </button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  <div>
                    <label className={FIELD_STYLES.label}>统一社会信用代码</label>
                    <input type="text" className={FIELD_STYLES.input} value={form.unifiedSocialCreditCode} onChange={(e) => updateField('unifiedSocialCreditCode', e.target.value)} placeholder="输入后可用企查查拉取" />
                  </div>
                  <div><label className={FIELD_STYLES.label}>电话</label><input type="text" className={FIELD_STYLES.input} value={form.phone} onChange={(e) => updateField('phone', e.target.value)} /></div>
                  <div><label className={FIELD_STYLES.label}>登记状态</label><SearchableSelect value={form.registrationStatus} onChange={(v) => updateField('registrationStatus', v)} options={REGISTRATION_STATUS_OPTIONS} placeholder="请选择" /></div>
                  <div><label className={FIELD_STYLES.label}>法定代表人</label><input type="text" className={FIELD_STYLES.input} value={form.legalRepresentative} onChange={(e) => updateField('legalRepresentative', e.target.value)} /></div>
                  <div><label className={FIELD_STYLES.label}>邮箱</label><input type="text" className={FIELD_STYLES.input} value={form.email} onChange={(e) => updateField('email', e.target.value)} /></div>
                  <div><label className={FIELD_STYLES.label}>企业规模</label><SearchableSelect value={form.enterpriseScale} onChange={(v) => updateField('enterpriseScale', v)} options={ENTERPRISE_SCALE_OPTIONS} placeholder="请选择" /></div>
                  <div><label className={FIELD_STYLES.label}>注册资本</label><input type="text" className={FIELD_STYLES.input} value={form.registeredCapital} onChange={(e) => updateField('registeredCapital', e.target.value)} /></div>
                  <div><label className={FIELD_STYLES.label}>官网</label><input type="text" className={FIELD_STYLES.input} value={form.website} onChange={(e) => updateField('website', e.target.value)} /></div>
                  <div><label className={FIELD_STYLES.label}>成立日期</label><input type="text" className={FIELD_STYLES.input} value={form.establishmentDate} onChange={(e) => updateField('establishmentDate', e.target.value)} placeholder="YYYY-MM-DD" /></div>
                  <div><label className={FIELD_STYLES.label}>国家（地区）</label><input type="text" className={FIELD_STYLES.input} value={form.countryRegion} onChange={(e) => updateField('countryRegion', e.target.value)} /></div>
                  <div className="lg:col-span-2">
                    <label className={FIELD_STYLES.label}>行业标签</label>
                    <SearchableMultiSelect
                      values={form.industryTags}
                      onChange={(tags) => updateField('industryTags', tags)}
                      options={INDUSTRY_TAG_OPTIONS}
                      placeholder="添加标签..."
                      searchPlaceholder="搜索标签..."
                      emptyText="无匹配标签"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Business Info */}
          {activeTab === 'business' && (
            <div className="bg-white rounded-2xl border border-[#EBEBEB] shadow-[0_2px_8px_rgba(0,0,0,0.06)] p-6">
              <h3 className="text-[16px] font-semibold text-[#0A0A0A] mb-4">工商资质全景信息</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                <div><label className={FIELD_STYLES.label}>实缴资本</label><input type="text" className={FIELD_STYLES.input} value={form.paidInCapital} onChange={(e) => updateField('paidInCapital', e.target.value)} /></div>
                <div><label className={FIELD_STYLES.label}>组织机构代码</label><input type="text" className={FIELD_STYLES.input} value={form.organizationCode} onChange={(e) => updateField('organizationCode', e.target.value)} /></div>
                <div><label className={FIELD_STYLES.label}>工商注册号</label><input type="text" className={FIELD_STYLES.input} value={form.businessRegistrationNumber} onChange={(e) => updateField('businessRegistrationNumber', e.target.value)} /></div>
                <div><label className={FIELD_STYLES.label}>纳税人识别号</label><input type="text" className={FIELD_STYLES.input} value={form.taxpayerIdentificationNumber} onChange={(e) => updateField('taxpayerIdentificationNumber', e.target.value)} /></div>
                <div><label className={FIELD_STYLES.label}>企业类型</label><SearchableSelect value={form.enterpriseType} onChange={(v) => updateField('enterpriseType', v)} options={ENTERPRISE_TYPE_OPTIONS} placeholder="请选择" /></div>
                <div><label className={FIELD_STYLES.label}>营业期限</label><input type="text" className={FIELD_STYLES.input} value={form.businessTerm} onChange={(e) => updateField('businessTerm', e.target.value)} /></div>
                <div><label className={FIELD_STYLES.label}>纳税人资质</label><SearchableSelect value={form.taxpayerQualification} onChange={(v) => updateField('taxpayerQualification', v)} options={TAXPAYER_QUALIFICATION_OPTIONS} placeholder="请选择" /></div>
                <div><label className={FIELD_STYLES.label}>人员规模</label><input type="text" className={FIELD_STYLES.input} value={form.staffSize} onChange={(e) => updateField('staffSize', e.target.value)} /></div>
                <div><label className={FIELD_STYLES.label}>参保人数</label><input type="text" className={FIELD_STYLES.input} value={form.insuredNumber} onChange={(e) => updateField('insuredNumber', e.target.value)} /></div>
                <div><label className={FIELD_STYLES.label}>核准日期</label><input type="text" className={FIELD_STYLES.input} value={form.approvalDate} onChange={(e) => updateField('approvalDate', e.target.value)} /></div>
                <div><label className={FIELD_STYLES.label}>所属地区</label><input type="text" className={FIELD_STYLES.input} value={form.region} onChange={(e) => updateField('region', e.target.value)} /></div>
                <div><label className={FIELD_STYLES.label}>登记机关</label><input type="text" className={FIELD_STYLES.input} value={form.registrationAuthority} onChange={(e) => updateField('registrationAuthority', e.target.value)} /></div>
                <div><label className={FIELD_STYLES.label}>英文名</label><input type="text" className={FIELD_STYLES.input} value={form.englishName} onChange={(e) => updateField('englishName', e.target.value)} /></div>
                <div className="md:col-span-2"><label className={FIELD_STYLES.label}>注册地址</label><input type="text" className={FIELD_STYLES.input} value={form.registeredAddress} onChange={(e) => updateField('registeredAddress', e.target.value)} /></div>
                <div className="md:col-span-2"><label className={FIELD_STYLES.label}>通信地址</label><input type="text" className={FIELD_STYLES.input} value={form.correspondenceAddress} onChange={(e) => updateField('correspondenceAddress', e.target.value)} /></div>
                <div className="lg:col-span-4"><label className={FIELD_STYLES.label}>经营范围</label><Textarea value={form.businessScope} onChange={(e) => updateField('businessScope', e.target.value)} className="mt-0.5 min-h-[80px]" placeholder="请输入经营范围" /></div>
              </div>
            </div>
          )}

          {/* Tab 3: Semiconductor */}
          {activeTab === 'semiconductor' && (
            <div className="bg-white rounded-2xl border border-[#EBEBEB] shadow-[0_2px_8px_rgba(0,0,0,0.06)] p-6">
              <h3 className="text-[16px] font-semibold text-[#0A0A0A] mb-4">半导体产业链定位</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className={FIELD_STYLES.label}>产业链层级</label>
                  <SearchableSelect value={form.industryChainLevel} onChange={(v) => updateField('industryChainLevel', v as IndustryChainLevel | '')} options={INDUSTRY_CHAIN_LEVEL_OPTIONS} placeholder="请选择" />
                </div>
                <div>
                  <label className={FIELD_STYLES.label}>细分产业链角色</label>
                  <SearchableSelect value={form.industryChainRole} onChange={(v) => updateField('industryChainRole', v as IndustryChainRole | '')} options={INDUSTRY_CHAIN_ROLE_OPTIONS} placeholder="请选择" searchPlaceholder="搜索产业链角色..." />
                </div>
              </div>
              <div>
                <label className={FIELD_STYLES.label}>半导体行业标签</label>
                <SearchableMultiSelect
                  values={form.semiIndustryTags}
                  onChange={(tags) => updateField('semiIndustryTags', tags)}
                  options={INDUSTRY_TAG_OPTIONS}
                  placeholder="添加标签..."
                  searchPlaceholder="搜索标签..."
                  emptyText="无匹配标签"
                />
              </div>
            </div>
          )}

          {/* Tabs 4-7: Read-only placeholder */}
          {activeTab === 'relations' && <EmptyTab message="上下游关联关系将在客户创建后可配置" />}
          {activeTab === 'products' && <EmptyTab message="经营商品档案将在客户创建后可配置" />}
          {activeTab === 'config' && <EmptyTab message="客户信息配置将在客户创建后可配置" />}
          {activeTab === 'billing' && <EmptyTab message="账单主体配置将在客户创建后可配置" />}

          {/* Tabs 8-11: Read-only empty */}
          {activeTab === 'followup' && <EmptyTab message="跟进记录将在客户创建后产生" />}
          {activeTab === 'opportunities' && <EmptyTab message="商机将在客户创建后关联" />}
          {activeTab === 'approvals' && <EmptyTab message="风控审批记录将在客户创建后产生" />}
          {activeTab === 'logs' && <EmptyTab message="操作日志将在客户创建后产生" />}
        </div>
      </div>
  );
}

function EmptyTab({ message }: { message: string }) {
  return (
    <div className="bg-white rounded-2xl border border-[#EBEBEB] shadow-[0_2px_8px_rgba(0,0,0,0.06)] p-12 text-center">
      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#F5F5F5] flex items-center justify-center">
        <Plus className="w-8 h-8 text-[#CCCCCC]" />
      </div>
      <p className="text-sm text-[#999999]">{message}</p>
    </div>
  );
}
