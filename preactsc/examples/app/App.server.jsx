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
