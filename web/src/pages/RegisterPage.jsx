import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { registerStudent } from '../api/projectMentorApi';
import { useAuth } from '../auth/AuthContext';
import { validateEmail } from '../auth/validation';

function AuthAside() {
  return (
    <aside className="auth-aside band-dark">
      <div className="hero-media" aria-hidden="true">
        <img src="/hero-hands.png" alt="" onError={(event) => { event.currentTarget.style.display = 'none'; }} />
      </div>
      <div className="auth-aside-inner">
        <p className="eyebrow">ProjectMentor</p>
      </div>
      <div>
        <blockquote>“Your deadline doesn’t care how busy you were. Let’s make a plan it can’t argue with.”</blockquote>
        <p className="sig">— The Examiner</p>
      </div>
    </aside>
  );
}

export default function RegisterPage() {
  const navigate = useNavigate();
  const { loginWithSession, isAuthenticated, user } = useAuth();
  const [form, setForm] = useState({ fullName: '', email: '', password: '', confirmPassword: '', yearOfStudy: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate(user.role === 'Admin' ? '/admin' : '/student', { replace: true });
    }
  }, [isAuthenticated, navigate, user]);

  if (isAuthenticated) return null;

  function updateField(event) {
    const { name, value } = event.target;
    setForm(current => ({ ...current, [name]: value }));
    setErrors(current => ({ ...current, [name]: '' }));
    setServerError('');
  }

  function validate() {
    const nextErrors = {};
    if (!form.fullName.trim()) nextErrors.fullName = 'Full name is required.';
    nextErrors.email = validateEmail(form.email);
    if (!form.password) nextErrors.password = 'Password is required.';
    if (!form.confirmPassword) nextErrors.confirmPassword = 'Please confirm your password.';
    else if (form.password !== form.confirmPassword) nextErrors.confirmPassword = 'Passwords do not match.';
    setErrors(nextErrors);
    return !Object.values(nextErrors).some(Boolean);
  }

  async function submit(event) {
    event.preventDefault();
    if (!validate()) return;
    setBusy(true); setServerError('');
    try {
      const session = await registerStudent({
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        password: form.password,
        yearOfStudy: form.yearOfStudy ? Number(form.yearOfStudy) : null,
      });
      loginWithSession(session);
      navigate('/student', { replace: true });
    } catch (error) {
      setServerError(error.code === 'API_UNREACHABLE'
        ? 'Cannot reach the server. Make sure the backend and database are running.'
        : error.status === 409
          ? 'Email already registered. Try logging in instead.'
          : error.message || 'Unable to create your account. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Navbar />
      <main className="auth">
        <AuthAside />
        <div className="auth-main">
          <section className="auth-card rise">
            <p className="eyebrow">Start with your project</p>
            <h1>Create your account.</h1>
            <p className="auth-intro">Set up your student account, then turn your brief into a validated roadmap.</p>
            <form className="auth-form" onSubmit={submit} noValidate>
              <label className="form-field">Full name
                <input name="fullName" type="text" autoComplete="name" value={form.fullName} onChange={updateField} aria-invalid={Boolean(errors.fullName)} />
                {errors.fullName && <small className="field-error">{errors.fullName}</small>}
              </label>
              <label className="form-field">Email
                <input name="email" type="email" autoComplete="email" value={form.email} onChange={updateField} aria-invalid={Boolean(errors.email)} />
                {errors.email && <small className="field-error">{errors.email}</small>}
              </label>
              <label className="form-field">Year of study <span className="optional">optional</span>
                <select name="yearOfStudy" value={form.yearOfStudy} onChange={updateField}>
                  <option value="">Choose a year</option>
                  <option value="1">Year 1</option>
                  <option value="2">Year 2</option>
                  <option value="3">Year 3</option>
                  <option value="4">Year 4</option>
                </select>
              </label>
              <label className="form-field">Password
                <input name="password" type="password" autoComplete="new-password" value={form.password} onChange={updateField} aria-invalid={Boolean(errors.password)} />
                {errors.password && <small className="field-error">{errors.password}</small>}
                <small className="hint">The API currently requires a non-empty password; no minimum length is enforced yet.</small>
              </label>
              <label className="form-field">Confirm password
                <input name="confirmPassword" type="password" autoComplete="new-password" value={form.confirmPassword} onChange={updateField} aria-invalid={Boolean(errors.confirmPassword)} />
                {errors.confirmPassword && <small className="field-error">{errors.confirmPassword}</small>}
              </label>
              {serverError && <p className="error-message" role="alert">{serverError}</p>}
              <button className="button button-primary" type="submit" disabled={busy} style={{ width: '100%' }}>{busy ? 'Creating account…' : 'Create account'}</button>
            </form>
            <p className="auth-switch">Already have an account? <Link to="/login">Log in</Link></p>
          </section>
        </div>
      </main>
    </>
  );
}
