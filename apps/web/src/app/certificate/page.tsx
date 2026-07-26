'use client';
import { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

const MEDAL_CONFIG = {
  gold: {
    emoji: '🥇',
    label: 'Gold Medal',
    bg: 'linear-gradient(135deg, #B45309 0%, #D97706 50%, #F59E0B 100%)',
    ribbon: '#F59E0B',
    ribbonDark: '#92400E',
    light: '#FEF3C7',
    congratsMsg: 'Outstanding Performance!',
    borderColor: '#F59E0B',
  },
  silver: {
    emoji: '🥈',
    label: 'Silver Medal',
    bg: 'linear-gradient(135deg, #1F2937 0%, #374151 50%, #6B7280 100%)',
    ribbon: '#9CA3AF',
    ribbonDark: '#374151',
    light: '#F3F4F6',
    congratsMsg: 'Great Achievement!',
    borderColor: '#9CA3AF',
  },
  bronze: {
    emoji: '🥉',
    label: 'Bronze Medal',
    bg: 'linear-gradient(135deg, #451A03 0%, #78350F 50%, #B45309 100%)',
    ribbon: '#C2713F',
    ribbonDark: '#78350F',
    light: '#FEF3C7',
    congratsMsg: 'Well Done!',
    borderColor: '#C2713F',
  },
  participation: {
    emoji: '⭐',
    label: 'Participation',
    bg: 'linear-gradient(135deg, #064E3B 0%, #0D4C3E 50%, #059669 100%)',
    ribbon: '#10B981',
    ribbonDark: '#065F46',
    light: '#ECFDF5',
    congratsMsg: 'Challenge Completed!',
    borderColor: '#10B981',
  },
} as const;

type MedalKey = keyof typeof MEDAL_CONFIG;

function starsForPct(pct: number): number {
  if (pct === 100) return 5;
  if (pct >= 80) return 4;
  if (pct >= 60) return 3;
  if (pct >= 40) return 2;
  return 1;
}

function CertificateContent() {
  const params = useSearchParams();
  const name = params.get('name') || 'Learner';
  const title = params.get('title') || 'Challenge';
  const score = params.get('score') || '0';
  const total = params.get('total') || '0';
  const pct = Number(params.get('pct') || '0');
  const rawMedal = params.get('medal') || 'participation';
  const medal: MedalKey = rawMedal in MEDAL_CONFIG ? (rawMedal as MedalKey) : 'participation';
  const paramDate = params.get('date');
  const mode = params.get('mode') || 'daily';

  const [fallbackDate, setFallbackDate] = useState('');
  useEffect(() => {
    if (!paramDate) {
      setFallbackDate(
        new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
      );
    }
  }, [paramDate]);

  const date = paramDate || fallbackDate;

  const config = MEDAL_CONFIG[medal];
  const stars = starsForPct(pct);

  const handlePrint = () => window.print();

  const handleShareLink = () => {
    if (navigator.share) {
      void navigator.share({ title: `${name}'s Scoolam Certificate`, url: window.location.href });
    } else {
      void navigator.clipboard.writeText(window.location.href);
      alert('Certificate link copied to clipboard!');
    }
  };

  const scoreItems = [
    { value: `${score}/${total}`, label: 'SCORE' },
    { value: `${pct}%`, label: 'ACCURACY' },
    { value: config.emoji, label: config.label.toUpperCase().split(' ')[0] },
  ];

  const decorCircles = [
    { left: '-80px', top: '-80px', size: '240px' },
    { left: '70%', top: '-60px', size: '200px' },
    { left: '-40px', top: '60%', size: '160px' },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=Inter:wght@400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #1a1a2e; font-family: 'Inter', sans-serif; min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: flex-start; padding: 40px 20px; }
        .cert-card { width: 100%; max-width: 540px; aspect-ratio: 4 / 5; display: flex; flex-direction: column; overflow: hidden; }
        @media (max-width: 600px) { body { padding: 20px 12px; } }
        @media print {
          body { background: #fff; padding: 0; display: block; }
          .no-print { display: none !important; }
          .cert-wrapper { box-shadow: none !important; border: none !important; }
          @page { margin: 0; size: 1080px 1350px; }
        }
      `}</style>

      {/* Action toolbar (hidden on print) */}
      <div
        className="no-print"
        style={{
          display: 'flex',
          gap: 12,
          marginBottom: 32,
          flexWrap: 'wrap',
          justifyContent: 'center',
        }}
      >
        <button
          onClick={handlePrint}
          style={{
            background: config.ribbon,
            color: '#fff',
            border: 'none',
            borderRadius: 12,
            padding: '12px 28px',
            fontSize: 15,
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          ⬇ Download / Print Certificate
        </button>
        <button
          onClick={handleShareLink}
          style={{
            background: 'rgba(255,255,255,0.12)',
            color: '#fff',
            border: '2px solid rgba(255,255,255,0.2)',
            borderRadius: 12,
            padding: '12px 28px',
            fontSize: 15,
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          ↗ Share Link
        </button>
      </div>

      {/* Certificate wrapper */}
      <div
        className="cert-wrapper cert-card"
        style={{
          width: '100%',
          maxWidth: 540,
          background: '#fff',
          borderRadius: 24,
          overflow: 'hidden',
          boxShadow: '0 32px 80px rgba(0,0,0,0.5)',
          border: `4px solid ${config.borderColor}`,
        }}
      >
        {/* Hero gradient top */}
        <div
          style={{
            background: config.bg,
            padding: '48px 48px 80px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {decorCircles.map((c, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: c.left,
                top: c.top,
                width: c.size,
                height: c.size,
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.05)',
                border: '2px solid rgba(255,255,255,0.08)',
              }}
            />
          ))}

          {/* Mode badge */}
          <div
            style={{
              background: 'rgba(255,255,255,0.2)',
              borderRadius: 20,
              padding: '6px 18px',
              marginBottom: 24,
            }}
          >
            <span style={{ color: '#fff', fontSize: 12, fontWeight: 700, letterSpacing: 2 }}>
              {mode === 'daily' ? '⚡ DAILY CHALLENGE' : '📚 TOPIC QUIZ'}
            </span>
          </div>

          {/* Medal circle */}
          <div
            style={{
              width: 110,
              height: 110,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '3px solid rgba(255,255,255,0.4)',
              fontSize: 60,
              marginBottom: 20,
            }}
          >
            {config.emoji}
          </div>

          <h1
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              color: '#fff',
              fontSize: 36,
              fontWeight: 900,
              letterSpacing: '-0.5px',
              textAlign: 'center',
            }}
          >
            Challenge Complete!
          </h1>

          <div style={{ display: 'flex', gap: 8, marginTop: 16, alignItems: 'center' }}>
            {[0, 1, 2, 3, 4].map((i) => (
              <span
                key={i}
                style={{ fontSize: 24, opacity: i < stars ? 1 : 0.25, color: '#FDE68A' }}
              >
                ★
              </span>
            ))}
          </div>
          <p
            style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13, marginTop: 8, fontWeight: 600 }}
          >
            {stars}/5 stars • {config.label}
          </p>
        </div>

        {/* White body */}
        <div style={{ padding: '0 40px 48px', marginTop: -44, position: 'relative' }}>
          <div
            style={{
              background: '#fff',
              borderRadius: 20,
              border: `2px solid ${config.borderColor}30`,
              overflow: 'hidden',
              boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
            }}
          >
            {/* Ribbon bar */}
            <div style={{ background: config.ribbon, padding: '12px 0', textAlign: 'center' }}>
              <span style={{ color: '#fff', fontSize: 11, fontWeight: 800, letterSpacing: 3 }}>
                ✦ CERTIFICATE OF ACHIEVEMENT ✦
              </span>
            </div>

            <div
              style={{
                padding: '36px 40px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              {/* Brand */}
              <p
                style={{
                  fontFamily: "'Playfair Display', Georgia, serif",
                  fontSize: 28,
                  fontWeight: 900,
                  color: '#0D4C3E',
                  letterSpacing: -1,
                }}
              >
                Scoolam
              </p>
              <p style={{ fontSize: 10, color: '#9CA3AF', letterSpacing: 4, marginTop: 2 }}>
                LEARNING PLATFORM
              </p>

              <div
                style={{
                  width: 64,
                  height: 3,
                  background: config.ribbon,
                  borderRadius: 2,
                  margin: '20px 0',
                }}
              />

              <p style={{ fontSize: 14, color: '#9CA3AF' }}>This is to certify that</p>
              <p
                style={{
                  fontFamily: "'Playfair Display', Georgia, serif",
                  fontSize: 34,
                  fontWeight: 900,
                  color: '#111827',
                  marginTop: 8,
                  textAlign: 'center',
                }}
              >
                {name}
              </p>

              <p style={{ fontSize: 14, color: '#9CA3AF', marginTop: 20, textAlign: 'center' }}>
                has successfully completed
              </p>
              <p
                style={{
                  fontFamily: "'Playfair Display', Georgia, serif",
                  fontSize: 20,
                  fontWeight: 700,
                  color: '#0D4C3E',
                  marginTop: 8,
                  textAlign: 'center',
                  lineHeight: '1.5',
                }}
              >
                {title}
              </p>

              {/* Stats */}
              <div
                style={{
                  display: 'flex',
                  marginTop: 28,
                  background: config.light,
                  borderRadius: 16,
                  overflow: 'hidden',
                  width: '100%',
                  maxWidth: 480,
                }}
              >
                {scoreItems.map((item, i) => (
                  <div
                    key={i}
                    style={{
                      flex: 1,
                      padding: '20px 10px',
                      textAlign: 'center',
                      borderRight:
                        i < scoreItems.length - 1 ? '1px solid rgba(0,0,0,0.08)' : 'none',
                    }}
                  >
                    <p style={{ fontSize: 28, fontWeight: 900, color: config.ribbonDark }}>
                      {item.value}
                    </p>
                    <p
                      style={{
                        fontSize: 10,
                        color: '#6B7280',
                        fontWeight: 700,
                        marginTop: 4,
                        letterSpacing: 1,
                      }}
                    >
                      {item.label}
                    </p>
                  </div>
                ))}
              </div>

              {/* Stars */}
              <div style={{ display: 'flex', gap: 6, marginTop: 20 }}>
                {[0, 1, 2, 3, 4].map((i) => (
                  <span
                    key={i}
                    style={{ fontSize: 20, color: i < stars ? config.ribbon : '#E5E7EB' }}
                  >
                    ★
                  </span>
                ))}
              </div>

              <p
                style={{
                  fontSize: 16,
                  fontWeight: 800,
                  color: config.ribbonDark,
                  marginTop: 16,
                  textAlign: 'center',
                }}
              >
                {config.congratsMsg}
              </p>

              {/* Footer */}
              <div
                style={{
                  width: '100%',
                  borderTop: '1px solid #F3F4F6',
                  marginTop: 28,
                  paddingTop: 16,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <p style={{ fontSize: 12, color: '#9CA3AF' }}>📅 {date}</p>
                <div
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}
                >
                  <div style={{ background: '#0D4C3E', borderRadius: 8, padding: '4px 14px' }}>
                    <span style={{ color: '#fff', fontSize: 12, fontWeight: 800 }}>Scoolam</span>
                  </div>
                  <p style={{ fontSize: 10, color: '#9CA3AF' }}>scoolam.com</p>
                </div>
                <p style={{ fontSize: 12, color: '#9CA3AF' }}>Verified Achievement</p>
              </div>
            </div>

            <div style={{ height: 6, background: config.ribbon }} />
          </div>

          <p style={{ textAlign: 'center', color: '#6B7280', fontSize: 12, marginTop: 24 }}>
            This certificate was issued by Scoolam Learning Platform on {date}.
          </p>
        </div>
      </div>
    </>
  );
}

export default function CertificatePage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#1a1a2e',
            color: '#fff',
          }}
        >
          Loading certificate…
        </div>
      }
    >
      <CertificateContent />
    </Suspense>
  );
}
