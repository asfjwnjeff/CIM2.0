import type { SentimentItem } from './types';

export const DEMO_SENTIMENT_ITEMS: SentimentItem[] = [
  {
    id: 'sent-1',
    title: '某公司Q3财报不及预期，市场反应强烈',
    source: '东方财富',
    sourceType: '媒体报道',
    publishDate: '2025-10-28',
    summary: '公司Q3营收18.5亿元，同比下降12.3%；归母净利润2.1亿元，同比下降28.6%。股价当日下跌5.8%，多家机构下调目标价。短期内公司基本面改善空间有限。',
    content: `公司于2025年10月28日发布第三季度财务报告。报告显示，公司Q3实现营业收入18.5亿元，同比下降12.3%；归母净利润2.1亿元，同比下降28.6%。

财报发布后，公司股价当日下跌5.8%，创年内新低。市场投资者情绪明显转冷，多家机构随即下调公司评级与目标价。

摩根士丹利将评级从"增持"下调至"中性"，目标价从45元下调至38元。中金公司维持"中性"评级，目标价从42元下调至35元。华泰证券指出，公司库存水平处于历史高位，去库存周期可能持续至2026年上半年。

分析师普遍认为，下游消费电子需求疲软、行业竞争加剧是公司业绩承压的主要原因。短期内公司基本面改善空间有限，需关注新产品线放量节奏及海外市场拓展进展。

此外，公司Q3毛利率为32.1%，同比下降3.2个百分点，主要受原材料成本上涨及产品结构变化影响。公司管理层在电话会议中表示，将加大研发投入，聚焦高附加值产品线。`,
    images: [
      'https://picsum.photos/seed/sent1a/800/400',
      'https://picsum.photos/seed/sent1b/800/400',
    ],
    originalUrl: 'https://www.eastmoney.com/news/example-001',
    tags: ['Q3财报', '业绩下滑', '机构评级', '股价下跌', '毛利率'],
    impactAssessment: '负面',
    collectedAt: '2025-10-29 08:00',
  },
  {
    id: 'sent-2',
    title: '公司完成新一轮5亿美元融资，估值突破50亿美元',
    source: '公司官网',
    sourceType: '官网公告',
    publishDate: '2025-10-25',
    summary: '公司宣布完成D轮融资，由红杉资本领投，高瓴资本、启明创投跟投，总金额5亿美元。本轮融资后估值达到50亿美元，资金将用于扩大AI芯片产线和海外市场拓展。',
    content: `公司今日正式宣布完成D轮融资，总金额5亿美元。本轮融资由红杉资本领投，高瓴资本、启明创投跟投，多家老股东继续追加投资。

本轮融资完成后，公司估值达到50亿美元，成为国内半导体领域估值最高的未上市企业之一。公司CEO在内部信中表示，本轮资金将主要用于三大方向：

**扩大AI芯片产线**：计划在长三角地区建设第二条12英寸晶圆产线，预计2026年底投产。

**海外市场拓展**：设立欧洲和东南亚区域总部，加速全球化布局。

**研发投入**：未来三年研发投入将超过10亿美元，聚焦先进制程和先进封装技术。

红杉资本合伙人表示："公司在AI芯片领域的技术积累和商业化能力令人印象深刻，我们看好其在全球半导体产业链中的长期价值。"

此次融资距上一轮C轮融资（2024年3月，2亿美元）仅相隔19个月，估值增长超过150%。`,
    images: [
      'https://picsum.photos/seed/sent2a/800/400',
    ],
    originalUrl: 'https://www.example-company.com/news/example-002',
    tags: ['融资', 'D轮', '估值', 'AI芯片', '海外扩张'],
    impactAssessment: '正面',
    collectedAt: '2025-10-26 08:00',
  },
  {
    id: 'sent-3',
    title: '证监会核准公司科创板IPO注册申请',
    source: '证监会',
    sourceType: '监管公告',
    publishDate: '2025-10-20',
    summary: '中国证监会正式核准公司在科创板首次公开发行股票注册申请。公司拟发行不超过1.2亿股，募集资金约30亿元，主要用于先进制程芯片研发及产业化项目。',
    content: `中国证监会今日发布公告，正式核准公司在科创板首次公开发行股票的注册申请。

根据招股说明书，公司拟发行不超过1.2亿股人民币普通股（A股），占发行后总股本的比例不低于10%。募集资金约30亿元，主要投向：

- 先进制程芯片研发及产业化项目（15亿元）
- 封装测试产线升级改造（8亿元）
- 补充流动资金（7亿元）

公司2024年实现营业收入52.3亿元，净利润8.6亿元，符合科创板上市标准。保荐机构为中信证券，联席主承销商包括中信证券、华泰联合证券。

市场分析人士认为，公司作为国内AI芯片领域的头部企业，上市后将获得更多资本支持，有助于加速技术研发和市场拓展。预计上市后市值将达到300-400亿元。`,
    images: [],
    originalUrl: 'https://www.csrc.gov.cn/example-003',
    tags: ['IPO', '科创板', '证监会', '融资', '上市'],
    impactAssessment: '正面',
    collectedAt: '2025-10-21 08:00',
  },
  {
    id: 'sent-4',
    title: '行业研报：半导体设备国产替代加速，公司作为核心供应商受益显著',
    source: '中信证券',
    sourceType: '行业研报',
    publishDate: '2025-10-18',
    summary: '中信证券发布半导体行业深度研报，指出国产替代进入加速期。公司作为国内刻蚀设备核心供应商，2025年市场份额预计提升至25%，给予"买入"评级，目标价60元。',
    content: `中信证券今日发布《半导体设备国产替代深度报告》，全面分析了国内半导体设备行业的发展现状和未来趋势。

报告核心观点：

**国产替代进入新阶段**：受国际环境影响，国内晶圆厂对国产设备的采购意愿大幅提升。2025年国产半导体设备市场规模预计达到450亿元，同比增长35%。

**公司作为核心供应商受益显著**：公司在刻蚀设备领域技术领先，14nm制程设备已实现量产，7nm设备处于验证阶段。2025年市场份额预计从18%提升至25%。

**财务预测**：
- 2025E 营收：75亿元（+44%）
- 2025E 净利润：12.5亿元（+45%）
- 目标价：60元（当前股价约42元，上涨空间约43%）

**风险提示**：下游需求不及预期、技术研发进度延迟、国际竞争加剧。

维持"买入"评级，建议中长期配置。`,
    images: [
      'https://picsum.photos/seed/sent4a/800/400',
    ],
    originalUrl: 'https://www.citics.com/research/example-004',
    tags: ['行业研报', '国产替代', '半导体设备', '买入评级', '市场份额'],
    impactAssessment: '正面',
    collectedAt: '2025-10-19 08:00',
  },
  {
    id: 'sent-5',
    title: '公司因环保违规被处罚款200万元',
    source: '生态环境部',
    sourceType: '监管公告',
    publishDate: '2025-10-15',
    summary: '生态环境部通报，公司因废水处理设施未正常运行，被处以罚款200万元并责令限期整改。公司已发布致歉声明，承诺在30天内完成整改。此次事件可能影响公司ESG评级。',
    content: `生态环境部今日发布公告，通报了2025年第三季度环境执法典型案例。其中包括公司因废水处理设施未正常运行被处罚一案。

根据通报，地方生态环境部门在9月执法检查中发现，公司某生产基地的废水处理设施存在停运情况，部分生产废水未经处理直排。经检测，排放废水中COD（化学需氧量）超标2.3倍，氨氮超标1.8倍。

处罚决定：
- 罚款200万元
- 责令停产整顿，限期30天内完成废水处理设施整改
- 整改期间需每日向环保部门报送水质监测数据

公司随后发布了致歉声明，承认管理疏忽，表示将积极配合整改，并聘请第三方环保机构进行全面审查。

**市场影响**：
- 此次事件可能影响公司ESG评级，部分ESG主题基金已表示将审慎评估持仓
- 整改期间相关产线停产，预计影响Q4营收约5000万元
- 中长期来看，若整改到位，对公司基本面影响有限`,
    images: [],
    originalUrl: 'https://www.mee.gov.cn/example-005',
    tags: ['环保处罚', 'ESG', '废水处理', '整改', '合规'],
    impactAssessment: '负面',
    collectedAt: '2025-10-16 08:00',
  },
];

