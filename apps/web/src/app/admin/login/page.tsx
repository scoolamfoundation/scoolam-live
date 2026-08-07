'use client';
import { type FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth-client';
import { BookOpen, Lock, Eye, EyeOff } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error: signInError } = await authClient.signIn.email({ email, password });
    if (signInError) {
      setError(signInError.message ?? 'Invalid credentials');
      setLoading(false);
      return;
    }

    // Check admin status
    const res = await fetch('/api/admin/me');
    if (!res.ok) {
      // Sign them out immediately — not an admin
      await authClient.signOut();
      setError('This account does not have admin access.');
      setLoading(false);
      return;
    }

    router.push('/admin');
  };

  return (
    <div className="min-h-screen bg-[#F0FDF4] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo card */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-20 h-20 bg-[#0D4C3E] rounded-2xl flex items-center justify-center mb-4 shadow-lg">
            <BookOpen className="text-white" size={36} />
          </div>
          <h1 className="text-3xl font-extrabold text-[#0D4C3E]">Scoolam</h1>
          <p className="text-gray-500 mt-1 text-sm font-medium">Admin Portal</p>
        </div>

        <form
          onSubmit={(e) => {
            void onSubmit(e);
          }}
          className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 space-y-5"
        >
          <div className="flex items-center gap-2 mb-6">
            <Lock size={18} className="text-[#0D4C3E]" />
            <h2 className="text-xl font-bold text-gray-800">Admin Sign In</h2>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-700 block">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@scoolam.com"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0D4C3E] focus:border-transparent"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-700 block">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-11 text-sm focus:outline-none focus:ring-2 focus:ring-[#0D4C3E] focus:border-transparent"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 text-sm rounded-xl px-4 py-3 border border-red-100">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#0D4C3E] hover:bg-[#0a3d32] text-white font-bold py-3.5 rounded-xl transition-colors disabled:opacity-60 text-base"
          >
            {loading ? 'Signing in…' : 'Sign In to Admin'}
          </button>
        </form>

        <p className="text-center text-xs text-gray-400 mt-6">
          Restricted access. Admin accounts only.
        </p>
      </div>
    </div>
  );
}
