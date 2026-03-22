import { h } from 'preact';

// In a real Jen.js app, we'd pass the params from the RouterMap
// For now, this shows the component structure
export default function UserProfile() {
  // In the future, we will extract this from the URL via a Jen.js hook
  const userId =
    typeof window !== 'undefined'
      ? window.location.pathname.split('/').pop()
      : 'Loading...';

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>User Profile</h1>
      <div
        style={{ background: '#f4f4f4', padding: '20px', borderRadius: '10px' }}
      >
        <p>
          Viewing data for User ID:{' '}
          <span style={{ color: 'blue', fontWeight: 'bold' }}>{userId}</span>
        </p>
      </div>
      <br />
      <a href="/">← Back to Home</a>
    </div>
  );
}
