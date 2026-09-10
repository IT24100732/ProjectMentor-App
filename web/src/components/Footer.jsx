import { Link } from 'react-router-dom';

const columns = [
  ['Platform', [['Create a roadmap', '/register'], ['Resource hub', '/resources'], ['Workflow demo', '/demo']]],
  ['For students', [['Progress tracking', '/progress'], ['Guidance library', '/guidance'], ['Log in', '/login']]],
  ['Project', [['SE3090 Assignment', '#'], ['Architecture', '#'], ['GitHub', 'https://github.com/IT24100732/ProjectMentor-App']]],
];

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-top">
          <div>
            <Link className="brand" to="/">
              <img className="brand-logo" src="/logo.png" alt="" />
              <span>ProjectMentor</span>
            </Link>
            <p className="footer-blurb">
              The mentor that reaches out — and the examiner that won’t let you coast.
              A validated, agentic roadmap for every undergraduate project, from a blank brief to deployment.
            </p>
          </div>
          {columns.map(([heading, links]) => (
            <div className="footer-col" key={heading}>
              <h4>{heading}</h4>
              {links.map(([label, href]) => (
                href.startsWith('http') || href === '#'
                  ? <a key={label} href={href} target={href.startsWith('http') ? '_blank' : undefined} rel="noreferrer noopener">{label}</a>
                  : <Link key={label} to={href}>{label}</Link>
              ))}
            </div>
          ))}
        </div>
        <div className="footer-base">
          <span>© {new Date().getFullYear()} ProjectMentor · Built for SE3090 Software Engineering Frameworks.</span>
          <span className="tt">Plan · Validate · Approve · Ship</span>
        </div>
      </div>
    </footer>
  );
}
