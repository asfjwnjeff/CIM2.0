'use client';

import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useApp } from '@/lib/store';
import { MOCK_USERS, PROGRESS_STATUS_LABELS, PROGRESS_STATUS_COLORS, RELATION_LABELS, INDUSTRY_CHAIN_LEVEL_LABELS } from '@/lib/sample-data';
import type { ProgressStatus, IndustryChainLevel, IndustryChainRole, CustomerStatus } from '@/lib/types';
import { ProgressStepper } from '@/components/ProgressStepper';
import { ArrowLeft, X, Plus, Trash2, Building2, Upload } from 'lucide-react';
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

interface EditFormData {
  // 协同管理信息
  name: string;
  customerCode: string;
  signingEntityIds: string[];
  serviceEntityIds: string[];
  settlementEntityIds: string[];
  status: CustomerStatus;
  responsiblePersons: string[];
  collaborators: string[];
  progressStatus: ProgressStatus;
  contactPerson: string;
  contactPhone: string;
  contactEmail: string;
  // 企业基本信息 - 新字段
  logoUrls: string[];
  unifiedSocialCreditCode: string;
  countryRegion: string;
  industryCategory: string;
  mainProducts: string;
  industryChainFormat: string;
  supplyChainRole: string;
  crossBorderMode: string;
  customerChannel: string;
  customerSource: string;
  potentialCompetitors: string;
  relatedEnterprises: string;
  addressProvince: string;
  addressCity: string;
  addressDistrict: string;
  addressDetail: string;
  intendedServiceRegions: string[];
  serviceProduct: string;
  otherServiceRequirement: string;
  estimatedMonthlyVolume: string;
  warehouseArea: string;
  warehouseConditions: string;
  customerLevel: string;
  ourAdvantage: string;
  ourDisadvantage: string;
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
  // 工商资质 - 从旧 basicInfo 移入
  phone: string;
  registrationStatus: string;
  legalRepresentative: string;
  email: string;
  enterpriseScale: string;
  registeredCapital: string;
  website: string;
  establishmentDate: string;
  bizCountryRegion: string;
  industryTags: string[];
  // semiconductorInfo
  industryChainLevel: IndustryChainLevel | '';
  industryChainRole: IndustryChainRole | '';
  semiIndustryTags: string[];
  // 上下游关联关系
  relatedCompanies: Array<{ id: string; relatedCompanyName: string; relation: string; relatedCompanyLevel: string; validFrom: string; validTo: string }>;
  // 经营商品档案
  products: Array<{ id: string; productName: string; productCode: string; customsDeclarationElements: string; origin: string; industryChainCategory: string; relatedBillingEntityId: string }>;
}

function buildFormData(customer: ReturnType<typeof useApp>['customers'][number]): EditFormData {
  return {
    name: customer.name || '',
    customerCode: customer.customerCode || '',
    signingEntityIds: customer.signingEntityIds || [],
    serviceEntityIds: customer.serviceEntityIds || [],
    settlementEntityIds: customer.settlementEntityIds || [],
    status: customer.status || 'active',
    responsiblePersons: customer.responsiblePersons || [],
    collaborators: customer.collaborators || [],
    progressStatus: customer.progressStatus || 'newly_acquired',
    contactPerson: customer.contactPerson || '',
    contactPhone: customer.contactPhone || '',
    contactEmail: customer.contactEmail || '',
    logoUrls: customer.basicInfo?.logoUrls || [],
    unifiedSocialCreditCode: customer.basicInfo?.unifiedSocialCreditCode || '',
    countryRegion: customer.basicInfo?.countryRegion || '',
    industryCategory: customer.basicInfo?.industryCategory || '',
    mainProducts: customer.basicInfo?.mainProducts || '',
    industryChainFormat: customer.basicInfo?.industryChainFormat || '',
    supplyChainRole: customer.basicInfo?.supplyChainRole || '',
    crossBorderMode: customer.basicInfo?.crossBorderMode || '',
    customerChannel: customer.basicInfo?.customerChannel || '',
    customerSource: customer.basicInfo?.customerSource || '',
    potentialCompetitors: customer.basicInfo?.potentialCompetitors || '',
    relatedEnterprises: customer.basicInfo?.relatedEnterprises || '',
    addressProvince: customer.basicInfo?.addressProvince || '',
    addressCity: customer.basicInfo?.addressCity || '',
    addressDistrict: customer.basicInfo?.addressDistrict || '',
    addressDetail: customer.basicInfo?.addressDetail || '',
    intendedServiceRegions: customer.basicInfo?.intendedServiceRegions || [],
    serviceProduct: (customer.basicInfo?.serviceProducts && customer.basicInfo.serviceProducts.length > 0) ? customer.basicInfo.serviceProducts[0] : '',
    otherServiceRequirement: customer.basicInfo?.otherServiceRequirement || '',
    estimatedMonthlyVolume: customer.basicInfo?.estimatedMonthlyVolume || '',
    warehouseArea: customer.basicInfo?.warehouseArea || '',
    warehouseConditions: customer.basicInfo?.warehouseConditions || '',
    customerLevel: customer.basicInfo?.customerLevel || '',
    ourAdvantage: customer.basicInfo?.ourAdvantage || '',
    ourDisadvantage: customer.basicInfo?.ourDisadvantage || '',
    paidInCapital: customer.businessInfo?.paidInCapital || '',
    organizationCode: customer.businessInfo?.organizationCode || '',
    businessRegistrationNumber: customer.businessInfo?.businessRegistrationNumber || '',
    taxpayerIdentificationNumber: customer.businessInfo?.taxpayerIdentificationNumber || '',
    enterpriseType: customer.businessInfo?.enterpriseType || '',
    businessTerm: customer.businessInfo?.businessTerm || '',
    taxpayerQualification: customer.businessInfo?.taxpayerQualification || '',
    staffSize: customer.businessInfo?.staffSize || '',
    insuredNumber: customer.businessInfo?.insuredNumber || '',
    approvalDate: customer.businessInfo?.approvalDate || '',
    region: customer.businessInfo?.region || '',
    registrationAuthority: customer.businessInfo?.registrationAuthority || '',
    englishName: customer.businessInfo?.englishName || '',
    registeredAddress: customer.businessInfo?.registeredAddress || '',
    correspondenceAddress: customer.businessInfo?.correspondenceAddress || '',
    businessScope: customer.businessInfo?.businessScope || '',
    phone: customer.businessInfo?.phone || '',
    registrationStatus: customer.businessInfo?.registrationStatus || '',
    legalRepresentative: customer.businessInfo?.legalRepresentative || '',
    email: customer.businessInfo?.email || '',
    enterpriseScale: customer.businessInfo?.enterpriseScale || '',
    registeredCapital: customer.businessInfo?.registeredCapital || '',
    website: customer.businessInfo?.website || '',
    establishmentDate: customer.businessInfo?.establishmentDate || '',
    bizCountryRegion: customer.businessInfo?.countryRegion || '',
    industryTags: customer.businessInfo?.industryTags || [],
    industryChainLevel: customer.semiconductorInfo?.industryChainLevel || '',
    industryChainRole: customer.semiconductorInfo?.industryChainRole || '',
    semiIndustryTags: customer.semiconductorInfo?.industryTags || [],
    relatedCompanies: (customer.relatedCompanies || []).map((r) => ({
      id: r.id,
      relatedCompanyName: r.relatedCompanyName || '',
      relation: r.relation || 'supplier',
      relatedCompanyLevel: r.relatedCompanyLevel || 'upstream',
      validFrom: r.validFrom || '',
      validTo: r.validTo || '',
    })),
    products: (customer.products || []).map((p) => ({
      id: p.id,
      productName: p.productName || '',
      productCode: p.productCode || '',
      customsDeclarationElements: p.customsDeclarationElements || '',
      origin: p.origin || '',
      industryChainCategory: p.industryChainCategory || '',
      relatedBillingEntityId: p.relatedBillingEntityId || '',
    })),
  };
}

// ==================== Mock 企业名称数据库（模糊搜索用） ====================

interface MockCompany {
  name: string;
  legalRepresentative: string;
  registeredCapital: string;
  establishmentDate: string;
  registrationStatus: string;
  unifiedSocialCreditCode: string;
  registeredAddress: string;
}

