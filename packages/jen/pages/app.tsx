import { h } from 'preact';
import { useState } from 'preact/hooks';

export default function Counter() {
  const [count, setCount] = useState(0);

  // Old School 2014-2018 Minimalist UI
  const containerStyle = {
    padding: '40px',
    fontFamily: 'system-ui, sans-serif',
    textAlign: 'center',
    color: 'var(--jen-text)',
    background: 'var(--jen-bg)',
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center'
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
    fontFamily: 'monospace'
  };

  return (
    <div style={containerStyle}>
      <h1 style={{ fontSize: '48px', marginBottom: '20px' }}>{count}</h1>
      <div style={{ display: 'flex', gap: '10px' }}>
        <button 
          style={buttonStyle} 
          onClick={() => setCount(count - 1)}
        >
          - DECREMENT
        </button>
        <button 
          style={buttonStyle} 
          onClick={() => setCount(count + 1)}
        >
          + INCREMENT
        </button>
      </div>
      <p style={{ marginTop: '20px', color: '#888', fontSize: '12px' }}>
        JEN.JS STATE PERSISTENCE TEST
      </p>
    </div>
  );
}