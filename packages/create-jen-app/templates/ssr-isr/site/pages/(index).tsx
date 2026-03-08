export default function HomePage() {
  return (
    <main>
      <h1>Welcome to Jen.js (SSR + ISR)</h1>
      <p>
        This is a server-rendered page with incremental static regeneration.
      </p>
      <p>Current time: {new Date().toLocaleString()}</p>
    </main>
  );
}
