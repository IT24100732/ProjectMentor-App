import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { validateEmail } from '../auth/validation';

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
      const destination = session.role === 'Admin' ? '/admin' : '/student';
      navigate(destination, { replace: true });
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
    <main className="auth-page">
      <section className="auth-panel">
        <p className="eyebrow">ProjectMentor access</p>
        <h1>Log in</h1>
        <p className="auth-intro">Return to your project workspace and keep your next milestone in view.</p>
        <form className="auth-form" onSubmit={submit} noValidate>
          <label className="form-field">Email
            <input name="email" type="email" autoComplete="email" value={form.email} onChange={updateField} aria-invalid={Boolean(errors.email)} />
            {errors.email && <small className="field-error">{errors.email}</small>}
          </label>
          <label className="form-field">Password
            <input name="password" type="password" autoComplete="current-password" value={form.password} onChange={updateField} aria-invalid={Boolean(errors.password)} />
            {errors.password && <small className="field-error">{errors.password}</small>}
          </label>
          {serverError && <p className="form-error" role="alert">{serverError}</p>}
          <button className="button button-primary auth-submit" type="submit" disabled={busy}>{busy ? 'Logging in...' : 'Log in'}</button>
        </form>
        <p className="auth-switch">New to ProjectMentor? <Link to="/register">Create an account</Link></p>
        <Link className="auth-back" to="/">Back to home</Link>
      </section>
    </main>
  );
}
