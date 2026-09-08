import { Link } from 'react-router-dom';

export default function LoginPage() {
  return (
    <main className="placeholder-page">
      <p className="eyebrow">ProjectMentor access</p>
      <h1>Log in</h1>
      <p>Authentication will connect this entry point to the ASP.NET API.</p>
      <div className="hero-actions">
        <Link className="button button-primary" to="/">Back to home</Link>
        <Link className="button button-quiet" to="/register">Create an account</Link>
      </div>
    </main>
  );
}