const MOCK_COMPANIES: MockCompany[] = [
  { name: '上海市应用科学技术管理局', legalRepresentative: '张建国', registeredCapital: '5000万人民币', establishmentDate: '2005-03-15', registrationStatus: '存续', unifiedSocialCreditCode: '91310000MA1FL6NCX7', registeredAddress: '上海市浦东新区张江高科技园区碧波路518号' },
  { name: '上海市微型电脑应用协会', legalRepresentative: '李明华', registeredCapital: '200万人民币', establishmentDate: '1992-08-20', registrationStatus: '存续', unifiedSocialCreditCode: '51310000MJ4900264B', registeredAddress: '上海市徐汇区漕溪北路88号圣爱大厦12层' },
  { name: '上海应用技术大学科技园有限公司', legalRepresentative: '王志强', registeredCapital: '1000万人民币', establishmentDate: '2010-06-01', registrationStatus: '存续', unifiedSocialCreditCode: '913101155579854321', registeredAddress: '上海市奉贤区海思路999号' },
  { name: '深圳中科半导体有限公司', legalRepresentative: '陈伟明', registeredCapital: '8000万人民币', establishmentDate: '2015-02-10', registrationStatus: '存续', unifiedSocialCreditCode: '914403003498765432', registeredAddress: '深圳市南山区科技园路18号' },
  { name: '北京华大九天科技股份有限公司', legalRepresentative: '刘伟平', registeredCapital: '1.2亿人民币', establishmentDate: '2009-05-08', registrationStatus: '存续', unifiedSocialCreditCode: '91110000687654321X', registeredAddress: '北京市海淀区中关村软件园一期8号楼' },
  { name: '武汉新芯集成电路制造有限公司', legalRepresentative: '杨士宁', registeredCapital: '15亿人民币', establishmentDate: '2006-04-12', registrationStatus: '存续', unifiedSocialCreditCode: '914201007878901234', registeredAddress: '武汉市东湖新技术开发区高新大道999号' },
  { name: '上海微电子装备（集团）股份有限公司', legalRepresentative: '程惊雷', registeredCapital: '3.6亿人民币', establishmentDate: '2002-03-22', registrationStatus: '存续', unifiedSocialCreditCode: '913100007406543210', registeredAddress: '上海市浦东新区张东路1525号' },
  { name: '中芯国际集成电路制造（上海）有限公司', legalRepresentative: '赵海军', registeredCapital: '24亿美元', establishmentDate: '2000-04-03', registrationStatus: '存续', unifiedSocialCreditCode: '913100006074123456', registeredAddress: '上海市浦东新区张江路18号' },
  { name: '华为技术有限公司', legalRepresentative: '任正非', registeredCapital: '403亿人民币', establishmentDate: '1987-09-15', registrationStatus: '存续', unifiedSocialCreditCode: '914403001922038216', registeredAddress: '深圳市龙岗区坂田华为总部办公楼' },
  { name: '中兴通讯股份有限公司', legalRepresentative: '李自学', registeredCapital: '46.6亿人民币', establishmentDate: '1985-02-07', registrationStatus: '存续', unifiedSocialCreditCode: '914403001923987654', registeredAddress: '深圳市南山区高新技术产业园科技南路中兴通讯大厦' },
  { name: '比亚迪股份有限公司', legalRepresentative: '王传福', registeredCapital: '29.1亿人民币', establishmentDate: '1995-02-10', registrationStatus: '存续', unifiedSocialCreditCode: '91440300279573123X', registeredAddress: '深圳市坪山新区比亚迪路3009号' },
  { name: '宁德时代新能源科技股份有限公司', legalRepresentative: '曾毓群', registeredCapital: '23.3亿人民币', establishmentDate: '2011-12-16', registrationStatus: '存续', unifiedSocialCreditCode: '913509005875123456', registeredAddress: '福建省宁德市蕉城区漳湾镇新港路2号' },
  { name: '长鑫存储技术有限公司', legalRepresentative: '朱一明', registeredCapital: '238亿人民币', establishmentDate: '2017-11-16', registrationStatus: '存续', unifiedSocialCreditCode: '91340100MA2R99M67K', registeredAddress: '合肥市经济技术开发区翠微路6号' },
  { name: '上海华虹（集团）有限公司', legalRepresentative: '张素心', registeredCapital: '50亿人民币', establishmentDate: '1996-04-09', registrationStatus: '存续', unifiedSocialCreditCode: '91310000132243210X', registeredAddress: '上海市浦东新区张江高科技园区祖冲之路1399号' },
  { name: '紫光展锐（上海）科技有限公司', legalRepresentative: '马道杰', registeredCapital: '75亿人民币', establishmentDate: '2013-08-28', registrationStatus: '存续', unifiedSocialCreditCode: '913100000764567890', registeredAddress: '上海市浦东新区祖冲之路2288弄展讯中心' },
  { name: '京东方科技集团股份有限公司', legalRepresentative: '陈炎顺', registeredCapital: '380亿人民币', establishmentDate: '1993-04-09', registrationStatus: '存续', unifiedSocialCreditCode: '911100006334567890', registeredAddress: '北京市朝阳区酒仙桥路10号' },
  { name: 'TCL科技集团股份有限公司', legalRepresentative: '李东生', registeredCapital: '135亿人民币', establishmentDate: '1982-03-11', registrationStatus: '存续', unifiedSocialCreditCode: '914413001959718754', registeredAddress: '广东省惠州市仲恺高新区惠风三路17号TCL科技大厦' },
  { name: '小米科技有限责任公司', legalRepresentative: '雷军', registeredCapital: '18.5亿人民币', establishmentDate: '2010-03-03', registrationStatus: '存续', unifiedSocialCreditCode: '91110108551385082Q', registeredAddress: '北京市海淀区西二旗中路33号院6号楼' },
  { name: '长江存储科技有限责任公司', legalRepresentative: '陈南翔', registeredCapital: '530亿人民币', establishmentDate: '2016-07-26', registrationStatus: '存续', unifiedSocialCreditCode: '91420100MA4KN4JY9G', registeredAddress: '武汉市东湖新技术开发区未来三路88号' },
  { name: '杭州海康威视数字技术股份有限公司', legalRepresentative: '胡扬忠', registeredCapital: '93.7亿人民币', establishmentDate: '2001-11-30', registrationStatus: '存续', unifiedSocialCreditCode: '91330000733765432X', registeredAddress: '杭州市滨江区阡陌路555号' },
  { name: '立讯精密工业股份有限公司', legalRepresentative: '王来春', registeredCapital: '71.2亿人民币', establishmentDate: '2004-05-24', registrationStatus: '存续', unifiedSocialCreditCode: '914403007632109876', registeredAddress: '广东省东莞市清溪镇青皇村青皇工业区' },
  { name: '韦尔半导体股份有限公司', legalRepresentative: '虞仁荣', registeredCapital: '11.8亿人民币', establishmentDate: '2007-05-15', registrationStatus: '存续', unifiedSocialCreditCode: '913100006674567890', registeredAddress: '上海市浦东新区龙东大道3000号1幢A楼' },
  { name: '寒武纪科技股份有限公司', legalRepresentative: '陈天石', registeredCapital: '4.2亿人民币', establishmentDate: '2016-03-15', registrationStatus: '存续', unifiedSocialCreditCode: '91110108MA007B4K3F', registeredAddress: '北京市海淀区知春路7号致真大厦D座' },
  { name: '上海贝岭股份有限公司', legalRepresentative: '马玉川', registeredCapital: '7.1亿人民币', establishmentDate: '1988-09-08', registrationStatus: '存续', unifiedSocialCreditCode: '91310000132200275J', registeredAddress: '上海市宜山路810号贝岭大厦' },
  { name: '北方华创科技集团股份有限公司', legalRepresentative: '赵晋荣', registeredCapital: '5.3亿人民币', establishmentDate: '2001-09-28', registrationStatus: '存续', unifiedSocialCreditCode: '91110000802673456X', registeredAddress: '北京市经济技术开发区文昌大道8号' },
  { name: '三安光电股份有限公司', legalRepresentative: '林志强', registeredCapital: '44.8亿人民币', establishmentDate: '1993-03-27', registrationStatus: '存续', unifiedSocialCreditCode: '91350200612003654H', registeredAddress: '厦门市思明区吕岭路1721号' },
  { name: '拓荆科技股份有限公司', legalRepresentative: '吕光泉', registeredCapital: '1.9亿人民币', establishmentDate: '2010-04-28', registrationStatus: '存续', unifiedSocialCreditCode: '912102005556789012', registeredAddress: '辽宁省沈阳市浑南区创新路177号' },
  { name: '华润微电子有限公司', legalRepresentative: '李虹', registeredCapital: '13.2亿人民币', establishmentDate: '2003-01-28', registrationStatus: '存续', unifiedSocialCreditCode: '913202007472345678', registeredAddress: '无锡市新吴区信息产业园14号' },
  { name: '上海新昇半导体科技有限公司', legalRepresentative: '李炜', registeredCapital: '20亿人民币', establishmentDate: '2014-06-10', registrationStatus: '存续', unifiedSocialCreditCode: '913101153014567890', registeredAddress: '上海市浦东新区泥城镇新元南路600号' },
  { name: '合肥晶合集成电路股份有限公司', legalRepresentative: '蔡国智', registeredCapital: '80亿人民币', establishmentDate: '2015-10-20', registrationStatus: '存续', unifiedSocialCreditCode: '91340100MA2MQ9B26L', registeredAddress: '合肥市新站区东方大道989号' },
];

