import { useState } from 'react';
import { acceptRoadmap, createRoadmapRequest, getRoadmapRequest, login, requestRevision } from '../api/projectMentorApi';

const demoStudent = { email: 'react.demo@projectmentor.local', password: 'Student123!', fullName: 'React Demo Student', yearOfStudy: 2 };
const showAgentModeIndicator = true;

export default function EndToEndPage() {
  const [token, setToken] = useState('');
  const [workflow, setWorkflow] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function startWorkflow() {
    setBusy(true); setError('');
    try {
      const session = await login(demoStudent);
      if (session.role !== 'Student') {
        throw new Error('The demo account does not have Student permissions. Re-run the database seed/migration.');
      }
      setToken(session.token);
      const created = await createRoadmapRequest(session.token, { year: 2, projectType: 'web', deadline: '2026-10-30', hoursPerWeek: 8 });
      setWorkflow(await getRoadmapRequest(session.token, created.roadmapRequestId));
    } catch (exception) {
      setError(exception.code === 'API_UNREACHABLE'
        ? exception.message
        : exception.status === 401
          ? 'Demo login failed — the seeded demo student is unavailable. Run the database migration/seed, then try again.'
          : exception.message);
    }
    finally { setBusy(false); }
  }

  async function decide(action) {
    setBusy(true); setError('');
    try {
      const updated = action === 'accept'
        ? await acceptRoadmap(token, workflow.id)
        : await requestRevision(token, workflow.id);
      setWorkflow(updated);
    } catch (exception) { setError(exception.message); }
    finally { setBusy(false); }
  }

  return (
    <main className="e2e-page">
      <p className="eyebrow">End-to-end skeleton</p>
      <h1>Roadmap pipeline</h1>
      <p>React - API - PostgreSQL - four agents - validation - student approval.</p>
      {!workflow && <><button className="button button-primary" disabled={busy} onClick={startWorkflow}>{busy ? 'Running workflow...' : 'Login and generate roadmap'}</button><small className="demo-note">This calls the live API and PostgreSQL database. No canned or scripted data.</small></>}
      {workflow && <section className="workflow-panel">
        <div><strong>Request:</strong> {workflow.requestStatus}</div>
        <div><strong>Roadmap:</strong> {workflow.status}</div>
        {showAgentModeIndicator && <p className="workflow-note">Agents: rule-based (Phase 1) — LLM reasoning coming in a later phase.</p>}
        <ol>{workflow.milestones.map(milestone => <li key={milestone.id}><strong>{milestone.phase}</strong> {milestone.title} <small>{milestone.dueDate} · {milestone.status}</small></li>)}</ol>
        {workflow.status === 'PendingApproval' && <div className="hero-actions"><button className="button button-primary" disabled={busy} onClick={() => decide('accept')}>Accept roadmap</button><button className="button button-quiet" disabled={busy} onClick={() => decide('revision')}>Request revision</button><small className="revision-note">Revision is recorded for a later re-plan; no new plan is generated yet.</small></div>}
      </section>}
      {error && <p className="error-message">{error}</p>}
    </main>
  );
}
