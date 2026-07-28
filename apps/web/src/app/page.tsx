import Link from 'next/link';
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
} from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0D4C3E] via-[#0a3d32] to-[#0D4C3E]">
      {/* Header */}
      <header className="border-b border-white/10 backdrop-blur-sm bg-white/5">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center">
              <img
                src="https://dtvoeevhaseb5.cloudfront.net/user-uploads/b322290c-0a64-4272-b044-83fbf3d71d7e.png"
                alt="Scoolam"
                className="w-7 h-7 object-contain"
              />
            </div>
            <div>
              <h1 className="text-white font-black text-lg leading-tight">Scoolam</h1>
              <p className="text-white/50 text-[10px] font-medium tracking-wider">
                DAILY LEARNING APP
              </p>
            </div>
          </div>
          <Link
            href="/admin"
            className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all border border-white/20 hover:border-white/30"
          >
            Admin Portal →
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-6 py-20 text-center">
        <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-2 mb-6">
          <Zap size={14} className="text-[#FCD34D]" />
          <span className="text-white/90 text-sm font-semibold">Your Daily Learning Companion</span>
        </div>

        <h2 className="text-5xl md:text-6xl font-black text-white leading-tight mb-6">
          Learn Smarter,
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#A7F3D0] to-[#FCD34D]">
            Grow Faster
          </span>
        </h2>

        <p className="text-white/70 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
          Master new concepts with bite-sized video lessons, interactive quizzes, and daily
          challenges. Built for students who want to excel.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/account/signup"
            className="bg-white text-[#0D4C3E] px-8 py-4 rounded-2xl font-bold text-lg shadow-2xl hover:shadow-xl hover:scale-105 transition-all flex items-center gap-2 group"
          >
            Get Started Free
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            href="/account/signin"
            className="bg-white/10 hover:bg-white/20 text-white px-8 py-4 rounded-2xl font-bold text-lg border border-white/20 hover:border-white/30 transition-all"
          >
            Sign In
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-6 max-w-2xl mx-auto mt-16">
          {[
            { icon: Users, label: 'Active Learners', value: '10K+' },
            { icon: BookOpen, label: 'Video Lessons', value: '500+' },
            { icon: Award, label: 'Daily Challenges', value: '100+' },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center mx-auto mb-3">
                <stat.icon size={22} className="text-white" />
              </div>
              <p className="text-2xl font-black text-white">{stat.value}</p>
              <p className="text-white/50 text-sm font-medium mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white/5 backdrop-blur-sm border-y border-white/10 py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h3 className="text-3xl md:text-4xl font-black text-white mb-4">
              Everything You Need to Succeed
            </h3>
            <p className="text-white/60 text-lg max-w-2xl mx-auto">
              Powerful features designed to make learning engaging, effective, and fun.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: PlayCircle,
                title: 'Video Lessons',
                desc: 'Watch expert-crafted video lessons on topics across Biology, Chemistry, Physics, and more.',
                color: 'from-emerald-400 to-emerald-600',
                bg: 'bg-emerald-500/10',
                border: 'border-emerald-500/20',
              },
              {
                icon: Brain,
                title: 'Interactive Quizzes',
                desc: 'Test your knowledge with timed MCQs after every lesson. Track your progress in real-time.',
                color: 'from-purple-400 to-purple-600',
                bg: 'bg-purple-500/10',
                border: 'border-purple-500/20',
              },
              {
                icon: Zap,
                title: 'Daily Challenges',
                desc: 'Stay sharp with fresh daily challenges. Compete on the leaderboard and earn rewards.',
                color: 'from-amber-400 to-amber-600',
                bg: 'bg-amber-500/10',
                border: 'border-amber-500/20',
              },
              {
                icon: FileText,
                title: 'Study Resources',
                desc: 'Download infographics, worksheets, and study guides to reinforce your learning.',
                color: 'from-blue-400 to-blue-600',
                bg: 'bg-blue-500/10',
                border: 'border-blue-500/20',
              },
              {
                icon: TrendingUp,
                title: 'Progress Tracking',
                desc: 'Monitor your streak, rank, and performance. See how you improve day by day.',
                color: 'from-pink-400 to-pink-600',
                bg: 'bg-pink-500/10',
                border: 'border-pink-500/20',
              },
              {
                icon: Crown,
                title: 'Premium Content',
                desc: 'Unlock unlimited access to all lessons, quizzes, and resources with Scoolam Premium.',
                color: 'from-yellow-400 to-yellow-600',
                bg: 'bg-yellow-500/10',
                border: 'border-yellow-500/20',
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className={`${feature.bg} border ${feature.border} rounded-2xl p-6 hover:scale-105 transition-all group`}
              >
                <div
                  className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 shadow-lg`}
                >
                  <feature.icon size={26} className="text-white" />
                </div>
                <h4 className="text-white font-bold text-lg mb-2">{feature.title}</h4>
                <p className="text-white/60 text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Platform Section */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h3 className="text-3xl md:text-4xl font-black text-white mb-4">
              Learn Anywhere, Anytime
            </h3>
            <p className="text-white/60 text-lg max-w-2xl mx-auto">
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
              },
              {
                icon: Smartphone,
                title: 'Mobile App',
                desc: 'Native iOS & Android app with offline support and push notifications.',
                features: ['Offline Learning', 'Daily Reminders', 'Progress Sync'],
              },
            ].map((platform) => (
              <div
                key={platform.title}
                className="bg-white/5 border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all"
              >
                <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center mb-5">
                  <platform.icon size={28} className="text-white" />
                </div>
                <h4 className="text-white font-bold text-xl mb-2">{platform.title}</h4>
                <p className="text-white/60 mb-5 leading-relaxed">{platform.desc}</p>
                <ul className="space-y-2">
                  {platform.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-white/80 text-sm">
                      <CheckCircle size={16} className="text-emerald-400 shrink-0" />
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
      <section className="py-20 border-t border-white/10">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-3xl p-12 backdrop-blur-sm">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center mx-auto mb-6 shadow-2xl">
              <Star size={32} className="text-white" />
            </div>
            <h3 className="text-3xl md:text-4xl font-black text-white mb-4">
              Ready to Start Learning?
            </h3>
            <p className="text-white/70 text-lg mb-8 max-w-2xl mx-auto">
              Join thousands of students already learning smarter with Scoolam. Sign up today and
              get instant access to all free content.
            </p>
            <Link
              href="/account/signup"
              className="inline-flex items-center gap-2 bg-white text-[#0D4C3E] px-10 py-5 rounded-2xl font-bold text-lg shadow-2xl hover:shadow-xl hover:scale-105 transition-all group"
            >
              Create Free Account
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <p className="text-white/40 text-sm mt-4">
              No credit card required · Free forever · Upgrade anytime
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                <img
                  src="https://dtvoeevhaseb5.cloudfront.net/user-uploads/b322290c-0a64-4272-b044-83fbf3d71d7e.png"
                  alt="Scoolam"
                  className="w-5 h-5 object-contain"
                />
              </div>
              <p className="text-white/50 text-sm">© 2026 Scoolam. All rights reserved.</p>
            </div>
            <div className="flex items-center gap-6">
              <Link
                href="/privacy-policy"
                className="text-white/50 hover:text-white text-sm transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms-of-service"
                className="text-white/50 hover:text-white text-sm transition-colors"
              >
                Terms of Service
              </Link>
              <Link
                href="/admin"
                className="text-white/50 hover:text-white text-sm transition-colors"
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