function fuzzyMatch(input: string, target: string): boolean {
  let i = 0;
  for (let j = 0; j < target.length && i < input.length; j++) {
    if (input[i] === target[j]) i++;
  }
  return i === input.length;
}

function searchCompanies(query: string): MockCompany[] {
  if (query.length < 2) return [];
  const results = MOCK_COMPANIES.filter((c) => fuzzyMatch(query, c.name));
  return results.slice(0, 8);
}

// ==================== 省市区级联数据（精简版） ====================

const REGION_DATA: Record<string, Record<string, string[]>> = {
  '北京市': { '北京市': ['东城区', '西城区', '朝阳区', '丰台区', '石景山区', '海淀区', '顺义区', '通州区', '大兴区', '昌平区', '平谷区', '怀柔区', '密云区', '延庆区'] },
  '上海市': { '上海市': ['黄浦区', '徐汇区', '长宁区', '静安区', '普陀区', '虹口区', '杨浦区', '闵行区', '宝山区', '嘉定区', '浦东新区', '金山区', '松江区', '青浦区', '奉贤区', '崇明区'] },
  '天津市': { '天津市': ['和平区', '河东区', '河西区', '南开区', '河北区', '红桥区', '东丽区', '西青区', '津南区', '北辰区', '武清区', '宝坻区', '滨海新区'] },
  '重庆市': { '重庆市': ['渝中区', '江北区', '沙坪坝区', '九龙坡区', '南岸区', '北碚区', '渝北区', '巴南区', '涪陵区', '万州区', '黔江区', '长寿区'] },
  '广东省': {
    '广州市': ['天河区', '越秀区', '海珠区', '荔湾区', '白云区', '番禺区', '黄埔区', '花都区', '南沙区', '增城区', '从化区'],
    '深圳市': ['福田区', '罗湖区', '南山区', '盐田区', '宝安区', '龙岗区', '龙华区', '坪山区', '光明区'],
    '东莞市': ['莞城区', '南城区', '东城区', '万江区'],
    '佛山市': ['禅城区', '南海区', '顺德区', '高明区', '三水区'],
    '珠海市': ['香洲区', '斗门区', '金湾区'],
    '惠州市': ['惠城区', '惠阳区', '博罗县', '惠东县'],
  },
  '江苏省': {
    '南京市': ['玄武区', '秦淮区', '建邺区', '鼓楼区', '浦口区', '栖霞区', '雨花台区', '江宁区', '六合区', '溧水区', '高淳区'],
    '苏州市': ['姑苏区', '虎丘区', '吴中区', '相城区', '吴江区', '常熟市', '张家港市', '昆山市', '太仓市'],
    '无锡市': ['梁溪区', '锡山区', '惠山区', '滨湖区', '新吴区', '江阴市', '宜兴市'],
    '南通市': ['崇川区', '通州区', '海门区', '如东县', '启东市', '如皋市', '海安市'],
  },
  '浙江省': {
    '杭州市': ['上城区', '拱墅区', '西湖区', '滨江区', '萧山区', '余杭区', '临平区', '钱塘区', '富阳区', '临安区'],
    '宁波市': ['海曙区', '江北区', '北仑区', '镇海区', '鄞州区', '奉化区', '余姚市', '慈溪市'],
    '温州市': ['鹿城区', '龙湾区', '瓯海区', '洞头区', '瑞安市', '乐清市'],
  },
  '山东省': {
    '济南市': ['历下区', '市中区', '槐荫区', '天桥区', '历城区', '长清区', '章丘区'],
    '青岛市': ['市南区', '市北区', '黄岛区', '崂山区', '李沧区', '城阳区', '即墨区', '胶州市'],
    '烟台市': ['芝罘区', '福山区', '牟平区', '莱山区', '蓬莱区', '龙口市', '莱阳市'],
  },
  '福建省': {
    '福州市': ['鼓楼区', '台江区', '仓山区', '马尾区', '晋安区', '长乐区', '福清市'],
    '厦门市': ['思明区', '海沧区', '湖里区', '集美区', '同安区', '翔安区'],
  },
  '湖北省': {
    '武汉市': ['江岸区', '江汉区', '硚口区', '汉阳区', '武昌区', '青山区', '洪山区', '东西湖区', '汉南区', '蔡甸区', '江夏区', '黄陂区', '新洲区'],
  },
  '湖南省': { '长沙市': ['芙蓉区', '天心区', '岳麓区', '开福区', '雨花区', '望城区', '长沙县', '浏阳市', '宁乡市'] },
  '四川省': { '成都市': ['锦江区', '青羊区', '金牛区', '武侯区', '成华区', '龙泉驿区', '青白江区', '新都区', '温江区', '双流区', '郫都区'] },
  '安徽省': { '合肥市': ['瑶海区', '庐阳区', '蜀山区', '包河区', '肥西县', '肥东县', '长丰县', '庐江县'] },
  '辽宁省': { '沈阳市': ['和平区', '沈河区', '大东区', '皇姑区', '铁西区', '苏家屯区', '浑南区', '沈北新区', '于洪区'], '大连市': ['中山区', '西岗区', '沙河口区', '甘井子区', '旅顺口区', '金州区'] },
  '河南省': { '郑州市': ['中原区', '二七区', '管城回族区', '金水区', '上街区', '惠济区'] },
  '陕西省': { '西安市': ['新城区', '碑林区', '莲湖区', '灞桥区', '未央区', '雁塔区', '阎良区', '临潼区', '长安区', '高陵区'] },
  '河北省': { '石家庄市': ['长安区', '桥西区', '新华区', '裕华区', '藁城区', '鹿泉区', '栾城区'] },
  '江西省': { '南昌市': ['东湖区', '西湖区', '青云谱区', '青山湖区', '新建区', '红谷滩区'] },
  '吉林省': { '长春市': ['南关区', '宽城区', '朝阳区', '二道区', '绿园区', '双阳区'] },
  '黑龙江省': { '哈尔滨市': ['道里区', '南岗区', '道外区', '平房区', '松北区', '香坊区', '呼兰区', '阿城区'] },
  '海南省': { '海口市': ['秀英区', '龙华区', '琼山区', '美兰区'] },
  '云南省': { '昆明市': ['五华区', '盘龙区', '官渡区', '西山区', '呈贡区'] },
  '贵州省': { '贵阳市': ['南明区', '云岩区', '花溪区', '乌当区', '白云区', '观山湖区'] },
};

const PROVINCE_OPTIONS: SelectOption[] = Object.keys(REGION_DATA).map((v) => ({ value: v, label: v }));

function getCityOptions(province: string): SelectOption[] {
  if (!province || !REGION_DATA[province]) return [];
  return Object.keys(REGION_DATA[province]).map((v) => ({ value: v, label: v }));
}

function getDistrictOptions(province: string, city: string): SelectOption[] {
  if (!province || !city || !REGION_DATA[province] || !REGION_DATA[province][city]) return [];
  return REGION_DATA[province][city].map((v) => ({ value: v, label: v }));
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
];

const PROGRESS_STATUS_OPTIONS: SelectOption[] = Object.entries(PROGRESS_STATUS_LABELS).map(([value, label]) => ({ value, label }));
const USER_OPTIONS: SelectOption[] = MOCK_USERS.map((u) => ({ value: u.id, label: u.name }));

// 企业基本信息 - 下拉选项
const COUNTRY_REGION_OPTIONS: SelectOption[] = ['中企', '美企', '日企', '韩企', '台企', '港企', '新加坡', '德国', '法国', '英国', '其他'].map((v) => ({ value: v, label: v }));
const INDUSTRY_CATEGORY_OPTIONS: SelectOption[] = ['半导体', '高科技', '工业工程', '新能源', '医疗健康', '消费品', '其他'].map((v) => ({ value: v, label: v }));
const INDUSTRY_CHAIN_FORMAT_OPTIONS: SelectOption[] = ['设计研发', '装备制造', '工业生产', '商贸服务', '机构组织', '平台组织'].map((v) => ({ value: v, label: v }));
const SUPPLY_CHAIN_ROLE_OPTIONS: SelectOption[] = ['供应商', '采购商', '中间商', '服务商'].map((v) => ({ value: v, label: v }));
const CROSS_BORDER_MODE_OPTIONS: SelectOption[] = ['口岸', '直通', '保税仓库', '保税区域', '普通仓库', '其他'].map((v) => ({ value: v, label: v }));
const CUSTOMER_CHANNEL_OPTIONS: SelectOption[] = ['直客', '代理', '同行'].map((v) => ({ value: v, label: v }));
const CUSTOMER_SOURCE_OPTIONS: SelectOption[] = ['公司资源', '自主开拓', '电话咨询', '客户推荐'].map((v) => ({ value: v, label: v }));
const SERVICE_PRODUCT_OPTIONS: SelectOption[] = ['货代', '关务', '仓储', '运输', '进出口', '维修', '合同物流', '一体化供应链', '其他'].map((v) => ({ value: v, label: v }));
const CUSTOMER_LEVEL_OPTIONS: SelectOption[] = ['K', 'A', 'B', 'C', 'D'].map((v) => ({ value: v, label: v }));
const INTENDED_CITY_OPTIONS: SelectOption[] = ['北京', '上海', '广州', '深圳', '天津', '重庆', '杭州', '南京', '苏州', '武汉', '成都', '西安', '青岛', '大连', '宁波', '厦门', '东莞', '佛山', '合肥', '长沙', '郑州', '济南', '沈阳', '福州', '无锡', '珠海', '中山', '惠州'].map((v) => ({ value: v, label: v }));

