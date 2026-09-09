import { Link } from 'react-router-dom';

export default function FeaturePlaceholderPage({ eyebrow, title, description }) {
  return (
    <main className="placeholder-page">
      <p className="eyebrow">{eyebrow}</p>
      <h1>{title}</h1>
      <p>{description}</p>
      <Link className="button button-primary" to="/">Back to home</Link>
    </main>
  );
}
