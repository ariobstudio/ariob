import { Layout } from './components/Layout';

export function App() {
  return (
    <Layout title="Security Encryption Authentication">
      <text className="Description">
        Welcome to the SEA (Security Encryption Authentication) Demo
      </text>
      <text className="Hint">
        This is a demonstration of SEA's cryptographic capabilities.
      </text>
      <text className="Hint">
        Use the navigation to explore the different demo steps.
      </text>
    </Layout>
  );
}
