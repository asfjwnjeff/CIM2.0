'use client';

import React, { useState, Suspense } from 'react';

export const dynamic = 'force-dynamic';
import { useRouter, useSearchParams } from 'next/navigation';
import { useApp } from '@/lib/store';
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

const SaveIcon = ({ className = '' }: { className?: string }) => (
  <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
    <polyline points="17 21 17 13 7 13 7 21"></polyline>
    <polyline points="7 3 7 8 15 8"></polyline>
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
  const [selectedStatus, setSelectedStatus] = useState<string>('new');
  const [selectedOwner, setSelectedOwner] = useState<string>('');
  const [selectedContactId, setSelectedContactId] = useState<string>('');
  const [checkInRecords, setCheckInRecords] = useState<Array<{lat:number;lng:number;address:string;timestamp:string;photos:string[]}>>([]);
  const [checkInPhotos, setCheckInPhotos] = useState<string[]>([]);
  const [checkingIn, setCheckingIn] = useState(false);
  const [checkInError, setCheckInError] = useState('');
  const [attachments, setAttachments] = useState<string[]>([]);
  const [selectedCollaborators, setSelectedCollaborators] = useState<string[]>([]);
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

  const { addFollowUp } = useApp();
  const [saving, setSaving] = useState(false);
  const [draftMessage, setDraftMessage] = useState('');

  const buildFollowUpData = (status: string) => ({
    customerId: selectedCustomerId,
    customerName: selectedCustomer,
    contactId: selectedContactId || undefined,
    contactName: customers.find(c => c.id === selectedContactId)?.contact || undefined,
    type: (selectedType as any) || 'biz_meeting',
    method: (selectedMethod as any) || undefined,
    followUpDate: followupTime || undefined,
    nextFollowUpDate: nextFollowupTime || undefined,
    status: status as any,
    owner: selectedOwner || undefined,
    collaborators: selectedCollaborators.length > 0 ? selectedCollaborators : undefined,
    content: summary || undefined,
    keyPoints: keyPoints ? keyPoints.split('\n').filter(Boolean) : undefined,
    actionItems: toDos ? toDos.split('\n').filter(Boolean) : undefined,
    decisions: decisions ? decisions.split('\n').filter(Boolean) : undefined,
    transcript: transcriptSegments.length > 0 ? JSON.stringify(transcriptSegments) : undefined,
    meetingSummary: summary || undefined,
    attachments: attachments.length > 0 ? attachments : undefined,
    checkInRecords: checkInRecords.length > 0 ? checkInRecords : undefined,
  });

  const handleCheckIn = () => {
    setCheckingIn(true);
    setCheckInError('');
    if (!navigator.geolocation) {
      setCheckInError('浏览器不支持定位功能');
      setCheckingIn(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        const now = new Date().toISOString();
        fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=zh`)
          .then(r => r.json())
          .then(data => {
            setCheckInRecords(prev => [...prev, { lat, lng, address: data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`, timestamp: now, photos: [] }]);
            setCheckInPhotos([]);
            setCheckingIn(false);
          })
          .catch(() => {
            setCheckInRecords(prev => [...prev, { lat, lng, address: `${lat.toFixed(4)}, ${lng.toFixed(4)}`, timestamp: now, photos: [] }]);
            setCheckInPhotos([]);
            setCheckingIn(false);
          });
      },
      (err) => {
        setCheckInError('定位失败：' + (err.message || '请检查定位权限'));
        setCheckingIn(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleCheckInPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setCheckInPhotos(prev => {
        const newPhotos = [...prev, reader.result as string];
        // Update the last check-in record with the new photos
        setCheckInRecords(prevRecords => {
          if (prevRecords.length === 0) return prevRecords;
          const updated = [...prevRecords];
          updated[updated.length - 1] = { ...updated[updated.length - 1], photos: newPhotos };
          return updated;
        });
        return newPhotos;
      });
    };
    reader.readAsDataURL(file);
  };

  const removeCheckInPhoto = (index: number) => {
    setCheckInPhotos(prev => {
      const newPhotos = prev.filter((_, i) => i !== index);
      setCheckInRecords(prevRecords => {
        if (prevRecords.length === 0) return prevRecords;
        const updated = [...prevRecords];
        updated[updated.length - 1] = { ...updated[updated.length - 1], photos: newPhotos };
        return updated;
      });
      return newPhotos;
    });
  };

  const handleAttachmentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAttachments(prev => [...prev, file.name]);
  };

  const handleSaveDraft = () => {
    setSaving(true);
    addFollowUp(buildFollowUpData('draft') as Parameters<typeof addFollowUp>[0]);
    setDraftMessage('草稿已保存，您可以继续编辑');
    setSaving(false);
    setTimeout(() => setDraftMessage(''), 3000);
  };

  const handleSubmit = () => {
    if (!selectedCustomerId) { alert('请选择关联客户'); return; }
    if (!selectedType) { alert('请选择跟进类型'); return; }
    if (!followupTime) { alert('请选择跟进时间'); return; }
    setSaving(true);
    addFollowUp(buildFollowUpData(selectedStatus || 'new') as Parameters<typeof addFollowUp>[0]);
    setSaving(false);
    router.push('/followup');
  };

  return (
      <div className="max-w-[1440px] mx-auto space-y-6">
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
              onClick={handleSaveDraft}
              disabled={saving}
              className="px-4 py-2 text-sm border border-[#EBEBEB] text-[#5A5A5A] rounded-xl hover:bg-[#F5F5F5] transition-all inline-flex items-center gap-2 disabled:opacity-50"
            >
              <SaveIcon /> 暂存
            </button>
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="px-4 py-2 text-sm bg-[#2D3BFF] text-white rounded-xl hover:opacity-90 active:scale-[0.98] transition-all inline-flex items-center gap-2 shadow-sm disabled:opacity-50"
            >
              <PlusIcon className="w-4 h-4" /> 提交
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
                    <textarea
                      value={followupTypeOther}
                      onChange={(e) => setFollowupTypeOther(e.target.value)}
                      placeholder="请输入其他客户事项说明"
                      rows={2}
                      className="mt-2 w-full bg-[#F5F5F5] border-none rounded-xl px-4 py-3 text-sm text-[#0A0A0A] focus:outline-none focus:ring-2 focus:ring-[#2D3BFF]/30 resize-none"
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
                  <label className="block text-sm font-medium text-[#5A5A5A] mb-2">跟进状态</label>
                  <SearchableSelect
                    value={selectedStatus}
                    onChange={(value) => setSelectedStatus(value)}
                    options={[
                      { value: 'new', label: '新建需求' },
                      { value: 'discussing', label: '沟通方案' },
                      { value: 'promoting', label: '促单' },
                      { value: 'success', label: '成功' },
                      { value: 'no_progress', label: '无进展' },
                      { value: 'cancelled', label: '需求取消' },
                      { value: 'terminated', label: '合同终止' },
                      { value: 'failed', label: '失败' },
                    ]}
                    placeholder="请选择状态"
                  />
                </div>

                {/* 打卡 — 仅上门拜访 */}
                {selectedMethod === 'onsite_visit' && (
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-[#5A5A5A] mb-2">上门打卡</label>
                    {/* 已打卡记录 */}
                    {checkInRecords.map((rec, idx) => (
                      <div key={idx} className="mb-3 p-3 bg-[#F5F5F5] rounded-lg text-xs">
                        <div className="text-[#0D8A5E] font-medium">打卡 #{idx + 1}: {rec.address}</div>
                        <div className="text-[#999] mt-0.5">{new Date(rec.timestamp).toLocaleString()}</div>
                        {rec.photos.length > 0 && (
                          <div className="flex gap-1.5 mt-2">
                            {rec.photos.map((photo, pi) => (
                              <div key={pi} className="relative w-16 h-16 rounded overflow-hidden bg-white border border-[#EBEBEB]">
                                <img src={photo} alt="" className="w-full h-full object-cover" />
                                <button type="button" onClick={() => {
                                  setCheckInRecords(prev => {
                                    const updated = [...prev];
                                    updated[idx] = { ...updated[idx], photos: updated[idx].photos.filter((_, j) => j !== pi) };
                                    return updated;
                                  });
                                }} className="absolute top-0 right-0 w-4 h-4 bg-black/50 rounded-bl text-white text-[10px] flex items-center justify-center">×</button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={handleCheckIn}
                        disabled={checkingIn}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#0D8A5E] text-white rounded-xl text-sm font-medium hover:bg-[#0B7250] disabled:opacity-50 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        {checkingIn ? '定位中...' : '打卡签到'}
                      </button>
                      {checkInRecords.length > 0 && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-[#0D8A5E]">最新打卡完成</span>
                          <label className="w-20 h-9 rounded-lg border-2 border-dashed border-[#D5D5D5] flex items-center justify-center cursor-pointer hover:border-[#2D3BFF] hover:bg-[#E8EBFF] transition-colors">
                            <input type="file" accept="image/*" onChange={handleCheckInPhoto} className="hidden" />
                            <span className="text-xs text-[#999]">+照片</span>
                          </label>
                        </div>
                      )}
                    </div>
                    {checkInError && <p className="text-xs text-[#D63031] mt-1">{checkInError}</p>}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-[#5A5A5A] mb-2">下次跟进</label>
                  <input 
                    type="datetime-local"
                    value={nextFollowupTime}
                    onChange={(e) => setNextFollowupTime(e.target.value)}
                    className="w-full bg-[#F5F5F5] border-none rounded-xl px-4 py-2.5 text-sm text-[#0A0A0A] focus:outline-none focus:ring-2 focus:ring-[#2D3BFF]/30"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#5A5A5A] mb-2">联系人</label>
                  <SearchableSelect
                    value={selectedContactId}
                    onChange={(value) => setSelectedContactId(value)}
                    options={customers.filter(c => c.id === selectedCustomerId).map(c => ({ value: c.id, label: c.contact || '无联系人' }))}
                    placeholder="请选择联系人"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#5A5A5A] mb-2">负责人</label>
                  <input
                    type="text"
                    value={selectedOwner}
                    onChange={(e) => setSelectedOwner(e.target.value)}
                    placeholder="请输入负责人"
                    className="w-full bg-[#F5F5F5] border-none rounded-xl px-4 py-2.5 text-sm text-[#0A0A0A] focus:outline-none focus:ring-2 focus:ring-[#2D3BFF]/30"
                  />
                </div>
              </div>
            </div>

            {/* 附件 */}
            <div className="bg-white border border-[#EBEBEB] rounded-xl p-6 space-y-4">
              <h3 className="text-sm font-semibold text-[#0A0A0A]">附件</h3>
              <div className="flex flex-wrap gap-2">
                {attachments.map((name, i) => (
                  <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#E8F4FF] text-[#2D3BFF] rounded-lg text-xs">
                    {name}
                    <button type="button" onClick={() => setAttachments(prev => prev.filter((_, j) => j !== i))} className="text-[#999] hover:text-red-500">×</button>
                  </span>
                ))}
                <label className="inline-flex items-center gap-1 px-3 py-1.5 border-2 border-dashed border-[#D5D5D5] rounded-lg text-xs text-[#999] cursor-pointer hover:border-[#2D3BFF] hover:text-[#2D3BFF]">
                  <input type="file" onChange={handleAttachmentUpload} className="hidden" />
                  + 上传文件
                </label>
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
