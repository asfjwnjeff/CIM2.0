'use client';

import React, { useState, useRef, useEffect } from 'react';

interface TranscriptSegment {
  speaker: string;
  time: string;
  text: string;
}

interface AIRecordingCardProps {
  onDataChange: (data: {
    transcript?: string;
    meetingSummary?: string;
    keyPoints?: string[];
    actionItems?: string[];
    decisions?: string[];
  }) => void;
  initialData?: {
    meetingSummary?: string;
    keyPoints?: string[];
    actionItems?: string[];
    decisions?: string[];
  };
}

export default function AIRecordingCard({ onDataChange, initialData }: AIRecordingCardProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [transcriptSegments, setTranscriptSegments] = useState<TranscriptSegment[]>([]);
  const [summary, setSummary] = useState(initialData?.meetingSummary || '');
  const [keyPointsText, setKeyPointsText] = useState(
    (initialData?.keyPoints || []).join('\n')
  );
  const [toDosText, setToDosText] = useState(
    (initialData?.actionItems || []).join('\n')
  );
  const [decisionsText, setDecisionsText] = useState(
    (initialData?.decisions || []).join('\n')
  );
  const [showTranscript, setShowTranscript] = useState(false);
  const [regenerating, setRegenerating] = useState(false);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // 计时器
  useEffect(() => {
    if (isRecording && !isPaused) {
      timerRef.current = setInterval(() => {
        setRecordingTime((t) => t + 1);
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording, isPaused]);

  // 同步数据回父组件
  useEffect(() => {
    onDataChange({
      transcript: transcriptSegments.length > 0 ? JSON.stringify(transcriptSegments) : undefined,
      meetingSummary: summary || undefined,
      keyPoints: keyPointsText ? keyPointsText.split('\n').filter(Boolean) : undefined,
      actionItems: toDosText ? toDosText.split('\n').filter(Boolean) : undefined,
      decisions: decisionsText ? decisionsText.split('\n').filter(Boolean) : undefined,
    });
  }, [summary, keyPointsText, toDosText, decisionsText, transcriptSegments, onDataChange]);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const handleStartRecording = () => {
    setIsRecording(true);
    setIsPaused(false);
    setRecordingTime(0);
    setTranscriptSegments([]);
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
    // Mock 转写数据
    setTranscriptSegments([
      { speaker: '客户方', time: '00:05', text: '我们目前的物流需求主要是半导体设备的报关和运输，时效性要求比较高。' },
      { speaker: '我方', time: '00:30', text: '了解，我们在半导体设备物流方面有丰富的经验，可以提供全套报关+运输方案。' },
      { speaker: '客户方', time: '00:55', text: '价格方面有什么优势吗？我们目前的供应商报价在每票1500左右。' },
      { speaker: '我方', time: '01:20', text: '我们可以做到每票1200，并且提供实时追踪和异常预警服务。' },
    ]);
    // Mock 摘要
    setSummary('客户（半导体企业）需要报关+运输服务，关注时效性和价格。我方提供了每票1200的报价方案，并强调实时追踪能力。客户表示会内部评估后回复。');
    setKeyPointsText('客需为半导体设备报关运输\n时效要求高，需24小时内通关\n价格敏感，需控制在每票1200以内\n客户承诺本周五前给反馈');
    setToDosText('本周五跟进客户反馈\n准备正式报价单\n对接操作部确认运输路线');
    setDecisionsText('同意以每票1200报价\n由王明跟进此客户\n下周确认操作方案后启动试单');
  };

  const handleRegenerate = () => {
    setRegenerating(true);
    setTimeout(() => {
      setRegenerating(false);
      // Mock 重新生成
      setSummary(summary + '\n\n[已更新] 经AI重新分析，建议将报价进一步优化至每票1150以提升竞争力。');
    }, 1500);
  };

  return (
    <div className="space-y-3">
      <span className="text-sm font-semibold text-[#0A0A0A]">🎙️ AI听记</span>

      {/* 录音控制区 */}
      <div className="bg-[#F8F9FF] rounded-lg p-3 space-y-2">
        {!isRecording && transcriptSegments.length === 0 ? (
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#5A5A5A]">开始录音以进行AI转写</span>
            <button
              type="button"
              className="px-4 py-1.5 bg-[#D63031] text-white rounded-lg text-xs font-medium active:bg-[#B82020] flex items-center gap-1"
              onClick={handleStartRecording}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="6" />
              </svg>
              开始录音
            </button>
          </div>
        ) : isRecording ? (
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${isPaused ? 'bg-[#E8850C]' : 'bg-[#D63031] animate-pulse'}`} />
                <span className={`text-sm font-mono ${isPaused ? 'text-[#E8850C]' : 'text-[#D63031]'}`}>
                  {formatTime(recordingTime)}
                </span>
                {isPaused && <span className="text-xs text-[#E8850C]">已暂停</span>}
              </div>
              <div className="flex items-center gap-2">
                {isPaused ? (
                  <button
                    type="button"
                    className="px-3 py-1.5 bg-[#0D8A5E] text-white rounded-lg text-xs font-medium"
                    onClick={handleResumeRecording}
                  >
                    继续
                  </button>
                ) : (
                  <button
                    type="button"
                    className="px-3 py-1.5 bg-[#E8850C] text-white rounded-lg text-xs font-medium"
                    onClick={handlePauseRecording}
                  >
                    暂停
                  </button>
                )}
                <button
                  type="button"
                  className="px-3 py-1.5 bg-[#D63031] text-white rounded-lg text-xs font-medium"
                  onClick={handleStopRecording}
                >
                  停止
                </button>
              </div>
            </div>
            {/* 实时转写预览 */}
            {transcriptSegments.length > 0 && (
              <button
                type="button"
                className="mt-2 w-full text-left text-xs text-[#2D3BFF] font-medium"
                onClick={() => setShowTranscript(!showTranscript)}
              >
                {showTranscript ? '收起转写' : `查看实时转写 (${transcriptSegments.length}条)`}
              </button>
            )}
          </div>
        ) : null}
      </div>

      {/* 转写内容 */}
      {showTranscript && transcriptSegments.length > 0 && (
        <div className="bg-white border border-[#EBEBEB] rounded-lg p-3 space-y-2 max-h-60 overflow-y-auto">
          {transcriptSegments.map((seg, i) => (
            <div key={i} className="text-xs space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="font-medium text-[#2D3BFF]">{seg.speaker}</span>
                <span className="text-[#999999]">{seg.time}</span>
              </div>
              <p className="text-[#5A5A5A]">{seg.text}</p>
            </div>
          ))}
        </div>
      )}

      {/* 会议纪要（录音停止后显示） */}
      {!isRecording && transcriptSegments.length > 0 && (
        <div className="space-y-3">
          {/* 会议摘要 */}
          <div>
            <label className="text-xs font-medium text-[#5A5A5A] block mb-1">会议摘要</label>
            <textarea
              className="w-full h-20 px-3 py-2 border border-[#EBEBEB] rounded-lg text-xs resize-none focus:outline-none focus:border-[#2D3BFF]"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="AI将自动生成会议摘要..."
            />
          </div>

          {/* 关键要点 */}
          <div>
            <label className="text-xs font-medium text-[#5A5A5A] block mb-1">关键要点（每行一个）</label>
            <textarea
              className="w-full h-20 px-3 py-2 border border-[#EBEBEB] rounded-lg text-xs resize-none focus:outline-none focus:border-[#2D3BFF]"
              value={keyPointsText}
              onChange={(e) => setKeyPointsText(e.target.value)}
              placeholder={'例如：\n客户对时效性要求高\n竞品价格在1500左右\n需准备正式报价方案'}
              rows={4}
            />
          </div>

          {/* 待办事项 */}
          <div>
            <label className="text-xs font-medium text-[#5A5A5A] block mb-1">待办事项（每行一个）</label>
            <textarea
              className="w-full h-20 px-3 py-2 border border-[#EBEBEB] rounded-lg text-xs resize-none focus:outline-none focus:border-[#2D3BFF]"
              value={toDosText}
              onChange={(e) => setToDosText(e.target.value)}
              placeholder={'例如：\n周五前跟进客户\n准备正式报价单'}
              rows={4}
            />
          </div>

          {/* 决策事项 */}
          <div>
            <label className="text-xs font-medium text-[#5A5A5A] block mb-1">决策事项（每行一个）</label>
            <textarea
              className="w-full h-20 px-3 py-2 border border-[#EBEBEB] rounded-lg text-xs resize-none focus:outline-none focus:border-[#2D3BFF]"
              value={decisionsText}
              onChange={(e) => setDecisionsText(e.target.value)}
              placeholder={'例如：\n同意以每票1200报价\n王明负责跟进'}
              rows={4}
            />
          </div>

          {/* 重新生成 */}
          <button
            type="button"
            className="w-full py-2 bg-[#E8EBFF] text-[#2D3BFF] rounded-lg text-xs font-medium active:bg-[#D0D5FF] transition-colors flex items-center justify-center gap-2"
            onClick={handleRegenerate}
            disabled={regenerating}
          >
            {regenerating ? (
              <>
                <div className="w-3 h-3 border border-[#2D3BFF] border-t-transparent rounded-full animate-spin" />
                AI 分析中...
              </>
            ) : (
              '🔄 AI 重新生成纪要'
            )}
          </button>
        </div>
      )}
    </div>
  );
}
