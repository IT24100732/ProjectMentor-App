import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Reveal from '../components/Reveal';

const marquee = ['Plan', 'Validate', 'Approve', 'Track', 'Ship', 'Resources', 'Milestones', 'Four Agents'];

const values = [
  ['A real plan', 'Not a chat window — a structured intake that becomes an ordered roadmap sized to your deadline.'],
  ['Right help, attached', 'Curated tutorials, docs and videos pinned to the exact milestone that needs them.'],
  ['Nothing slips', 'Milestone status, overdue flags and reminders keep the deadline honest.'],
  ['You approve it', 'The plan pauses for your decision — accept, or send it back for a revision.'],
];

const steps = [
  ['01', 'Answer, don’t chat', 'A short structured intake — year, deadline, project type, hours, weak spots.'],
  ['02', 'Agents build the plan', 'Four agents plan, attach resources, analyse scope and validate every milestone.'],
  ['03', 'You approve it', 'Nothing goes live until you accept — or ask for a revision.'],
  ['04', 'Ship it', 'Track milestones and follow the attached resources all the way to deployment.'],
];

const phases = [
  ['01', 'Title', 'Choose or refine a project title — a workable idea to build on.', 'Week 1'],
  ['02', 'Design', 'Diagrams, scope and structure before a line of code.', 'Weeks 1–2'],
  ['03', 'Build', 'The core build, milestone by milestone, at your real pace.', 'Weeks 2–6'],
  ['04', 'Documentation', 'Report outlines and the writing everyone leaves too late.', 'Weeks 5–7'],
  ['05', 'Presentation', 'A presentation skeleton and a demo that actually lands.', 'Week 8'],
  ['06', 'Deployment', 'A tailored checklist that takes it beyond a laptop demo.', 'Week 9'],
];

function Hero() {
  return (
    <section className="hero">
      <div className="hero-media" aria-hidden="true">
        <img src="/hero-hands.png" alt="" onError={(event) => { event.currentTarget.style.display = 'none'; }} />
      </div>
      <div className="container hero-inner hero-rise">
        <span className="script">your project, mentored</span>
        <h1>Know what<br />comes next.</h1>
        <p className="hero-caption">
          <span className="tick">✦</span>
          An agentic-AI platform that turns a blank project brief into a validated, personalised roadmap — from choosing a title to deploying the result.
        </p>
      </div>
      <div className="scroll-cue" aria-hidden="true">Scroll<span /></div>
    </section>
  );
}

function Marquee() {
  const items = [...marquee, ...marquee];
  return (
    <div className="marquee" aria-hidden="true">
      <div className="marquee-track">
        {items.map((word, index) => (
          <span key={index}>{word}<span className="tick">&nbsp;✦&nbsp;</span></span>
        ))}
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="app-shell">
      <Navbar overlay />
      <main>
        <Hero />
        <Marquee />

        {/* Approach — editorial statement */}
        <section className="section" id="approach">
          <div className="container">
            <div className="statement">
              <Reveal className="lead">Not a chatbot.</Reveal>
              <div>
                <Reveal as="h2" delay={80}>We don’t leave you staring at a blank page.</Reveal>
                <Reveal as="p" delay={160}>
                  A chat box is the last thing a stuck student needs. ProjectMentor asks the right questions,
                  reasons over the rules, and delegates real work to four specialised agents — each with one job,
                  a defined contract and controlled tools.
                </Reveal>
              </div>
            </div>
          </div>
        </section>

        {/* Value quad */}
        <section className="section" style={{ paddingTop: 0 }}>
          <div className="container">
            <div className="quad">
              {values.map(([title, copy], index) => (
                <Reveal className="quad-item" key={title} delay={index * 90}>
                  <h3>{title}</h3>
                  <p>{copy}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="section" id="workflow">
          <div className="container">
            <Reveal className="section-head">
              <p className="eyebrow">How it works</p>
              <h2>From blank brief to next step, in four moves.</h2>
            </Reveal>
            <div className="quad">
              {steps.map(([num, title, copy], index) => (
                <Reveal className="quad-item" key={num} delay={index * 90}>
                  <span className="no" style={{ fontFamily: 'var(--serif)', fontSize: '1.4rem', color: 'var(--accent-quiet)' }}>{num}</span>
                  <h3 style={{ marginTop: 12 }}>{title}</h3>
                  <p>{copy}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* The six phases — numbered list */}
        <section className="section" id="phases" style={{ paddingTop: 0 }}>
          <div className="container">
            <Reveal className="section-head">
              <p className="eyebrow">The roadmap</p>
              <h2>Every project, six phases.</h2>
              <p>The Planner agent sizes each phase to your real deadline and hours — then the Examiner checks it can actually ship.</p>
            </Reveal>
            <div className="numbered">
              {phases.map(([no, title, copy, meta], index) => (
                <Reveal className="numbered-row" key={no} delay={index * 60}>
                  <span className="no">{no}</span>
                  <div>
                    <h3>{title}</h3>
                    <p>{copy}</p>
                  </div>
                  <span className="meta">{meta}</span>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* Mentor & Examiner */}
        <section className="section band-dark" id="duo">
          <div className="container">
            <Reveal className="section-head">
              <p className="eyebrow">Two voices, one goal</p>
              <h2>Every good mentor is a little bit of both.</h2>
              <p>Encouragement gets you started. Standards get you finished. ProjectMentor runs on both at once.</p>
            </Reveal>
            <div className="duo">
              <Reveal className="duo-card nice">
                <span className="duo-tag">The Mentor</span>
                <h3>Warm, patient, always a next step.</h3>
                <p>Breaks the mountain into stairs. Attaches the exact tutorial you need. Never makes you feel behind for asking.</p>
                <blockquote>“You don’t need to know everything today. You need to know the next thing. Here it is.”</blockquote>
              </Reveal>
              <Reveal className="duo-card bad" delay={120}>
                <span className="duo-tag">The Examiner</span>
                <h3>Blunt, exacting, allergic to excuses.</h3>
                <p>Checks your plan against the deadline and the rules. Flags the phase you’re quietly avoiding. Won’t sign off on a roadmap that can’t ship.</p>
                <blockquote>“Your deadline doesn’t care how busy you were. Milestone three is late. Fix it.”</blockquote>
              </Reveal>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="section band-dark" style={{ paddingTop: 0 }}>
          <div className="container cta">
            <Reveal as="h2">Make the next step visible.</Reveal>
            <Reveal as="p" delay={100}>Give your project a little structure before the deadline gives it to you. You review the plan before anything becomes active.</Reveal>
            <Reveal className="hero-actions" delay={200}>
              <Link className="button button-primary" to="/register">Get started</Link>
              <Link className="button button-gold" to="/login">Log in</Link>
            </Reveal>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
