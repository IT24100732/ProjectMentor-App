import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { acceptRoadmap, getRoadmapRequest, requestRevision } from '../api/projectMentorApi';
import { useAuth } from '../auth/AuthContext';

const showAgentModeIndicator = true;

function getErrorMessage(error) {
  if (error.code === 'API_UNREACHABLE') return error.message;
  return error.message || 'Something went wrong. Please try again.';
}

function MilestoneList({ milestones }) {
  return (
    <ol className="milestones">
      {milestones.map(milestone => (
        <li className="milestone" key={milestone.id}>
          <div>
            <span className="phase">{milestone.phase}</span>
            <h4>{milestone.title}</h4>
            <small>{milestone.description}</small>
          </div>
          <div className="milestone-meta">
            <span>{milestone.dueDate}</span>
            <span>{milestone.status}</span>
            <span>{milestone.resources?.length ? '● resource attached' : '○ no resource'}</span>
          </div>
        </li>
      ))}
    </ol>
  );
}

export default function StudentRoadmapDetailPage() {
  const { id } = useParams();
  const { token } = useAuth();
  const [workflow, setWorkflow] = useState(undefined);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function loadRoadmap() {
    try {
      const data = await getRoadmapRequest(token, id);
      setWorkflow(data);
    } catch (exception) {
      if (exception.status === 404) {
        setNotFound(true);
      } else {
        setError(getErrorMessage(exception));
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRoadmap();
  }, [token, id]);

  // Poll every 1.5 s while the workflow is still processing
  useEffect(() => {
    if (!workflow || !['Submitted', 'Planning'].includes(workflow.requestStatus)) return undefined;
    const timer = window.setInterval(loadRoadmap, 1500);
    return () => window.clearInterval(timer);
  }, [workflow, token, id]);

  async function decide(action) {
    setBusy(true);
    setError('');
    try {
      const updated = action === 'accept'
        ? await acceptRoadmap(token, workflow.id)
        : await requestRevision(token, workflow.id);
      setWorkflow(updated);
    } catch (exception) {
      setError(getErrorMessage(exception));
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <main className="page">
        <p className="eyebrow">Student workspace</p>
        <h1>Loading roadmap…</h1>
      </main>
    );
  }

  if (notFound) {
    return (
      <main className="page">
        <p className="eyebrow">Student workspace</p>
        <h1>Roadmap not found</h1>
        <p className="page-lede">This roadmap doesn't exist or doesn't belong to your account.</p>
        <div className="hero-actions" style={{ marginTop: '24px' }}>
          <Link to="/student/roadmaps" className="button button-primary">Back to your roadmaps</Link>
        </div>
      </main>
    );
  }

  const isProcessing = workflow && ['Submitted', 'Planning'].includes(workflow.requestStatus);
  const isAwaitingApproval = workflow?.status === 'PendingApproval';
  const isActive = workflow?.status === 'Accepted';

  return (
    <main className="page">
      <div className="page-head">
        <div>
          <p className="eyebrow">Student workspace</p>
          <h1>Roadmap detail</h1>
        </div>
        <Link to="/student/roadmaps" className="button button-quiet">← All roadmaps</Link>
      </div>
      <p className="page-lede">
        Review your generated plan below. Once you're happy, accept it to lock in your milestones.
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
          {showAgentModeIndicator && <p className="note">Agents: rule-based (Phase 1) — LLM reasoning arrives in a later phase.</p>}
          <MilestoneList milestones={workflow.milestones} />
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
          <div className="status-row">
            <span className="chip">Request · {workflow.requestStatus}</span>
          </div>
          <p className="note" style={{ marginTop: '16px' }}>This roadmap request has status: {workflow.requestStatus}.</p>
        </section>
      )}

      <p className="demo-note">This calls the live API and PostgreSQL database. No canned or scripted data.</p>
      {error && <p className="error-message" role="alert">{error}</p>}
    </main>
  );
}
