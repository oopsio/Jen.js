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

import { h } from "preact";
import type { FunctionComponent } from "preact";

interface NewsletterProps {
  endpoint: string;
}

const Newsletter: FunctionComponent<NewsletterProps> = ({ endpoint }) => {
  return (
    <div id="newsletter-form" data-island="Newsletter">
      <form>
        <div style={{ marginBottom: "1rem" }}>
          <input
            type="email"
            name="email"
            placeholder="Enter your email"
            required
            style={{
              width: "100%",
              padding: "0.75rem",
              border: "1px solid #ccc",
              borderRadius: "4px",
              fontSize: "1rem",
            }}
          />
        </div>
        <button type="submit" className="btn-primary" style={{ width: "100%" }}>
          Subscribe
        </button>
      </form>
      <script type="application/json">{JSON.stringify({ endpoint })}</script>
    </div>
  );
};

export default Newsletter;
