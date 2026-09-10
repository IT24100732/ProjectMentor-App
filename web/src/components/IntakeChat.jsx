import { useMemo, useState } from 'react';

const questionBank = [
  { id: 'year', label: 'What year are you in?', type: 'choice', options: ['Year 1', 'Year 2', 'Year 3', 'Year 4'] },
  { id: 'title', label: 'Do you already have a project title or idea?', type: 'choice', options: ['I have one', 'I need suggestions'] },
  { id: 'projectType', label: 'What kind of project are you planning?', type: 'choice', options: ['Web app', 'Mobile app', 'Data or AI', 'Research', 'Other'] },
  { id: 'confidence', label: 'How confident do you feel about starting this project?', type: 'choice', options: ['I know what I am doing', 'I have a rough idea', 'I need quite a lot of guidance', 'I am not sure yet'] },
  { id: 'idea', label: 'Describe your idea in one or two sentences.', type: 'text', when: (answers) => answers.title === 'I have one' },
  { id: 'domain', label: 'What subject or problem would you like your project to explore?', type: 'text', when: (answers) => answers.title === 'I need suggestions' },
  { id: 'deadline', label: 'When is the project due?', type: 'date' },
  { id: 'hours', label: 'How many hours can you realistically work each week?', type: 'number' },
  { id: 'team', label: 'Are you working alone or with a team?', type: 'choice', options: ['Alone', 'With a team'] },
  { id: 'teamSize', label: 'How many people are in your team?', type: 'number', when: (answers) => answers.team === 'With a team' },
  { id: 'technologies', label: 'Which technologies do you already feel comfortable using?', type: 'choice', options: ['None yet', 'HTML, CSS, and JavaScript', 'C# and .NET', 'Python', 'Several technologies'], when: (answers) => answers.confidence !== 'I know what I am doing' },
  { id: 'needs', label: 'Which part would you most like extra help with?', type: 'choice', options: ['Planning and scope', 'Design and diagrams', 'Coding', 'Documentation', 'Presentation', 'Deployment', 'I am not sure yet'], when: (answers) => answers.confidence !== 'I know what I am doing' },
  { id: 'blocker', label: 'What is the biggest thing making this project difficult right now?', type: 'choice', options: ['I do not know where to start', 'The scope feels too big', 'I cannot choose an idea', 'I am worried about the deadline', 'Nothing specific'], when: (answers) => answers.confidence !== 'I know what I am doing' },
  { id: 'deliverable', label: 'What must your final submission include?', type: 'text' },
];

function getNextQuestion(startIndex, answers) {
  return questionBank.findIndex((question, index) => index > startIndex && (!question.when || question.when(answers)));
}

function getBehaviorProfile(answers) {
  const isConfident = answers.confidence === 'I know what I am doing';
  const needsGuidance = !isConfident;
  const deadline = answers.deadline ? new Date(`${answers.deadline}T00:00:00`) : null;
  const daysLeft = deadline ? Math.ceil((deadline - new Date()) / 86400000) : null;
  return {
    isConfident,
    needsGuidance,
    isUrgent: daysLeft !== null && daysLeft >= 0 && daysLeft < 28,
    isTeam: answers.team === 'With a team',
    isUncertain: answers.confidence === 'I am not sure yet' || answers.needs === 'I am not sure yet',
  };
}

function getQuestionPrompt(question, answers) {
  if (question.id === 'hours' && answers.confidence === 'I know what I am doing') return 'How many hours can you commit each week without disrupting your other work?';
  if (question.id === 'deliverable' && answers.projectType === 'Research') return 'What must your research submission include: report, presentation, prototype, evaluation, or something else?';
  if (question.id === 'technologies' && answers.projectType === 'Mobile app') return 'Which mobile technologies or device features do you already feel comfortable using?';
  return question.label;
}

