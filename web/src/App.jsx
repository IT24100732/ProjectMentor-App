import { Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import FeaturePlaceholderPage from './pages/FeaturePlaceholderPage';
import EndToEndPage from './pages/EndToEndPage';
import { RequireAuth, RequireRole } from './auth/RouteGuards';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/demo" element={<EndToEndPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route element={<RequireAuth />}>
        <Route element={<RequireRole role="Student" />}>
          <Route path="/student" element={<FeaturePlaceholderPage eyebrow="Student workspace" title="Your project starts here" description="Your roadmap workspace will appear here. Use the workflow demo to exercise the current end-to-end slice." />} />
          <Route path="/planning" element={<FeaturePlaceholderPage eyebrow="Planning workspace" title="Build your roadmap" description="The planning workspace will turn an approved intake into milestones, dates, and attached resources." />} />
          <Route path="/resources" element={<FeaturePlaceholderPage eyebrow="Resource hub" title="Find the right help" description="The resource hub will organize tutorials, documentation, and videos around each milestone." />} />
          <Route path="/progress" element={<FeaturePlaceholderPage eyebrow="Progress tracking" title="See what is moving" description="Progress tracking will bring milestone status, overdue work, and reminders into one view." />} />
          <Route path="/guidance" element={<FeaturePlaceholderPage eyebrow="Guidance library" title="Finish with confidence" description="The guidance library will provide report, presentation, and deployment checklists." />} />
        </Route>
        <Route element={<RequireRole role="Admin" />}>
          <Route path="/admin" element={<FeaturePlaceholderPage eyebrow="Admin workspace" title="ProjectMentor administration" description="Admin dashboards, resource management, and system reports will appear here." />} />
        </Route>
      </Route>
    </Routes>
  );
}
