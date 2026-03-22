import { useRouter } from '../../../src/client/router';
import { Link } from '../../../src/client/link';

export default function UserProfile() {
  const router = useRouter();

  // In a real implementation, we'd extract the ID from the URL or router state
  const userId =
    typeof window !== 'undefined'
      ? window.location.pathname.split('/').pop()
      : '...';

  return (
    <div
      style={{ padding: '40px', fontFamily: 'monospace', textAlign: 'center' }}
    >
      <h2
        style={{
          background: '#000',
          color: '#00ff00',
          padding: '10px',
          display: 'inline-block',
        }}
      >
        USER_PROFILE: {userId}
      </h2>

      <div
        style={{
          marginTop: '30px',
          border: '2px solid #000',
          padding: '20px',
          boxShadow: '8px 8px 0px #000',
        }}
      >
        <p>
          This is a dynamic route for User ID: <strong>{userId}</strong>
        </p>
        <p>Current Path: {router.path}</p>
      </div>

      <div style={{ marginTop: '30px' }}>
        <Link
          href="/"
          style={{
            background: '#ff00ff',
            color: '#fff',
            padding: '10px 20px',
            textDecoration: 'none',
            fontWeight: 'bold',
            border: '2px solid #000',
            boxShadow: '4px 4px 0px #000',
          }}
        >
          BACK TO HOME
        </Link>
      </div>
    </div>
  );
}
