'use client';
import { useEffect, useState, useCallback, useRef } from 'react';
import {
  Bell,
  CheckCheck,
  ShoppingCart,
  TrendingUp,
  AlertCircle,
  MessageSquare,
  RefreshCw,
  Filter,
  Mail,
  Clock,
  X,
  ChevronRight,
  User,
  Send,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface AdminNotification {
  id: number;
  user_id: string;
  user_name: string;
  user_email: string;
  event_type: string;
  plan_name: string;
  plan_id: number | null;
  amount: number;
  platform: string;
  status: string;
  details: Record<string, unknown>;
  created_at: string;
}

interface IssueReport {
  id: number;
  user_id: string;
  user_name: string;
  user_email: string;
  subject: string;
  description: string;
  status: string;
  is_read: boolean;
  created_at: string;
}

const EVENT_CONFIG: Record<
  string,
  { label: string; color: string; bg: string; icon: React.ElementType }
> = {
  purchase_success: {
    label: 'Purchase Successful',
    color: '#059669',
    bg: '#ECFDF5',
    icon: ShoppingCart,
  },
  purchase_attempt: {
    label: 'Purchase Attempted',
    color: '#D97706',
    bg: '#FFFBEB',
    icon: TrendingUp,
  },
  purchase_failed: { label: 'Purchase Failed', color: '#DC2626', bg: '#FEF2F2', icon: AlertCircle },
};

const STATUS_OPTIONS = [
  { value: 'open', label: 'Open', color: '#D97706', bg: '#FFFBEB' },
  { value: 'in_progress', label: 'In Progress', color: '#2563EB', bg: '#EFF6FF' },
  { value: 'resolved', label: 'Resolved', color: '#059669', bg: '#ECFDF5' },
];

function TimeAgo({ dateStr }: { dateStr: string }) {
  const [label, setLabel] = useState('');
  useEffect(() => {
    const calc = () => {
      const diff = Date.now() - new Date(dateStr).getTime();
      const mins = Math.floor(diff / 60000);
      if (mins < 1) return 'Just now';
      if (mins < 60) return `${mins}m ago`;
      const hrs = Math.floor(mins / 60);
      if (hrs < 24) return `${hrs}h ago`;
      return `${Math.floor(hrs / 24)}d ago`;
    };
    setLabel(calc());
  }, [dateStr]);
  return <span suppressHydrationWarning>{label}</span>;
}

function ReportDetailPanel({
  report,
  onClose,
  onUpdate,
}: {
  report: IssueReport;
  onClose: () => void;
  onUpdate: (id: number, updates: Partial<IssueReport>) => void;
}) {
  const [status, setStatus] = useState(report.status);
  const [saving, setSaving] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // Mark as read when opened
  useEffect(() => {
    if (!report.is_read) {
      void fetch('/api/admin/reports', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: report.id, is_read: true }),
      });
      onUpdate(report.id, { is_read: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [report.id]);

  const saveStatus = async (newStatus: string) => {
    setSaving(true);
    const res = await fetch('/api/admin/reports', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: report.id, status: newStatus, is_read: true }),
    });
    setSaving(false);
    if (res.ok) {
      setStatus(newStatus);
      onUpdate(report.id, { status: newStatus, is_read: true });
      toast.success('Status updated');
    } else {
      toast.error('Failed to update status');
    }
  };

  const statusCfg = STATUS_OPTIONS.find((s) => s.value === status) ?? STATUS_OPTIONS[0];
  const initials = report.user_name
    ? report.user_name
        .split(' ')
        .map((w) => w[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : '?';

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div className="flex-1 bg-black/40" onClick={onClose} />

      {/* Slide-in panel */}
      <div
        ref={panelRef}
        className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="bg-[#0D4C3E] px-6 py-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <MessageSquare size={18} className="text-white" />
            </div>
            <div>
              <p className="text-white font-bold text-base">User Report</p>
              <p className="text-white/50 text-xs mt-0.5">#{report.id}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white transition-colors p-1"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* User info */}
          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl">
            <div className="w-12 h-12 rounded-full bg-[#0D4C3E] flex items-center justify-center shrink-0">
              <span className="text-white font-bold text-sm">{initials}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-gray-900">{report.user_name || 'Unknown User'}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Mail size={12} className="text-gray-400" />
                <span className="text-sm text-gray-500">{report.user_email}</span>
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <Clock size={12} />
              <TimeAgo dateStr={report.created_at} />
            </div>
          </div>

          {/* Subject */}
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Subject</p>
            <p className="text-lg font-bold text-gray-900">{report.subject}</p>
          </div>

          {/* Description */}
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
              Full Description
            </p>
            <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
              <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
                {report.description}
              </p>
            </div>
          </div>

          {/* Status */}
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
              Update Status
            </p>
            <div className="flex gap-2 flex-wrap">
              {STATUS_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => void saveStatus(opt.value)}
                  disabled={saving || status === opt.value}
                  className={`px-4 py-2 rounded-xl text-sm font-bold transition-all border-2 flex items-center gap-2 ${
                    status === opt.value
                      ? 'border-current shadow-sm'
                      : 'border-transparent bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}
                  style={
                    status === opt.value
                      ? { color: opt.color, backgroundColor: opt.bg, borderColor: opt.color }
                      : {}
                  }
                >
                  {status === opt.value && (
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: opt.color }} />
                  )}
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Current status pill */}
          <div
            className="flex items-center gap-2 p-3 rounded-xl"
            style={{ backgroundColor: statusCfg.bg }}
          >
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: statusCfg.color }} />
            <span className="text-sm font-semibold" style={{ color: statusCfg.color }}>
              Current status: {statusCfg.label}
            </span>
          </div>

          {/* Contact hint */}
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex gap-3">
            <Send size={16} className="text-blue-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-blue-800">Reply to User</p>
              <p className="text-sm text-blue-600 mt-1">
                To reply, email <strong>{report.user_email}</strong> directly. Mention the report #
                {report.id} in your email subject.
              </p>
              <a
                href={`mailto:${report.user_email}?subject=Re: Your report #${report.id} - ${report.subject}`}
                className="inline-flex items-center gap-1.5 mt-2 text-sm font-bold text-blue-700 hover:text-blue-900 underline"
              >
                <Mail size={13} /> Open Email App
              </a>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-100 px-6 py-4 flex justify-end shrink-0">
          <Button variant="outline" onClick={onClose} className="gap-2">
            <ChevronRight size={14} className="rotate-180" /> Close
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function AdminNotificationsPage() {
  const [tab, setTab] = useState<'purchase' | 'reports'>('purchase');
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [reports, setReports] = useState<IssueReport[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [unreadReports, setUnreadReports] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [selectedReport, setSelectedReport] = useState<IssueReport | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [nRes, rRes] = await Promise.all([
        fetch(`/api/admin/notifications?type=${filter}`),
        fetch('/api/admin/reports'),
      ]);
      if (nRes.ok) {
        const d = (await nRes.json()) as {
          notifications: AdminNotification[];
          unread_count: number;
        };
        setNotifications(d.notifications ?? []);
        setUnreadCount(d.unread_count ?? 0);
      }
      if (rRes.ok) {
        const d = (await rRes.json()) as { reports: IssueReport[]; unread_count: number };
        setReports(d.reports ?? []);
        setUnreadReports(d.unread_count ?? 0);
      }
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    void fetchAll();
  }, [fetchAll]);

  const markAllRead = async () => {
    const res = await fetch('/api/admin/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mark_all_read: true }),
    });
    if (res.ok) {
      setNotifications((prev) => prev.map((n) => ({ ...n, status: 'read' })));
      setUnreadCount(0);
      toast.success('All notifications marked as read');
    }
  };

  const markNotifRead = async (id: number) => {
    await fetch('/api/admin/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, status: 'read' } : n)));
    setUnreadCount((c) => Math.max(0, c - 1));
  };

  const handleReportUpdate = (id: number, updates: Partial<IssueReport>) => {
    setReports((prev) => prev.map((r) => (r.id === id ? { ...r, ...updates } : r)));
    if (updates.is_read) setUnreadReports((c) => Math.max(0, c - 1));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Report detail panel */}
      {selectedReport && (
        <ReportDetailPanel
          report={selectedReport}
          onClose={() => setSelectedReport(null)}
          onUpdate={handleReportUpdate}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Bell size={22} className="text-[#0D4C3E]" /> Notifications
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Purchase events and user reports from the app
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={() => void fetchAll()} className="gap-2">
            <RefreshCw size={14} /> Refresh
          </Button>
          {tab === 'purchase' && unreadCount > 0 && (
            <Button
              size="sm"
              onClick={() => void markAllRead()}
              className="bg-[#0D4C3E] hover:bg-[#0a3d32] gap-2"
            >
              <CheckCheck size={14} /> Mark All Read
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit flex-wrap">
        <button
          onClick={() => setTab('purchase')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all ${tab === 'purchase' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
        >
          <ShoppingCart size={14} /> Purchase Events
          {unreadCount > 0 && (
            <span className="bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[20px] text-center">
              {unreadCount}
            </span>
          )}
        </button>
        <button
          onClick={() => setTab('reports')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all ${tab === 'reports' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
        >
          <MessageSquare size={14} /> User Reports
          {unreadReports > 0 && (
            <span className="bg-orange-500 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[20px] text-center">
              {unreadReports}
            </span>
          )}
        </button>
      </div>

      {/* Purchase Events */}
      {tab === 'purchase' && (
        <>
          <div className="flex items-center gap-3">
            <Filter size={14} className="text-gray-400" />
            <div className="flex gap-1.5">
              {(['all', 'unread'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${filter === f ? 'bg-[#0D4C3E] text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
          {loading ? (
            <div className="space-y-3">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="h-24 bg-white rounded-2xl border border-gray-100 animate-pulse"
                />
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <Bell size={40} className="mx-auto mb-3 opacity-30" />
              <p className="font-semibold">No notifications yet</p>
              <p className="text-sm mt-1">
                Purchase events will appear here as users interact with subscriptions
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((n) => {
                const cfg = EVENT_CONFIG[n.event_type] ?? {
                  label: n.event_type,
                  color: '#6B7280',
                  bg: '#F9FAFB',
                  icon: Bell,
                };
                const Icon = cfg.icon;
                const isUnread = n.status === 'unread';
                return (
                  <div
                    key={n.id}
                    onClick={() => {
                      if (isUnread) void markNotifRead(n.id);
                    }}
                    className={`bg-white rounded-2xl border p-4 md:p-5 flex items-start gap-4 cursor-pointer transition-all hover:shadow-md ${isUnread ? 'border-[#0D4C3E]/20 ring-1 ring-[#0D4C3E]/10' : 'border-gray-100'}`}
                  >
                    <div
                      className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0"
                      style={{ backgroundColor: cfg.bg }}
                    >
                      <Icon size={20} style={{ color: cfg.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 flex-wrap">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span
                              className="text-xs font-bold px-2 py-0.5 rounded-full"
                              style={{ color: cfg.color, backgroundColor: cfg.bg }}
                            >
                              {cfg.label}
                            </span>
                            <span className="text-xs text-gray-400 uppercase font-semibold hidden sm:block">
                              {n.platform}
                            </span>
                            {isUnread && (
                              <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                            )}
                          </div>
                          <p className="text-gray-900 font-semibold text-sm">
                            <span className="text-[#0D4C3E]">{n.user_name || 'Unknown User'}</span>
                            {n.event_type === 'purchase_success' && ' purchased '}
                            {n.event_type === 'purchase_attempt' && ' tried to purchase '}
                            {n.event_type === 'purchase_failed' && ' failed to purchase '}
                            <span className="font-bold">{n.plan_name}</span>
                            {Number(n.amount) > 0 && (
                              <span className="text-gray-500 font-normal">
                                {' '}
                                — ${Number(n.amount).toFixed(2)}
                              </span>
                            )}
                          </p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <Mail size={10} className="text-gray-400" />
                            <span className="text-xs text-gray-400 truncate">{n.user_email}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-400 shrink-0 mt-0.5">
                          <Clock size={10} />
                          <TimeAgo dateStr={n.created_at} />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* User Reports */}
      {tab === 'reports' && (
        <>
          {loading ? (
            <div className="space-y-3">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="h-28 bg-white rounded-2xl border border-gray-100 animate-pulse"
                />
              ))}
            </div>
          ) : reports.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <MessageSquare size={40} className="mx-auto mb-3 opacity-30" />
              <p className="font-semibold">No reports yet</p>
              <p className="text-sm mt-1">User issue reports will appear here</p>
            </div>
          ) : (
            <div className="space-y-3">
              {reports.map((report) => {
                const statusCfg =
                  STATUS_OPTIONS.find((s) => s.value === report.status) ?? STATUS_OPTIONS[0];
                return (
                  <div
                    key={report.id}
                    onClick={() => setSelectedReport(report)}
                    className={`bg-white rounded-2xl border p-4 md:p-5 cursor-pointer transition-all hover:shadow-md hover:border-[#0D4C3E]/20 ${!report.is_read ? 'border-orange-200 ring-1 ring-orange-100' : 'border-gray-100'}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className="w-10 h-10 rounded-full bg-[#0D4C3E] flex items-center justify-center shrink-0">
                          <User size={16} className="text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span
                              className="text-xs font-bold px-2 py-0.5 rounded-full"
                              style={{ color: statusCfg.color, backgroundColor: statusCfg.bg }}
                            >
                              {statusCfg.label}
                            </span>
                            {!report.is_read && (
                              <span
                                className="w-2 h-2 rounded-full bg-orange-500 shrink-0"
                                title="Unread"
                              />
                            )}
                          </div>
                          <p className="font-bold text-gray-900 text-sm">{report.subject}</p>
                          <p className="text-gray-500 text-xs mt-0.5 line-clamp-1">
                            {report.description}
                          </p>
                          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                            <span className="text-xs font-semibold text-gray-600">
                              {report.user_name || 'Unknown'}
                            </span>
                            <span className="text-xs text-gray-400 hidden sm:block">
                              {report.user_email}
                            </span>
                            <div className="flex items-center gap-0.5 text-xs text-gray-400 ml-auto">
                              <Clock size={10} />
                              <TimeAgo dateStr={report.created_at} />
                            </div>
                          </div>
                        </div>
                      </div>
                      <ChevronRight size={16} className="text-gray-300 shrink-0 mt-2" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
