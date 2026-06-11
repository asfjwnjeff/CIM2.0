'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

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

const EditIcon = ({ className = '' }: { className?: string }) => (
  <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
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

// 示例数据 - 按公司区分
const followUpDataByCompany: Record<string, any> = {
  '1': {
    companyName: '应用材料(中国)有限公司',
    followUpType: 'biz_meeting',
    followUpMethod: 'phone_visit',
    followUpDate: '2025-03-15',
    followUpStatus: 'discussing',
    owner: '张经理',
    collaborators: '李专员, 王助理',
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
    followUpType: 'biz_meeting',
    followUpMethod: 'onsite_visit',
    followUpDate: '2025-03-14',
    followUpStatus: 'promoting',
    owner: '王经理',
    collaborators: '赵主管',
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
    followUpType: 'contract_mgmt',
    followUpMethod: 'online_visit',
    followUpDate: '2025-03-13',
    followUpStatus: 'success',
    owner: '李经理',
    collaborators: '',
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

const followUpStatusMap: Record<string, { label: string; color: string; bgColor: string }> = {
  'new': { label: '新需求', color: '#2D3BFF', bgColor: '#E6EAFF' },
  'discussing': { label: '沟通中', color: '#FF9500', bgColor: '#FFF4E6' },
  'promoting': { label: '推进中', color: '#00B42A', bgColor: '#E8FFEE' },
  'success': { label: '成功', color: '#00B42A', bgColor: '#E8FFEE' },
  'no_progress': { label: '无进展', color: '#F53F3F', bgColor: '#FFECE8' },
};

const followUpTypeMap: Record<string, string> = {
  'kpi_not_met': 'KPI未达标',
  'contract_mgmt': '合同管理',
  'biz_meeting': '业务会议',
  'other_customer': '其他客户事项',
};

const followUpMethodMap: Record<string, string> = {
  'phone_visit': '电话拜访',
  'onsite_visit': '上门拜访',
  'online_visit': '网络拜访',
  'hmg_meeting': 'HMG现场会议',
};

export default function FollowUpDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string || '1';
  
  // 录音相关
  const [isPlaying, setIsPlaying] = useState(false);
  const [playProgress, setPlayProgress] = useState(25);
  const [playSpeed, setPlaySpeed] = useState(1);

  // 获取对应公司的数据，默认为应用材料
  const data = followUpDataByCompany[id] || followUpDataByCompany['1'];
  
  const statusConfig = followUpStatusMap[data.followUpStatus] || followUpStatusMap['discussing'];

  return (
      <div className="max-w-[1440px] mx-auto space-y-6">
        {/* 顶部 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => router.push('/followup')} className="p-2 rounded-lg hover:bg-[#F5F5F5]">
              <ArrowLeftIcon className="w-5 h-5 text-[#5A5A5A]" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-[#0A0A0A]">跟进详情</h1>
              <p className="text-[#5A5A5A] mt-1">查看客户跟进记录详情，包括录音、转写文字和会议纪要</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => router.push(`/followup/${id}/edit`)} 
              className="px-4 py-2 text-sm bg-[#2D3BFF] text-white rounded-xl hover:opacity-90 active:scale-[0.98] transition-all inline-flex items-center gap-2 shadow-sm"
            >
              <EditIcon className="w-4 h-4" /> 编辑
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
                  <label className="block text-sm font-medium text-[#5A5A5A] mb-2">关联客户</label>
                  <div className="w-full bg-[#F5F5F5] border-none rounded-xl px-4 py-2.5 text-sm text-[#0A0A0A]">
                    {data.companyName}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-[#5A5A5A] mb-2">跟进类型</label>
                  <div className="w-full bg-[#F5F5F5] border-none rounded-xl px-4 py-2.5 text-sm text-[#0A0A0A]">
                    {followUpTypeMap[data.followUpType]}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-[#5A5A5A] mb-2">跟进方式</label>
                  <div className="w-full bg-[#F5F5F5] border-none rounded-xl px-4 py-2.5 text-sm text-[#0A0A0A]">
                    {followUpMethodMap[data.followUpMethod] || data.followUpMethod}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-[#5A5A5A] mb-2">跟进时间</label>
                  <div className="w-full bg-[#F5F5F5] border-none rounded-xl px-4 py-2.5 text-sm text-[#0A0A0A]">
                    {data.followUpDate}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-[#5A5A5A] mb-2">跟进状态</label>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap"
                       style={{ backgroundColor: statusConfig.bgColor, color: statusConfig.color }}>
                    {statusConfig.label}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-[#5A5A5A] mb-2">负责人</label>
                  <div className="w-full bg-[#F5F5F5] border-none rounded-xl px-4 py-2.5 text-sm text-[#0A0A0A]">
                    {data.owner}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-[#5A5A5A] mb-2">协同人</label>
                  <div className="w-full bg-[#F5F5F5] border-none rounded-xl px-4 py-2.5 text-sm text-[#0A0A0A]">
                    {data.collaborators || '-'}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-[#5A5A5A] mb-2">联系人</label>
                  <div className="w-full bg-[#F5F5F5] border-none rounded-xl px-4 py-2.5 text-sm text-[#0A0A0A]">
                    {data.contactName}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-[#5A5A5A] mb-2">下次跟进</label>
                  <div className="w-full bg-[#F5F5F5] border-none rounded-xl px-4 py-2.5 text-sm text-[#0A0A0A]">
                    {data.nextFollowUpDate || '-'}
                  </div>
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

            {/* 转写文字 */}
            <div className="bg-white border border-[#EBEBEB] rounded-xl p-6 space-y-4">
              <h3 className="text-sm font-semibold text-[#0A0A0A]">转写文字</h3>
              <div className="w-full bg-[#F5F5F5] border-none rounded-xl px-4 py-3 text-sm leading-relaxed text-[#0A0A0A] whitespace-pre-wrap">
                {data.transcriptText}
              </div>
            </div>

            {/* 跟进内容 */}
            <div className="bg-white border border-[#EBEBEB] rounded-xl p-6 space-y-4">
              <h3 className="text-sm font-semibold text-[#0A0A0A]">跟进内容</h3>
              <div className="w-full bg-[#F5F5F5] border-none rounded-xl px-4 py-3 text-sm text-[#0A0A0A]">
                {data.content}
              </div>
            </div>
          </div>

          {/* 右侧 - 会议纪要 */}
          <div className="col-span-5 space-y-6">
            <div className="bg-white border border-[#EBEBEB] rounded-xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-[#0A0A0A] inline-flex items-center gap-2">
                  <SparklesIcon className="w-4 h-4 text-purple-500" /> 会议纪要
                </h3>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#5A5A5A] mb-2">会议摘要</label>
                  <div className="w-full bg-[#F5F5F5] border-none rounded-xl px-4 py-2.5 text-sm text-[#0A0A0A]">
                    {data.minutesSummary}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#5A5A5A] mb-2 inline-flex items-center gap-1">
                    <LightbulbIcon className="w-3 h-3 text-amber-500" /> 关键要点
                  </label>
                  <div className="space-y-1.5">
                    {data.keyPoints.map((point: string, idx: number) => (
                      <div key={idx} className="flex items-start gap-2">
                        <span className="text-xs text-[#5A5A5A] mt-2">{idx + 1}.</span>
                        <div className="flex-1 px-3 py-1.5 bg-[#F5F5F5] border-none rounded-lg text-sm text-[#0A0A0A]">
                          {point}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#5A5A5A] mb-2 inline-flex items-center gap-1">
                    <ListChecksIcon className="w-3 h-3 text-blue-500" /> 待办事项
                  </label>
                  <div className="space-y-1.5">
                    {data.todos.map((todo: string, idx: number) => (
                      <div key={idx} className="flex items-start gap-2">
                        <span className="text-xs text-[#5A5A5A] mt-2">☐</span>
                        <div className="flex-1 px-3 py-1.5 bg-[#F5F5F5] border-none rounded-lg text-sm text-[#0A0A0A]">
                          {todo}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#5A5A5A] mb-2 inline-flex items-center gap-1">
                    <MessageSquareIcon className="w-3 h-3 text-green-500" /> 决策事项
                  </label>
                  <div className="space-y-1.5">
                    {data.decisions.map((decision: string, idx: number) => (
                      <div key={idx} className="flex items-start gap-2">
                        <span className="text-xs text-[#5A5A5A] mt-2">✓</span>
                        <div className="flex-1 px-3 py-1.5 bg-[#F5F5F5] border-none rounded-lg text-sm text-[#0A0A0A]">
                          {decision}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
}
