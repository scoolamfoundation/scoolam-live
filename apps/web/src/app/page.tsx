'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  BookOpen,
  Brain,
  Zap,
  Award,
  PlayCircle,
  FileText,
  Users,
  TrendingUp,
  CheckCircle,
  ArrowRight,
  Smartphone,
  Globe,
  Crown,
  Star,
  Flame,
  Target,
  BarChart3,
  Sparkles,
} from 'lucide-react';

interface Stats {
  total_topics: number;
  total_users: number;
  total_challenges: number;
}

export default function HomePage() {
  const [stats, setStats] = useState<Stats>({
    total_topics: 0,
    total_users: 0,
    total_challenges: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch real stats from the API
    fetch('/api/stats')
      .then((r) => r.json())
      .then((d) => {
        setStats({
          total_topics: d.total_videos ?? 0,
          total_users: 0, // not exposed in current API
          total_challenges: 0, // not exposed in current API
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-[#F4F6FA]">
      {/* Header */}
      <header className="bg-white border-b border-gray-200/70 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#E8F5F0] flex items-center justify-center">
              <img
                src="https://dtvoeevhaseb5.cloudfront.net/user-uploads/b322290c-0a64-4272-b044-83fbf3d71d7e.png"
                alt="Scoolam"
                className="w-7 h-7 object-contain"
              />
            </div>
            <div>
              <h1 className="text-[#0D4C3E] font-black text-lg leading-tight">Scoolam</h1>
              <p className="text-gray-400 text-[10px] font-medium tracking-wider">
                DAILY LEARNING APP
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/account/signin"
              className="text-gray-600 hover:text-gray-900 px-4 py-2 rounded-xl text-sm font-semibold transition-colors hidden sm:block"
            >
              Sign In
            </Link>
            <Link
              href="/account/signup"
              className="bg-[#0D4C3E] hover:bg-[#0a3d32] text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm hover:shadow-md"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 py-16 md:py-24">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Text */}
          <div>
            <div className="inline-flex items-center gap-2 bg-[#E8F5F0] border border-[#0D4C3E]/10 rounded-full px-4 py-2 mb-6">
              <Sparkles size={14} className="text-[#0D4C3E]" />
              <span className="text-[#0D4C3E] text-sm font-bold">
                Your Daily Learning Companion
              </span>
            </div>

            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 leading-tight mb-6">
              Learn Smarter,
              <br />
              <span className="text-[#0D4C3E]">Grow Faster</span>
            </h2>

            <p className="text-gray-600 text-lg leading-relaxed mb-8 max-w-xl">
              Master new concepts with bite-sized video lessons, interactive quizzes, and daily
              challenges. Built for students who want to excel.
            </p>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-10">
              <Link
                href="/account/signup"
                className="bg-[#0D4C3E] hover:bg-[#0a3d32] text-white px-8 py-4 rounded-2xl font-bold text-base shadow-lg hover:shadow-xl transition-all flex items-center gap-2 group"
              >
                Get Started Free
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/admin"
                className="text-gray-600 hover:text-gray-900 px-8 py-4 rounded-2xl font-semibold text-base border border-gray-200 hover:border-gray-300 hover:bg-white transition-all"
              >
                Admin Portal →
              </Link>
            </div>

            {/* Quick stats */}
            <div className="grid grid-cols-3 gap-4 max-w-md">
              {[
                {
                  icon: BookOpen,
                  label: 'Topics',
                  value: loading ? '—' : stats.total_topics > 0 ? `${stats.total_topics}+` : '100+',
                },
                { icon: Users, label: 'Learners', value: '10K+' },
                { icon: Zap, label: 'Challenges', value: '50+' },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="w-10 h-10 rounded-xl bg-[#E8F5F0] border border-gray-100 flex items-center justify-center mx-auto mb-2">
                    <stat.icon size={18} className="text-[#0D4C3E]" />
                  </div>
                  <p className="text-xl font-black text-gray-900">{stat.value}</p>
                  <p className="text-gray-500 text-xs font-medium mt-0.5">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Visual */}
          <div className="relative">
            <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-8 space-y-6">
              {/* Mock video card */}
              <div className="bg-gradient-to-br from-[#0D4C3E] to-[#0a3d32] rounded-2xl p-6 text-white">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                    <PlayCircle size={24} className="text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-sm">Biology Lesson</p>
                    <p className="text-white/60 text-xs">Cell Structure & Function</p>
                  </div>
                  <Crown size={16} className="text-[#FCD34D]" />
                </div>
                <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                  <div className="h-full w-3/4 bg-white/80 rounded-full" />
                </div>
                <p className="text-white/50 text-xs mt-2">75% complete</p>
              </div>

              {/* Mock quiz card */}
              <div className="bg-[#F9FAFB] rounded-2xl p-5 border border-gray-100">
                <div className="flex items-center gap-2 mb-3">
                  <Brain size={16} className="text-[#0D4C3E]" />
                  <p className="font-bold text-sm text-gray-900">Daily Challenge</p>
                  <span className="ml-auto bg-[#FCD34D] text-[#78350F] text-xs font-bold px-2 py-0.5 rounded-full">
                    5Q
                  </span>
                </div>
                <p className="text-gray-600 text-xs mb-3">Test your knowledge with today's quiz</p>
                <button className="w-full bg-[#0D4C3E] text-white py-2.5 rounded-xl text-sm font-bold hover:bg-[#0a3d32] transition-colors">
                  Start Quiz →
                </button>
              </div>

              {/* Mock progress */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Flame size={18} className="text-orange-500" />
                  <span className="text-sm font-bold text-gray-900">7 Day Streak</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award size={18} className="text-amber-500" />
                  <span className="text-sm font-bold text-gray-900">Rank #42</span>
                </div>
              </div>
            </div>

            {/* Floating badge */}
            <div className="absolute -top-4 -right-4 bg-white rounded-2xl shadow-xl border border-gray-100 px-4 py-3 flex items-center gap-2">
              <CheckCircle size={18} className="text-emerald-500" />
              <span className="text-sm font-bold text-gray-900">100% Free</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white border-y border-gray-200/70 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h3 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">
              Everything You Need to Succeed
            </h3>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Powerful features designed to make learning engaging, effective, and fun.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: PlayCircle,
                title: 'Video Lessons',
                desc: 'Watch expert-crafted video lessons on topics across Biology, Chemistry, Physics, and more.',
                color: 'text-emerald-600',
                bg: 'bg-emerald-50',
              },
              {
                icon: Brain,
                title: 'Interactive Quizzes',
                desc: 'Test your knowledge with timed MCQs after every lesson. Track your progress in real-time.',
                color: 'text-purple-600',
                bg: 'bg-purple-50',
              },
              {
                icon: Zap,
                title: 'Daily Challenges',
                desc: 'Stay sharp with fresh daily challenges. Compete on the leaderboard and earn rewards.',
                color: 'text-amber-600',
                bg: 'bg-amber-50',
              },
              {
                icon: FileText,
                title: 'Study Resources',
                desc: 'Download infographics, worksheets, and study guides to reinforce your learning.',
                color: 'text-blue-600',
                bg: 'bg-blue-50',
              },
              {
                icon: TrendingUp,
                title: 'Progress Tracking',
                desc: 'Monitor your streak, rank, and performance. See how you improve day by day.',
                color: 'text-pink-600',
                bg: 'bg-pink-50',
              },
              {
                icon: Crown,
                title: 'Premium Content',
                desc: 'Unlock unlimited access to all lessons, quizzes, and resources with Scoolam Premium.',
                color: 'text-[#0D4C3E]',
                bg: 'bg-[#E8F5F0]',
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="bg-white border border-gray-100 rounded-2xl p-6 hover:shadow-lg hover:border-gray-200 transition-all group"
              >
                <div
                  className={`w-14 h-14 rounded-2xl ${feature.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                >
                  <feature.icon size={26} className={feature.color} />
                </div>
                <h4 className="text-gray-900 font-bold text-lg mb-2">{feature.title}</h4>
                <p className="text-gray-600 text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Platform Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h3 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">
              Learn Anywhere, Anytime
            </h3>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Access Scoolam on web and mobile. Your progress syncs seamlessly across all devices.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                icon: Globe,
                title: 'Web Platform',
                desc: 'Full-featured admin portal and learning dashboard accessible from any browser.',
                features: ['Admin Dashboard', 'Content Management', 'Analytics & Reports'],
                color: 'text-blue-600',
                bg: 'bg-blue-50',
              },
              {
                icon: Smartphone,
                title: 'Mobile App',
                desc: 'Native iOS & Android app with offline support and push notifications.',
                features: ['Offline Learning', 'Daily Reminders', 'Progress Sync'],
                color: 'text-purple-600',
                bg: 'bg-purple-50',
              },
            ].map((platform) => (
              <div
                key={platform.title}
                className="bg-white border border-gray-100 rounded-2xl p-8 hover:shadow-lg hover:border-gray-200 transition-all"
              >
                <div
                  className={`w-16 h-16 rounded-2xl ${platform.bg} flex items-center justify-center mb-5`}
                >
                  <platform.icon size={28} className={platform.color} />
                </div>
                <h4 className="text-gray-900 font-bold text-xl mb-2">{platform.title}</h4>
                <p className="text-gray-600 mb-5 leading-relaxed">{platform.desc}</p>
                <ul className="space-y-2">
                  {platform.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-gray-700 text-sm">
                      <CheckCircle size={16} className="text-emerald-500 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white border-t border-gray-200/70">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="bg-gradient-to-br from-[#0D4C3E] to-[#0a3d32] rounded-3xl p-12 text-white shadow-2xl">
            <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center mx-auto mb-6">
              <Star size={32} className="text-white" />
            </div>
            <h3 className="text-3xl md:text-4xl font-black mb-4">Ready to Start Learning?</h3>
            <p className="text-white/80 text-lg mb-8 max-w-2xl mx-auto">
              Join thousands of students already learning smarter with Scoolam. Sign up today and
              get instant access to all free content.
            </p>
            <Link
              href="/account/signup"
              className="inline-flex items-center gap-2 bg-white text-[#0D4C3E] px-10 py-5 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl hover:scale-105 transition-all group"
            >
              Create Free Account
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <p className="text-white/50 text-sm mt-4">
              No credit card required · Free forever · Upgrade anytime
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200/70 py-8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#E8F5F0] flex items-center justify-center">
                <img
                  src="https://dtvoeevhaseb5.cloudfront.net/user-uploads/b322290c-0a64-4272-b044-83fbf3d71d7e.png"
                  alt="Scoolam"
                  className="w-5 h-5 object-contain"
                />
              </div>
              <p className="text-gray-500 text-sm">© 2026 Scoolam. All rights reserved.</p>
            </div>
            <div className="flex items-center gap-6">
              <Link
                href="/privacy-policy"
                className="text-gray-500 hover:text-gray-900 text-sm transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms-of-service"
                className="text-gray-500 hover:text-gray-900 text-sm transition-colors"
              >
                Terms of Service
              </Link>
              <Link
                href="/admin"
                className="text-gray-500 hover:text-gray-900 text-sm transition-colors font-semibold"
              >
                Admin
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
