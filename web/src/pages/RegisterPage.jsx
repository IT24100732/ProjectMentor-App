import { Link } from 'react-router-dom';

export default function RegisterPage() {
  return (
    <main className="placeholder-page">
      <p className="eyebrow">Start with your project</p>
      <h1>Create your roadmap</h1>
      <p>The structured intake form will be built here before the planning workspace.</p>
      <div className="hero-actions">
        <Link className="button button-primary" to="/">Back to home</Link>
        <Link className="button button-quiet" to="/login">Log in</Link>
      </div>
    </main>
  );
}
