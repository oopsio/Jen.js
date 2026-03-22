import { useState } from 'preact/hooks';
import { GoogleFont } from '../src/fonts/google';
import { Link } from '../src/client/link';

const inter = GoogleFont('Inter', {
  weight: [400, 700],
  subsets: ['latin'],
  display: 'swap',
});

export default function Counter() {
  const [count, setCount] = useState(0);

  const containerStyle = {
    padding: '40px',
    fontFamily: `${inter.style.fontFamily}, system-ui, sans-serif`,
    textAlign: 'center',
    color: 'var(--jen-text)',
    background: 'var(--jen-bg)',
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  };

  const buttonStyle = {
    padding: '12px 24px',
    fontSize: '18px',
    cursor: 'pointer',
    background: '#00ff00',
    border: '2px solid #000',
    fontWeight: 'bold',
    margin: '10px',
    boxShadow: '4px 4px 0px #000',
    fontFamily: 'monospace',
  };



  return (
    <div style={containerStyle}>
      <h1 style={{ fontSize: '48px', marginBottom: '20px' }}>{count}</h1>
      <div style={{ display: 'flex', gap: '10px' }}>
        <button style={buttonStyle} onClick={() => setCount(count - 1)}>
          - DECREMENT
        </button>
        <button style={buttonStyle} onClick={() => setCount(count + 1)}>
          + INCREMENT
        </button>
      </div>

      <div
        style={{
          marginTop: '30px',
          display: 'flex',
          flexDirection: 'column',
          gap: '15px',
        }}
      >
        <Link
          href="/test"
          style={{
            color: '#00ff00',
            fontWeight: 'bold',
            textDecoration: 'none',
            fontSize: '18px',
          }}
        >
          → GO TO TEST PAGE (Link Component)
        </Link>
      </div>
      <p style={{ marginTop: '40px', color: '#888', fontSize: '12px' }}>
        JEN.JS CLIENT ROUTER TEST (v1.0.0)
      </p>
    </div>
  );
}
