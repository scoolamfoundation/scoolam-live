'use client';
import { useEffect, useState } from 'react';
import {
  Plus,
  Trash2,
  Star,
  Check,
  Pencil,
  X,
  Smartphone,
  Apple,
  ShoppingBag,
  Save,
  Info,
  ExternalLink,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';

interface Plan {
  id: number;
  name: string;
  price: number;
  billing_period: string;
  features: string[];
  is_featured: boolean;
  sort_order: number;
  rc_package_identifier: string;
  apple_product_id: string;
  google_product_id: string;
}

interface RCConfig {
  entitlement_id: string;
  offering_id: string;
}

const PERIOD_LABELS: Record<string, string> = {
  forever: 'Free forever',
  month: '/ month',
  year: '/ year',
};

const PLAN_COLORS = ['#6B7280', '#3B82F6', '#F59E0B', '#10B981', '#8B5CF6'];

function PlanCard({
  plan,
  colorIdx,
  onEdit,
  onDelete,
}: {
  plan: Plan;
  colorIdx: number;
  onEdit: (p: Plan) => void;
  onDelete: (id: number) => void;
}) {
  const color = PLAN_COLORS[colorIdx % PLAN_COLORS.length];
  const hasIap = plan.rc_package_identifier || plan.apple_product_id || plan.google_product_id;

  return (
    <div
      className="bg-white rounded-2xl border-2 overflow-hidden shadow-sm relative"
      style={{ borderColor: plan.is_featured ? color : '#E5E7EB' }}
    >
      {plan.is_featured && (
        <div
          className="text-white text-xs font-bold py-1.5 text-center tracking-wider"
          style={{ backgroundColor: color }}
        >
          ⭐ MOST POPULAR
        </div>
      )}
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="text-lg font-bold text-gray-900">{plan.name}</h3>
            <p className="text-3xl font-black mt-1" style={{ color }}>
              {plan.price === 0 ? 'Free' : `$${plan.price}`}
              {plan.price > 0 && (
                <span className="text-sm font-normal text-gray-400 ml-1">
                  {PERIOD_LABELS[plan.billing_period] ?? `/ ${plan.billing_period}`}
                </span>
              )}
            </p>
          </div>
          <div className="flex gap-1">
            <Button variant="outline" size="sm" className="gap-1" onClick={() => onEdit(plan)}>
              <Pencil size={12} /> Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-1 text-red-500 border-red-200 hover:bg-red-50"
              onClick={() => onDelete(plan.id)}
            >
              <Trash2 size={12} />
            </Button>
          </div>
        </div>

        <ul className="space-y-2 mt-3 mb-4">
          {(plan.features ?? []).map((f, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
              <Check size={14} className="mt-0.5 shrink-0" style={{ color }} />
              {f}
            </li>
          ))}
        </ul>

        {/* IAP IDs badge */}
        {hasIap ? (
          <div className="bg-[#F0FDF4] border border-[#A7F3D0] rounded-xl p-3 space-y-1 text-xs">
            {plan.rc_package_identifier && (
              <div className="flex items-center gap-2">
                <Smartphone size={11} className="text-[#059669]" />
                <span className="text-gray-500">RC Package:</span>
                <code className="font-mono text-[#059669] font-semibold">
                  {plan.rc_package_identifier}
                </code>
              </div>
            )}
            {plan.apple_product_id && (
              <div className="flex items-center gap-2">
                <Apple size={11} className="text-gray-500" />
                <span className="text-gray-500">Apple:</span>
                <code className="font-mono text-gray-700">{plan.apple_product_id}</code>
              </div>
            )}
            {plan.google_product_id && (
              <div className="flex items-center gap-2">
                <ShoppingBag size={11} className="text-[#4285F4]" />
                <span className="text-gray-500">Google:</span>
                <code className="font-mono text-gray-700">{plan.google_product_id}</code>
              </div>
            )}
          </div>
        ) : (
          plan.price > 0 && (
            <div className="bg-[#FEF3C7] border border-[#FCD34D] rounded-xl p-2.5 text-xs text-[#92400E] flex items-center gap-2">
              <Info size={12} className="shrink-0" />
              No store product IDs configured — click Edit to add them.
            </div>
          )
        )}
      </div>
    </div>
  );
}

function PlanEditor({
  initial,
  onSave,
  onCancel,
}: {
  initial?: Partial<Plan>;
  onSave: (data: Omit<Plan, 'id'>) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(initial?.name ?? '');
  const [price, setPrice] = useState(String(initial?.price ?? 0));
  const [period, setPeriod] = useState(initial?.billing_period ?? 'month');
  const [isFeatured, setIsFeatured] = useState(initial?.is_featured ?? false);
  const [features, setFeatures] = useState<string[]>(initial?.features ?? ['']);
  const [sortOrder, setSortOrder] = useState(String(initial?.sort_order ?? 0));
  const [rcPackageId, setRcPackageId] = useState(initial?.rc_package_identifier ?? '');
  const [appleProductId, setAppleProductId] = useState(initial?.apple_product_id ?? '');
  const [googleProductId, setGoogleProductId] = useState(initial?.google_product_id ?? '');

  return (
    <div className="bg-white rounded-2xl border-2 border-[#0D4C3E] p-5 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-gray-900">{initial?.id ? 'Edit Plan' : 'New Plan'}</h3>
        <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
          <X size={18} />
        </button>
      </div>

      {/* Basic info */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <Label className="mb-1 block">Plan Name</Label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Premium"
          />
        </div>
        <div>
          <Label className="mb-1 block">Price (USD)</Label>
          <Input
            type="number"
            min={0}
            step="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
        </div>
        <div>
          <Label className="mb-1 block">Billing Period</Label>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
          >
            <option value="forever">Free forever</option>
            <option value="month">Monthly</option>
            <option value="year">Yearly</option>
          </select>
        </div>
        <div>
          <Label className="mb-1 block">Display Order</Label>
          <Input type="number" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} />
        </div>
      </div>

      <div className="flex items-center justify-between border border-gray-100 rounded-xl p-3 mb-4">
        <div>
          <p className="font-semibold text-gray-700 text-sm">Mark as "Most Popular"</p>
          <p className="text-xs text-gray-400">Shows a highlighted badge on this plan</p>
        </div>
        <Switch checked={isFeatured} onCheckedChange={setIsFeatured} />
      </div>

      {/* IAP Store IDs */}
      <div className="border border-[#D1FAE5] bg-[#F0FDF4] rounded-xl p-4 mb-4 space-y-3">
        <p className="font-semibold text-[#065F46] text-sm flex items-center gap-2">
          <Smartphone size={15} /> Store Product IDs (RevenueCat)
        </p>
        <p className="text-xs text-[#047857]">
          These IDs link this plan to your RevenueCat packages and store products. Leave blank for
          free plans.
        </p>
        <div>
          <Label className="mb-1 block text-xs text-gray-600">RevenueCat Package Identifier</Label>
          <Input
            value={rcPackageId}
            onChange={(e) => setRcPackageId(e.target.value)}
            placeholder="e.g. $rc_monthly or custom_package_id"
            className="font-mono text-sm"
          />
          <p className="text-xs text-gray-400 mt-1">
            The package identifier in your RevenueCat offering (e.g. <code>$rc_monthly</code>,{' '}
            <code>$rc_annual</code>).
          </p>
        </div>
        <div>
          <Label className="mb-1 block text-xs text-gray-600 flex items-center gap-1">
            <Apple size={12} /> Apple App Store Product ID
          </Label>
          <Input
            value={appleProductId}
            onChange={(e) => setAppleProductId(e.target.value)}
            placeholder="e.g. com.scoolam.premium.monthly"
            className="font-mono text-sm"
          />
        </div>
        <div>
          <Label className="mb-1 block text-xs text-gray-600 flex items-center gap-1">
            <ShoppingBag size={12} /> Google Play Product ID
          </Label>
          <Input
            value={googleProductId}
            onChange={(e) => setGoogleProductId(e.target.value)}
            placeholder="e.g. scoolam_premium_monthly"
            className="font-mono text-sm"
          />
        </div>
      </div>

      {/* Features */}
      <div className="mb-4">
        <Label className="mb-2 block">Features</Label>
        <div className="space-y-2">
          {features.map((f, i) => (
            <div key={i} className="flex items-center gap-2">
              <Input
                value={f}
                onChange={(e) => {
                  const next = [...features];
                  next[i] = e.target.value;
                  setFeatures(next);
                }}
                placeholder={`Feature ${i + 1}`}
              />
              {features.length > 1 && (
                <button
                  onClick={() => setFeatures((prev) => prev.filter((_, idx) => idx !== i))}
                  className="text-gray-300 hover:text-red-500"
                >
                  <X size={15} />
                </button>
              )}
            </div>
          ))}
        </div>
        <Button
          variant="outline"
          size="sm"
          className="mt-2 gap-1"
          onClick={() => setFeatures((prev) => [...prev, ''])}
        >
          <Plus size={13} /> Add Feature
        </Button>
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          className="bg-[#0D4C3E] hover:bg-[#0a3d32]"
          onClick={() =>
            onSave({
              name,
              price: parseFloat(price) || 0,
              billing_period: period,
              features: features.filter((f) => f.trim()),
              is_featured: isFeatured,
              sort_order: parseInt(sortOrder) || 0,
              rc_package_identifier: rcPackageId.trim(),
              apple_product_id: appleProductId.trim(),
              google_product_id: googleProductId.trim(),
            })
          }
        >
          Save Plan
        </Button>
      </div>
    </div>
  );
}

function RCConfigPanel() {
  const [config, setConfig] = useState<RCConfig>({
    entitlement_id: 'premium',
    offering_id: 'default',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    void (async () => {
      const res = await fetch('/api/admin/revenuecat-config');
      if (res.ok) {
        const data = await res.json();
        setConfig(data.config);
      }
      setLoading(false);
    })();
  }, []);

  const save = async () => {
    setSaving(true);
    const res = await fetch('/api/admin/revenuecat-config', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config),
    });
    setSaving(false);
    if (res.ok) toast.success('RevenueCat config saved!');
    else toast.error('Failed to save config');
  };

  return (
    <div className="bg-white border-2 border-[#0D4C3E] rounded-2xl p-6 mb-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-[#0D4C3E] flex items-center justify-center">
          <Smartphone size={20} className="text-white" />
        </div>
        <div>
          <h2 className="font-bold text-gray-900">RevenueCat Configuration</h2>
          <p className="text-xs text-gray-400">
            Global settings applied to all in-app purchase flows
          </p>
        </div>
      </div>

      {loading ? (
        <div className="animate-pulse space-y-3">
          <div className="h-10 bg-gray-100 rounded-lg" />
          <div className="h-10 bg-gray-100 rounded-lg" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <Label className="mb-1 block">Entitlement Identifier</Label>
            <Input
              value={config.entitlement_id}
              onChange={(e) => setConfig((c) => ({ ...c, entitlement_id: e.target.value }))}
              placeholder="premium"
              className="font-mono text-sm"
            />
            <p className="text-xs text-gray-400 mt-1">
              The RevenueCat entitlement that grants premium access (e.g. <code>premium</code>).
            </p>
          </div>
          <div>
            <Label className="mb-1 block">Offering Identifier</Label>
            <Input
              value={config.offering_id}
              onChange={(e) => setConfig((c) => ({ ...c, offering_id: e.target.value }))}
              placeholder="default"
              className="font-mono text-sm"
            />
            <p className="text-xs text-gray-400 mt-1">
              The RevenueCat offering to display (<code>default</code> uses the current offering).
            </p>
          </div>
        </div>
      )}

      <div className="flex justify-end">
        <Button
          className="bg-[#0D4C3E] hover:bg-[#0a3d32] gap-2"
          onClick={() => void save()}
          disabled={saving || loading}
        >
          <Save size={15} />
          {saving ? 'Saving…' : 'Save RC Config'}
        </Button>
      </div>
    </div>
  );
}

