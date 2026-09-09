import { Link, Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import FeaturePlaceholderPage from './pages/FeaturePlaceholderPage';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/planning" element={<FeaturePlaceholderPage eyebrow="Planning workspace" title="Build your roadmap" description="The planning workspace will turn an approved intake into milestones, dates, and attached resources." miraPose="roadmap" miraMessage="This is where your answers become a sequence. We will keep the plan practical and deadline-aware." />} />
      <Route path="/resources" element={<FeaturePlaceholderPage eyebrow="Resource hub" title="Find the right help" description="The resource hub will organize tutorials, documentation, and videos around each milestone." miraPose="questions" miraMessage="No more hunting through random links. Each milestone will have learning material that explains the next move." />} />
      <Route path="/progress" element={<FeaturePlaceholderPage eyebrow="Progress tracking" title="See what is moving" description="Progress tracking will bring milestone status, overdue work, and reminders into one view." miraPose="review" miraMessage="A project can feel stuck when progress is invisible. I will help you see what is done and what needs attention." />} />
      <Route path="/guidance" element={<FeaturePlaceholderPage eyebrow="Guidance library" title="Finish with confidence" description="The guidance library will provide report, presentation, and deployment checklists." miraPose="cta" miraMessage="The final stretch deserves structure too. We will turn your report, presentation, and deployment work into checkable steps." />} />
    </Routes>
  );
}
