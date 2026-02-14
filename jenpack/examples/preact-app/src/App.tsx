/*
 * This file is part of Jen.js.
 * Copyright (C) 2026 oopsio
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

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
