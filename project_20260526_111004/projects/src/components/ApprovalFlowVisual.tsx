'use client';

import { ApprovalWorkflow, RuleTriggeredApprover } from '@/lib/types';

export interface ApprovalFlowVisualProps {
  workflow: ApprovalWorkflow | null;
  ruleTriggeredApprovers?: RuleTriggeredApprover[];
  mode: 'preview' | 'progress';
  progress?: {
    currentNodeIndex: number;
    completedNodes: number[];
    approvalTimes?: Record<number, string>;
  };
}

export default function ApprovalFlowVisual({
  workflow,
  ruleTriggeredApprovers = [],
  mode,
  progress,
}: ApprovalFlowVisualProps) {
  if (!workflow || !workflow.approvalNodes || workflow.approvalNodes.length === 0) {
    return (
      <div className="p-8 text-center text-[#999] text-sm">
        暂无审批流程配置，请先选择服务产品
      </div>
    );
  }

  const nodes = workflow.approvalNodes;

  return (
    <div className="space-y-2">
      {nodes.map((node, index) => {
        const isFunctional = (node.type || node.nodeType) === 'functional';
        const isLast = index === nodes.length - 1;
        const nodeIndex = node.level ?? index;

        // Progress mode state
        const isCompleted = mode === 'progress' && progress?.completedNodes?.includes(nodeIndex);
        const isCurrent = mode === 'progress' && progress?.currentNodeIndex === nodeIndex;
        const isPending = mode === 'progress' && !isCompleted && !isCurrent;

        // Conditional approvers for functional node
        const functionalApprovers = isFunctional ? ruleTriggeredApprovers : [];
        const hasConditional = functionalApprovers.length > 0;
        const totalApprovers = (node.approvers?.length || 0) + functionalApprovers.length;
        const showCountersignNote = isFunctional && totalApprovers > 1;

        return (
          <div key={node.id || index} className="flex gap-3">
            {/* Timeline */}
            <div className="flex flex-col items-center flex-shrink-0 pt-1">
              {isCompleted ? (
                <div className="w-8 h-8 rounded-full bg-[#0D8A5E] text-white flex items-center justify-center text-[10px]">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
              ) : isCurrent ? (
                <div className="w-8 h-8 rounded-full bg-[#2D3BFF] text-white flex items-center justify-center text-xs font-bold shadow-[0_0_0_4px_rgba(45,59,255,0.15)]" style={{ animation: 'approval-pulse 2s ease-in-out infinite' }}>
                  {nodeIndex}
                </div>
              ) : (
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 ${
                  isFunctional ? 'bg-[#2D3BFF] border-[#2D3BFF] text-white shadow-[0_0_0_3px_rgba(45,59,255,0.15)]' : 'bg-white border-[#D5D5D5] text-[#999]'
                }`}>
                  {nodeIndex}
                </div>
              )}
              {!isLast && (
                <div className={`w-0.5 flex-1 min-h-[40px] ${
                  isCompleted ? 'bg-[#0D8A5E]' :
                  isFunctional ? 'bg-[#2D3BFF]/30' :
                  'bg-[#EBEBEB]'
                }`} />
              )}
            </div>

            {/* Content */}
            <div className={`flex-1 pb-2 ${
              isFunctional
                ? 'bg-[#F0F1FF] border border-[#C7CAFF] rounded-lg p-3'
                : isCurrent
                ? 'bg-[#F0F1FF] border border-[#2D3BFF] rounded-lg p-3'
                : 'bg-white border border-[#EBEBEB] rounded-lg p-3'
            }`}>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-semibold text-[#0A0A0A]">{node.name}</span>
                {isFunctional && (
                  <span className="inline-flex items-center px-1.5 py-0.5 text-[10px] font-medium bg-[#2D3BFF] text-white rounded">动态</span>
                )}
                {isCurrent && (
                  <span className="inline-flex items-center px-1.5 py-0.5 text-[10px] font-medium bg-[#2D3BFF] text-white rounded">审批中</span>
                )}
                {mode === 'preview' && index === 0 && (
                  <span className="inline-flex items-center px-1.5 py-0.5 text-[10px] font-medium bg-[#F5F5F5] text-[#999] rounded border border-[#D5D5D5]">草稿</span>
                )}
                {showCountersignNote && (
                  <span className="inline-flex items-center px-1.5 py-0.5 text-[10px] font-medium bg-[#FFF9EB] text-[#E8850C] rounded border border-[#FDE68A]">会签</span>
                )}
              </div>

              {/* Default approvers */}
              {node.approvers && node.approvers.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {node.approvers.map((approver) => (
                    <span key={approver.id} className={`inline-flex items-center px-2 py-0.5 text-xs rounded-full ${
                      isFunctional
                        ? 'bg-[#E8EBFF] text-[#2D3BFF] border border-[#2D3BFF]/20'
                        : 'bg-white border border-[#D5D5D5] text-[#5A5A5A]'
                    }`}>
                      {approver.name}
                    </span>
                  ))}
                </div>
              )}

              {/* Conditional approvers (functional node only) */}
              {isFunctional && hasConditional && (
                <div className="pt-2 border-t border-dashed border-[#E8850C]">
                  {functionalApprovers.map((ta) => (
                    <div key={ta.ruleId} className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs bg-[#FFF9EB] border border-[#FDE68A] mb-1 mr-1">
                      <span className="text-[#E8850C] font-medium">+ {ta.approver.name}</span>
                      <span className="text-[10px] text-[#E8850C]">{ta.reason}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Countersign note */}
              {showCountersignNote && (
                <div className="mt-2 p-2 bg-[#FFF9EB] rounded text-[10px] text-[#E8850C] text-center">
                  职能审批共 {totalApprovers} 人，需全部同意（会签）
                </div>
              )}

              {/* Completed time */}
              {isCompleted && progress?.approvalTimes?.[nodeIndex] && (
                <p className="text-[10px] text-[#0D8A5E] mt-1">
                  {progress.approvalTimes[nodeIndex]}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