/** 生成补充 demo 数据（用于"加载更多"） */
export function generateMoreSentimentItems(startIndex: number, count: number): SentimentItem[] {
  const templates = [
    {
      title: '公司获评"国家级绿色工厂"称号',
      source: '工信部',
      sourceType: '监管公告' as const,
      impactAssessment: '正面' as const,
      tags: ['绿色工厂', '工信部', '节能减排', 'ESG'],
    },
    {
      title: '公司三季度营收环比增长15%，新业务线表现亮眼',
      source: '36氪',
      sourceType: '媒体报道' as const,
      impactAssessment: '正面' as const,
      tags: ['Q3财报', '营收增长', '新业务', '环比'],
    },
    {
      title: '公司与华为达成战略合作，共同推进AI芯片生态建设',
      source: '公司官网',
      sourceType: '官网公告' as const,
      impactAssessment: '正面' as const,
      tags: ['战略合作', '华为', 'AI芯片', '生态'],
    },
    {
      title: '公司CFO张某某辞职，由原财务总监李某接任',
      source: '公司官网',
      sourceType: '官网公告' as const,
      impactAssessment: '中性' as const,
      tags: ['高管变动', 'CFO', '人事任免'],
    },
    {
      title: '行业分析：AI芯片市场规模2026年将突破800亿美元',
      source: '麦肯锡',
      sourceType: '行业研报' as const,
      impactAssessment: '正面' as const,
      tags: ['行业研报', 'AI芯片', '市场规模', '预测'],
    },
  ];

  return templates.slice(0, count).map((tpl, i) => ({
    id: `sent-${startIndex + i}`,
    title: tpl.title,
    source: tpl.source,
    sourceType: tpl.sourceType,
    publishDate: `2025-10-${String(14 - i).padStart(2, '0')}`,
    summary: `这是关于"${tpl.title}"的AI自动生成摘要。此条为系统采集的舆情信息，原始内容来源于${tpl.source}。`,
    content: `这是关于"${tpl.title}"的详细内容。\n\n此条为系统自动采集的舆情信息，原始内容来源于${tpl.source}。详情请查看原文链接。`,
    images: i % 2 === 0 ? [`https://picsum.photos/seed/sent${startIndex + i}/800/400`] : [],
    originalUrl: `https://example.com/news/${startIndex + i}`,
    tags: tpl.tags,
    impactAssessment: tpl.impactAssessment,
    collectedAt: `2025-10-${String(15 - i).padStart(2, '0')} 08:00`,
  }));
}
