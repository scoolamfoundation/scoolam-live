'use client';
import { useEffect, useState, useCallback, useRef } from 'react';
import {
  Save,
  Video,
  BookOpen,
  FileText,
  Brain,
  Info,
  Smartphone,
  Key,
  ExternalLink,
  Mail,
  Lock,
  Server,
  Send,
  Eye,
  EyeOff,
  CheckCircle,
  HelpCircle,
  Users,
  Plus,
  Trash2,
  Pencil,
  X,
  Gift,
  ToggleLeft,
  ToggleRight,
  Settings,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface FreeLimits {
  videos_per_day: number;
  infographics_per_day: number;
  worksheets_per_day: number;
  mcqs_per_day: number;
}

interface RCServerConfig {
  revenue_cat_project_id: string;
}

interface HelpTopic {
  id: number;
  title: string;
  content: string;
  sort_order: number;
  is_active: boolean;
}

interface ReferralRule {
  id: string;
  label: string;
  enabled: boolean;
}

interface ReferralConfig {
  wallet_amount_per_invite: number;
  currency: string;
  reward_rules: ReferralRule[];
  minimum_redeem_amount: number;
  max_wallet_balance: number;
}

const TABS = [
  { id: 'content', label: 'Content Limits', icon: Zap, shortLabel: 'Limits' },
  { id: 'email', label: 'Email / SMTP', icon: Mail, shortLabel: 'Email' },
  { id: 'iap', label: 'In-App Purchases', icon: Smartphone, shortLabel: 'IAP' },
  { id: 'help', label: 'Help Topics', icon: HelpCircle, shortLabel: 'Help' },
  { id: 'referral', label: 'Referral & Wallet', icon: Gift, shortLabel: 'Referral' },
] as const;
type TabId = (typeof TABS)[number]['id'];

const LIMIT_FIELDS = [
  {
    key: 'videos_per_day' as keyof FreeLimits,
    label: 'Video Lessons per Day',
    icon: Video,
    desc: 'Max topic videos a free user can watch per day',
    color: '#3B82F6',
    bg: '#EFF6FF',
  },
  {
    key: 'mcqs_per_day' as keyof FreeLimits,
    label: 'Daily MCQs per Day',
    icon: Brain,
    desc: 'Max quiz questions a free user can attempt per day',
    color: '#8B5CF6',
    bg: '#EDE9FE',
  },
  {
    key: 'infographics_per_day' as keyof FreeLimits,
    label: 'Infographics per Day',
    icon: BookOpen,
    desc: 'Max infographics a free user can view per day',
    color: '#EC4899',
    bg: '#FDF2F8',
  },
  {
    key: 'worksheets_per_day' as keyof FreeLimits,
    label: 'Worksheets per Day',
    icon: FileText,
    desc: 'Max worksheets a free user can download per day',
    color: '#10B981',
    bg: '#ECFDF5',
  },
];

interface SmtpConfig {
  smtp_host: string;
  smtp_port: number;
  smtp_user: string;
  smtp_pass: string;
  smtp_from_name: string;
}

const DEFAULT_REFERRAL_CONFIG: ReferralConfig = {
  wallet_amount_per_invite: 50,
  currency: 'INR',
  reward_rules: [
    { id: 'on_signup', label: 'Upon referee signup via referral code/link', enabled: true },
    { id: 'on_purchase', label: 'Upon referee purchases any subscription', enabled: false },
    { id: 'after_30_days', label: '30 days after referee joins', enabled: false },
  ],
  minimum_redeem_amount: 100,
  max_wallet_balance: 1000,
};

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState<TabId>('content');
  const [limits, setLimits] = useState<FreeLimits>({
    videos_per_day: 2,
    mcqs_per_day: 5,
    infographics_per_day: 3,
    worksheets_per_day: 2,
  });
  const [rcConfig, setRcConfig] = useState<RCServerConfig>({ revenue_cat_project_id: '' });
  const [smtpConfig, setSmtpConfig] = useState<SmtpConfig>({
    smtp_host: 'smtp.gmail.com',
    smtp_port: 587,
    smtp_user: '',
    smtp_pass: '',
    smtp_from_name: 'Scoolam',
  });
  const [helpTopics, setHelpTopics] = useState<HelpTopic[]>([]);
  const [referralConfig, setReferralConfig] = useState<ReferralConfig>(DEFAULT_REFERRAL_CONFIG);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingRC, setSavingRC] = useState(false);
  const [savingSmtp, setSavingSmtp] = useState(false);
  const [savingReferral, setSavingReferral] = useState(false);
  const [testingEmail, setTestingEmail] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [testEmailAddr, setTestEmailAddr] = useState('');

  // Help topic editor state
  const [helpEditing, setHelpEditing] = useState<number | null>(null); // id of topic being edited, or -1 for new
  const [helpForm, setHelpForm] = useState({ title: '', content: '' });
  const [savingHelp, setSavingHelp] = useState(false);

  // New rule form
  const [newRuleLabel, setNewRuleLabel] = useState('');
  const ruleCounter = useRef(0);

  const fetchAll = useCallback(async () => {
    const [settingsRes, topicsRes, referralRes] = await Promise.all([
      fetch('/api/admin/settings'),
      fetch('/api/admin/help-topics'),
      fetch('/api/admin/referral-config'),
    ]);
    if (settingsRes.ok) {
      const data = (await settingsRes.json()) as {
        settings?: {
          free_limits?: FreeLimits;
          revenuecat_server?: RCServerConfig;
          smtp_config?: SmtpConfig;
        };
      };
      if (data.settings?.free_limits)
        setLimits((prev) => ({ ...prev, ...data.settings!.free_limits }));
      if (data.settings?.revenuecat_server)
        setRcConfig((prev) => ({ ...prev, ...data.settings!.revenuecat_server }));
      if (data.settings?.smtp_config)
        setSmtpConfig((prev) => ({ ...prev, ...data.settings!.smtp_config }));
    }
    if (topicsRes.ok) {
      const d = (await topicsRes.json()) as { topics: HelpTopic[] };
      setHelpTopics(d.topics ?? []);
    }
    if (referralRes.ok) {
      const d = (await referralRes.json()) as { config: ReferralConfig };
      setReferralConfig((prev) => ({ ...prev, ...d.config }));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void fetchAll();
  }, [fetchAll]);

  const saveLimits = async () => {
    setSaving(true);
    const res = await fetch('/api/admin/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key: 'free_limits', value: limits }),
    });
    setSaving(false);
    if (res.ok) toast.success('Free user limits saved!');
    else toast.error('Failed to save limits');
  };

  const saveRCConfig = async () => {
    setSavingRC(true);
    const res = await fetch('/api/admin/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key: 'revenuecat_server', value: rcConfig }),
    });
    setSavingRC(false);
    if (res.ok) toast.success('RevenueCat config saved!');
    else toast.error('Failed to save config');
  };

  const saveSmtpConfig = async () => {
    if (!smtpConfig.smtp_user || !smtpConfig.smtp_pass) {
      toast.error('Email and App Password are required');
      return;
    }
    setSavingSmtp(true);
    const res = await fetch('/api/admin/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key: 'smtp_config', value: smtpConfig }),
    });
    setSavingSmtp(false);
    if (res.ok) toast.success('SMTP settings saved!');
    else toast.error('Failed to save SMTP settings');
  };

  const sendTestEmail = async () => {
    if (!testEmailAddr) {
      toast.error('Enter a test email address');
      return;
    }
    setTestingEmail(true);
    try {
      const res = await fetch('/api/admin/test-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: testEmailAddr }),
      });
      const data = (await res.json()) as { error?: string };
      if (res.ok) toast.success(`Test email sent to ${testEmailAddr}!`);
      else toast.error(data.error ?? 'Failed to send test email');
    } catch {
      toast.error('Failed to send test email');
    } finally {
      setTestingEmail(false);
    }
  };

  const saveHelpTopic = async () => {
    if (!helpForm.title.trim()) {
      toast.error('Title is required');
      return;
    }
    setSavingHelp(true);
    try {
      if (helpEditing === -1) {
        const res = await fetch('/api/admin/help-topics', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: helpForm.title,
            content: helpForm.content,
            sort_order: helpTopics.length,
          }),
        });
        if (res.ok) {
          const d = (await res.json()) as { topic: HelpTopic };
          setHelpTopics((prev) => [...prev, d.topic]);
          toast.success('Help topic added!');
        } else toast.error('Failed to add topic');
      } else {
        const res = await fetch(`/api/admin/help-topics/${helpEditing}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: helpForm.title, content: helpForm.content }),
        });
        if (res.ok) {
          const d = (await res.json()) as { topic: HelpTopic };
          setHelpTopics((prev) => prev.map((t) => (t.id === helpEditing ? d.topic : t)));
          toast.success('Help topic updated!');
        } else toast.error('Failed to update topic');
      }
    } finally {
      setSavingHelp(false);
      setHelpEditing(null);
      setHelpForm({ title: '', content: '' });
    }
  };

  const deleteHelpTopic = async (id: number) => {
    const res = await fetch(`/api/admin/help-topics/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setHelpTopics((prev) => prev.filter((t) => t.id !== id));
      toast.success('Topic deleted');
    } else toast.error('Failed to delete');
  };

  const toggleHelpActive = async (id: number, current: boolean) => {
    const res = await fetch(`/api/admin/help-topics/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: !current }),
    });
    if (res.ok)
      setHelpTopics((prev) => prev.map((t) => (t.id === id ? { ...t, is_active: !current } : t)));
  };

  const saveReferralConfig = async () => {
    setSavingReferral(true);
    const res = await fetch('/api/admin/referral-config', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(referralConfig),
    });
    setSavingReferral(false);
    if (res.ok) toast.success('Referral config saved!');
    else toast.error('Failed to save referral config');
  };

  const toggleRule = (ruleId: string) => {
    setReferralConfig((prev) => ({
      ...prev,
      reward_rules: prev.reward_rules.map((r) =>
        r.id === ruleId ? { ...r, enabled: !r.enabled } : r
      ),
    }));
  };

  const addRule = () => {
    if (!newRuleLabel.trim()) {
      toast.error('Enter a rule description');
      return;
    }
    ruleCounter.current += 1;
    const newRule: ReferralRule = {
      id: `custom_${ruleCounter.current}`,
      label: newRuleLabel.trim(),
      enabled: true,
    };
    setReferralConfig((prev) => ({ ...prev, reward_rules: [...prev.reward_rules, newRule] }));
    setNewRuleLabel('');
  };

  const removeRule = (ruleId: string) => {
    setReferralConfig((prev) => ({
      ...prev,
      reward_rules: prev.reward_rules.filter((r) => r.id !== ruleId),
    }));
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Settings size={22} className="text-[#0D4C3E]" /> Settings
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Configure app behaviour, limits and integrations
        </p>
      </div>

      {/* Sub-tab navigation */}
      <div className="flex gap-1 bg-gray-100 p-1.5 rounded-2xl mb-8 overflow-x-auto">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all flex-1 justify-center min-w-[80px] ${isActive ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700 hover:bg-white/50'}`}
            >
              <Icon size={15} className={isActive ? 'text-[#0D4C3E]' : ''} />
              <span className="hidden md:block">{tab.label}</span>
              <span className="block md:hidden">{tab.shortLabel}</span>
            </button>
          );
        })}
      </div>

      {/* ── Content Limits ── */}
      {activeTab === 'content' && (
        <div className="max-w-2xl space-y-6">
          <div className="bg-[#FEF3C7] border border-[#FCD34D] rounded-2xl p-4 flex gap-3">
            <Info size={18} className="text-[#D97706] shrink-0 mt-0.5" />
            <p className="text-sm text-[#92400E]">
              These limits apply to <strong>free (non-premium) users only</strong>. Premium users
              always get unlimited access. Daily limits reset at midnight.
            </p>
          </div>
          {loading ? (
            <div className="space-y-4">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-28 bg-white rounded-2xl border border-gray-100 animate-pulse"
                />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {LIMIT_FIELDS.map((field) => (
                <div
                  key={field.key}
                  className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm flex items-center gap-5"
                >
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
                    style={{ backgroundColor: field.bg }}
                  >
                    <field.icon size={24} style={{ color: field.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <Label className="font-bold text-gray-800 text-base">{field.label}</Label>
                    <p className="text-sm text-gray-400 mt-0.5">{field.desc}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <Input
                      type="number"
                      min={0}
                      max={999}
                      value={limits[field.key]}
                      onChange={(e) =>
                        setLimits((prev) => ({ ...prev, [field.key]: Number(e.target.value) }))
                      }
                      className="w-20 text-center text-lg font-bold"
                    />
                    <span className="text-gray-400 text-sm">/ day</span>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="flex justify-end">
            <Button
              className="bg-[#0D4C3E] hover:bg-[#0a3d32] gap-2 min-w-[140px]"
              onClick={() => void saveLimits()}
              disabled={saving || loading}
            >
              <Save size={16} />
              {saving ? 'Saving…' : 'Save Limits'}
            </Button>
          </div>
        </div>
      )}

      {/* ── Email / SMTP ── */}
      {activeTab === 'email' && (
        <div className="max-w-2xl space-y-6">
          <div className="bg-[#EFF6FF] border border-[#BFDBFE] rounded-2xl p-4 flex gap-3">
            <Info size={18} className="text-[#2563EB] shrink-0 mt-0.5" />
            <div className="text-sm text-[#1E40AF]">
              <p className="font-semibold mb-1">How to get a Google App Password:</p>
              <ol className="list-decimal list-inside space-y-1 text-[#1D4ED8]">
                <li>
                  Go to <strong>myaccount.google.com</strong> → Security
                </li>
                <li>
                  Enable <strong>2-Step Verification</strong> on your Gmail account
                </li>
                <li>
                  Search for <strong>&quot;App passwords&quot;</strong> and open it
                </li>
                <li>Create a new app password (select &quot;Mail&quot; + &quot;Other&quot;)</li>
                <li>Copy the 16-character password and paste it below</li>
              </ol>
              <a
                href="https://myaccount.google.com/apppasswords"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 mt-2 text-[#2563EB] underline font-semibold"
              >
                Open Google App Passwords <ExternalLink size={12} />
              </a>
            </div>
          </div>
          {loading ? (
            <div className="h-64 bg-white rounded-2xl border border-gray-100 animate-pulse" />
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="mb-1.5 flex items-center gap-1.5 font-semibold">
                    <Server size={14} className="text-gray-400" /> SMTP Host
                  </Label>
                  <Input
                    value={smtpConfig.smtp_host}
                    onChange={(e) => setSmtpConfig((c) => ({ ...c, smtp_host: e.target.value }))}
                    placeholder="smtp.gmail.com"
                  />
                </div>
                <div>
                  <Label className="mb-1.5 font-semibold">Port</Label>
                  <Input
                    type="number"
                    value={smtpConfig.smtp_port}
                    onChange={(e) =>
                      setSmtpConfig((c) => ({ ...c, smtp_port: Number(e.target.value) }))
                    }
                    placeholder="587"
                  />
                  <p className="text-xs text-gray-400 mt-1">587 = TLS, 465 = SSL</p>
                </div>
              </div>
              <div>
                <Label className="mb-1.5 font-semibold">From Name</Label>
                <Input
                  value={smtpConfig.smtp_from_name}
                  onChange={(e) => setSmtpConfig((c) => ({ ...c, smtp_from_name: e.target.value }))}
                  placeholder="Scoolam"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Display name in the &quot;From&quot; field of sent emails
                </p>
              </div>
              <div>
                <Label className="mb-1.5 flex items-center gap-1.5 font-semibold">
                  <Mail size={14} className="text-gray-400" /> Gmail Address (From Email)
                </Label>
                <Input
                  type="email"
                  value={smtpConfig.smtp_user}
                  onChange={(e) => setSmtpConfig((c) => ({ ...c, smtp_user: e.target.value }))}
                  placeholder="yourname@gmail.com"
                />
                <p className="text-xs text-gray-400 mt-1">
                  The Gmail account you created the App Password for
                </p>
              </div>
              <div>
                <Label className="mb-1.5 flex items-center gap-1.5 font-semibold">
                  <Lock size={14} className="text-gray-400" /> Google App Password
                </Label>
                <div className="relative">
                  <Input
                    type={showPass ? 'text' : 'password'}
                    value={smtpConfig.smtp_pass}
                    onChange={(e) => setSmtpConfig((c) => ({ ...c, smtp_pass: e.target.value }))}
                    placeholder="xxxx xxxx xxxx xxxx"
                    className="font-mono pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  16-character App Password from Google (spaces are OK)
                </p>
              </div>
              <div className="flex justify-end pt-2">
                <Button
                  className="bg-[#0D4C3E] hover:bg-[#0a3d32] gap-2 min-w-[160px]"
                  onClick={() => void saveSmtpConfig()}
                  disabled={savingSmtp}
                >
                  <Save size={16} />
                  {savingSmtp ? 'Saving…' : 'Save SMTP Settings'}
                </Button>
              </div>
            </div>
          )}
          {!loading && (
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5">
              <h3 className="font-bold text-gray-700 mb-3 flex items-center gap-2">
                <Send size={16} className="text-[#0D4C3E]" /> Send Test Email
              </h3>
              <div className="flex gap-3">
                <Input
                  type="email"
                  placeholder="test@example.com"
                  value={testEmailAddr}
                  onChange={(e) => setTestEmailAddr(e.target.value)}
                  className="flex-1"
                />
                <Button
                  variant="outline"
                  onClick={() => void sendTestEmail()}
                  disabled={testingEmail || !smtpConfig.smtp_user}
                  className="gap-2 shrink-0"
                >
                  {testingEmail ? (
                    <span className="flex items-center gap-1">
                      <CheckCircle size={14} className="text-green-500" /> Sending…
                    </span>
                  ) : (
                    <>
                      <Send size={14} /> Send Test
                    </>
                  )}
                </Button>
              </div>
              <p className="text-xs text-gray-400 mt-2">
                Save your SMTP settings first, then send a test to confirm it works.
              </p>
            </div>
          )}
        </div>
      )}

      {/* ── In-App Purchases ── */}
      {activeTab === 'iap' && (
        <div className="max-w-2xl space-y-6">
          <div className="bg-[#F0FDF4] border border-[#A7F3D0] rounded-2xl p-4 flex gap-3">
            <Info size={18} className="text-[#059669] shrink-0 mt-0.5" />
            <div className="text-sm text-[#065F46]">
              <p className="font-semibold mb-1">Setup Instructions:</p>
              <ol className="list-decimal list-inside space-y-1 text-[#047857]">
                <li>Connect your RevenueCat account in project settings → In App Purchases</li>
                <li>Connect your App Store Connect account in project settings</li>
                <li>
                  Add your <code className="bg-green-100 px-1 rounded">REVENUE_CAT_API_KEY</code>{' '}
                  via the Secrets panel
                </li>
                <li>Enter your RevenueCat Project ID below</li>
                <li>
                  Configure plans in{' '}
                  <a href="/admin/subscription" className="underline font-semibold">
                    Manage Subscriptions
                  </a>
                </li>
              </ol>
              <a
                href="https://app.revenuecat.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 mt-2 text-[#059669] underline font-semibold"
              >
                Open RevenueCat Dashboard <ExternalLink size={12} />
              </a>
            </div>
          </div>
          {loading ? (
            <div className="h-24 bg-white rounded-2xl border border-gray-100 animate-pulse" />
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-[#F0FDF4] flex items-center justify-center">
                  <Key size={18} className="text-[#059669]" />
                </div>
                <div>
                  <Label className="font-bold text-gray-800">RevenueCat Project ID</Label>
                  <p className="text-xs text-gray-400">
                    Found in your RevenueCat dashboard URL (e.g. proj_xxxxxxxx)
                  </p>
                </div>
              </div>
              <Input
                type="text"
                placeholder="proj_xxxxxxxxxxxxxxxx"
                value={rcConfig.revenue_cat_project_id}
                onChange={(e) =>
                  setRcConfig((c) => ({ ...c, revenue_cat_project_id: e.target.value }))
                }
                className="font-mono text-sm"
              />
            </div>
          )}
          <div className="flex justify-end">
            <Button
              className="bg-[#0D4C3E] hover:bg-[#0a3d32] gap-2 min-w-[160px]"
              onClick={() => void saveRCConfig()}
              disabled={savingRC || loading}
            >
              <Save size={16} />
              {savingRC ? 'Saving…' : 'Save RC Config'}
            </Button>
          </div>
        </div>
      )}

      {/* ── Help Topics ── */}
      {activeTab === 'help' && (
        <div className="max-w-2xl space-y-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-gray-500">
              Configure FAQ articles shown to users in the app&apos;s Help section.
            </p>
            <Button
              className="bg-[#0D4C3E] hover:bg-[#0a3d32] gap-2 shrink-0"
              onClick={() => {
                setHelpForm({ title: '', content: '' });
                setHelpEditing(-1);
              }}
            >
              <Plus size={16} /> Add Topic
            </Button>
          </div>
          {helpEditing !== null && (
            <div className="bg-white border border-[#0D4C3E]/20 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-900">
                  {helpEditing === -1 ? 'New Help Topic' : 'Edit Help Topic'}
                </h3>
                <button
                  onClick={() => setHelpEditing(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="space-y-3">
                <div>
                  <Label className="mb-1.5 font-semibold">Title</Label>
                  <Input
                    value={helpForm.title}
                    onChange={(e) => setHelpForm((f) => ({ ...f, title: e.target.value }))}
                    placeholder="e.g. How to reset my password?"
                  />
                </div>
                <div>
                  <Label className="mb-1.5 font-semibold">Content</Label>
                  <textarea
                    value={helpForm.content}
                    onChange={(e) => setHelpForm((f) => ({ ...f, content: e.target.value }))}
                    placeholder="Write the help content here…"
                    rows={4}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 bg-gray-50 focus:outline-none focus:border-[#0D4C3E] focus:ring-2 focus:ring-[#0D4C3E]/15 resize-none"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-1">
                  <Button variant="outline" onClick={() => setHelpEditing(null)}>
                    Cancel
                  </Button>
                  <Button
                    className="bg-[#0D4C3E] hover:bg-[#0a3d32] gap-2"
                    onClick={() => void saveHelpTopic()}
                    disabled={savingHelp}
                  >
                    <Save size={14} />
                    {savingHelp ? 'Saving…' : helpEditing === -1 ? 'Add Topic' : 'Save Changes'}
                  </Button>
                </div>
              </div>
            </div>
          )}
          {loading ? (
            <div className="space-y-3">
              {[0, 1].map((i) => (
                <div
                  key={i}
                  className="h-16 bg-white rounded-2xl border border-gray-100 animate-pulse"
                />
              ))}
            </div>
          ) : helpTopics.length === 0 ? (
            <div className="text-center py-10 text-gray-400 bg-white rounded-2xl border border-gray-100">
              <HelpCircle size={32} className="mx-auto mb-2 opacity-30" />
              <p className="font-semibold">No help topics yet</p>
              <p className="text-sm mt-1">Add topics to help users in the app</p>
            </div>
          ) : (
            <div className="space-y-2">
              {helpTopics.map((topic) => (
                <div
                  key={topic.id}
                  className="bg-white rounded-2xl border border-gray-100 px-5 py-4 flex items-start gap-3 shadow-sm"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-gray-900 text-sm truncate">{topic.title}</p>
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ${topic.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}
                      >
                        {topic.is_active ? 'Active' : 'Hidden'}
                      </span>
                    </div>
                    {topic.content && (
                      <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{topic.content}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => toggleHelpActive(topic.id, topic.is_active)}
                      className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                      title={topic.is_active ? 'Hide' : 'Show'}
                    >
                      {topic.is_active ? (
                        <ToggleRight size={16} className="text-green-600" />
                      ) : (
                        <ToggleLeft size={16} />
                      )}
                    </button>
                    <button
                      onClick={() => {
                        setHelpForm({ title: topic.title, content: topic.content });
                        setHelpEditing(topic.id);
                      }}
                      className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => void deleteHelpTopic(topic.id)}
                      className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Referral & Wallet ── */}
      {activeTab === 'referral' && (
        <div className="max-w-2xl space-y-4">
          <p className="text-sm text-gray-500">
            Configure the invite friends program and wallet reward amounts.
          </p>
          {loading ? (
            <div className="h-48 bg-white rounded-2xl border border-gray-100 animate-pulse" />
          ) : (
            <>
              <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Users size={16} className="text-[#0D4C3E]" /> Per-Invite Wallet Reward
                </h3>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <Label className="mb-1.5 font-semibold">Wallet Amount per Invite</Label>
                    <Input
                      type="number"
                      min={0}
                      value={referralConfig.wallet_amount_per_invite}
                      onChange={(e) =>
                        setReferralConfig((c) => ({
                          ...c,
                          wallet_amount_per_invite: Number(e.target.value),
                        }))
                      }
                      className="max-w-[160px]"
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      Amount credited to referrer&apos;s wallet for each successful invite
                    </p>
                  </div>
                  <div>
                    <Label className="mb-1.5 font-semibold">Currency</Label>
                    <Input
                      value={referralConfig.currency}
                      onChange={(e) =>
                        setReferralConfig((c) => ({ ...c, currency: e.target.value }))
                      }
                      className="w-24"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <Label className="mb-1.5 font-semibold">Minimum Redeem Amount</Label>
                    <Input
                      type="number"
                      min={0}
                      value={referralConfig.minimum_redeem_amount}
                      onChange={(e) =>
                        setReferralConfig((c) => ({
                          ...c,
                          minimum_redeem_amount: Number(e.target.value),
                        }))
                      }
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      Min wallet balance before user can redeem
                    </p>
                  </div>
                  <div>
                    <Label className="mb-1.5 font-semibold">Max Wallet Balance</Label>
                    <Input
                      type="number"
                      min={0}
                      value={referralConfig.max_wallet_balance}
                      onChange={(e) =>
                        setReferralConfig((c) => ({
                          ...c,
                          max_wallet_balance: Number(e.target.value),
                        }))
                      }
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      Maximum wallet balance a user can hold
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                <h3 className="font-bold text-gray-800 mb-1">Reward Trigger Rules</h3>
                <p className="text-sm text-gray-400 mb-4">
                  Choose when the referrer receives their wallet reward. Multiple rules can be
                  enabled.
                </p>
                <div className="space-y-2">
                  {referralConfig.reward_rules.map((rule) => (
                    <div
                      key={rule.id}
                      className={`flex items-center gap-3 py-2.5 px-3 rounded-xl transition-colors ${rule.enabled ? 'bg-[#E8F5F0]' : 'hover:bg-gray-50'}`}
                    >
                      <button onClick={() => toggleRule(rule.id)} className="shrink-0">
                        {rule.enabled ? (
                          <ToggleRight size={22} className="text-[#0D4C3E]" />
                        ) : (
                          <ToggleLeft size={22} className="text-gray-300" />
                        )}
                      </button>
                      <span
                        className={`flex-1 text-sm ${rule.enabled ? 'text-gray-800 font-semibold' : 'text-gray-400'}`}
                      >
                        {rule.label}
                      </span>
                      {rule.id.startsWith('custom_') && (
                        <button
                          onClick={() => removeRule(rule.id)}
                          className="text-gray-300 hover:text-red-400 transition-colors shrink-0"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
                  <Input
                    value={newRuleLabel}
                    onChange={(e) => setNewRuleLabel(e.target.value)}
                    placeholder="Add custom rule e.g. 30 days after joining"
                    className="flex-1 text-sm"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') addRule();
                    }}
                  />
                  <Button variant="outline" onClick={addRule} className="gap-1.5 shrink-0">
                    <Plus size={14} /> Add Rule
                  </Button>
                </div>
              </div>
            </>
          )}
          <div className="flex justify-end">
            <Button
              className="bg-[#0D4C3E] hover:bg-[#0a3d32] gap-2 min-w-[160px]"
              onClick={() => void saveReferralConfig()}
              disabled={savingReferral || loading}
            >
              <Save size={16} />
              {savingReferral ? 'Saving…' : 'Save Referral Config'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
