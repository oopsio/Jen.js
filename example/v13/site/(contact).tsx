import { h } from "preact";

export default function Contact() {
  return (
    <div>
      <header>
        <nav>
          <h1>Jen.js SSG</h1>
          <ul>
            <li>
              <a href="/">Home</a>
            </li>
            <li>
              <a href="/about">About</a>
            </li>
            <li>
              <a href="/contact">Contact</a>
            </li>
          </ul>
          <button className="btn-primary">Get Started</button>
        </nav>
      </header>

      <main>
        <section className="hero">
          <h1>Get In Touch</h1>
          <p>Have questions? We'd love to hear from you.</p>
        </section>

        <section style={{ maxWidth: "600px", margin: "2rem auto" }}>
          <form
            style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}
          >
            <div>
              <label
                htmlFor="name"
                style={{
                  display: "block",
                  marginBottom: "0.5rem",
                  fontWeight: "600",
                }}
              >
                Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
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

            <div>
              <label
                htmlFor="email"
                style={{
                  display: "block",
                  marginBottom: "0.5rem",
                  fontWeight: "600",
                }}
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
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

            <div>
              <label
                htmlFor="message"
                style={{
                  display: "block",
                  marginBottom: "0.5rem",
                  fontWeight: "600",
                }}
              >
                Message
              </label>
              <textarea
                id="message"
                name="message"
                rows={5}
                required
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  border: "1px solid #ccc",
                  borderRadius: "4px",
                  fontSize: "1rem",
                  fontFamily: "inherit",
                }}
              />
            </div>

            <button
              type="submit"
              className="btn-primary"
              style={{ alignSelf: "flex-start" }}
            >
              Send Message
            </button>
          </form>

          <div
            style={{
              marginTop: "3rem",
              padding: "2rem",
              background: "#f9fafb",
              borderRadius: "8px",
            }}
          >
            <h3>Other Ways to Reach Us</h3>
            <ul style={{ listStyle: "none", paddingLeft: 0 }}>
              <li>📧 Email: hello@example.com</li>
              <li>🐦 Twitter: @jenjs</li>
              <li>💬 Discord: Join our community</li>
            </ul>
          </div>
        </section>
      </main>

      <footer>
        <p>© 2024 Jen.js SSG Example. All rights reserved.</p>
      </footer>
    </div>
  );
}

export function Head() {
  return (
    <>
      <title>Contact - Jen.js SSG</title>
      <meta
        name="description"
        content="Contact us for questions about Jen.js or to get support for your static site project."
      />
    </>
  );
}
