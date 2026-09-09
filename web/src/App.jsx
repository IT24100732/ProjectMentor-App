import { Link, Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import FeaturePlaceholderPage from './pages/FeaturePlaceholderPage';
import EndToEndPage from './pages/EndToEndPage';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/demo" element={<EndToEndPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/planning" element={<FeaturePlaceholderPage eyebrow="Planning workspace" title="Build your roadmap" description="The planning workspace will turn an approved intake into milestones, dates, and attached resources." />} />
      <Route path="/resources" element={<FeaturePlaceholderPage eyebrow="Resource hub" title="Find the right help" description="The resource hub will organize tutorials, documentation, and videos around each milestone." />} />
      <Route path="/progress" element={<FeaturePlaceholderPage eyebrow="Progress tracking" title="See what is moving" description="Progress tracking will bring milestone status, overdue work, and reminders into one view." />} />
      <Route path="/guidance" element={<FeaturePlaceholderPage eyebrow="Guidance library" title="Finish with confidence" description="The guidance library will provide report, presentation, and deployment checklists." />} />
    </Routes>
  );
}
