import { Link } from 'react-router-dom';

const steps = [
  ['01', 'Answer a few questions', 'Tell us your year, deadline, project type, time, and where you need the most help.'],
  ['02', 'Get a validated roadmap', 'The agentic workflow turns your answers into a practical sequence with dates and resources.'],
  ['03', 'Review before it goes live', 'You stay in control: accept the plan or ask for a revision before anything becomes active.'],
  ['04', 'Keep moving', 'Track milestones, follow attached learning resources, and see what needs attention next.'],
];

const painPoints = [
  ['01', 'A project title', 'Start with a workable idea when the brief gives you nothing to hold on to.'],
  ['02', 'The next step', 'Turn a vague project into an ordered plan instead of guessing what comes after what.'],
  ['03', 'Diagrams that explain', 'Get guidance for ER, use-case, class, and sequence diagrams when the terminology gets dense.'],
  ['04', 'Documents and presentations', 'Know what belongs in the report and how to shape the final presentation.'],
  ['05', 'Deployment', 'Work through the practical steps that take a project beyond a laptop demo.'],
  ['06', 'The parts you avoid', 'Spend more time building and less time circling the same uncertain task.'],
];

function Header() {
  return (
    <header className="site-header">
      <div className="container nav">
        <Link className="brand" to="/" aria-label="ProjectMentor home">
          <span className="brand-mark">PM</span>
          <span>ProjectMentor</span>
        </Link>
        <nav className="nav-links" aria-label="Main navigation">
          <a href="#how-it-works">How it works</a>
          <a href="#what-it-helps">What it helps with</a>
        </nav>
        <div className="nav-actions">
          <Link className="button button-quiet" to="/login">Log in</Link>
          <Link className="button button-primary" to="/register">Get started</Link>
        </div>
      </div>
    </header>
  );
}

function RoadmapPreview() {
  return (
    <div className="roadmap-preview" aria-label="Example ProjectMentor roadmap">
      <div className="preview-top">
        <span className="preview-kicker">Project brief / in progress</span>
        <span className="preview-status">● Reviewed</span>
      </div>
      <p className="preview-title">Campus project roadmap</p>
      {['Choose and refine a title', 'Design the core experience', 'Build the first working version', 'Prepare the report and demo'].map((item, index) => (
        <div className="preview-step" key={item}>
          <span className="step-number">{String(index + 1).padStart(2, '0')}</span>
          <div><strong>{item}</strong><small>{index < 2 ? 'Resource attached' : 'Next milestone'}</small></div>
          <span className="step-check">{index < 2 ? '✓' : '→'}</span>
        </div>
      ))}
    </div>
  );
}

function HowItWorks() {
  return (
    <section className="section how" id="how-it-works">
      <div className="container">
        <div className="section-intro">
          <div><p className="eyebrow">A clear sequence</p><h2>From blank brief to next step.</h2></div>
          <p>ProjectMentor is not a chat window. It is a guided workflow that uses your answers, checks the plan, and gives you a chance to approve it.</p>
        </div>
        <div className="steps">
          {steps.map(([number, title, copy]) => <article className="step" key={number}><span className="step-label">STEP {number}</span><h3>{title}</h3><p>{copy}</p></article>)}
        </div>
      </div>
    </section>
  );
}

function PainPoints() {
  return (
    <section className="section" id="what-it-helps">
      <div className="container">
        <div className="section-intro">
          <div><p className="eyebrow">The unglamorous work</p><h2>Useful when the project gets fuzzy.</h2></div>
          <p>Most project stress is not one giant problem. It is a dozen small uncertainties that arrive in the wrong order. The platform gives each one a place.</p>
        </div>
        <div className="pain-grid">
          {painPoints.map(([number, title, copy]) => <article className="pain" key={number}><span className="pain-index">{number}</span><h3>{title}</h3><p>{copy}</p></article>)}
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return <footer className="site-footer"><div className="container footer-content"><span>ProjectMentor for undergraduate project work.</span><a href="#about">About</a></div></footer>;
}

export default function HomePage() {
  return <div className="site-shell"><Header /><main><section className="hero"><div className="container hero-grid"><div className="hero-copy"><p className="eyebrow">For the student with a blank project brief</p><h1>Know what to do next.</h1><p>ProjectMentor helps undergraduates take a project from choosing a title to deploying the result, with a structured roadmap built around their actual deadline and experience.</p><div className="hero-actions"><Link className="button button-primary" to="/register">Create your roadmap <span aria-hidden="true">&nbsp;→</span></Link><Link className="button button-quiet" to="/login">Log in</Link></div><p className="hero-note">You review the plan before it becomes active.</p></div><RoadmapPreview /></div></section><HowItWorks /><PainPoints /><section className="cta-band"><div className="container cta-content"><div><p className="eyebrow">Start with the questions</p><h2>Make the next step visible.</h2><p>Give your project a little structure before the deadline gives it to you.</p></div><div className="cta-actions"><Link className="button button-primary" to="/register">Get started</Link><Link className="button button-quiet" to="/login">Log in</Link></div></div></section></main><Footer /></div>;
}
