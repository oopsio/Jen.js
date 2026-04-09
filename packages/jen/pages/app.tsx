import { Partial } from '../src/components/partial.js';
import { PartialRegistry } from '../src/core/partials.js';
import Header from './partials/Header.js';
import Card from './partials/Card.js';

// Explicitly register partials for this page
PartialRegistry.register('header', Header);
PartialRegistry.register('card', Card);

// Alternatively, you could use:
// PartialRegistry.registerGlob(import.meta.glob('./partials/*.tsx', { eager: true }));

export default function HomePage() {
  const time = new Date().toLocaleString();
  return (
    <div style={{ fontFamily: 'sans-serif' }}>
      <Partial name="header" title="Jen.js Framework" />

      <main style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
        <h2>Welcome to Jen.js</h2>
        <p>
          Freshly server-rendered at: <strong>{time}</strong>
        </p>

        <Partial
          name="card"
          title="Dynamic Partials"
          description="This card is heavily decoupled! It is being rendered dynamically from the PartialRegistry."
        />

        <Partial
          name="card"
          title="Seamless Props"
          description="You can pass any props directly into the <Partial> tag, and they will cascade down to the target partial component."
        />
      </main>
    </div>
  );
}