function getSigningEntityOptions(signingEntities: ReturnType<typeof useApp>['signingEntities']): SelectOption[] {
  return signingEntities.map((e) => ({ value: e.id, label: e.name }));
}
function getServiceEntityOptions(serviceEntities: ReturnType<typeof useApp>['serviceEntities']): SelectOption[] {
  return serviceEntities.map((e) => ({ value: e.id, label: e.name }));
}
function getSettlementEntityOptions(settlementEntities: ReturnType<typeof useApp>['settlementEntities']): SelectOption[] {
  return settlementEntities.map((e) => ({ value: e.id, label: e.name }));
}

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

export default function EditCustomerPage() {
  const params = useParams();
  const router = useRouter();
  const { customers, updateCustomer, addLog, signingEntities, serviceEntities, settlementEntities } = useApp();

  const customer = useMemo(() => customers.find((c) => c.id === params.id), [params.id, customers]);

  const [activeTab, setActiveTab] = useState<TabType>('basic');
  const [form, setForm] = useState<EditFormData | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const initialized = useRef(false);

  // 模糊搜索状态
  const [nameSuggestions, setNameSuggestions] = useState<MockCompany[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [verifiedCompany, setVerifiedCompany] = useState<MockCompany | null>(null);
  const [showBizInfoPopover, setShowBizInfoPopover] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (customer && !initialized.current) {
      setForm(buildFormData(customer));
      initialized.current = true;
    }
  }, [customer]);

  const updateField = useCallback(<K extends keyof EditFormData>(key: K, value: EditFormData[K]) => {
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev));
    setIsDirty(true);
  }, []);

  // 客户名称模糊搜索
  const handleNameChange = useCallback((value: string) => {
    updateField('name', value);
    setVerifiedCompany(null);
    if (value.length >= 2) {
      const results = searchCompanies(value);
      setNameSuggestions(results);
      setShowSuggestions(results.length > 0);
    } else {
      setNameSuggestions([]);
      setShowSuggestions(false);
    }
  }, [updateField]);

  const handleSelectSuggestion = useCallback((company: MockCompany) => {
    setForm((prev) => (prev ? {
      ...prev,
      name: company.name,
      unifiedSocialCreditCode: prev.unifiedSocialCreditCode || company.unifiedSocialCreditCode,
      legalRepresentative: prev.legalRepresentative || company.legalRepresentative,
      registeredCapital: prev.registeredCapital || company.registeredCapital,
      establishmentDate: prev.establishmentDate || company.establishmentDate,
      registrationStatus: prev.registrationStatus || company.registrationStatus,
    } : prev));
    setVerifiedCompany(company);
    setShowSuggestions(false);
    setIsDirty(true);
  }, []);

  // 上下游关联关系 - 增删改
  const addRelatedCompany = useCallback(() => {
    setForm((prev) => (prev ? {
      ...prev,
      relatedCompanies: [...prev.relatedCompanies, { id: `rel-${Date.now()}`, relatedCompanyName: '', relation: 'supplier', relatedCompanyLevel: 'upstream', validFrom: '', validTo: '' }],
    } : prev));
    setIsDirty(true);
  }, []);

  const updateRelatedCompany = useCallback((id: string, field: string, value: string) => {
    setForm((prev) => (prev ? {
      ...prev,
      relatedCompanies: prev.relatedCompanies.map((r) => r.id === id ? { ...r, [field]: value } : r),
    } : prev));
    setIsDirty(true);
  }, []);

  const removeRelatedCompany = useCallback((id: string) => {
    setForm((prev) => (prev ? {
      ...prev,
      relatedCompanies: prev.relatedCompanies.filter((r) => r.id !== id),
    } : prev));
    setIsDirty(true);
  }, []);

  // 经营商品档案 - 增删改
  const addProduct = useCallback(() => {
    setForm((prev) => (prev ? {
      ...prev,
      products: [...prev.products, { id: `prod-${Date.now()}`, productName: '', productCode: '', customsDeclarationElements: '', origin: '', industryChainCategory: '', relatedBillingEntityId: '' }],
    } : prev));
    setIsDirty(true);
  }, []);

  const updateProduct = useCallback((id: string, field: string, value: string) => {
    setForm((prev) => (prev ? {
      ...prev,
      products: prev.products.map((p) => p.id === id ? { ...p, [field]: value } : p),
    } : prev));
    setIsDirty(true);
  }, []);

  const removeProduct = useCallback((id: string) => {
    setForm((prev) => (prev ? {
      ...prev,
      products: prev.products.filter((p) => p.id !== id),
    } : prev));
    setIsDirty(true);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(e.target as Node) && nameInputRef.current && !nameInputRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setShowBizInfoPopover(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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


  const handleSave = useCallback(async () => {
    if (!customer || !form) return;
    if (!form.name.trim()) { setErrorMessage('请填写客户名称'); return; }
    if (form.responsiblePersons.length === 0) { setErrorMessage('请选择负责人（必填）'); return; }

    setIsSubmitting(true);
    setErrorMessage('');

    updateCustomer(customer.id, {
      name: form.name.trim(),
      customerCode: form.customerCode.trim() || undefined,
      signingEntityIds: form.signingEntityIds.length > 0 ? form.signingEntityIds : undefined,
      serviceEntityIds: form.serviceEntityIds.length > 0 ? form.serviceEntityIds : undefined,
      settlementEntityIds: form.settlementEntityIds.length > 0 ? form.settlementEntityIds : undefined,
      status: form.status,
      responsiblePersons: form.responsiblePersons,
      collaborators: form.collaborators,
      progressStatus: form.progressStatus,
      basicInfo: {
        logoUrls: form.logoUrls.length > 0 ? form.logoUrls : undefined,
        unifiedSocialCreditCode: form.unifiedSocialCreditCode.trim() || undefined,
        countryRegion: form.countryRegion || undefined,
        industryCategory: form.industryCategory || undefined,
        mainProducts: form.mainProducts.trim() || undefined,
        industryChainFormat: form.industryChainFormat || undefined,
        supplyChainRole: form.supplyChainRole || undefined,
        crossBorderMode: form.crossBorderMode || undefined,
        customerChannel: form.customerChannel || undefined,
        customerSource: form.customerSource || undefined,
        potentialCompetitors: form.potentialCompetitors.trim() || undefined,
        relatedEnterprises: form.relatedEnterprises.trim() || undefined,
        addressProvince: form.addressProvince || undefined,
        addressCity: form.addressCity || undefined,
        addressDistrict: form.addressDistrict || undefined,
        addressDetail: form.addressDetail.trim() || undefined,
        intendedServiceRegions: form.intendedServiceRegions.length > 0 ? form.intendedServiceRegions : undefined,
        serviceProducts: form.serviceProduct ? [form.serviceProduct] : undefined,
        otherServiceRequirement: form.serviceProduct === '其他' ? form.otherServiceRequirement.trim() || undefined : undefined,
        estimatedMonthlyVolume: form.estimatedMonthlyVolume.trim() || undefined,
        warehouseArea: form.warehouseArea.trim() || undefined,
        warehouseConditions: form.warehouseConditions.trim() || undefined,
        customerLevel: form.customerLevel || undefined,
        ourAdvantage: form.ourAdvantage.trim() || undefined,
        ourDisadvantage: form.ourDisadvantage.trim() || undefined,
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
        phone: form.phone.trim() || undefined,
        registrationStatus: form.registrationStatus || undefined,
        legalRepresentative: form.legalRepresentative.trim() || undefined,
        email: form.email.trim() || undefined,
        enterpriseScale: form.enterpriseScale || undefined,
        registeredCapital: form.registeredCapital.trim() || undefined,
        website: form.website.trim() || undefined,
        establishmentDate: form.establishmentDate.trim() || undefined,
        countryRegion: form.bizCountryRegion || undefined,
        industryTags: form.industryTags.length > 0 ? form.industryTags : undefined,
      },
      semiconductorInfo: form.industryChainLevel ? {
        industryChainLevel: form.industryChainLevel as IndustryChainLevel,
        industryChainRole: form.industryChainRole as IndustryChainRole | '',
        industryTags: form.semiIndustryTags,
      } : undefined,
      relatedCompanies: form.relatedCompanies.length > 0 ? form.relatedCompanies.filter((r) => r.relatedCompanyName.trim()).map((r) => ({
        id: r.id,
        relatedCompanyName: r.relatedCompanyName.trim(),
        relation: r.relation,
        relatedCompanyLevel: r.relatedCompanyLevel,
        validFrom: r.validFrom || undefined,
        validTo: r.validTo || undefined,
      })) : undefined,
      products: form.products.length > 0 ? form.products.filter((p) => p.productName.trim()).map((p) => ({
        id: p.id,
        productName: p.productName.trim(),
        productCode: p.productCode.trim() || undefined,
        customsDeclarationElements: p.customsDeclarationElements.trim() || undefined,
        origin: p.origin.trim() || undefined,
        industryChainCategory: p.industryChainCategory || undefined,
        relatedBillingEntityId: p.relatedBillingEntityId || undefined,
      })) : undefined,
    });

    addLog({ action: 'update', operator: '系统管理员', targetType: 'customer', targetId: customer.id, targetName: customer.name, details: `编辑客户信息: ${form.name.trim()}` });
    router.push(`/customers/${customer.id}`);
  }, [form, customer, updateCustomer, addLog, router]);

  const handleBack = useCallback(() => {
    if (isDirty) {
      if (!window.confirm('您有未保存的更改，确定要离开吗？')) return;
    }
    router.push(`/customers/${customer?.id}`);
  }, [isDirty, customer, router]);

  if (!customer || !form) {
    return (
        <div className="max-w-[1440px] mx-auto py-12 text-center">
          <h2 className="text-2xl font-bold text-[#0A0A0A] mb-4">客户不存在</h2>
          <button onClick={() => router.push('/customers')} className="inline-flex items-center px-4 py-2 bg-[#2D3BFF] text-white rounded-lg font-medium hover:bg-[#4338CA] transition-all">返回客户列表</button>
        </div>
    );
  }

  const createdByUser = getUserById(customer.createdBy);
  const requiredStar = FIELD_STYLES.requiredStar;
  const hasBizInfo = verifiedCompany !== null;

  return (
      <div className="max-w-[1440px] mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={handleBack} className="p-2 text-[#5A5A5A] hover:text-[#0A0A0A] hover:bg-[#F5F5F5] rounded-lg transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-[#0A0A0A]">编辑客户</h1>
              <p className="text-sm text-[#5A5A5A]">{customer.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={handleBack} className="px-4 py-2 border border-[#D5D5D5] text-[#5A5A5A] rounded-lg text-sm font-medium hover:bg-[#F5F5F5] transition-colors">取消</button>
            <button onClick={handleSave} disabled={isSubmitting} className="px-6 py-2 bg-[#2D3BFF] text-white rounded-lg text-sm font-medium hover:bg-[#4338CA] transition-all disabled:opacity-50">{isSubmitting ? '保存中...' : '保存'}</button>
          </div>
        </div>

        {errorMessage && (
          <div className="bg-[#FFEBEE] border border-[#FFCDD2] rounded-lg px-4 py-3 text-sm text-[#D63031]">{errorMessage}</div>
        )}

        <ProgressStepper readonly currentStatus={form.progressStatus} />

        {/* Tabs */}
        <div className="border-b border-[#EBEBEB]">
          <div className="flex space-x-1 bg-[#F5F5F5] rounded-lg p-1 overflow-x-auto">
            {(Object.keys(TAB_LABELS) as TabType[]).map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${activeTab === tab ? 'bg-white text-[#2D3BFF] shadow-sm' : 'text-[#5A5A5A] hover:text-[#0A0A0A]'}`}>
                {TAB_LABELS[tab]}
              </button>
            ))}
          </div>
        </div>

        <div className="pb-8">
          {/* Tab 1: Basic */}
          {activeTab === 'basic' && (
            <div className="space-y-6">
              {/* 协同管理信息 */}
              <div className="bg-white rounded-xl border border-[#EBEBEB] p-6">
                <h3 className="text-lg font-semibold text-[#0A0A0A] mb-4">协同管理信息</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className={FIELD_STYLES.label}>创建人</label>
                    <div className="flex items-center gap-2 px-3 py-2 bg-[#F5F5F5] border border-[#D5D5D5] rounded-lg">
                      <UserAvatar userId={customer.createdBy} size="sm" />
                      <span className="text-sm text-[#999999]">{createdByUser?.name || '-'}（不可修改）</span>
                    </div>
                  </div>
                  <div>
                    <label className={FIELD_STYLES.label}>负责人{requiredStar}</label>
                    <SearchableMultiSelect values={form.responsiblePersons} onChange={(ids) => updateField('responsiblePersons', ids)} options={USER_OPTIONS} placeholder="请选择负责人（必填）" searchPlaceholder="搜索用户..." emptyText="未找到用户" renderOption={(opt) => <UserOptionRender userId={opt.value} />} renderBadge={(opt, onRemove) => <UserBadgeRender userId={opt.value} onRemove={onRemove} />} />
                  </div>
                  <div>
                    <label className={FIELD_STYLES.label}>协同人</label>
                    <SearchableMultiSelect values={form.collaborators} onChange={(ids) => updateField('collaborators', ids)} options={USER_OPTIONS} placeholder="搜索并选择协同人..." searchPlaceholder="搜索用户..." emptyText="未找到用户" renderOption={(opt) => <UserOptionRender userId={opt.value} />} renderBadge={(opt, onRemove) => <UserBadgeRender userId={opt.value} onRemove={onRemove} />} />
                  </div>
                  <div>
                    <label className={FIELD_STYLES.label}>跟进进度 <span className="text-xs text-[#999]">（系统自动判断）</span></label>
                    <div className={`${FIELD_STYLES.input} bg-[#F5F5F5] text-[#5A5A5A] flex items-center gap-2 cursor-default`}>
                      <span className={`inline-block w-2.5 h-2.5 rounded-full ${PROGRESS_STATUS_COLORS[form.progressStatus]?.dot || 'bg-gray-400'}`} />
                      {PROGRESS_STATUS_LABELS[form.progressStatus] || form.progressStatus}
                    </div>
                  </div>
                  <div>
                    <label className={FIELD_STYLES.label}>客户代码</label>
                    <input type="text" className={FIELD_STYLES.input} value={form.customerCode} onChange={(e) => updateField('customerCode', e.target.value)} placeholder="请输入客户代码" />
                  </div>
                  <div>
                    <label className={FIELD_STYLES.label}>客户状态</label>
                    {customer?.status === 'draft' ? (
                      <div className={`${FIELD_STYLES.input} bg-[#F5F5F5] text-[#5A5A5A] cursor-default`}>草稿</div>
                    ) : (
                      <SearchableSelect<CustomerStatus> value={form.status} onChange={(v) => updateField('status', v)} options={CUSTOMER_STATUS_OPTIONS} placeholder="请选择客户状态" />
                    )}
                  </div>
                  <div>
                    <label className={FIELD_STYLES.label}>签约主体</label>
                    <SearchableMultiSelect values={form.signingEntityIds} onChange={(ids) => updateField('signingEntityIds', ids)} options={getSigningEntityOptions(signingEntities)} placeholder="搜索并选择签约主体..." searchPlaceholder="搜索签约主体..." emptyText="未找到签约主体" />
                  </div>
                  <div>
                    <label className={FIELD_STYLES.label}>服务主体</label>
                    <SearchableMultiSelect values={form.serviceEntityIds} onChange={(ids) => updateField('serviceEntityIds', ids)} options={getServiceEntityOptions(serviceEntities)} placeholder="搜索并选择服务主体..." searchPlaceholder="搜索服务主体..." emptyText="未找到服务主体" />
                  </div>
                  <div>
                    <label className={FIELD_STYLES.label}>结算主体</label>
                    <SearchableMultiSelect values={form.settlementEntityIds} onChange={(ids) => updateField('settlementEntityIds', ids)} options={getSettlementEntityOptions(settlementEntities)} placeholder="搜索并选择结算主体..." searchPlaceholder="搜索结算主体..." emptyText="未找到结算主体" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-[#5A5A5A] mb-1.5 block">联系人</label>
                    <input type="text" value={form.contactPerson} onChange={e => updateField('contactPerson', e.target.value)} placeholder="请输入联系人姓名" className="w-full px-3 py-2 border border-[#D5D5D5] rounded-lg text-sm focus:outline-none focus:border-[#2D3BFF] focus:shadow-[0_0_0_2px_rgba(45,59,255,0.10)]" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-[#5A5A5A] mb-1.5 block">联系人电话</label>
                    <input type="text" value={form.contactPhone} onChange={e => updateField('contactPhone', e.target.value)} placeholder="请输入联系人电话" className="w-full px-3 py-2 border border-[#D5D5D5] rounded-lg text-sm focus:outline-none focus:border-[#2D3BFF] focus:shadow-[0_0_0_2px_rgba(45,59,255,0.10)]" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-[#5A5A5A] mb-1.5 block">联系人邮箱</label>
                    <input type="text" value={form.contactEmail} onChange={e => updateField('contactEmail', e.target.value)} placeholder="请输入联系人邮箱" className="w-full px-3 py-2 border border-[#D5D5D5] rounded-lg text-sm focus:outline-none focus:border-[#2D3BFF] focus:shadow-[0_0_0_2px_rgba(45,59,255,0.10)]" />
                  </div>
                </div>
              </div>

              {/* 企业基本信息 */}
              <div className="bg-white rounded-xl border border-[#EBEBEB] p-6">
                <h3 className="text-lg font-semibold text-[#0A0A0A] mb-4">企业基本信息</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* 客户LOGO */}
                  <div>
                    <label className={FIELD_STYLES.label}>客户LOGO</label>
                    <label className="flex items-center justify-center w-full h-[38px] border border-dashed border-[#D5D5D5] rounded-lg text-xs text-[#999999] hover:border-[#2D3BFF] hover:text-[#2D3BFF] cursor-pointer transition-colors">
                      <Upload className="w-4 h-4 mr-1" />
                      添加图片（最多9张）
                      <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => {
                        const files = e.target.files;
                        if (files) {
                          const urls = Array.from(files).slice(0, 9).map((f) => URL.createObjectURL(f));
                          updateField('logoUrls', [...form.logoUrls, ...urls].slice(0, 9));
                        }
                      }} />
                    </label>
                    {form.logoUrls.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {form.logoUrls.map((url, idx) => (
                          <div key={idx} className="relative w-8 h-8 rounded border overflow-hidden group">
                            <img src={url} alt="" className="w-full h-full object-cover" />
                            <button type="button" onClick={() => updateField('logoUrls', form.logoUrls.filter((_, i) => i !== idx))} className="absolute inset-0 bg-black/40 text-white hidden group-hover:flex items-center justify-center"><X className="w-3 h-3" /></button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* 客户名称 + 工商信息按钮 */}
                  <div>
                    <label className={FIELD_STYLES.label}>客户名称{requiredStar}</label>
                    <div className="flex gap-1 relative">
                      <div className="flex-1 relative">
                        <input ref={nameInputRef} type="text" className={FIELD_STYLES.input} value={form.name} onChange={(e) => handleNameChange(e.target.value)} onFocus={() => { if (nameSuggestions.length > 0) setShowSuggestions(true); }} placeholder="搜索企业名称进行模糊匹配" />
                        {showSuggestions && nameSuggestions.length > 0 && (
                          <div ref={suggestionsRef} className="absolute left-0 right-0 top-full mt-1 bg-white border border-[#EBEBEB] rounded-lg shadow-[0_8px_32px_rgba(0,0,0,0.12)] z-50 max-h-60 overflow-y-auto">
                            {nameSuggestions.map((company, idx) => (
                              <button key={idx} type="button" onClick={() => handleSelectSuggestion(company)} className="w-full text-left px-3 py-2 hover:bg-[#F5F5F5] transition-colors border-b border-[#F5F5F5] last:border-b-0">
                                <div className="text-sm text-[#0A0A0A]">{company.name}</div>
                                <div className="text-xs text-[#999999] mt-0.5">法定代表人: {company.legalRepresentative} | 注册资本: {company.registeredCapital}</div>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="relative" ref={popoverRef}>
                        <button type="button" onClick={() => { if (hasBizInfo) setShowBizInfoPopover(!showBizInfoPopover); }} className={`inline-flex items-center justify-center w-[38px] h-[38px] rounded-lg border transition-colors shrink-0 ${hasBizInfo ? 'bg-[#E6F7F0] border-[#0D8A5E] text-[#0D8A5E] cursor-pointer hover:bg-[#D0F0E3]' : 'bg-[#F5F5F5] border-[#D5D5D5] text-[#999999] cursor-not-allowed'}`} title={hasBizInfo ? '查看工商信息' : '未校验到工商信息'}>
                          <Building2 className="w-4 h-4" />
                        </button>
                        {hasBizInfo && showBizInfoPopover && verifiedCompany && (
                          <div className="absolute right-0 top-full mt-2 w-72 bg-white border border-[#EBEBEB] rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] z-50 p-4">
                            <h4 className="text-sm font-semibold text-[#0A0A0A] mb-3 border-b border-[#F5F5F5] pb-2">工商信息校验</h4>
                            <div className="space-y-2 text-[13px]">
                              <div><span className="text-[#999999]">企业名称：</span><span className="text-[#0A0A0A]">{verifiedCompany.name}</span></div>
                              <div><span className="text-[#999999]">法定代表人：</span><span className="text-[#0A0A0A]">{verifiedCompany.legalRepresentative}</span></div>
                              <div><span className="text-[#999999]">注册资本：</span><span className="text-[#0A0A0A]">{verifiedCompany.registeredCapital}</span></div>
                              <div><span className="text-[#999999]">成立日期：</span><span className="text-[#0A0A0A]">{verifiedCompany.establishmentDate}</span></div>
                              <div><span className="text-[#999999]">登记状态：</span><span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-[#E6F7F0] text-[#0D8A5E]">{verifiedCompany.registrationStatus}</span></div>
                              <div><span className="text-[#999999]">统一社会信用代码：</span><span className="text-[#0A0A0A] font-mono text-xs">{verifiedCompany.unifiedSocialCreditCode}</span></div>
                              <div><span className="text-[#999999]">注册地址：</span><span className="text-[#0A0A0A]">{verifiedCompany.registeredAddress}</span></div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div><label className={FIELD_STYLES.label}>统一社会信用证代码</label><input type="text" className={FIELD_STYLES.input} value={form.unifiedSocialCreditCode} onChange={(e) => updateField('unifiedSocialCreditCode', e.target.value)} placeholder="请输入信用证代码" /></div>
                  <div><label className={FIELD_STYLES.label}>客户国（地）别</label><SearchableSelect value={form.countryRegion} onChange={(v) => updateField('countryRegion', v)} options={COUNTRY_REGION_OPTIONS} placeholder="请选择" /></div>
                  <div><label className={FIELD_STYLES.label}>产业分类</label><SearchableSelect value={form.industryCategory} onChange={(v) => updateField('industryCategory', v)} options={INDUSTRY_CATEGORY_OPTIONS} placeholder="请选择" /></div>
                  <div><label className={FIELD_STYLES.label}>主营产品工艺</label><input type="text" className={FIELD_STYLES.input} value={form.mainProducts} onChange={(e) => updateField('mainProducts', e.target.value)} placeholder="请输入主营产品工艺" /></div>
                  <div><label className={FIELD_STYLES.label}>产业链业态</label><SearchableSelect value={form.industryChainFormat} onChange={(v) => updateField('industryChainFormat', v)} options={INDUSTRY_CHAIN_FORMAT_OPTIONS} placeholder="请选择" /></div>
                  <div><label className={FIELD_STYLES.label}>供应链角色</label><SearchableSelect value={form.supplyChainRole} onChange={(v) => updateField('supplyChainRole', v)} options={SUPPLY_CHAIN_ROLE_OPTIONS} placeholder="请选择" /></div>
                  <div><label className={FIELD_STYLES.label}>跨境模式</label><SearchableSelect value={form.crossBorderMode} onChange={(v) => updateField('crossBorderMode', v)} options={CROSS_BORDER_MODE_OPTIONS} placeholder="请选择" /></div>
                  <div><label className={FIELD_STYLES.label}>客户渠道</label><SearchableSelect value={form.customerChannel} onChange={(v) => updateField('customerChannel', v)} options={CUSTOMER_CHANNEL_OPTIONS} placeholder="请选择" /></div>
                  <div><label className={FIELD_STYLES.label}>客户来源</label><SearchableSelect value={form.customerSource} onChange={(v) => updateField('customerSource', v)} options={CUSTOMER_SOURCE_OPTIONS} placeholder="请选择" /></div>
                  <div><label className={FIELD_STYLES.label}>客户等级</label><SearchableSelect value={form.customerLevel} onChange={(v) => updateField('customerLevel', v)} options={CUSTOMER_LEVEL_OPTIONS} placeholder="请选择" /></div>
                  <div><label className={FIELD_STYLES.label}>潜在竞争对手</label><input type="text" className={FIELD_STYLES.input} value={form.potentialCompetitors} onChange={(e) => updateField('potentialCompetitors', e.target.value)} placeholder="请输入潜在竞争对手" /></div>
                  <div><label className={FIELD_STYLES.label}>关联上下游企业</label><input type="text" className={FIELD_STYLES.input} value={form.relatedEnterprises} onChange={(e) => updateField('relatedEnterprises', e.target.value)} placeholder="请输入关联上下游企业" /></div>
                  <div>
                    <label className={FIELD_STYLES.label}>意向服务地区</label>
                    <SearchableMultiSelect values={form.intendedServiceRegions} onChange={(v) => updateField('intendedServiceRegions', v)} options={INTENDED_CITY_OPTIONS} placeholder="选择城市..." searchPlaceholder="搜索城市..." emptyText="未找到城市" />
                  </div>
                  <div>
                    <label className={FIELD_STYLES.label}>服务产品</label>
                    <SearchableSelect
                      value={form.serviceProduct}
                      onChange={(v) => { updateField('serviceProduct', v); if (v !== '其他') updateField('otherServiceRequirement', ''); }}
                      options={SERVICE_PRODUCT_OPTIONS}
                      placeholder="请选择服务产品"
                    />
                    {form.serviceProduct === '其他' && (
                      <div className="mt-3">
                        <label className={FIELD_STYLES.label}>其他服务产品需求</label>
                        <input type="text" className={FIELD_STYLES.input} value={form.otherServiceRequirement} onChange={(e) => updateField('otherServiceRequirement', e.target.value)} placeholder="请描述服务产品需求" />
                      </div>
                    )}
                  </div>

                  {/* 公司营业地址 - 省/市/区 级联 */}
                  <div className="lg:col-span-4">
                    <label className={FIELD_STYLES.label}>公司营业地址</label>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                      <SearchableSelect value={form.addressProvince} onChange={(v) => { updateField('addressProvince', v); updateField('addressCity', ''); updateField('addressDistrict', ''); }} options={PROVINCE_OPTIONS} placeholder="请选择省" />
                      <SearchableSelect value={form.addressCity} onChange={(v) => { updateField('addressCity', v); updateField('addressDistrict', ''); }} options={getCityOptions(form.addressProvince)} placeholder="请选择市" />
                      <SearchableSelect value={form.addressDistrict} onChange={(v) => updateField('addressDistrict', v)} options={getDistrictOptions(form.addressProvince, form.addressCity)} placeholder="请选择区" />
                      <input type="text" className={FIELD_STYLES.input} value={form.addressDetail} onChange={(e) => updateField('addressDetail', e.target.value)} placeholder="请输入详细地址" />
                    </div>
                  </div>

                  <div><label className={FIELD_STYLES.label}>预计月均业务量（票）</label><input type="text" className={FIELD_STYLES.input} value={form.estimatedMonthlyVolume} onChange={(e) => updateField('estimatedMonthlyVolume', e.target.value)} placeholder="请输入" /></div>
                  <div><label className={FIELD_STYLES.label}>仓库面积（平方米）</label><input type="text" className={FIELD_STYLES.input} value={form.warehouseArea} onChange={(e) => updateField('warehouseArea', e.target.value)} placeholder="请输入" /></div>
                  <div><label className={FIELD_STYLES.label}>仓库温湿度要求</label><input type="text" className={FIELD_STYLES.input} value={form.warehouseConditions} onChange={(e) => updateField('warehouseConditions', e.target.value)} placeholder="请输入温湿度要求" /></div>

                  <div className="md:col-span-2"><label className={FIELD_STYLES.label}>我司优势简述</label><input type="text" className={FIELD_STYLES.input} value={form.ourAdvantage} onChange={(e) => updateField('ourAdvantage', e.target.value)} placeholder="请输入我司优势" /></div>
                  <div className="md:col-span-2"><label className={FIELD_STYLES.label}>我司劣势简述</label><input type="text" className={FIELD_STYLES.input} value={form.ourDisadvantage} onChange={(e) => updateField('ourDisadvantage', e.target.value)} placeholder="请输入我司劣势" /></div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Business Info (工商资质全景) */}
          {activeTab === 'business' && (
            <div className="bg-white rounded-xl border border-[#EBEBEB] p-6">
              <h3 className="text-lg font-semibold text-[#0A0A0A] mb-4">工商资质全景信息</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                <div><label className={FIELD_STYLES.label}>电话</label><input type="text" className={FIELD_STYLES.input} value={form.phone} onChange={(e) => updateField('phone', e.target.value)} /></div>
                <div><label className={FIELD_STYLES.label}>登记状态</label><SearchableSelect value={form.registrationStatus} onChange={(v) => updateField('registrationStatus', v)} options={REGISTRATION_STATUS_OPTIONS} placeholder="请选择" /></div>
                <div><label className={FIELD_STYLES.label}>法定代表人</label><input type="text" className={FIELD_STYLES.input} value={form.legalRepresentative} onChange={(e) => updateField('legalRepresentative', e.target.value)} /></div>
                <div><label className={FIELD_STYLES.label}>邮箱</label><input type="text" className={FIELD_STYLES.input} value={form.email} onChange={(e) => updateField('email', e.target.value)} /></div>
                <div><label className={FIELD_STYLES.label}>企业规模</label><SearchableSelect value={form.enterpriseScale} onChange={(v) => updateField('enterpriseScale', v)} options={ENTERPRISE_SCALE_OPTIONS} placeholder="请选择" /></div>
                <div><label className={FIELD_STYLES.label}>注册资本</label><input type="text" className={FIELD_STYLES.input} value={form.registeredCapital} onChange={(e) => updateField('registeredCapital', e.target.value)} /></div>
                <div><label className={FIELD_STYLES.label}>官网</label><input type="text" className={FIELD_STYLES.input} value={form.website} onChange={(e) => updateField('website', e.target.value)} /></div>
                <div><label className={FIELD_STYLES.label}>成立日期</label><input type="text" className={FIELD_STYLES.input} value={form.establishmentDate} onChange={(e) => updateField('establishmentDate', e.target.value)} placeholder="YYYY-MM-DD" /></div>
                <div><label className={FIELD_STYLES.label}>国家（地区）</label><input type="text" className={FIELD_STYLES.input} value={form.bizCountryRegion} onChange={(e) => updateField('bizCountryRegion', e.target.value)} /></div>
                <div className="lg:col-span-2">
                  <label className={FIELD_STYLES.label}>行业标签</label>
                  <SearchableMultiSelect values={form.industryTags} onChange={(tags) => updateField('industryTags', tags)} options={INDUSTRY_TAG_OPTIONS} placeholder="添加标签..." searchPlaceholder="搜索标签..." emptyText="无匹配标签" />
                </div>
                <div className="lg:col-span-4 mt-2"><div className="border-t border-[#EBEBEB] pt-3 text-xs font-semibold text-[#5A5A5A] uppercase tracking-wide mb-2">工商登记信息</div></div>
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
                <div className="lg:col-span-4"><label className={FIELD_STYLES.label}>经营范围</label><Textarea value={form.businessScope} onChange={(e) => updateField('businessScope', e.target.value)} className="mt-0.5 min-h-[80px]" /></div>
              </div>
            </div>
          )}

          {/* Tab 3: Semiconductor */}
          {activeTab === 'semiconductor' && (
            <div className="bg-white rounded-xl border border-[#EBEBEB] p-6">
              <h3 className="text-lg font-semibold text-[#0A0A0A] mb-4">半导体产业链定位</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div><label className={FIELD_STYLES.label}>产业链层级</label><SearchableSelect value={form.industryChainLevel} onChange={(v) => updateField('industryChainLevel', v as IndustryChainLevel | '')} options={INDUSTRY_CHAIN_LEVEL_OPTIONS} placeholder="请选择" /></div>
                <div><label className={FIELD_STYLES.label}>细分产业链角色</label><SearchableSelect value={form.industryChainRole} onChange={(v) => updateField('industryChainRole', v as IndustryChainRole | '')} options={INDUSTRY_CHAIN_ROLE_OPTIONS} placeholder="请选择" searchPlaceholder="搜索产业链角色..." /></div>
              </div>
              <div><label className={FIELD_STYLES.label}>半导体行业标签</label><SearchableMultiSelect values={form.semiIndustryTags} onChange={(tags) => updateField('semiIndustryTags', tags)} options={INDUSTRY_TAG_OPTIONS} placeholder="添加标签..." searchPlaceholder="搜索标签..." emptyText="无匹配标签" /></div>
            </div>
          )}

          {activeTab === 'relations' && (
            <div className="bg-white rounded-xl border border-[#EBEBEB] p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[16px] font-semibold text-[#0A0A0A]">企业上下游关联关系</h3>
                <button
                  type="button"
                  onClick={addRelatedCompany}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-[#D5D5D5] text-[#0A0A0A] rounded-lg text-sm hover:bg-[#F5F5F5] transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  添加关联企业
                </button>
              </div>
              {form.relatedCompanies.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-[#FAFAFA] text-[11px] font-semibold uppercase text-[#5A5A5A]">
                      <tr>
                        <th className="px-3 py-2.5 text-left w-10">序号</th>
                        <th className="px-3 py-2.5 text-left">关联企业名称</th>
                        <th className="px-3 py-2.5 text-left">与本企业关系</th>
                        <th className="px-3 py-2.5 text-left">对方产业链层级</th>
                        <th className="px-3 py-2.5 text-left">关联有效期</th>
                        <th className="px-3 py-2.5 text-center w-16">操作</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#EBEBEB]">
                      {form.relatedCompanies.map((rel, idx) => (
                        <tr key={rel.id}>
                          <td className="px-3 py-2.5 text-[13px] text-[#5A5A5A]">{idx + 1}</td>
                          <td className="px-3 py-2.5">
                            <input
                              type="text"
                              value={rel.relatedCompanyName}
                              onChange={(e) => updateRelatedCompany(rel.id, 'relatedCompanyName', e.target.value)}
                              placeholder="企业名称"
                              className="w-full h-[34px] px-2.5 border border-[#D5D5D5] rounded-lg text-sm text-[#0A0A0A] placeholder:text-[#999999] focus:outline-none focus:border-[#2D3BFF]"
                            />
                          </td>
                          <td className="px-3 py-2.5">
                            <select
                              value={rel.relation}
                              onChange={(e) => updateRelatedCompany(rel.id, 'relation', e.target.value)}
                              className="w-full h-[34px] px-2 border border-[#D5D5D5] rounded-lg text-sm text-[#0A0A0A] bg-white focus:outline-none focus:border-[#2D3BFF]"
                            >
                              {Object.entries(RELATION_LABELS).map(([value, label]) => (
                                <option key={value} value={value}>{label}</option>
                              ))}
                            </select>
                          </td>
                          <td className="px-3 py-2.5">
                            <select
                              value={rel.relatedCompanyLevel}
                              onChange={(e) => updateRelatedCompany(rel.id, 'relatedCompanyLevel', e.target.value)}
                              className="w-full h-[34px] px-2 border border-[#D5D5D5] rounded-lg text-sm text-[#0A0A0A] bg-white focus:outline-none focus:border-[#2D3BFF]"
                            >
                              {Object.entries(INDUSTRY_CHAIN_LEVEL_LABELS).map(([value, label]) => (
                                <option key={value} value={value}>{label}</option>
                              ))}
                            </select>
                          </td>
                          <td className="px-3 py-2.5">
                            <div className="flex items-center gap-1.5">
                              <input
                                type="date"
                                value={rel.validFrom}
                                onChange={(e) => updateRelatedCompany(rel.id, 'validFrom', e.target.value)}
                                className="w-[130px] h-[34px] px-2 border border-[#D5D5D5] rounded-lg text-sm text-[#0A0A0A] focus:outline-none focus:border-[#2D3BFF]"
                              />
                              <span className="text-[#999999] text-xs">至</span>
                              <input
                                type="date"
                                value={rel.validTo}
                                onChange={(e) => updateRelatedCompany(rel.id, 'validTo', e.target.value)}
                                className="w-[130px] h-[34px] px-2 border border-[#D5D5D5] rounded-lg text-sm text-[#0A0A0A] focus:outline-none focus:border-[#2D3BFF]"
                              />
                            </div>
                          </td>
                          <td className="px-3 py-2.5 text-center">
                            <button
                              type="button"
                              onClick={() => removeRelatedCompany(rel.id)}
                              className="p-1.5 text-[#D63031] hover:bg-[#FFEBEE] rounded-lg transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="py-8 text-center text-sm text-[#999999] bg-[#FAFAFA] rounded-lg">暂无上下游关联关系，点击上方按钮添加</div>
              )}
            </div>
          )}
          {activeTab === 'products' && (
            <div className="bg-white rounded-xl border border-[#EBEBEB] p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[16px] font-semibold text-[#0A0A0A]">企业经营商品档案</h3>
                <button
                  type="button"
                  onClick={addProduct}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-[#D5D5D5] text-[#0A0A0A] rounded-lg text-sm hover:bg-[#F5F5F5] transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  添加商品
                </button>
              </div>
              {form.products.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-[#FAFAFA] text-[11px] font-semibold uppercase text-[#5A5A5A]">
                      <tr>
                        <th className="px-3 py-2.5 text-left">商品名称</th>
                        <th className="px-3 py-2.5 text-left">商品编码</th>
                        <th className="px-3 py-2.5 text-left">海关申报要素</th>
                        <th className="px-3 py-2.5 text-left">原产地</th>
                        <th className="px-3 py-2.5 text-left">所属产业链品类</th>
                        <th className="px-3 py-2.5 text-left">关联账单主体</th>
                        <th className="px-3 py-2.5 text-center w-16">操作</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#EBEBEB]">
                      {form.products.map((prod) => (
                        <tr key={prod.id}>
                          <td className="px-3 py-2.5">
                            <input
                              type="text"
                              value={prod.productName}
                              onChange={(e) => updateProduct(prod.id, 'productName', e.target.value)}
                              placeholder="商品名称"
                              className="w-full h-[34px] px-2.5 border border-[#D5D5D5] rounded-lg text-sm text-[#0A0A0A] placeholder:text-[#999999] focus:outline-none focus:border-[#2D3BFF]"
                            />
                          </td>
                          <td className="px-3 py-2.5">
                            <input
                              type="text"
                              value={prod.productCode}
                              onChange={(e) => updateProduct(prod.id, 'productCode', e.target.value)}
                              placeholder="商品编码"
                              className="w-full h-[34px] px-2.5 border border-[#D5D5D5] rounded-lg text-sm text-[#0A0A0A] font-mono placeholder:text-[#999999] focus:outline-none focus:border-[#2D3BFF]"
                            />
                          </td>
                          <td className="px-3 py-2.5">
                            <input
                              type="text"
                              value={prod.customsDeclarationElements}
                              onChange={(e) => updateProduct(prod.id, 'customsDeclarationElements', e.target.value)}
                              placeholder="海关申报要素"
                              className="w-full h-[34px] px-2.5 border border-[#D5D5D5] rounded-lg text-sm text-[#0A0A0A] placeholder:text-[#999999] focus:outline-none focus:border-[#2D3BFF]"
                            />
                          </td>
                          <td className="px-3 py-2.5">
                            <input
                              type="text"
                              value={prod.origin}
                              onChange={(e) => updateProduct(prod.id, 'origin', e.target.value)}
                              placeholder="原产地"
                              className="w-full h-[34px] px-2.5 border border-[#D5D5D5] rounded-lg text-sm text-[#0A0A0A] placeholder:text-[#999999] focus:outline-none focus:border-[#2D3BFF]"
                            />
                          </td>
                          <td className="px-3 py-2.5">
                            <input
                              type="text"
                              value={prod.industryChainCategory}
                              onChange={(e) => updateProduct(prod.id, 'industryChainCategory', e.target.value)}
                              placeholder="产业链品类"
                              className="w-full h-[34px] px-2.5 border border-[#D5D5D5] rounded-lg text-sm text-[#0A0A0A] placeholder:text-[#999999] focus:outline-none focus:border-[#2D3BFF]"
                            />
                          </td>
                          <td className="px-3 py-2.5">
                            <select
                              value={prod.relatedBillingEntityId}
                              onChange={(e) => updateProduct(prod.id, 'relatedBillingEntityId', e.target.value)}
                              className="w-full h-[34px] px-2 border border-[#D5D5D5] rounded-lg text-sm text-[#0A0A0A] bg-white focus:outline-none focus:border-[#2D3BFF]"
                            >
                              <option value="">请选择</option>
                              {[...signingEntities, ...serviceEntities, ...settlementEntities].map((e) => (
                                <option key={e.id} value={e.id}>{e.name}</option>
                              ))}
                            </select>
                          </td>
                          <td className="px-3 py-2.5 text-center">
                            <button
                              type="button"
                              onClick={() => removeProduct(prod.id)}
                              className="p-1.5 text-[#D63031] hover:bg-[#FFEBEE] rounded-lg transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="py-8 text-center text-sm text-[#999999] bg-[#FAFAFA] rounded-lg">暂无商品档案，点击上方按钮添加</div>
              )}
            </div>
          )}
          {activeTab === 'config' && <ReadOnlyTab title="客户信息配置" message="请在详情页管理字段配置" />}
          {activeTab === 'billing' && <ReadOnlyTab title="账单主体配置" message="请在详情页管理账单配置" />}
          {activeTab === 'followup' && <ReadOnlyTab title="跟进记录" message="请在跟进记录模块查看" />}
          {activeTab === 'opportunities' && <ReadOnlyTab title="商机" message="请在商机模块查看" />}
          {activeTab === 'approvals' && <ReadOnlyTab title="风控审批记录" message="请在风控审批模块查看" />}
          {activeTab === 'logs' && <ReadOnlyTab title="操作日志" message="请返回详情页查看" />}
        </div>
      </div>
  );
}

function ReadOnlyTab({ title, count, message }: { title: string; count?: number; message: string }) {
  return (
    <div className="bg-white rounded-xl border border-[#EBEBEB] p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-[#0A0A0A]">{title}</h3>
        {count !== undefined && <span className="text-sm text-[#5A5A5A]">共 {count} 条</span>}
      </div>
      <div className="py-8 text-center text-sm text-[#999999] bg-[#FAFAFA] rounded-lg">{message}</div>
    </div>
  );
}
