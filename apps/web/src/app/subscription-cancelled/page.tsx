'use client';

export default function SubscriptionCancelledPage() {
  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#F9FAFB',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        textAlign: 'center',
      }}
    >
      <div style={{ fontSize: 64, marginBottom: 24 }}>😔</div>
      <h1 style={{ color: '#111827', fontSize: 28, fontWeight: 800, marginBottom: 12 }}>
        Payment Cancelled
      </h1>
      <p style={{ color: '#6B7280', fontSize: 15, maxWidth: 300, lineHeight: 1.6 }}>
        No charge was made. Return to the Scoolam app and try again whenever you're ready.
      </p>
    </div>
  );
}