function getMiraReply(question, answer, answers, profile) {
  if (question.id === 'confidence' && profile.isConfident) return 'Good. I will avoid teaching you things you already know and focus on a tight scope, realistic dates, and a strong finish.';
  if (question.id === 'confidence' && profile.isUncertain) return 'That is a perfectly useful answer. I will ask a little more so the roadmap can guide you instead of guessing.';
  if (question.id === 'confidence') return 'Thanks for saying that clearly. I will add learning checkpoints and smaller wins before the heavier build work.';
  if (question.id === 'title' && answer === 'I need suggestions') return 'No problem. I will turn your interests into a small set of workable directions before we plan the build.';
  if (question.id === 'projectType' && answer === 'Data or AI') return 'That changes the plan: dataset readiness, evaluation, and responsible results will need their own milestones.';
  if (question.id === 'team' && profile.isTeam) return 'Good to know. I will include ownership, integration, and a shared definition of done so teamwork does not become invisible work.';
  if (question.id === 'hours') return profile.isUrgent ? 'The deadline is close, so I will keep the first version deliberately small and protect time for testing.' : 'That gives us a capacity boundary. I will use it to size milestones instead of filling the roadmap with wishful work.';
  if (question.id === 'deadline') return profile.isUrgent ? 'We have less than four weeks, so the roadmap will prioritize a demonstrable core before optional features.' : 'I will work backwards from that date and reserve time for testing, documentation, and submission preparation.';
  if (question.id === 'blocker' && answer === 'I do not know where to start') return 'Then your first achievement will be orientation: a small, visible first step before the project asks for a big decision.';
  if (question.id === 'blocker' && answer === 'The scope feels too big') return 'I will make scope control explicit and mark optional work as optional, so progress does not depend on doing everything.';
  if (question.id === 'blocker' && answer === 'I cannot choose an idea') return 'We will treat idea selection as a real milestone, with a clear decision rule rather than endless brainstorming.';
  if (question.id === 'needs' && answer === 'I am not sure yet') return 'I will spread support across the roadmap and let the milestones reveal where more help is needed.';
  if (answer.length < 4 && question.type !== 'choice') return 'That is enough for now. I will keep the next step simple and leave room to refine this later.';
  return profile.isConfident ? 'Understood. I will use that to sharpen the plan without adding unnecessary detours.' : 'Got it. I will use that to choose the next useful question and keep the plan manageable.';
}

function makeRoadmap(answers) {
  const profile = getBehaviorProfile(answers);
  const title = answers.title === 'I have one' ? answers.idea || 'Your project idea' : `A ${answers.domain || 'focused'} project`;
  const support = profile.isConfident ? 'independent build milestones' : 'guided learning checkpoints';
  const team = answers.team === 'With a team' ? 'Share ownership and integrate the team work' : 'Build and validate the project yourself';
  const scopeAdvice = profile.isUrgent ? 'Protect the core feature and move optional ideas to a later list.' : answers.blocker === 'The scope feels too big' ? 'Split must-have work from optional polish before building.' : 'Keep a visible definition of done for every milestone.';
  return {
    title,
    goal: `Deliver a clear ${answers.projectType?.toLowerCase() || 'student'} project by ${answers.deadline || 'your deadline'}, with a scope you can complete in about ${answers.hours || 'your available'} hours each week.`,
    achievement: `You will finish with a working project, evidence of testing, and a submission package that matches your requirements.`,
    milestones: [
      ['01', 'Define the finish line', `Confirm the problem, audience, scope, and success criteria. ${scopeAdvice}`, '1 week'],
      ['02', 'Plan the solution', `Choose the design approach and ${answers.needs === 'Design and diagrams' ? 'complete the required diagrams' : 'document the key technical decisions'}.`, '1 week'],
      ['03', 'Build the smallest useful version', `${team}. Keep a working version available from the first build milestone.`, profile.isConfident ? '2 weeks' : '3 weeks'],
      ['04', 'Test and improve', 'Test the important journeys, fix the sharp edges, and record what the project proves.', '1 week'],
      ['05', 'Prepare the submission', `Complete the documentation, presentation, and deployment work needed for ${support}.`, '1 week'],
    ],
  };
}

