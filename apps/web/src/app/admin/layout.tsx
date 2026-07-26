'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import {
  BookOpen,
  LayoutDashboard,
  LogOut,
  Loader2,
  Library,
  ChevronDown,
  ChevronRight,
  Menu,
  X,
  ImageIcon,
  FileText,
  Zap,
  ScrollText,
  Shield,
  Settings,
  Star,
  Bell,
  Pencil,
  Save,
  Eye,
  EyeOff,
  Check,
} from 'lucide-react';
import { authClient } from '@/lib/auth-client';

interface NavChild {
  label: string;
  href: string;
  icon: React.ElementType;
}
interface NavItem {
  label: string;
  href?: string;
  icon: React.ElementType;
  children?: NavChild[];
  badge?: string;
}

interface AdminUser {
  id: string;
  name: string;
  email: string;
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isLoginPage = pathname === '/admin/login';

  const [checking, setChecking] = useState(!isLoginPage);
  const [adminUser, setAdminUser] = useState<AdminUser>({ id: '', name: '', email: '' });
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    Library: pathname.startsWith('/admin/library'),
  });
  const [unreadNotifCount, setUnreadNotifCount] = useState(0);

  // Profile modal state
  const [profileOpen, setProfileOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isLoginPage) return;
    fetch('/api/admin/me')
      .then(async (res) => {
        if (!res.ok) {
          router.replace('/admin/login');
        } else {
          const data = (await res.json()) as { user?: AdminUser };
          const u = data.user ?? { id: '', name: 'Admin', email: '' };
          setAdminUser(u);
          setChecking(false);
        }
      })
      .catch(() => router.replace('/admin/login'));
  }, [isLoginPage, router]);

  // Poll unread notification count
  useEffect(() => {
    if (isLoginPage) return;
    const fetchUnread = () => {
      fetch('/api/admin/notifications?type=unread')
        .then((r) => r.json() as Promise<{ unread_count?: number }>)
        .then((d) => setUnreadNotifCount(d.unread_count ?? 0))
        .catch(() => {});
    };
    const t = setTimeout(fetchUnread, 2000);
    const interval = setInterval(fetchUnread, 30000);
    return () => {
      clearTimeout(t);
      clearInterval(interval);
    };
  }, [isLoginPage]);

  // Close modal on outside click
  useEffect(() => {
    if (!profileOpen) return;
    const handler = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [profileOpen]);

  const openProfile = () => {
    setEditName(adminUser.name);
    setEditEmail(adminUser.email);
    setCurrentPass('');
    setNewPass('');
    setConfirmPass('');
    setProfileError(null);
    setProfileSuccess(false);
    setProfileOpen(true);
  };

  const handleSaveProfile = async () => {
    setProfileError(null);
    setProfileSuccess(false);

    if (!editName.trim()) {
      setProfileError('Name cannot be empty.');
      return;
    }

    if (newPass) {
      if (newPass.length < 8) {
        setProfileError('New password must be at least 8 characters.');
        return;
      }
      if (newPass !== confirmPass) {
        setProfileError('New passwords do not match.');
        return;
      }
      if (!currentPass) {
        setProfileError('Please enter your current password to change it.');
        return;
      }
    }

    setSaving(true);
    try {
      const body: Record<string, string> = { name: editName.trim() };
      if (newPass) {
        body.current_password = currentPass;
        body.new_password = newPass;
      }

      const res = await fetch('/api/admin/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = (await res.json()) as { error?: string; user?: AdminUser };

      if (!res.ok) {
        setProfileError(data.error ?? 'Failed to save.');
      } else {
        if (data.user) {
          setAdminUser((prev) => ({ ...prev, name: data.user!.name }));
        }
        setProfileSuccess(true);
        setCurrentPass('');
        setNewPass('');
        setConfirmPass('');
        setTimeout(() => {
          setProfileOpen(false);
          setProfileSuccess(false);
        }, 1400);
      }
    } catch {
      setProfileError('Something went wrong. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    await authClient.signOut();
    router.replace('/admin/login');
  };

  const toggleSection = (label: string) => {
    setExpandedSections((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  const navItems: NavItem[] = [
    { label: 'Topics', href: '/admin', icon: LayoutDashboard },
    {
      label: 'Library',
      icon: Library,
      children: [
        { label: 'Infographics', href: '/admin/library?tab=infographics', icon: ImageIcon },
        { label: 'Worksheets', href: '/admin/library?tab=worksheets', icon: FileText },
      ],
    },
    { label: 'Daily MCQ', href: '/admin/daily-mcq', icon: Zap },
    {
      label: 'Notifications',
      href: '/admin/notifications',
      icon: Bell,
      badge:
        unreadNotifCount > 0
          ? unreadNotifCount > 99
            ? '99+'
            : String(unreadNotifCount)
          : undefined,
    },
    { label: 'Settings', href: '/admin/settings', icon: Settings },
    { label: 'Manage Subscription', href: '/admin/subscription', icon: Star },
    { label: 'Terms of Service', href: '/admin/terms', icon: ScrollText },
    { label: 'Privacy Policy', href: '/admin/privacy', icon: Shield },
  ];

  const isActive = (href: string) => {
    const path = href.split('?')[0];
    if (path === '/admin') return pathname === '/admin';
    if (path === '/admin/library') return pathname.startsWith('/admin/library');
    return pathname.startsWith(path);
  };

  const isLibraryActive = pathname.startsWith('/admin/library');

  if (isLoginPage) return <>{children}</>;

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#0D4C3E] flex items-center justify-center">
            <BookOpen size={22} className="text-white" />
          </div>
          <div className="flex items-center gap-2 text-gray-400">
            <Loader2 className="animate-spin" size={16} />
            <span className="text-sm font-medium">Verifying access…</span>
          </div>
        </div>
      </div>
    );
  }

  const initials = adminUser.name
    ? adminUser.name
        .split(' ')
        .map((w) => w[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'A';

  const currentPageLabel =
    navItems
      .flatMap((item) =>
        item.href && isActive(item.href)
          ? [item.label]
          : (item.children ?? [])
              .filter((c) => pathname.startsWith(c.href.split('?')[0]))
              .map((c) => c.label)
      )
      .find(Boolean) ?? 'Dashboard';

  return (
    <>
      <div className="min-h-screen bg-[#F4F6FA] flex">
        {/* ── Mobile overlay backdrop ── */}
        {mobileSidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/40 lg:hidden"
            onClick={() => setMobileSidebarOpen(false)}
          />
        )}

        {/* ── Sidebar ── */}
        <aside
          className={`
            bg-[#0D4C3E] flex flex-col transition-all duration-200 shrink-0 shadow-xl
            fixed inset-y-0 left-0 z-50 lg:relative lg:z-auto
            ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            ${sidebarOpen ? 'w-64' : 'w-[72px]'}
          `}
        >
          {/* Logo row */}
          <div
            className={`flex items-center ${sidebarOpen ? 'gap-3 px-5' : 'justify-center px-0'} py-5 border-b border-white/10`}
          >
            {sidebarOpen ? (
              <>
                <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
                  <BookOpen size={18} className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-bold text-base leading-tight">Scoolam</p>
                  <p className="text-white/50 text-[10px] font-medium tracking-wider">
                    ADMIN PANEL
                  </p>
                </div>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="text-white/40 hover:text-white transition-colors p-1 hidden lg:block"
                >
                  <X size={16} />
                </button>
                <button
                  onClick={() => setMobileSidebarOpen(false)}
                  className="text-white/40 hover:text-white transition-colors p-1 lg:hidden"
                >
                  <X size={16} />
                </button>
              </>
            ) : (
              <button
                onClick={() => setSidebarOpen(true)}
                className="text-white/70 hover:text-white transition-colors w-full flex justify-center py-1"
              >
                <Menu size={20} />
              </button>
            )}
          </div>

          {/* Nav items */}
          <nav className="flex-1 py-4 overflow-y-auto">
            <div className="space-y-0.5 px-3">
              {navItems.map((item) => {
                const hasChildren = !!item.children;
                const sectionExpanded = expandedSections[item.label];
                const active = item.href ? isActive(item.href) : isLibraryActive;

                if (hasChildren) {
                  return (
                    <div key={item.label}>
                      <button
                        onClick={() => toggleSection(item.label)}
                        title={!sidebarOpen ? item.label : undefined}
                        className={`w-full flex items-center ${sidebarOpen ? 'gap-3 px-3' : 'justify-center px-0'} py-2.5 rounded-xl text-sm font-semibold transition-all ${
                          isLibraryActive
                            ? 'bg-white/15 text-white'
                            : 'text-white/65 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        <item.icon size={18} className="shrink-0" />
                        {sidebarOpen && (
                          <>
                            <span className="flex-1 text-left">{item.label}</span>
                            {sectionExpanded ? (
                              <ChevronDown size={14} className="text-white/50" />
                            ) : (
                              <ChevronRight size={14} className="text-white/50" />
                            )}
                          </>
                        )}
                      </button>
                      {sidebarOpen && sectionExpanded && item.children && (
                        <div className="ml-4 mt-1 mb-1 space-y-0.5 pl-3 border-l border-white/10">
                          {item.children.map((child) => (
                            <Link
                              key={child.label}
                              href={child.href}
                              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all ${
                                pathname.startsWith('/admin/library')
                                  ? 'bg-white/15 text-white font-semibold'
                                  : 'text-white/55 hover:bg-white/10 hover:text-white'
                              }`}
                            >
                              <child.icon size={14} className="shrink-0" />
                              {child.label}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                }

                return (
                  <Link
                    key={item.label}
                    href={item.href!}
                    title={!sidebarOpen ? item.label : undefined}
                    className={`flex items-center ${sidebarOpen ? 'gap-3 px-3' : 'justify-center px-0'} py-2.5 rounded-xl text-sm font-semibold transition-all ${
                      active
                        ? 'bg-white/15 text-white'
                        : 'text-white/65 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <div className="relative shrink-0">
                      <item.icon size={18} />
                      {item.badge && !sidebarOpen && (
                        <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[9px] font-bold rounded-full min-w-[15px] h-[15px] flex items-center justify-center px-0.5 leading-none">
                          {item.badge}
                        </span>
                      )}
                    </div>
                    {sidebarOpen && <span className="flex-1">{item.label}</span>}
                    {sidebarOpen && item.badge && (
                      <span className="bg-red-500 text-white text-[10px] font-bold rounded-full px-1.5 py-0.5 shrink-0 min-w-[20px] text-center leading-none">
                        {item.badge}
                      </span>
                    )}
                    {sidebarOpen && active && !item.badge && (
                      <span className="w-1.5 h-1.5 rounded-full bg-white/80 shrink-0" />
                    )}
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* ── Bottom profile (single, clickable) ── */}
          <div className="border-t border-white/10 p-3">
            {sidebarOpen ? (
              <div className="flex items-center gap-2">
                {/* Clickable profile button */}
                <button
                  onClick={openProfile}
                  title="Edit profile"
                  className="flex items-center gap-3 flex-1 min-w-0 px-2 py-1.5 rounded-xl hover:bg-white/10 transition-colors group text-left"
                >
                  <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center shrink-0 group-hover:bg-white/30 transition-colors">
                    <span className="text-white text-xs font-bold">{initials}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-semibold truncate">{adminUser.name}</p>
                    <p className="text-white/40 text-[10px] truncate">{adminUser.email}</p>
                  </div>
                  <Pencil
                    size={13}
                    className="text-white/30 group-hover:text-white/70 transition-colors shrink-0"
                  />
                </button>

                {/* Sign out */}
                <button
                  onClick={() => void handleSignOut()}
                  className="text-white/50 hover:text-red-300 transition-colors p-1.5 rounded-lg hover:bg-white/10 shrink-0"
                  title="Sign Out"
                >
                  <LogOut size={15} />
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <button
                  onClick={openProfile}
                  title="Edit profile"
                  className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
                >
                  <span className="text-white text-xs font-bold">{initials}</span>
                </button>
                <button
                  onClick={() => void handleSignOut()}
                  className="text-white/50 hover:text-red-300 transition-colors w-full flex justify-center py-1.5 rounded-xl hover:bg-white/10"
                  title="Sign Out"
                >
                  <LogOut size={16} />
                </button>
              </div>
            )}
          </div>
        </aside>

        {/* ── Main content ── */}
        <div className="flex-1 flex flex-col min-w-0 lg:ml-0">
          {/* Top bar */}
          <header className="bg-white border-b border-gray-200/70 px-4 md:px-6 py-3.5 flex items-center gap-3 sticky top-0 z-10 shadow-sm">
            {/* Hamburger for mobile/tablet */}
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
            >
              <Menu size={20} />
            </button>
            <div className="flex items-center gap-1.5 text-sm flex-1">
              <span className="text-gray-400 font-medium hidden sm:block">Admin</span>
              <ChevronRight size={14} className="text-gray-300 hidden sm:block" />
              <span className="text-gray-900 font-semibold">{currentPageLabel}</span>
            </div>
          </header>

          <main className="flex-1 p-4 md:p-6 overflow-auto">
            <div className="max-w-6xl mx-auto w-full">{children}</div>
          </main>
        </div>
      </div>

      {/* ── Edit Profile Modal ── */}
      {profileOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div
            ref={modalRef}
            className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
          >
            {/* Modal header */}
            <div className="bg-[#0D4C3E] px-6 py-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">{initials}</span>
                </div>
                <div>
                  <p className="text-white font-bold text-base leading-tight">Edit Profile</p>
                  <p className="text-white/50 text-xs mt-0.5">{adminUser.email}</p>
                </div>
              </div>
              <button
                onClick={() => setProfileOpen(false)}
                className="text-white/50 hover:text-white transition-colors p-1"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal body */}
            <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
              {/* Name */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                  Display Name
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Your full name"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 bg-gray-50 focus:outline-none focus:border-[#0D4C3E] focus:ring-2 focus:ring-[#0D4C3E]/15 transition-all"
                />
              </div>

              {/* Email (read-only) */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                  Email{' '}
                  <span className="text-gray-300 font-normal normal-case">(cannot be changed)</span>
                </label>
                <input
                  type="email"
                  value={editEmail}
                  readOnly
                  className="w-full border border-gray-100 rounded-xl px-4 py-3 text-sm text-gray-400 bg-gray-50 cursor-not-allowed"
                />
              </div>

              {/* Divider */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-gray-100" />
                <span className="text-xs text-gray-400 font-semibold">Change Password</span>
                <div className="flex-1 h-px bg-gray-100" />
              </div>
              <p className="text-xs text-gray-400 -mt-3">
                Leave blank to keep your current password
              </p>

              {/* Current Password */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showCurrent ? 'text' : 'password'}
                    value={currentPass}
                    onChange={(e) => setCurrentPass(e.target.value)}
                    placeholder="Enter current password"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-11 text-sm text-gray-800 bg-gray-50 focus:outline-none focus:border-[#0D4C3E] focus:ring-2 focus:ring-[#0D4C3E]/15 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrent((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showNew ? 'text' : 'password'}
                    value={newPass}
                    onChange={(e) => setNewPass(e.target.value)}
                    placeholder="Min. 8 characters"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-11 text-sm text-gray-800 bg-gray-50 focus:outline-none focus:border-[#0D4C3E] focus:ring-2 focus:ring-[#0D4C3E]/15 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Confirm New Password */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={confirmPass}
                  onChange={(e) => setConfirmPass(e.target.value)}
                  placeholder="Re-enter new password"
                  className={`w-full border rounded-xl px-4 py-3 text-sm text-gray-800 bg-gray-50 focus:outline-none focus:ring-2 transition-all ${
                    confirmPass && confirmPass !== newPass
                      ? 'border-red-300 focus:border-red-400 focus:ring-red-300/20'
                      : 'border-gray-200 focus:border-[#0D4C3E] focus:ring-[#0D4C3E]/15'
                  }`}
                />
                {confirmPass && confirmPass !== newPass && (
                  <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
                )}
              </div>

              {/* Error / Success */}
              {profileError && (
                <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-sm text-red-600">
                  {profileError}
                </div>
              )}
              {profileSuccess && (
                <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-sm text-green-700 flex items-center gap-2">
                  <Check size={16} className="text-green-600 shrink-0" />
                  Profile updated successfully!
                </div>
              )}
            </div>

            {/* Footer buttons */}
            <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
              <button
                onClick={() => setProfileOpen(false)}
                className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => void handleSaveProfile()}
                disabled={saving}
                className="flex-1 py-3 rounded-xl bg-[#0D4C3E] text-white text-sm font-bold hover:bg-[#0a3d32] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
                {saving ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
