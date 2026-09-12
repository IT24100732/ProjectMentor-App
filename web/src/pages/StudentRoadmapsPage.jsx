import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { listRoadmapRequests } from '../api/projectMentorApi';
import { useAuth } from '../auth/AuthContext';

function getErrorMessage(error) {
  if (error.code === 'API_UNREACHABLE') return error.message;
  return error.message || 'Something went wrong. Please try again.';
}

function statusChipClass(requestStatus) {
  if (requestStatus === 'Accepted') return 'chip gold';
  return 'chip';
}

export default function StudentRoadmapsPage() {
  const { token, user } = useAuth();
  const [roadmaps, setRoadmaps] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const data = await listRoadmapRequests(token);
        setRoadmaps(data);
      } catch (exception) {
        setError(getErrorMessage(exception));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [token]);

  if (loading) {
    return (
      <main className="page">
        <p className="eyebrow">Student workspace</p>
        <h1>Loading your roadmaps…</h1>
      </main>
    );
  }

  return (
    <main className="page">
      <div className="page-head">
        <div>
          <p className="eyebrow">Student workspace</p>
          <h1>Your roadmaps</h1>
        </div>
        <Link to="/student" className="button button-primary">Start a new roadmap</Link>
      </div>
      <p className="page-lede">
        Each roadmap is a separate, independent project plan. Click a card to view milestones and manage approval.
      </p>

      {error && <p className="error-message" role="alert">{error}</p>}

      {!error && roadmaps?.length === 0 && (
        <section className="panel">
          <h2>No roadmaps yet</h2>
          <p className="note">You haven't generated any roadmaps yet. Start your first one now.</p>
          <div className="hero-actions" style={{ marginTop: '20px' }}>
            <Link to="/student" className="button button-primary">Start your first roadmap</Link>
          </div>
        </section>
      )}

      {roadmaps?.length > 0 && (
        <div className="roadmap-list">
          {roadmaps.map(roadmap => (
            <Link
              key={roadmap.id}
              to={`/student/roadmaps/${roadmap.id}`}
              className="panel roadmap-card"
            >
              <div className="roadmap-card-head">
                <h3 className="roadmap-card-title">{roadmap.displayTitle}</h3>
                <span className={statusChipClass(roadmap.requestStatus)}>{roadmap.requestStatus}</span>
              </div>
              <div className="roadmap-card-foot">
                <span className="roadmap-card-meta">
                  Due {roadmap.deadline}
                </span>
                <span className="roadmap-card-meta">
                  Created {new Date(roadmap.createdAt).toLocaleDateString()}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}

      <p className="demo-note">This calls the live API and PostgreSQL database. No canned or scripted data.</p>
    </main>
  );
}
