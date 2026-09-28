import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { acceptRoadmap, downloadRoadmapReport, getRoadmapRequest, requestRevision, updateMilestoneStatus } from '../api/projectMentorApi';
import { useAuth } from '../auth/AuthContext';

const STATUSES = [
  ['NotStarted', 'Not started'],
  ['InProgress', 'In progress'],
  ['Blocked', 'Blocked'],
  ['Done', 'Done'],
];
const STATUS_CLASS = { NotStarted: 'todo', InProgress: 'doing', Blocked: 'blocked', Done: 'done' };

function getErrorMessage(error) {
  if (error.code === 'API_UNREACHABLE') return error.message;
  return error.message || 'Something went wrong. Please try again.';
}

function isOverdue(m) {
  return m.status !== 'Done' && m.dueDate && new Date(m.dueDate) < new Date(new Date().toDateString());
}

// Read-only milestone list (used while the roadmap is still awaiting approval).
function MilestonePreview({ milestones }) {
  return (
    <ol className="milestones">
      {milestones.map(m => (
        <li className="milestone" key={m.id}>
          <div>
            <span className="phase">{m.phase}</span>
            <h4>{m.title}</h4>
            <small>{m.description}</small>
          </div>
          <div className="milestone-meta">
            <span>{m.dueDate}</span>
            <span>{m.status}</span>
            <span>{m.resources?.length ? '● resource attached' : '○ no resource'}</span>
          </div>
        </li>
      ))}
    </ol>
  );
}

