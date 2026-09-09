import { Link } from 'react-router-dom';
import IntakeChat from '../components/IntakeChat';
import GuideCharacter from '../components/GuideCharacter';

export default function RegisterPage() {
  return (
    <main className="intake-page">
      <div className="intake-page-top">
        <Link className="brand" to="/" aria-label="ProjectMentor home"><span className="brand-star" aria-hidden="true">PM</span>PROJECT MENTOR</Link>
        <Link className="button button-quiet" to="/login">Already have an account?</Link>
      </div>
      <IntakeChat />
      <p className="intake-note"><Link to="/">Back to homepage</Link> · Your answers will be used to size and validate your roadmap.</p>
      <GuideCharacter initialPose="questions" message="We will take this one answer at a time. Your project does not need to be figured out all at once." />
    </main>
  );
}
