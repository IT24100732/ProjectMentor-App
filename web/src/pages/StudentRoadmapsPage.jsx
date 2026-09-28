import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { deleteRoadmapRequest, listRoadmapRequests, renameRoadmapRequest } from '../api/projectMentorApi';
import { useAuth } from '../auth/AuthContext';

function getErrorMessage(error) {
  if (error.code === 'API_UNREACHABLE') return error.message;
  return error.message || 'Something went wrong. Please try again.';
}

function statusChipClass(requestStatus) {
  return requestStatus === 'Accepted' ? 'chip gold' : 'chip';
}

export default function StudentRoadmapsPage() {
  const { token } = useAuth();
  const [roadmaps, setRoadmaps] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [busyId, setBusyId] = useState('');

  async function load() {
    try {
      setRoadmaps(await listRoadmapRequests(token));
    } catch (exception) {
      setError(getErrorMessage(exception));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [token]);

  function startEdit(roadmap) {
    setEditingId(roadmap.id);
    setEditTitle(roadmap.displayTitle);
  }

  async function saveEdit(id) {
    setBusyId(id); setError('');
    try {
      await renameRoadmapRequest(token, id, editTitle.trim() || null);
      setEditingId('');
      await load();
    } catch (exception) {
      setError(getErrorMessage(exception));
    } finally {
      setBusyId('');
    }
  }

  async function remove(roadmap) {
    if (!window.confirm(`Delete "${roadmap.displayTitle}"? This permanently removes the roadmap and its progress.`)) return;
    setBusyId(roadmap.id); setError('');
    try {
      await deleteRoadmapRequest(token, roadmap.id);
      setRoadmaps(list => list.filter(r => r.id !== roadmap.id));
    } catch (exception) {
      setError(getErrorMessage(exception));
    } finally {
      setBusyId('');
    }
  }

  if (loading) {
    return <main className="page"><p className="eyebrow">Student workspace</p><h1>Loading your roadmaps…</h1></main>;
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
      <p className="page-lede">Each roadmap is a separate, independent project. Open one to track progress — or rename and delete from here.</p>

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
            <article className="panel roadmap-card" key={roadmap.id}>
              <div className="roadmap-card-head">
                {editingId === roadmap.id
                  ? <input className="roadmap-rename" value={editTitle} onChange={e => setEditTitle(e.target.value)} autoFocus />
                  : <Link to={`/student/roadmaps/${roadmap.id}`} className="roadmap-card-title">{roadmap.displayTitle}</Link>}
                <span className={statusChipClass(roadmap.requestStatus)}>{roadmap.requestStatus}</span>
              </div>

              {roadmap.roadmapStatus === 'Accepted' && roadmap.milestoneCount > 0 && (
                <div className="card-progress">
                  <div className="progress-bar"><span style={{ width: `${roadmap.progressPercent}%` }} /></div>
                  <div className="card-progress-meta">
                    <span>{roadmap.doneCount}/{roadmap.milestoneCount} done · {roadmap.progressPercent}%</span>
                    {roadmap.overdueCount > 0 && <span className="tracker-overdue">{roadmap.overdueCount} overdue</span>}
                  </div>
                </div>
              )}

              <div className="roadmap-card-foot">
                <span className="roadmap-card-meta">Due {roadmap.deadline} · created {new Date(roadmap.createdAt).toLocaleDateString()}</span>
                <span className="roadmap-actions">
                  {editingId === roadmap.id ? (
                    <>
                      <button type="button" className="button button-primary button-small" disabled={busyId === roadmap.id} onClick={() => saveEdit(roadmap.id)}>Save</button>
                      <button type="button" className="button button-quiet button-small" onClick={() => setEditingId('')}>Cancel</button>
                    </>
                  ) : (
                    <>
                      <button type="button" className="button button-quiet button-small" disabled={busyId === roadmap.id} onClick={() => startEdit(roadmap)}>Rename</button>
                      <button type="button" className="button button-danger button-small" disabled={busyId === roadmap.id} onClick={() => remove(roadmap)}>Delete</button>
                    </>
                  )}
                </span>
              </div>
            </article>
          ))}
        </div>
      )}

      <p className="demo-note">This calls the live API and PostgreSQL database. No canned or scripted data.</p>
    </main>
  );
}
