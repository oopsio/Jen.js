import Counter from "./Counter.client.jsx";

export default function App() {
  return (
    <div style={{ fontFamily: "system-ui, sans-serif", padding: "20px" }}>
      <h1>Hello Preact Server Components</h1>
      <p>This component runs on the server.</p>

      <Counter initial={5} />

      <hr />

      <section>
        <h2>About PRSC</h2>
        <p>
          Server components can use any Node.js APIs. Client components run in
          the browser.
        </p>
      </section>
    </div>
  );
}
