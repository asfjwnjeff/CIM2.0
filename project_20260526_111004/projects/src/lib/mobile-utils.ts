/**
 * 将 Date 或 ISO 字符串格式化为相对时间（移动端统一使用）
 */
export function formatRelativeTime(dateStr: string): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return '刚刚';
  if (diffMins < 60) return `${diffMins}分钟前`;
  if (diffHours < 24) return `${diffHours}小时前`;
  if (diffDays < 7) return `${diffDays}天前`;
  return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
}

/**
 * 将 Date 或 ISO 字符串格式化为简短日期（MM月DD日 HH:mm）
 */
export function formatShortDateTime(dateStr: string): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString('zh-CN', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * 审批状态中文标签映射（PRD §5.6）
 */
export function getApprovalStatusLabel(status: string): string {
  const map: Record<string, string> = {
    draft: '草稿',
    in_review: '审批中',
    approved: '已完成',
    rejected: '已驳回',
    '草稿': '草稿',
    '审批中': '审批中',
    '审批完成': '已完成',
    '已驳回': '已驳回',
  };
  return map[status] || status;
}

/**
 * 跟进状态颜色映射（PRD §5.4）
 */
export function getFollowupStatusColor(status: string): string {
  const success = ['success'];
  const danger = ['failed', 'cancelled', 'terminated'];
  const info = ['new', 'discussing', 'promoting'];
  if (success.includes(status)) return 'bg-[#E6F7F0] text-[#0D8A5E]';
  if (danger.includes(status)) return 'bg-[#FFEBEE] text-[#D63031]';
  if (info.includes(status)) return 'bg-[#E8EBFF] text-[#2D3BFF]';
  return 'bg-[#F5F5F5] text-[#5A5A5A]';
}

/**
 * 跟进方式中文标签
 */
export function getFollowupMethodLabel(method: string): string {
  const map: Record<string, string> = {
    phone_visit: '📞 电话',
    onsite_visit: '🚗 上门',
    online_visit: '💻 网络',
    hmg_meeting: '🏢 HMG会议',
  };
  return map[method] || method;
}

/**
 * 跟进类型中文标签
 */
export function getFollowupTypeLabel(type: string): string {
  const map: Record<string, string> = {
    kpi_not_met: 'KPI未达标',
    contract_mgmt: '合同管理',
    biz_meeting: '业务会议',
    other_customer: '其他客户事项',
  };
  return map[type] || type;
}
