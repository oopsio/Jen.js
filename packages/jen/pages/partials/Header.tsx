export default function Header({ title }: { title: string }) {
  return (
    <header
      style={{ padding: '1rem', backgroundColor: '#333', color: 'white' }}
    >
      <h2>{title}</h2>
      <nav>
        <a href="/" style={{ color: 'lightblue', marginRight: '1rem' }}>
          Home
        </a>
        <a href="/about" style={{ color: 'lightblue' }}>
          About
        </a>
      </nav>
    </header>
  );
}
