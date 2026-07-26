'use client';

export default function SubscriptionSuccessPage() {
  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#0D4C3E',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        textAlign: 'center',
      }}
    >
      <div style={{ fontSize: 72, marginBottom: 24 }}>🎉</div>
      <h1 style={{ color: '#fff', fontSize: 32, fontWeight: 800, marginBottom: 12 }}>
        You're Now Premium!
      </h1>
      <p style={{ color: '#A7C7C1', fontSize: 16, maxWidth: 320, lineHeight: 1.6 }}>
        Your subscription is active. Go back to the Scoolam app and enjoy unlimited access to all
        content!
      </p>
      <div
        style={{
          marginTop: 32,
          backgroundColor: 'rgba(255,255,255,0.1)',
          borderRadius: 16,
          padding: '20px 32px',
        }}
      >
        <p style={{ color: '#FCD34D', fontWeight: 700, fontSize: 15 }}>
          ✅ Return to the Scoolam app to continue learning
        </p>
      </div>
    </div>
  );
}
