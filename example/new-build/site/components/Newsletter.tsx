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
