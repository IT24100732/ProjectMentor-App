import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

const marketingLinks = [
  ['#approach', 'Approach'],
  ['#workflow', 'Workflow'],
  ['#duo', 'Mentor & Examiner'],
  ['#phases', 'Phases'],
];

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="8" r="4" /><path d="M4 21v-1a7 7 0 0 1 14 0v1" />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><path d="M16 17l5-5-5-5" /><path d="M21 12H9" />
    </svg>
  );
}

export default function Navbar({ overlay = false }) {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (!overlay) return undefined;
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [overlay]);

  const dashboard = isAuthenticated ? (user.role === 'Admin' ? '/admin' : '/student/roadmaps') : '/login';

  function signOut() {
    logout();
    navigate('/');
  }

  const links = isAuthenticated
    ? (user.role === 'Admin'
        ? [['/admin', 'Console'], ['/resources', 'Resources']]
        : [['/student/roadmaps', 'Roadmaps'], ['/resources', 'Resources'], ['/progress', 'Progress'], ['/guidance', 'Guidance']])
    : marketingLinks;

  return (
    <header className={`navbar ${overlay ? 'overlay' : 'solid'}${overlay && scrolled ? ' scrolled' : ''}`}>
      <div className="container navbar-inner">
        <Link className="brand" to={isAuthenticated ? dashboard : '/'} aria-label="ProjectMentor home">
          <img className="brand-logo" src="/logo.png" alt="" />
          <span>ProjectMentor</span>
        </Link>

        <nav className="nav-links" aria-label="Primary">
          {links.map(([href, label]) => (
            href.startsWith('#')
              ? <a key={href} href={href}>{label}</a>
              : <Link key={href} to={href}>{label}</Link>
          ))}
        </nav>

        <div className="nav-right">
          <Link className="icon-btn" to={dashboard} aria-label={isAuthenticated ? 'Your workspace' : 'Log in'} title={isAuthenticated ? 'Workspace' : 'Log in'}>
            <UserIcon />
          </Link>
          {isAuthenticated && (
            <button className="icon-btn" type="button" onClick={signOut} aria-label="Sign out" title="Sign out">
              <LogoutIcon />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
