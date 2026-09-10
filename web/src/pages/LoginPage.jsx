import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
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
        <blockquote>“You don’t need to know everything today. You need to know the next thing.”</blockquote>
        <p className="sig">— The Mentor</p>
      </div>
    </aside>
  );
}

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, isAuthenticated, user } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
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
    const nextErrors = { email: validateEmail(form.email) };
    if (!form.password) nextErrors.password = 'Password is required.';
    setErrors(nextErrors);
    return !Object.values(nextErrors).some(Boolean);
  }

  async function submit(event) {
    event.preventDefault();
    if (!validate()) return;
    setBusy(true); setServerError('');
    try {
      const session = await login({ email: form.email.trim(), password: form.password });
      navigate(session.role === 'Admin' ? '/admin' : '/student', { replace: true });
    } catch (error) {
      setServerError(error.code === 'API_UNREACHABLE'
        ? 'Cannot reach the server. Make sure the backend and database are running.'
        : error.status === 401
          ? 'Incorrect email or password.'
          : error.message || 'Unable to log in. Please try again.');
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
            <p className="eyebrow">Welcome back</p>
            <h1>Log in.</h1>
            <p className="auth-intro">Return to your workspace and keep your next milestone in view.</p>
            <form className="auth-form" onSubmit={submit} noValidate>
              <label className="form-field">Email
                <input name="email" type="email" autoComplete="email" value={form.email} onChange={updateField} aria-invalid={Boolean(errors.email)} />
                {errors.email && <small className="field-error">{errors.email}</small>}
              </label>
              <label className="form-field">Password
                <input name="password" type="password" autoComplete="current-password" value={form.password} onChange={updateField} aria-invalid={Boolean(errors.password)} />
                {errors.password && <small className="field-error">{errors.password}</small>}
              </label>
              {serverError && <p className="error-message" role="alert">{serverError}</p>}
              <button className="button button-primary" type="submit" disabled={busy} style={{ width: '100%' }}>{busy ? 'Logging in…' : 'Log in'}</button>
            </form>
            <p className="auth-switch">New to ProjectMentor? <Link to="/register">Create an account</Link></p>
          </section>
        </div>
      </main>
    </>
  );
}
