import { Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import FeaturePlaceholderPage from './pages/FeaturePlaceholderPage';
import EndToEndPage from './pages/EndToEndPage';
import StudentIntakePage from './pages/StudentIntakePage';
import StudentRoadmapsPage from './pages/StudentRoadmapsPage';
import StudentRoadmapDetailPage from './pages/StudentRoadmapDetailPage';
import ResourceHubPage from './pages/ResourceHubPage';
import SiteLayout from './components/SiteLayout';
import { RequireAuth, RequireRole } from './auth/RouteGuards';

export default function App() {
  return (
    <Routes>
      {/* Pages that manage their own chrome (dark hero navbar / split auth layout). */}
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* App pages share the light navbar + footer via SiteLayout. */}
      <Route element={<SiteLayout />}>
        <Route path="/demo" element={<EndToEndPage />} />
        <Route element={<RequireAuth />}>
          {/* Resource Hub (Component B) is shared: students browse, admins manage. */}
          <Route path="/resources" element={<ResourceHubPage />} />
          <Route element={<RequireRole role="Student" />}>
            {/* Intake: start a brand-new roadmap */}
            <Route path="/student" element={<StudentIntakePage />} />
            {/* List: all of this student's roadmap requests */}
            <Route path="/student/roadmaps" element={<StudentRoadmapsPage />} />
            {/* Detail: one specific roadmap request, by id */}
            <Route path="/student/roadmaps/:id" element={<StudentRoadmapDetailPage />} />
            <Route path="/planning" element={<FeaturePlaceholderPage eyebrow="Planning workspace" title="Build your roadmap" description="The planning workspace will turn an approved intake into milestones, dates, and attached resources." />} />
            <Route path="/progress" element={<FeaturePlaceholderPage eyebrow="Progress tracking" title="See what is moving" description="Progress tracking will bring milestone status, overdue work, and reminders into one view." />} />
            <Route path="/guidance" element={<FeaturePlaceholderPage eyebrow="Guidance library" title="Finish with confidence" description="The guidance library will provide report, presentation, and deployment checklists." />} />
          </Route>
          <Route element={<RequireRole role="Admin" />}>
            <Route path="/admin" element={<FeaturePlaceholderPage eyebrow="Admin workspace" title="ProjectMentor administration" description="Admin dashboards, resource management, and system reports will appear here." />} />
          </Route>
        </Route>
      </Route>
    </Routes>
  );
}
