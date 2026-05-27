'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AppLayout from '@/components/layout/AppLayout';
import { SearchableSelect } from '@/components/ui/searchable-select';

// 内联SVG图标
const PlusIcon = ({ className = '' }: { className?: string }) => (
  <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);

const ArrowLeftIcon = ({ className = '' }: { className?: string }) => (
  <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12"></line>
    <polyline points="12 19 5 12 12 5"></polyline>
  </svg>
);

const SaveIcon = ({ className = '' }: { className?: string }) => (
  <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
    <polyline points="17 21 17 13 7 13 7 21"></polyline>
    <polyline points="7 3 7 8 15 8"></polyline>
  </svg>
);

const MicIcon = ({ className = '' }: { className?: string }) => (
  <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
    <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
    <line x1="12" y1="19" x2="12" y2="23"></line>
    <line x1="8" y1="23" x2="16" y2="23"></line>
  </svg>
);

const PlayIcon = ({ className = '' }: { className?: string }) => (
  <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="5 3 19 12 5 21 5 3"></polygon>
  </svg>
);

const PauseIcon = ({ className = '' }: { className?: string }) => (
  <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="6" y="4" width="4" height="16"></rect>
    <rect x="14" y="4" width="4" height="16"></rect>
  </svg>
);

const SparklesIcon = ({ className = '' }: { className?: string }) => (
  <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3l1.912 5.813a2 2 0 001.275 1.275L21 12l-5.813 1.912a2 2 0 00-1.275 1.275L12 21l-1.912-5.813a2 2 0 00-1.275-1.275L3 12l5.813-1.912a2 2 0 001.275-1.275L12 3z"></path>
  </svg>
);

const Loader2Icon = ({ className = '' }: { className?: string }) => (
  <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12a9 9 0 11-6.219-8.56"></path>
  </svg>
);

const RotateCcwIcon = ({ className = '' }: { className?: string }) => (
  <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="1 4 1 10 7 10"></polyline>
    <path d="M3.51 15a9 9 0 102.13-9.36L1 10"></path>
  </svg>
);

const LightbulbIcon = ({ className = '' }: { className?: string }) => (
  <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
    <line x1="12" y1="17" x2="12.01" y2="17"></line>
  </svg>
);

const ListChecksIcon = ({ className = '' }: { className?: string }) => (
  <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="8" y1="6" x2="21" y2="6"></line>
    <line x1="8" y1="12" x2="21" y2="12"></line>
    <line x1="8" y1="18" x2="21" y2="18"></line>
    <line x1="3" y1="6" x2="3.01" y2="6"></line>
    <line x1="3" y1="12" x2="3.01" y2="12"></line>
    <line x1="3" y1="18" x2="3.01" y2="18"></line>
  </svg>
);

const MessageSquareIcon = ({ className = '' }: { className?: string }) => (
  <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
  </svg>
);

const Trash2Icon = ({ className = '' }: { className?: string }) => (
  <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"></polyline>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
  </svg>
);

// 示例客户数据
const mockCustomers = [
  { id: '1', name: '应用材料(中国)有限公司' },
  { id: '2', name: '飞雅贸易(上海)有限公司' },
  { id: '3', name: '荏原机械(中国)有限公司' },
  { id: '4', name: '苏斯贸易(上海)有限公司' },
  { id: '5', name: '昇先创国际贸易(上海)有限公司' },
];

