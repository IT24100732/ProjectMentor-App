import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createRoadmapRequest } from '../api/projectMentorApi';
import { useAuth } from '../auth/AuthContext';

const defaultIntake = { year: '2', projectType: 'web', deadline: '2026-10-30', hoursPerWeek: '8' };

function getErrorMessage(error) {
  if (error.code === 'API_UNREACHABLE') return error.message;
  return error.message || 'Something went wrong. Please try again.';
}

export default function StudentIntakePage() {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [intake, setIntake] = useState(defaultIntake);
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
    try {
      const created = await createRoadmapRequest(token, {
        year: Number(intake.year),
        projectType: intake.projectType,
        deadline: intake.deadline,
        hoursPerWeek: Number(intake.hoursPerWeek),
      });
      // Navigate to the specific roadmap request's detail page
      navigate(`/student/roadmaps/${created.roadmapRequestId}`);
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
        Describe your project below and the planning agents will generate a tailored milestone roadmap for you.
      </p>

      <section className="panel">
        <h2>Start your roadmap</h2>
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
          <button className="button button-primary" type="submit" disabled={busy}>
            {busy ? 'Generating roadmap…' : 'Generate roadmap'}
          </button>
        </form>
      </section>

      <p className="demo-note">This calls the live API and PostgreSQL database. No canned or scripted data.</p>
      {error && <p className="error-message" role="alert">{error}</p>}
    </main>
  );
}
