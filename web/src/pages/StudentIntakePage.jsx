import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { draftRoadmapRequest } from '../api/projectMentorApi';
import { useAuth } from '../auth/AuthContext';

const defaultIntake = { year: '2', projectType: 'web', deadline: '2026-11-30', hoursPerWeek: '8', title: '', teamSize: '1', technologies: '', leastConfident: '' };

function getErrorMessage(error) {
  if (error.code === 'API_UNREACHABLE') return error.message;
  return error.message || 'Something went wrong. Please try again.';
}

export default function StudentIntakePage() {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [intake, setIntake] = useState(defaultIntake);
  const [mode, setMode] = useState('suggest'); // 'suggest' = need ideas · 'own' = already have one
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  function updateIntake(event) {
    setIntake(current => ({ ...current, [event.target.name]: event.target.value }));
    setError('');
  }

  async function submitIntake(event) {
    event.preventDefault();
    setBusy(true);
    setError('');
    const payload = {
      year: Number(intake.year),
      projectType: intake.projectType,
      deadline: intake.deadline,
      hoursPerWeek: Number(intake.hoursPerWeek),
      teamSize: intake.teamSize ? Number(intake.teamSize) : null,
      technologies: intake.technologies.trim() || null,
      leastConfident: intake.leastConfident.trim() || null,
    };
    try {
      if (mode === 'suggest') {
        // Path A — create a draft, then go to the AI idea suggestions (then chat, then plan).
        const draft = await draftRoadmapRequest(token, payload);
        navigate(`/student/roadmaps/${draft.roadmapRequestId}/ideas`);
      } else {
        // Path B — student has an idea: create a draft, then straight to the mentor chat.
        const draft = await draftRoadmapRequest(token, { ...payload, title: intake.title.trim() || null });
        navigate(`/student/roadmaps/${draft.roadmapRequestId}/chat`, { state: { title: intake.title.trim() || null } });
      }
    } catch (exception) {
      setError(getErrorMessage(exception));
      setBusy(false);
    }
  }

  return (
    <main className="page">
      <div className="page-head">
        <div>
          <p className="eyebrow">Student workspace</p>
          <h1>Welcome, {user.fullName.split(' ')[0]}.</h1>
        </div>
      </div>
      <p className="page-lede">
        Answer a few questions and the agents will {mode === 'suggest' ? 'suggest project ideas, then build' : 'build'} a tailored, validated roadmap for you.
      </p>

      <section className="panel">
        <h2>Start a new project</h2>

        <div className="mode-toggle" role="tablist" aria-label="Do you have an idea?">
          <button type="button" role="tab" aria-selected={mode === 'suggest'} className={`mode-option${mode === 'suggest' ? ' active' : ''}`} onClick={() => setMode('suggest')}>
            <strong>Suggest ideas for me</strong>
            <span>The AI proposes projects that fit you.</span>
          </button>
          <button type="button" role="tab" aria-selected={mode === 'own'} className={`mode-option${mode === 'own' ? ' active' : ''}`} onClick={() => setMode('own')}>
            <strong>I already have an idea</strong>
            <span>Skip suggestions, go straight to the roadmap.</span>
          </button>
        </div>

        <form className="intake-grid" onSubmit={submitIntake}>
          <label className="form-field">Year of study
            <select name="year" value={intake.year} onChange={updateIntake}>
              <option value="1">Year 1</option>
              <option value="2">Year 2</option>
              <option value="3">Year 3</option>
              <option value="4">Year 4</option>
            </select>
          </label>
          <label className="form-field">Project type
            <select name="projectType" value={intake.projectType} onChange={updateIntake}>
              <option value="web">Web application</option>
              <option value="mobile">Mobile application</option>
              <option value="data">Data or AI project</option>
            </select>
          </label>
          <label className="form-field">Deadline
            <input name="deadline" type="date" value={intake.deadline} onChange={updateIntake} required />
          </label>
          <label className="form-field">Hours per week
            <input name="hoursPerWeek" type="number" min="1" value={intake.hoursPerWeek} onChange={updateIntake} required />
          </label>
          <label className="form-field">Team size
            <input name="teamSize" type="number" min="1" value={intake.teamSize} onChange={updateIntake} />
          </label>
          <label className="form-field">Technologies you know <span className="optional">optional</span>
            <input name="technologies" type="text" value={intake.technologies} onChange={updateIntake} placeholder="e.g. React, Node, SQL" />
          </label>
          <label className="form-field resource-form-wide">Areas you feel least confident about <span className="optional">optional</span>
            <input name="leastConfident" type="text" value={intake.leastConfident} onChange={updateIntake} placeholder="e.g. database design, deployment, presentation" />
          </label>
          {mode === 'own' && (
            <label className="form-field resource-form-wide">Your project title / idea
              <input name="title" type="text" value={intake.title} onChange={updateIntake} placeholder="e.g. Campus lost & found app" />
            </label>
          )}
          <button className="button button-primary" type="submit" disabled={busy}>
            {busy ? (mode === 'suggest' ? 'Thinking of ideas…' : 'Generating roadmap…') : (mode === 'suggest' ? 'Suggest project ideas →' : 'Generate roadmap →')}
          </button>
        </form>
      </section>

      <p className="demo-note">This calls the live API, PostgreSQL and the agentic AI. No canned or scripted data.</p>
      {error && <p className="error-message" role="alert">{error}</p>}
    </main>
  );
}
