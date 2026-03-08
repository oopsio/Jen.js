import { useState } from "preact/hooks";
import { Counter } from "./Counter.js";
import "./App.css";

export function App() {
  const [count, setCount] = useState(0);

  return (
    <div class="app">
      <header>
        <h1>Jenpack + Preact</h1>
        <p>Modern bundler for the Jen.js ecosystem</p>
      </header>
      <main>
        <Counter initial={count} onChange={setCount} />
        <section>
          <h2>Features</h2>
          <ul>
            <li>⚡️ Fast SWC-based bundling</li>
            <li>🔥 Hot module reload</li>
            <li>📦 Smart code splitting</li>
            <li>🎯 TypeScript & JSX support</li>
          </ul>
        </section>
      </main>
    </div>
  );
}
