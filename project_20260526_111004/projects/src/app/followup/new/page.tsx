'use client';

import React, { useState, Suspense } from 'react';

export const dynamic = 'force-dynamic';
import { useRouter, useSearchParams } from 'next/navigation';
import { SearchableSelect } from '@/components/ui/searchable-select';
import type { SelectOption } from '@/components/ui/searchable-select';

interface CustomerOption {
  id: string;
  name: string;
  contact?: string;
}

interface TranscriptSegment {
  speaker: string;
  time: string;
  text: string;
}

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
  <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M8 5v14l11-7z"></path>
  </svg>
);

const PauseIcon = ({ className = '' }: { className?: string }) => (
  <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <rect x="6" y="4" width="4" height="16"></rect>
    <rect x="14" y="4" width="4" height="16"></rect>
  </svg>
);

const ClockIcon = ({ className = '' }: { className?: string }) => (
  <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"></circle>
    <polyline points="12 6 12 12 16 14"></polyline>
  </svg>
);

const StopIcon = ({ className = '' }: { className?: string }) => (
  <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <rect x="6" y="6" width="12" height="12"></rect>
  </svg>
);

const RefreshIcon = ({ className = '' }: { className?: string }) => (
  <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 4 23 10 17 10"></polyline>
    <polyline points="1 20 1 14 7 14"></polyline>
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
  </svg>
);

const UploadIcon = ({ className = '' }: { className?: string }) => (
  <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
    <polyline points="17 8 12 3 7 8"></polyline>
    <line x1="12" y1="3" x2="12" y2="15"></line>
  </svg>
);

const PencilIcon = ({ className = '' }: { className?: string }) => (
  <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
  </svg>
);

function FollowupFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [selectedCustomer, setSelectedCustomer] = useState<string>(searchParams.get('customerName') || '');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(searchParams.get('customerId') || '');
  const [selectedType, setSelectedType] = useState<string>('');
  const [followupTypeOther, setFollowupTypeOther] = useState('');
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [followupTime, setFollowupTime] = useState<string>('');
  const [nextFollowupTime, setNextFollowupTime] = useState<string>('');
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [recordingTime, setRecordingTime] = useState<string>('00:00:00');
  const [transcriptSegments, setTranscriptSegments] = useState<TranscriptSegment[]>([]);

  const [summary, setSummary] = useState<string>('');
  const [keyPoints, setKeyPoints] = useState<string>('');
  const [toDos, setToDos] = useState<string>('');
  const [decisions, setDecisions] = useState<string>('');

  const [customers] = useState<CustomerOption[]>([
    { id: '1', name: '应用材料(中国)有限公司', contact: '李总' },
    { id: '2', name: '飞雅贸易(上海)有限公司', contact: '王经理' },
    { id: '3', name: '荏原机械(中国)有限公司', contact: '张总监' },
    { id: '4', name: '苏斯贸易(上海)有限公司', contact: '赵总' },
    { id: '5', name: '昇先创(上海)贸易有限公司', contact: '孙经理' },
    { id: '6', name: '上海华力微电子有限公司', contact: '周总监' },
  ]);

  const handleStartRecording = () => {
    setIsRecording(true);
    setIsPaused(false);
  };

  const handlePauseRecording = () => {
    setIsPaused(true);
  };

  const handleResumeRecording = () => {
    setIsPaused(false);
  };

  const handleStopRecording = () => {
    setIsRecording(false);
    setIsPaused(false);
    setTranscriptSegments([
      { speaker: '张洁', time: '14:30:15', text: '今天我们主要讨论一下项目的实施细节，您这边有什么想法？' },
      { speaker: '王总', time: '14:31:22', text: '我们希望能够尽快完成系统对接，下月正式开始试运行。' },
    ]);
    setSummary('本次会议主要讨论了项目的实施细节，双方就系统对接时间和试运行安排达成了初步共识。');
  };

  const handleSave = () => {
    router.push('/followup');
  };

  return (
      <div className="max-w-7xl mx-auto space-y-6">
        {/* 顶部 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => router.push('/followup')} className="p-2 rounded-lg hover:bg-[#F5F5F5]">
              <ArrowLeftIcon className="w-5 h-5 text-[#5A5A5A]" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-[#0A0A0A]">新增跟进</h1>
              <p className="text-[#5A5A5A] mt-1">创建新的客户跟进记录，支持AI听记和会议纪要</p>
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
              <PlusIcon className="w-4 h-4" /> 保存
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
                  <label className="block text-sm font-medium text-[#5A5A5A] mb-2">关联客户 *</label>
                  <SearchableSelect
                    value={selectedCustomer}
                    onChange={(value) => setSelectedCustomer(value)}
                    options={customers.map(customer => ({ value: customer.id, label: customer.name }))}
                    placeholder="请选择客户"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-[#5A5A5A] mb-2">跟进类型 *</label>
                  <SearchableSelect
                    value={selectedType}
                    onChange={(value) => setSelectedType(value)}
                    options={[
                      { value: 'kpi_not_met', label: 'KPI未达标' },
                      { value: 'contract_mgmt', label: '合同管理' },
                      { value: 'biz_meeting', label: '业务会议' },
                      { value: 'other_customer', label: '其他客户事项' },
                    ]}
                    placeholder="请选择类型"
                  />
                  {selectedType === 'other_customer' && (
                    <input
                      type="text"
                      value={followupTypeOther}
                      onChange={(e) => setFollowupTypeOther(e.target.value)}
                      placeholder="请输入其他客户事项说明"
                      className="mt-2 w-full bg-[#F5F5F5] border-none rounded-xl px-4 py-2.5 text-sm text-[#0A0A0A] focus:outline-none focus:ring-2 focus:ring-[#2D3BFF]/30"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#5A5A5A] mb-2">跟进方式</label>
                  <SearchableSelect
                    value={selectedMethod}
                    onChange={(value) => setSelectedMethod(value)}
                    options={[
                      { value: 'phone_visit', label: '电话拜访' },
                      { value: 'onsite_visit', label: '上门拜访' },
                      { value: 'online_visit', label: '网络拜访' },
                      { value: 'hmg_meeting', label: 'HMG现场会议' },
                    ]}
                    placeholder="请选择方式"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-[#5A5A5A] mb-2">跟进时间 *</label>
                  <input 
                    type="datetime-local"
                    value={followupTime}
                    onChange={(e) => setFollowupTime(e.target.value)}
                    className="w-full bg-[#F5F5F5] border-none rounded-xl px-4 py-2.5 text-sm text-[#0A0A0A] focus:outline-none focus:ring-2 focus:ring-[#2D3BFF]/30"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-[#5A5A5A] mb-2">下次跟进</label>
                  <input 
                    type="datetime-local"
                    value={nextFollowupTime}
                    onChange={(e) => setNextFollowupTime(e.target.value)}
                    className="w-full bg-[#F5F5F5] border-none rounded-xl px-4 py-2.5 text-sm text-[#0A0A0A] focus:outline-none focus:ring-2 focus:ring-[#2D3BFF]/30"
                  />
                </div>
              </div>
            </div>

            {/* AI听记 */}
            <div className="bg-white border border-[#EBEBEB] rounded-xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-[#0A0A0A] flex items-center gap-2">
                  <MicIcon className="w-5 h-5 text-[#2D3BFF]" />
                  AI听记
                </h3>
              </div>
              
              {(!isRecording && transcriptSegments.length === 0) ? (
                <div className="flex items-center gap-3">
                  <button 
                    onClick={handleStartRecording}
                    className="px-6 py-3 text-sm bg-[#22C55E] text-white rounded-xl hover:bg-[#22C55E]/90 transition-all inline-flex items-center gap-2"
                  >
                    <MicIcon className="w-5 h-5" />
                    开始录音
                  </button>
                  <button className="px-6 py-3 text-sm bg-[#F5F5F5] text-[#0A0A0A] rounded-xl hover:bg-[#EBEBEB] transition-all inline-flex items-center gap-2">
                    <UploadIcon className="w-5 h-5" />
                    上传录音
                  </button>
                  <span className="text-sm text-[#999999] flex items-center gap-2">
                    <ClockIcon className="w-5 h-5" />
                    {recordingTime}
                  </span>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={isPaused ? handleResumeRecording : handlePauseRecording}
                      className="px-4 py-2 text-sm bg-[#F5F5F5] text-[#0A0A0A] rounded-xl hover:bg-[#EBEBEB] transition-all inline-flex items-center gap-2"
                    >
                      {isPaused ? <PlayIcon className="w-4 h-4" /> : <PauseIcon className="w-4 h-4" />}
                      {isPaused ? '继续录音' : '暂停录音'}
                    </button>
                    <button 
                      onClick={handleStopRecording}
                      className="px-4 py-2 text-sm bg-[#EF4444] text-white rounded-xl hover:bg-[#EF4444]/90 transition-all inline-flex items-center gap-2"
                    >
                      <StopIcon className="w-4 h-4" />
                      停止录音
                    </button>
                    <span className="text-sm text-[#999999] flex items-center gap-2">
                      <ClockIcon className="w-5 h-5" />
                      {recordingTime}
                    </span>
                  </div>
                </div>
              )}

              {/* 实时转写 */}
              {transcriptSegments.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-[#0A0A0A]">实时转写</h4>
                    <button className="text-sm text-[#2D3BFF] flex items-center gap-1">
                      <PencilIcon className="w-4 h-4" />
                      编辑修正
                    </button>
                  </div>
                  <div className="bg-[#F5F5F5] rounded-xl p-5 space-y-4">
                    {transcriptSegments.map((segment, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <span className="w-8 h-8 rounded-full bg-[#2D3BFF]/10 text-[#2D3BFF] flex items-center justify-center font-medium text-xs">
                            {segment.speaker.charAt(0)}
                          </span>
                          <span className="font-medium text-[#0A0A0A]">{segment.speaker}</span>
                          <span className="text-[#999999] text-xs">{segment.time}</span>
                        </div>
                        <p className="text-sm text-[#0A0A0A] ml-10 leading-relaxed">
                          {segment.text}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 跟进内容 */}
            <div className="bg-white border border-[#EBEBEB] rounded-xl p-6 space-y-4">
              <h3 className="text-sm font-semibold text-[#0A0A0A]">跟进内容</h3>
              <textarea 
                className="w-full bg-[#F5F5F5] border-none rounded-xl px-4 py-3 text-sm text-[#0A0A0A] focus:outline-none focus:ring-2 focus:ring-[#2D3BFF]/30 resize-none"
                rows={6}
                placeholder="请输入跟进内容..."
              />
            </div>
          </div>

          {/* 右侧 - 会议纪要 */}
          <div className="col-span-5 space-y-6">
            <div className="bg-white border border-[#EBEBEB] rounded-xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-[#0A0A0A]">会议纪要</h3>
                {summary && (
                  <button className="text-sm text-[#2D3BFF] flex items-center gap-1">
                    <RefreshIcon className="w-4 h-4" />
                    重新生成
                  </button>
                )}
              </div>

              {summary ? (
                <div className="space-y-4">
                  <div>
                    <h4 className="text-xs font-medium text-[#5A5A5A] mb-2">会议摘要</h4>
                    <p className="text-sm text-[#0A0A0A] leading-relaxed bg-[#F5F5F5] rounded-lg p-4">
                      {summary}
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="text-xs font-medium text-[#5A5A5A] mb-2">关键要点</h4>
                    <textarea 
                      value={keyPoints}
                      onChange={(e) => setKeyPoints(e.target.value)}
                      className="w-full bg-[#F5F5F5] border-none rounded-lg p-4 text-sm text-[#0A0A0A] focus:outline-none focus:ring-2 focus:ring-[#2D3BFF]/30 resize-none"
                      rows={4}
                    />
                  </div>
                  
                  <div>
                    <h4 className="text-xs font-medium text-[#5A5A5A] mb-2">待办事项</h4>
                    <textarea 
                      value={toDos}
                      onChange={(e) => setToDos(e.target.value)}
                      className="w-full bg-[#F5F5F5] border-none rounded-lg p-4 text-sm text-[#0A0A0A] focus:outline-none focus:ring-2 focus:ring-[#2D3BFF]/30 resize-none"
                      rows={4}
                    />
                  </div>
                  
                  <div>
                    <h4 className="text-xs font-medium text-[#5A5A5A] mb-2">决策事项</h4>
                    <textarea 
                      value={decisions}
                      onChange={(e) => setDecisions(e.target.value)}
                      className="w-full bg-[#F5F5F5] border-none rounded-lg p-4 text-sm text-[#0A0A0A] focus:outline-none focus:ring-2 focus:ring-[#2D3BFF]/30 resize-none"
                      rows={4}
                    />
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-sm text-[#999999]">
                  开始录音后将自动生成会议纪要
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
  );
}

export default function NewFollowupPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen text-[#999999]">加载中...</div>}>
      <FollowupFormContent />
    </Suspense>
  );
}
