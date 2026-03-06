import { h } from "preact";

interface FooterProps {
  year?: number;
  author?: string;
}

export default function Footer({
  year = new Date().getFullYear(),
  author = "Jen.js Blog",
}: FooterProps) {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <h4>About</h4>
            <p>
              A modern blog built with Jen.js, showcasing fast, beautiful web
              design.
            </p>
          </div>
          <div className="footer-section">
            <h4>Links</h4>
            <ul>
              <li>
                <a href="/">Home</a>
              </li>
              <li>
                <a href="/blog">Blog</a>
              </li>
              <li>
                <a
                  href="https://github.com/oopsio/jen.js"
                  target="_blank"
                  rel="noopener"
                >
                  GitHub
                </a>
              </li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Follow</h4>
            <ul>
              <li>
                <a href="#twitter">Twitter</a>
              </li>
              <li>
                <a href="#github">GitHub</a>
              </li>
              <li>
                <a href="#discord">Discord</a>
              </li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>
            &copy; {year} {author}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