// 示例数据 - 按公司区分
const followUpDataByCompany: Record<string, any> = {
  '1': {
    companyName: '应用材料(中国)有限公司',
    customerId: '1',
    followUpType: 'phone',
    followUpMethod: '电话',
    followUpDate: '2025-03-15',
    followUpStatus: 'discussing',
    owner: '张经理',
    collaborators: '李专员, 王助理',
    contactId: '1',
    contactName: '李总',
    content: '本次沟通主要围绕半导体设备配套物流服务需求展开',
    nextFollowUpDate: '2025-03-20',
    transcriptText: '【张经理】大家好，今天我们讨论一下应用材料的新项目需求。\n\n【客户方-李总】我们的半导体设备需要配套的物流服务，包括货代和仓储。\n\n【张经理】好的，货代方面我们可以提供FWD服务，仓储我们有上海和苏州两个仓库。\n\n【客户方-李总】运输方面有什么要求？需要温控吗？\n\n【张经理】半导体设备一般需要恒温运输，我们可以安排专车。',
    minutesSummary: '本次会议与客户方李总讨论了半导体设备配套物流服务需求，涉及货代、仓储和运输三个板块。',
    keyPoints: [
      '客户需要半导体设备配套物流服务',
      '货代方面提供FWD服务',
      '仓储有上海和苏州两个仓库可选',
      '半导体设备需要恒温运输',
    ],
    todos: [
      '准备详细的报价单',
      '下周三之前发送报价给客户',
      '确认上海和苏州仓库的可用面积',
    ],
    decisions: [
      '货代服务采用FWD方案',
      '运输方式确定为恒温专车',
    ],
  },
  '2': {
    companyName: '飞雅贸易(上海)有限公司',
    customerId: '2',
    followUpType: 'meeting',
    followUpMethod: '现场',
    followUpDate: '2025-03-14',
    followUpStatus: 'promoting',
    owner: '王经理',
    collaborators: '赵主管',
    contactId: '2',
    contactName: '王经理',
    content: '现场拜访飞雅贸易，了解新季度的进出口需求',
    nextFollowUpDate: '2025-03-18',
    transcriptText: '【王经理】王经理您好，感谢您抽出时间接待我们。\n\n【客户方-王经理】不客气，我们新季度有一批电子产品要从香港进口。\n\n【王经理】好的，香港进口我们可以提供一站式清关服务。\n\n【客户方-王经理】时间上有什么要求？我们希望越快越好。\n\n【王经理】电子产品清关一般3-5个工作日，我们会优先安排。',
    minutesSummary: '现场拜访飞雅贸易，王经理介绍了新季度电子产品进口需求，双方就香港进口清关服务进行了深入交流。',
    keyPoints: [
      '飞雅贸易新季度有电子产品进口需求',
      '货物从香港进口',
      '需要一站式清关服务',
      '客户希望快速清关',
    ],
    todos: [
      '确认香港仓库提货安排',
      '准备清关所需文件清单',
      '跟进具体货量和到港时间',
    ],
    decisions: [
      '采用香港进口一站式清关方案',
      '优先安排飞雅贸易的清关服务',
    ],
  },
  '3': {
    companyName: '荏原机械(中国)有限公司',
    customerId: '3',
    followUpType: 'email',
    followUpMethod: '邮件',
    followUpDate: '2025-03-13',
    followUpStatus: 'success',
    owner: '李经理',
    collaborators: '',
    contactId: '3',
    contactName: '张总监',
    content: '邮件确认荏原机械的年度物流合同条款',
    nextFollowUpDate: '',
    transcriptText: '【李经理】张总监您好，附件是我们的年度合同草案，请您审阅。\n\n【客户方-张总监】李经理，合同我看了，价格条款没问题，但付款方式需要调整。\n\n【李经理】好的，付款方式我们可以改成月结60天。\n\n【客户方-张总监】那就没问题了，我这边安排签字盖章。',
    minutesSummary: '邮件确认荏原机械年度物流合同，双方就价格条款达成一致，付款方式调整为月结60天。',
    keyPoints: [
      '年度合同价格条款确认',
      '付款方式调整为月结60天',
      '客户方安排签字盖章',
    ],
    todos: [
      '更新合同付款条款',
      '跟进客户盖章进度',
      '合同归档',
    ],
    decisions: [
      '合同价格保持不变',
      '付款方式调整为月结60天',
    ],
  },
};

