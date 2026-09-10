import { Link } from 'react-router-dom';
import GuideCharacter from '../components/GuideCharacter';

export default function FeaturePlaceholderPage({ eyebrow, title, description, miraPose = 'roadmap', miraMessage }) {
  return (
    <main className="placeholder-page">
      <p className="eyebrow">{eyebrow}</p>
      <h1>{title}</h1>
      <p>{description}</p>
      <Link className="button button-primary" to="/">Back to home</Link>
      <GuideCharacter initialPose={miraPose} message={miraMessage} />
    </main>
  );
}
