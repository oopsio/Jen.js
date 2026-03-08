import { FunctionComponent, h } from "preact";

interface HeaderProps {
  title: string;
  description?: string;
}

const Header: FunctionComponent<HeaderProps> = ({ title, description }) => {
  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white shadow-sm">
      <nav className="container mx-auto flex items-center justify-between px-4 py-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-primary-600 to-accent-600 text-white font-bold">
            J
          </div>
          <h1 className="text-xl font-bold text-gray-900">{title}</h1>
        </div>

        <ul className="flex gap-6">
          <li>
            <a
              href="/"
              className="font-medium text-gray-700 hover:text-primary-600 transition-colors"
            >
              Home
            </a>
          </li>
          <li>
            <a
              href="/about"
              className="font-medium text-gray-700 hover:text-primary-600 transition-colors"
            >
              About
            </a>
          </li>
          <li>
            <a
              href="/docs"
              className="font-medium text-gray-700 hover:text-primary-600 transition-colors"
            >
              Docs
            </a>
          </li>
          <li>
            <a
              href="/contact"
              className="font-medium text-gray-700 hover:text-primary-600 transition-colors"
            >
              Contact
            </a>
          </li>
        </ul>

        <button className="btn-primary">Get Started</button>
      </nav>

      {description && (
        <div className="border-t border-gray-100 bg-gray-50 px-4 py-3">
          <p className="container mx-auto text-sm text-gray-600">
            {description}
          </p>
        </div>
      )}
    </header>
  );
};

export default Header;