export default function FollowUpEditPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string || '1';
  
  // 获取对应公司的数据，默认为应用材料
  const initialData = followUpDataByCompany[id] || followUpDataByCompany['1'];

  // 基本信息
  const [customerId, setCustomerId] = useState(initialData.customerId);
  const [followUpType, setFollowUpType] = useState<string>(initialData.followUpType);
  const [followUpMethod, setFollowUpMethod] = useState<string>(initialData.followUpMethod);
  const [followUpDate, setFollowUpDate] = useState(initialData.followUpDate);
  const [followUpStatus, setFollowUpStatus] = useState<string>(initialData.followUpStatus);
  const [owner, setOwner] = useState(initialData.owner);
  const [collaborators, setCollaborators] = useState(initialData.collaborators);
  const [contactId, setContactId] = useState(initialData.contactId);
  const [content, setContent] = useState(initialData.content);
  const [nextFollowUpDate, setNextFollowUpDate] = useState(initialData.nextFollowUpDate);

  // 录音相关
  const [isPlaying, setIsPlaying] = useState(false);
  const [playProgress, setPlayProgress] = useState(25);
  const [playSpeed, setPlaySpeed] = useState(1);

  // 转写文字
  const [transcriptText, setTranscriptText] = useState(initialData.transcriptText);

  // 会议纪要
  const [minutesSummary, setMinutesSummary] = useState(initialData.minutesSummary);
  const [keyPoints, setKeyPoints] = useState<string[]>(initialData.keyPoints);
  const [todos, setTodos] = useState<string[]>(initialData.todos);
  const [decisions, setDecisions] = useState<string[]>(initialData.decisions);
  const [newPoint, setNewPoint] = useState('');
  const [newTodo, setNewTodo] = useState('');
  const [newDecision, setNewDecision] = useState('');
  const [isRegenerating, setIsRegenerating] = useState(false);

  const handleSave = () => {
    if (!customerId) {
      alert('请选择关联客户');
      return;
    }
    router.push('/followup');
  };

  const handleRegenerateMinutes = () => {
    setIsRegenerating(true);
    setTimeout(() => {
      setIsRegenerating(false);
    }, 3000);
  };

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        {/* 顶部 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => router.push(`/followup/${id}`)} className="p-2 rounded-lg hover:bg-[#F5F5F5]">
              <ArrowLeftIcon className="w-5 h-5 text-[#5A5A5A]" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-[#0A0A0A]">编辑跟进记录</h1>
              <p className="text-[#5A5A5A] mt-1">编辑客户跟进记录，支持修改跟进内容和会议纪要</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => router.push('/followup')} 
              className="px-4 py-2 text-sm bg-white border border-[#EBEBEB] text-[#0A0A0A] rounded-xl hover:bg-[#F5F5F5] transition-all"
            >
              取消
            </button>
            <button 
              onClick={handleSave} 
              className="px-4 py-2 text-sm bg-[#2D3BFF] text-white rounded-xl hover:opacity-90 active:scale-[0.98] transition-all inline-flex items-center gap-2 shadow-sm"
            >
              <SaveIcon className="w-4 h-4" /> 保存
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* 左侧 - 基本信息、录音、转写文字、跟进内容 */}
          <div className="col-span-7 space-y-6">
            {/* 基本信息卡片 */}
            <div className="bg-white border border-[#EBEBEB] rounded-xl p-6 space-y-4">
              <h3 className="text-sm font-semibold text-[#0A0A0A]">基本信息</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-[#5A5A5A] mb-2">关联客户 <span className="text-red-500">*</span></label>
                  <SearchableSelect
                    value={customerId}
                    onChange={(value) => setCustomerId(value)}
                    options={mockCustomers.map(c => ({ value: c.id, label: c.name }))}
                    placeholder="请选择客户"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-[#5A5A5A] mb-2">跟进类型</label>
                  <SearchableSelect
                    value={followUpType}
                    onChange={(value) => setFollowUpType(value)}
                    options={[
                      { value: 'phone', label: '电话沟通' },
                      { value: 'email', label: '邮件' },
                      { value: 'meeting', label: '会议' },
                      { value: 'other', label: '其他' },
                    ]}
                    placeholder="请选择类型"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-[#5A5A5A] mb-2">跟进方式</label>
                  <SearchableSelect
                    value={followUpMethod}
                    onChange={(value) => setFollowUpMethod(value)}
                    options={[
                      { value: '电话', label: '电话' },
                      { value: '邮件', label: '邮件' },
                      { value: '现场', label: '现场' },
                      { value: '视频', label: '视频' },
                      { value: '会议', label: '会议' },
                    ]}
                    placeholder="请选择方式"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-[#5A5A5A] mb-2">跟进时间</label>
                  <input
                    type="date"
                    value={followUpDate}
                    onChange={(e) => setFollowUpDate(e.target.value)}
                    className="w-full bg-[#F5F5F5] border-none rounded-xl px-4 py-2.5 text-sm text-[#0A0A0A] focus:outline-none focus:ring-2 focus:ring-[#2D3BFF]/10 transition-all"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-[#5A5A5A] mb-2">跟进状态</label>
                  <SearchableSelect
                    value={followUpStatus}
                    onChange={(value) => setFollowUpStatus(value)}
                    options={[
                      { value: 'new', label: '新需求' },
                      { value: 'discussing', label: '沟通中' },
                      { value: 'promoting', label: '推进中' },
                      { value: 'success', label: '成功' },
                      { value: 'no_progress', label: '无进展' },
                    ]}
                    placeholder="请选择状态"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-[#5A5A5A] mb-2">负责人</label>
                  <input
                    type="text"
                    value={owner}
                    onChange={(e) => setOwner(e.target.value)}
                    placeholder="请输入负责人"
                    className="w-full bg-[#F5F5F5] border-none rounded-xl px-4 py-2.5 text-sm text-[#0A0A0A] focus:outline-none focus:ring-2 focus:ring-[#2D3BFF]/10 transition-all"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-[#5A5A5A] mb-2">协同人</label>
                  <input
                    type="text"
                    value={collaborators}
                    onChange={(e) => setCollaborators(e.target.value)}
                    placeholder="请输入协同人"
                    className="w-full bg-[#F5F5F5] border-none rounded-xl px-4 py-2.5 text-sm text-[#0A0A0A] focus:outline-none focus:ring-2 focus:ring-[#2D3BFF]/10 transition-all"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-[#5A5A5A] mb-2">联系人</label>
                  <SearchableSelect
                    value={contactId}
                    onChange={(value) => setContactId(value)}
                    options={[
                      { value: '1', label: '李总' },
                      { value: '2', label: '王经理' },
                      { value: '3', label: '张总监' },
                    ]}
                    placeholder="请选择联系人"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-[#5A5A5A] mb-2">下次跟进</label>
                  <input
                    type="date"
                    value={nextFollowUpDate}
                    onChange={(e) => setNextFollowUpDate(e.target.value)}
                    className="w-full bg-[#F5F5F5] border-none rounded-xl px-4 py-2.5 text-sm text-[#0A0A0A] focus:outline-none focus:ring-2 focus:ring-[#2D3BFF]/10 transition-all"
                  />
                </div>
              </div>
            </div>

            {/* 录音回放 */}
            <div className="bg-white border border-[#EBEBEB] rounded-xl p-6 space-y-4">
              <h3 className="text-sm font-semibold text-[#0A0A0A] inline-flex items-center gap-2">
                <MicIcon className="w-4 h-4 text-red-500" /> 录音回放
              </h3>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="w-10 h-10 rounded-full bg-[#2D3BFF] text-white inline-flex items-center justify-center hover:opacity-90"
                >
                  {isPlaying ? <PauseIcon className="w-4 h-4" /> : <PlayIcon className="w-4 h-4 ml-0.5" />}
                </button>
                <div className="flex-1">
                  <div className="h-2 bg-[#F5F5F5] rounded-full overflow-hidden">
                    <div className="h-full bg-[#2D3BFF] rounded-full" style={{ width: `${playProgress}%` }} />
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-xs text-[#5A5A5A]">02:35</span>
                    <span className="text-xs text-[#5A5A5A]">12:48</span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {[0.5, 1, 1.5, 2].map(speed => (
                    <button
                      key={speed}
                      onClick={() => setPlaySpeed(speed)}
                      className={`px-2 py-0.5 text-xs rounded-lg ${playSpeed === speed ? 'bg-[#2D3BFF] text-white' : 'bg-[#F5F5F5] text-[#5A5A5A] hover:bg-[#D5D5D5]'}`}
                    >
                      {speed}x
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 转写文字编辑 */}
            <div className="bg-white border border-[#EBEBEB] rounded-xl p-6 space-y-4">
              <h3 className="text-sm font-semibold text-[#0A0A0A]">转写文字</h3>
              <textarea
                value={transcriptText}
                onChange={(e) => setTranscriptText(e.target.value)}
                rows={8}
                className="w-full bg-[#F5F5F5] border-none rounded-xl px-4 py-3 text-sm leading-relaxed text-[#0A0A0A] focus:outline-none focus:ring-2 focus:ring-[#2D3BFF]/10 transition-all resize-none"
              />
            </div>

            {/* 跟进内容 */}
            <div className="bg-white border border-[#EBEBEB] rounded-xl p-6 space-y-4">
              <h3 className="text-sm font-semibold text-[#0A0A0A]">跟进内容</h3>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="请输入跟进内容..."
                rows={4}
                className="w-full bg-[#F5F5F5] border-none rounded-xl px-4 py-3 text-sm text-[#0A0A0A] focus:outline-none focus:ring-2 focus:ring-[#2D3BFF]/10 transition-all resize-none"
              />
            </div>
          </div>

          {/* 右侧 - 会议纪要 */}
          <div className="col-span-5 space-y-6">
            <div className="bg-white border border-[#EBEBEB] rounded-xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-[#0A0A0A] inline-flex items-center gap-2">
                  <SparklesIcon className="w-4 h-4 text-purple-500" /> 会议纪要
                </h3>
                <button
                  onClick={handleRegenerateMinutes}
                  disabled={isRegenerating}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs border border-[#D5D5D5] rounded-lg hover:bg-[#F5F5F5] disabled:opacity-50 transition-all"
                >
                  {isRegenerating ? <Loader2Icon className="w-3 h-3 animate-spin" /> : <RotateCcwIcon className="w-3 h-3" />}
                  {isRegenerating ? '重新生成中...' : '重新生成'}
                </button>
              </div>

              {isRegenerating ? (
                <div className="flex flex-col items-center py-8 gap-3">
                  <Loader2Icon className="w-8 h-8 text-purple-500 animate-spin" />
                  <p className="text-sm text-[#5A5A5A]">AI正在重新分析会议内容...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[#5A5A5A] mb-2">会议摘要</label>
                    <textarea 
                      value={minutesSummary} 
                      onChange={(e) => setMinutesSummary(e.target.value)} 
                      rows={3} 
                      className="w-full bg-[#F5F5F5] border-none rounded-xl px-4 py-2.5 text-sm text-[#0A0A0A] focus:outline-none focus:ring-2 focus:ring-[#2D3BFF]/10 transition-all resize-none" 
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#5A5A5A] mb-2 inline-flex items-center gap-1">
                      <LightbulbIcon className="w-3 h-3 text-amber-500" /> 关键要点
                    </label>
                    <div className="space-y-1.5">
                      {keyPoints.map((point, idx) => (
                        <div key={idx} className="flex items-start gap-2">
                          <span className="text-xs text-[#5A5A5A] mt-2">{idx + 1}.</span>
                          <input 
                            type="text" 
                            value={point} 
                            onChange={(e) => { const u = [...keyPoints]; u[idx] = e.target.value; setKeyPoints(u); }} 
                            className="flex-1 px-3 py-1.5 bg-[#F5F5F5] border-none rounded-lg text-sm text-[#0A0A0A] focus:outline-none focus:ring-2 focus:ring-[#2D3BFF]/10 transition-all" 
                          />
                          <button 
                            onClick={() => setKeyPoints(keyPoints.filter((_, i) => i !== idx))} 
                            className="p-1.5 hover:text-red-500"
                          >
                            <Trash2Icon className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                      <div className="flex items-center gap-2 mt-2">
                        <input 
                          type="text" 
                          value={newPoint} 
                          onChange={(e) => setNewPoint(e.target.value)} 
                          placeholder="添加要点..." 
                          className="flex-1 px-3 py-1.5 bg-[#F5F5F5] border-none rounded-lg text-sm text-[#0A0A0A] focus:outline-none focus:ring-2 focus:ring-[#2D3BFF]/10 transition-all" 
                          onKeyDown={(e) => { if (e.key === 'Enter' && newPoint.trim()) { setKeyPoints([...keyPoints, newPoint.trim()]); setNewPoint(''); } }} 
                        />
                        <button 
                          onClick={() => { if (newPoint.trim()) { setKeyPoints([...keyPoints, newPoint.trim()]); setNewPoint(''); } }} 
                          className="p-1.5 text-[#2D3BFF] hover:text-[#4338CA]"
                        >
                          <PlusIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#5A5A5A] mb-2 inline-flex items-center gap-1">
                      <ListChecksIcon className="w-3 h-3 text-blue-500" /> 待办事项
                    </label>
                    <div className="space-y-1.5">
                      {todos.map((todo, idx) => (
                        <div key={idx} className="flex items-start gap-2">
                          <span className="text-xs text-[#5A5A5A] mt-2">☐</span>
                          <input 
                            type="text" 
                            value={todo} 
                            onChange={(e) => { const u = [...todos]; u[idx] = e.target.value; setTodos(u); }} 
                            className="flex-1 px-3 py-1.5 bg-[#F5F5F5] border-none rounded-lg text-sm text-[#0A0A0A] focus:outline-none focus:ring-2 focus:ring-[#2D3BFF]/10 transition-all" 
                          />
                          <button 
                            onClick={() => setTodos(todos.filter((_, i) => i !== idx))} 
                            className="p-1.5 hover:text-red-500"
                          >
                            <Trash2Icon className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                      <div className="flex items-center gap-2 mt-2">
                        <input 
                          type="text" 
                          value={newTodo} 
                          onChange={(e) => setNewTodo(e.target.value)} 
                          placeholder="添加待办..." 
                          className="flex-1 px-3 py-1.5 bg-[#F5F5F5] border-none rounded-lg text-sm text-[#0A0A0A] focus:outline-none focus:ring-2 focus:ring-[#2D3BFF]/10 transition-all" 
                          onKeyDown={(e) => { if (e.key === 'Enter' && newTodo.trim()) { setTodos([...todos, newTodo.trim()]); setNewTodo(''); } }} 
                        />
                        <button 
                          onClick={() => { if (newTodo.trim()) { setTodos([...todos, newTodo.trim()]); setNewTodo(''); } }} 
                          className="p-1.5 text-[#2D3BFF] hover:text-[#4338CA]"
                        >
                          <PlusIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#5A5A5A] mb-2 inline-flex items-center gap-1">
                      <MessageSquareIcon className="w-3 h-3 text-green-500" /> 决策事项
                    </label>
                    <div className="space-y-1.5">
                      {decisions.map((decision, idx) => (
                        <div key={idx} className="flex items-start gap-2">
                          <span className="text-xs text-[#5A5A5A] mt-2">✓</span>
                          <input 
                            type="text" 
                            value={decision} 
                            onChange={(e) => { const u = [...decisions]; u[idx] = e.target.value; setDecisions(u); }} 
                            className="flex-1 px-3 py-1.5 bg-[#F5F5F5] border-none rounded-lg text-sm text-[#0A0A0A] focus:outline-none focus:ring-2 focus:ring-[#2D3BFF]/10 transition-all" 
                          />
                          <button 
                            onClick={() => setDecisions(decisions.filter((_, i) => i !== idx))} 
                            className="p-1.5 hover:text-red-500"
                          >
                            <Trash2Icon className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                      <div className="flex items-center gap-2 mt-2">
                        <input 
                          type="text" 
                          value={newDecision} 
                          onChange={(e) => setNewDecision(e.target.value)} 
                          placeholder="添加决策..." 
                          className="flex-1 px-3 py-1.5 bg-[#F5F5F5] border-none rounded-lg text-sm text-[#0A0A0A] focus:outline-none focus:ring-2 focus:ring-[#2D3BFF]/10 transition-all" 
                          onKeyDown={(e) => { if (e.key === 'Enter' && newDecision.trim()) { setDecisions([...decisions, newDecision.trim()]); setNewDecision(''); } }} 
                        />
                        <button 
                          onClick={() => { if (newDecision.trim()) { setDecisions([...decisions, newDecision.trim()]); setNewDecision(''); } }} 
                          className="p-1.5 text-[#2D3BFF] hover:text-[#4338CA]"
                        >
                          <PlusIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
