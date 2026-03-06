import { h } from "preact";

interface HeaderProps {
  title?: string;
  description?: string;
}

export default function Header({
  title = "Jen.js Blog",
  description = "Modern blogging with Jen.js",
}: HeaderProps) {
  return (
    <header className="header">
      <div className="container">
        <nav className="navbar">
          <div className="logo">
            <a href="/">
              <span className="logo-text">{title}</span>
            </a>
          </div>
          <ul className="nav-links">
            <li>
              <a href="/">Home</a>
            </li>
            <li>
              <a href="/blog">Blog</a>
            </li>
            <li>
              <a href="/about">About</a>
            </li>
            <li>
              <a href="/contact">Contact</a>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