function RoadmapResult({ answers, onRestart }) {
  const roadmap = useMemo(() => makeRoadmap(answers), [answers]);
  return <div className="roadmap-result">
    <div className="roadmap-result-heading"><div><p className="eyebrow">Draft roadmap / ready to review</p><h2>{roadmap.title}</h2></div><span className="roadmap-badge">{answers.projectType || 'Project'}</span></div>
    <div className="roadmap-summary"><div><span>Goal</span><p>{roadmap.goal}</p></div><div><span>Achievement</span><p>{roadmap.achievement}</p></div></div>
    <div className="milestone-list"><p className="roadmap-label">Your milestones</p>{roadmap.milestones.map(([number, title, detail, duration]) => <article className="milestone" key={number}><span className="milestone-number">{number}</span><div><h3>{title}</h3><p>{detail}</p></div><span className="milestone-duration">{duration}</span></article>)}</div>
    <div className="roadmap-actions"><button className="button button-primary" type="button">Review and accept roadmap <span aria-hidden="true">→</span></button><button className="button button-quiet" type="button" onClick={onRestart}>Adjust answers</button></div>
  </div>;
}

export default function IntakeChat() {
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [history, setHistory] = useState([]);
  const [draft, setDraft] = useState('');
  const isComplete = questionIndex === -1;
  const currentQuestion = questionBank[questionIndex];

  function submitAnswer(value) {
    const cleanValue = String(value || '').trim();
    if (!cleanValue || !currentQuestion) return;
    const nextAnswers = { ...answers, [currentQuestion.id]: cleanValue };
    setAnswers(nextAnswers);
    const profile = getBehaviorProfile(nextAnswers);
    setHistory((current) => [...current, { question: getQuestionPrompt(currentQuestion, answers), answer: cleanValue, reply: getMiraReply(currentQuestion, cleanValue, nextAnswers, profile) }]);
    setDraft('');
    setQuestionIndex(getNextQuestion(questionIndex, nextAnswers));
  }

  function handleSubmit(event) { event.preventDefault(); submitAnswer(draft); }
  function restart() { setQuestionIndex(0); setAnswers({}); setHistory([]); setDraft(''); }

  return <section className={`intake-chat ${isComplete ? 'intake-chat-complete' : ''}`} aria-labelledby="intake-title">
    <div className="intake-header"><div><p className="eyebrow">Structured intake</p><h2 id="intake-title">{isComplete ? 'Your project has a shape now.' : 'Let&apos;s give your project a starting point.'}</h2></div><span className="intake-progress">{isComplete ? 'Roadmap ready' : 'Adaptive questions'}</span></div>
    {!isComplete && <div className="intake-depth"><span style={{ width: `${Math.min(96, Math.max(8, (history.length / 9) * 100))}%` }} /></div>}
    {isComplete ? <RoadmapResult answers={answers} onRestart={restart} /> : <>
      <div className="chat-thread" aria-live="polite">{history.length === 0 && <div className="chat-message chat-message-agent"><span className="chat-avatar">M</span><p>Hi, I&apos;m Mira. I will adapt to what you already know. Confident answers keep this short; uncertainty gets more support, not judgment.</p></div>}{history.map((item) => <div className="chat-exchange" key={`${item.question}-${item.answer}`}><div className="chat-message chat-message-user"><p><strong>{item.question}</strong><br />{item.answer}</p></div><div className="chat-message chat-message-agent chat-message-followup"><span className="chat-avatar">M</span><p>{item.reply}</p></div></div>)}<div className="chat-message chat-message-agent"><span className="chat-avatar">M</span><p>{getQuestionPrompt(currentQuestion, answers)}</p></div></div>
      {currentQuestion.type === 'choice' ? <div className="intake-options">{currentQuestion.options.map((option) => <button className="intake-option" key={option} type="button" onClick={() => submitAnswer(option)}>{option}</button>)}</div> : <form className="intake-input-row" onSubmit={handleSubmit}><input aria-label={currentQuestion.label} type={currentQuestion.type} value={draft} onChange={(event) => setDraft(event.target.value)} min={currentQuestion.type === 'number' ? '1' : undefined} placeholder={currentQuestion.type === 'number' ? 'Enter a number' : currentQuestion.type === 'text' ? 'Type a short answer' : undefined} /><button className="button button-primary" type="submit">Next <span aria-hidden="true">→</span></button></form>}
    </>}
  </section>;
}
