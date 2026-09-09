import { Link } from 'react-router-dom';
import GuideCharacter from '../components/GuideCharacter';

export default function LoginPage() {
  return (
    <main className="placeholder-page">
      <p className="eyebrow">ProjectMentor access</p>
      <h1>Log in</h1>
      <p>Authentication will connect this entry point to the ASP.NET API. Mira will keep your active roadmap close once the account flow is connected.</p>
      <div className="hero-actions">
        <Link className="button button-primary" to="/">Back to home</Link>
        <Link className="button button-quiet" to="/register">Create an account</Link>
      </div>
      <GuideCharacter initialPose="review" message="Welcome back. Once you log in, I can help you pick up the milestone you left unfinished." />
    </main>
  );
}