export default function ManageSubscriptionPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Plan | null | 'new'>(null);
  const [subscriptionsEnabled, setSubscriptionsEnabled] = useState(true);
  const [togglingSubscriptions, setTogglingSubscriptions] = useState(false);

  const load = async () => {
    setLoading(true);
    const [plansRes, settingsRes] = await Promise.all([
      fetch('/api/admin/subscription'),
      fetch('/api/admin/settings'),
    ]);
    if (plansRes.ok) {
      const data = await plansRes.json();
      setPlans(data.plans ?? []);
    }
    if (settingsRes.ok) {
      const data = await settingsRes.json();
      const enabled = data.settings?.subscriptions_enabled;
      setSubscriptionsEnabled(enabled == null ? true : enabled?.enabled !== false);
    }
    setLoading(false);
  };

  useEffect(() => {
    void load();
  }, []);

  const toggleSubscriptions = async () => {
    const newValue = !subscriptionsEnabled;
    setTogglingSubscriptions(true);
    const res = await fetch('/api/admin/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key: 'subscriptions_enabled', value: { enabled: newValue } }),
    });
    setTogglingSubscriptions(false);
    if (res.ok) {
      setSubscriptionsEnabled(newValue);
      toast.success(newValue ? 'Subscriptions enabled' : 'Subscriptions disabled');
    } else {
      toast.error('Failed to update subscription status');
    }
  };

  const handleSave = async (data: Omit<Plan, 'id'>) => {
    if (editing === 'new') {
      const res = await fetch('/api/admin/subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        toast.success('Plan created!');
        setEditing(null);
        await load();
      } else toast.error('Failed to create plan');
    } else if (editing && typeof editing !== 'string') {
      const res = await fetch(`/api/admin/subscription/${editing.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        toast.success('Plan updated!');
        setEditing(null);
        await load();
      } else toast.error('Failed to update plan');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this plan?')) return;
    await fetch(`/api/admin/subscription/${id}`, { method: 'DELETE' });
    await load();
    toast.success('Plan deleted');
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Subscription Plans</h1>
          <p className="text-gray-500 text-sm mt-1">
            Configure plans shown in the app. Link each paid plan to its store product IDs.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Subscriptions Enable/Disable Toggle */}
          <div
            className={`flex items-center gap-3 px-4 py-2 rounded-xl border-2 transition-all ${
              subscriptionsEnabled ? 'bg-[#E8F5F0] border-[#0D4C3E]' : 'bg-red-50 border-red-300'
            }`}
          >
            <span
              className={`text-sm font-bold ${
                subscriptionsEnabled ? 'text-[#0D4C3E]' : 'text-red-600'
              }`}
            >
              {togglingSubscriptions
                ? 'Saving…'
                : subscriptionsEnabled
                  ? 'Subscriptions ON'
                  : 'Subscriptions OFF'}
            </span>
            <Switch
              checked={subscriptionsEnabled}
              onCheckedChange={() => void toggleSubscriptions()}
              disabled={togglingSubscriptions || loading}
            />
          </div>
          <Button variant="outline" size="sm" className="gap-1" onClick={() => void load()}>
            <RefreshCw size={14} /> Refresh
          </Button>
          <Button
            className="bg-[#0D4C3E] hover:bg-[#0a3d32] gap-2"
            onClick={() => setEditing('new')}
          >
            <Plus size={16} /> Add Plan
          </Button>
        </div>
      </div>

      {/* Disabled subscriptions banner */}
      {!subscriptionsEnabled && !loading && (
        <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-4 flex gap-3 mb-6">
          <X size={18} className="text-red-500 shrink-0 mt-0.5" />
          <div className="text-sm text-red-700">
            <p className="font-bold">Subscriptions are currently DISABLED</p>
            <p className="text-red-500 mt-1">
              No paid subscription plans are shown in the user app. Any plan marked as
              subscription-based will not appear. Only <strong>free plans</strong> (price = ₹0 / $0)
              remain visible. Toggle above to re-enable subscriptions.
            </p>
          </div>
        </div>
      )}

      {/* RevenueCat info banner */}
      <div className="bg-[#F0FDF4] border border-[#A7F3D0] rounded-2xl p-4 flex gap-3 mb-6">
        <Smartphone size={18} className="text-[#059669] shrink-0 mt-0.5" />
        <div className="text-sm text-[#065F46]">
          <p className="font-semibold">RevenueCat In-App Purchases Active 📱</p>
          <p className="text-[#047857] mt-1">
            Subscriptions are handled natively through <strong>Apple App Store</strong> and{' '}
            <strong>Google Play Store</strong> via RevenueCat. To activate, connect your RevenueCat
            account and App Store Connect in{' '}
            <a href="/admin/settings" className="underline font-semibold">
              Settings
            </a>
            . Then add your store product IDs to each plan below.
          </p>
          <a
            href="https://app.revenuecat.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[#059669] underline font-semibold mt-1"
          >
            Open RevenueCat Dashboard <ExternalLink size={12} />
          </a>
        </div>
      </div>

      {/* Global RC config */}
      <RCConfigPanel />

      {editing && (
        <div className="mb-6">
          <PlanEditor
            initial={editing === 'new' ? undefined : editing}
            onSave={(data) => void handleSave(data)}
            onCancel={() => setEditing(null)}
          />
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-64 bg-white rounded-2xl border border-gray-100 animate-pulse"
            />
          ))}
        </div>
      ) : plans.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <Star className="mx-auto mb-3" size={40} />
          <p className="font-semibold">No plans yet</p>
          <p className="text-sm mt-1">Add your first subscription plan above.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {plans.map((plan, i) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              colorIdx={i}
              onEdit={(p) => setEditing(p)}
              onDelete={(id) => void handleDelete(id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