// Interactive tracker (used once the roadmap is accepted).
function ProgressTracker({ milestones, onSetStatus, busyId }) {
  const total = milestones.length;
  const done = milestones.filter(m => m.status === 'Done').length;
  const percent = total === 0 ? 0 : Math.round((done / total) * 100);
  const overdue = milestones.filter(isOverdue).length;

  return (
    <div className="tracker">
      <div className="tracker-head">
        <div>
          <span className="tracker-count">{done}/{total} milestones</span>
          {overdue > 0 && <span className="tracker-overdue">{overdue} overdue</span>}
        </div>
        <span className="tracker-pct">{percent}%</span>
      </div>
      <div className="progress-bar"><span style={{ width: `${percent}%` }} /></div>

      <ol className="track-list">
        {milestones.map(m => (
          <li className={`track-item ${STATUS_CLASS[m.status] || 'todo'}${isOverdue(m) ? ' overdue' : ''}`} key={m.id}>
            <span className="track-node" aria-hidden="true" />
            <div className="track-body">
              <div className="track-top">
                <span className="phase">{m.phase}</span>
                {isOverdue(m) && <span className="overdue-badge">Overdue</span>}
                <span className="track-due">Due {m.dueDate}</span>
              </div>
              <h4>{m.title}</h4>
              <small>{m.description}</small>
              <div className="status-picker" role="group" aria-label={`Status for ${m.title}`}>
                {STATUSES.map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    className={`status-opt ${STATUS_CLASS[value]}${m.status === value ? ' active' : ''}`}
                    disabled={busyId === m.id}
                    onClick={() => onSetStatus(m.id, value)}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

export default function StudentRoadmapDetailPage() {
  const { id } = useParams();
  const { token } = useAuth();
  const [workflow, setWorkflow] = useState(undefined);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [busy, setBusy] = useState(false);
  const [busyMilestone, setBusyMilestone] = useState('');
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState('');

  async function loadRoadmap() {
    try {
      setWorkflow(await getRoadmapRequest(token, id));
    } catch (exception) {
      if (exception.status === 404) setNotFound(true);
      else setError(getErrorMessage(exception));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadRoadmap(); }, [token, id]);

  useEffect(() => {
    if (!workflow || !['Submitted', 'Planning'].includes(workflow.requestStatus)) return undefined;
    const timer = window.setInterval(loadRoadmap, 1500);
    return () => window.clearInterval(timer);
  }, [workflow, token, id]);

  async function decide(action) {
    setBusy(true); setError('');
    try {
      const updated = action === 'accept' ? await acceptRoadmap(token, workflow.id) : await requestRevision(token, workflow.id);
      setWorkflow(updated);
    } catch (exception) {
      setError(getErrorMessage(exception));
    } finally {
      setBusy(false);
    }
  }

  async function download() {
    setDownloading(true); setError('');
    try {
      const { blob, filename } = await downloadRoadmapReport(token, id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = filename;
      document.body.appendChild(a); a.click(); a.remove();
      URL.revokeObjectURL(url);
    } catch (exception) {
      setError(getErrorMessage(exception));
    } finally {
      setDownloading(false);
    }
  }

  async function setStatus(milestoneId, status) {
    setBusyMilestone(milestoneId); setError('');
    try {
      const updated = await updateMilestoneStatus(token, milestoneId, status);
      setWorkflow(w => ({ ...w, milestones: w.milestones.map(m => (m.id === milestoneId ? updated : m)) }));
    } catch (exception) {
      setError(getErrorMessage(exception));
    } finally {
      setBusyMilestone('');
    }
  }

  if (loading) return <main className="page"><p className="eyebrow">Student workspace</p><h1>Loading roadmap…</h1></main>;
  if (notFound) return (
    <main className="page">
      <p className="eyebrow">Student workspace</p>
      <h1>Roadmap not found</h1>
      <p className="page-lede">This roadmap doesn't exist or doesn't belong to your account.</p>
      <div className="hero-actions" style={{ marginTop: '24px' }}><Link to="/student/roadmaps" className="button button-primary">Back to your roadmaps</Link></div>
    </main>
  );

  const isProcessing = workflow && ['Submitted', 'Planning'].includes(workflow.requestStatus);
  const isAwaitingApproval = workflow?.status === 'PendingApproval';
  const isActive = workflow?.status === 'Accepted';

  return (
    <main className="page">
      <div className="page-head">
        <div>
          <p className="eyebrow">{isActive ? 'Progress tracker' : 'Student workspace'}</p>
          <h1>{workflow?.title || 'Roadmap detail'}</h1>
        </div>
        <Link to="/student/roadmaps" className="button button-quiet button-small">← All roadmaps</Link>
      </div>
      <p className="page-lede">
        {isActive ? 'Track your milestones — set each one In progress, Blocked or Done. Overdue items are flagged.' : "Review your generated plan below. Once you're happy, accept it to lock in your milestones."}
      </p>

      {isProcessing && (
        <section className="panel">
          <h2>Generating your roadmap</h2>
          <p className="note">The workflow is planning, attaching resources, and validating your milestones. This only takes a moment.</p>
        </section>
      )}

      {(isAwaitingApproval || isActive) && (
        <section className="panel">
          <div className="status-row">
            <span className="chip">Request · {workflow.requestStatus}</span>
            <span className="chip gold">Roadmap · {workflow.status}</span>
          </div>
          <p style={{ margin: '10px 0 0' }}><Link className="resource-link" to={`/student/roadmaps/${id}/workflow`}>See how the AI built this →</Link></p>

          {isActive
            ? <ProgressTracker milestones={workflow.milestones} onSetStatus={setStatus} busyId={busyMilestone} />
            : <MilestonePreview milestones={workflow.milestones} />}

          {isActive && (
            <div className="hero-actions">
              <button className="button button-primary" disabled={downloading} onClick={download}>
                {downloading ? 'Preparing report…' : '⬇ Download project report'}
              </button>
            </div>
          )}

          {isAwaitingApproval && (
            <div className="hero-actions">
              <button className="button button-primary" disabled={busy} onClick={() => decide('accept')}>Accept roadmap</button>
              <button className="button button-quiet" disabled={busy} onClick={() => decide('revision')}>Request revision</button>
            </div>
          )}
        </section>
      )}

      {!isProcessing && !isAwaitingApproval && !isActive && workflow && (
        <section className="panel">
          <div className="status-row"><span className="chip">Request · {workflow.requestStatus}</span></div>
          <p className="note" style={{ marginTop: '16px' }}>This roadmap request has status: {workflow.requestStatus}.</p>
        </section>
      )}

      <p className="demo-note">This calls the live API and PostgreSQL database. No canned or scripted data.</p>
      {error && <p className="error-message" role="alert">{error}</p>}
    </main>
  );
}
