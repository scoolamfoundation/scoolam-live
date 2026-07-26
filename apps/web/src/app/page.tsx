import Link from 'next/link';

// Neutral landing — do NOT redirect to /admin here.
// The mobile WebView lands on this page after sign-in but intercepts the
// auth token before any redirect renders. Web admins go to /admin directly.
export default function RootPage() {
  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#0D4C3E',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
      }}
    >
      <img
        src="https://dtvoeevhaseb5.cloudfront.net/user-uploads/b322290c-0a64-4272-b044-83fbf3d71d7e.png"
        alt="Scoolam"
        style={{ width: 128, height: 128, objectFit: 'contain' }}
      />
      <h1 style={{ color: '#fff', fontSize: 32, fontWeight: 800, margin: 0 }}>Scoolam</h1>
      <p style={{ color: '#A7C7C1', fontSize: 16, margin: 0 }}>Your Daily Learning App</p>
      <Link
        href="/admin"
        style={{
          marginTop: 24,
          backgroundColor: '#fff',
          color: '#0D4C3E',
          fontWeight: 700,
          padding: '12px 32px',
          borderRadius: 12,
          textDecoration: 'none',
          fontSize: 16,
        }}
      >
        Admin Portal →
      </Link>
    </div>
  );
}
