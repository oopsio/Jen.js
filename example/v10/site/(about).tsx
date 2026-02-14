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

export default function About() {
  return (
    <main className="about">
      <header className="page-header">
        <h1>About This Blog</h1>
      </header>

      <article className="about-content">
        <section>
          <h2>Our Mission</h2>
          <p>
            We believe in sharing knowledge and helping developers build better
            applications. This blog is dedicated to providing practical
            insights, tutorials, and best practices for modern web development.
          </p>
        </section>

        <section>
          <h2>What We Cover</h2>
          <ul>
            <li>Web framework tutorials</li>
            <li>TypeScript and JavaScript best practices</li>
            <li>Full-stack development patterns</li>
            <li>Performance optimization</li>
            <li>Developer productivity tips</li>
          </ul>
        </section>

        <section>
          <h2>Meet the Authors</h2>
          <div className="authors">
            <div className="author">
              <h3>Sarah Chen</h3>
              <p>Full-stack developer with 8+ years of experience</p>
            </div>
            <div className="author">
              <h3>Alex Rivera</h3>
              <p>DevOps engineer and cloud architecture specialist</p>
            </div>
            <div className="author">
              <h3>Jordan Park</h3>
              <p>Frontend expert and TypeScript enthusiast</p>
            </div>
          </div>
        </section>

        <section>
          <h2>Get In Touch</h2>
          <p>Have feedback or want to contribute? Reach out to us:</p>
          <ul>
            <li>Email: hello@example.com</li>
            <li>Twitter: @blogexample</li>
            <li>GitHub: github.com/blogexample</li>
          </ul>
        </section>
      </article>

      <nav className="back-link">
        <a href="/">← Back to Blog</a>
      </nav>
    </main>
  );
}

export function Head() {
  return (
    <>
      <title>About - Our Blog</title>
      <meta
        name="description"
        content="Learn about our blog and the authors behind it."
      />
    </>
  );
}
