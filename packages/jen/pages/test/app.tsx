import { Link } from '../../src/client/link';

export default function TestPage() {
  return (
    <div
      style={{ padding: '40px', textAlign: 'center', fontFamily: 'sans-serif' }}
    >
      <h1 style={{ color: '#00ff00' }}>Test Page</h1>
      <p>This page was loaded via soft navigation!</p>

      <div style={{ marginTop: '20px' }}>
        <Link href="/" style={{ color: '#ff00ff', fontWeight: 'bold' }}>
          ← BACK TO HOME
        </Link>
      </div>
    </div>
  );
}
