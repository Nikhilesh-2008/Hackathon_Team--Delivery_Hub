import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout';
import { useAuth } from '../context/AuthContext';

// Pages
import { Dashboard } from '../pages/Dashboard';
import { DiscoverEvents } from '../pages/DiscoverEvents';
import { HackathonDetails } from '../pages/HackathonDetails';
import { TeamFinder } from '../pages/TeamFinder';
import { CandidateProfile } from '../pages/CandidateProfile';
import { TeamWorkspace } from '../pages/TeamWorkspace';
import { TasksTimeline } from '../pages/TasksTimeline';
import { SubmissionHub } from '../pages/SubmissionHub';
import { RulebookPage } from '../pages/RulebookPage';
import { AiPlanner } from '../pages/AiPlanner';
import { ReputationPage } from '../pages/ReputationPage';
import { ProfilePage } from '../pages/ProfilePage';
import { NotificationsPage } from '../pages/NotificationsPage';
import { SettingsPage } from '../pages/SettingsPage';
import { MentorDashboard } from '../pages/MentorDashboard';
import { JudgeDashboard } from '../pages/JudgeDashboard';
import { OrganizerDashboard } from '../pages/OrganizerDashboard';
import { LoginPage } from '../pages/LoginPage';

export const AppRoutes = () => {
  const { activeRole, user, isLoading } = useAuth();

  if (isLoading) {
    return <div className="grid min-h-screen place-items-center text-sm text-slate-500">Loading HackHub…</div>;
  }

  // Return role-appropriate dashboard
  const renderDashboardByRole = () => {
    const role = (user?.role || activeRole || '').toUpperCase();
    if (role === 'MENTOR') return <MentorDashboard />;
    if (role === 'JUDGE') return <JudgeDashboard />;
    if (role === 'ORGANIZER') return <OrganizerDashboard />;
    return <Dashboard />;
  };

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
      <Route path="/register" element={user ? <Navigate to="/dashboard" replace /> : <LoginPage />} />

      {/* Main App Layout shell */}
      <Route path="/" element={user ? <AppLayout /> : <Navigate to="/login" replace />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={renderDashboardByRole()} />
        <Route path="judge" element={<JudgeDashboard />} />
        <Route path="mentor" element={<MentorDashboard />} />
        <Route path="organizer" element={<OrganizerDashboard />} />
        
        {/* Events & Challenges */}
        <Route path="events" element={<DiscoverEvents />} />
        <Route path="events/:id" element={<HackathonDetails />} />
        <Route path="events/:id/challenges/:challengeId" element={<HackathonDetails />} />

        {/* Team Finder & Profiles */}
        <Route path="team-finder" element={<TeamFinder />} />
        <Route path="profile/:id" element={<CandidateProfile />} />
        <Route path="profile" element={<ProfilePage />} />

        {/* Team Workspace & Sprints */}
        <Route path="team" element={<TeamWorkspace />} />
        <Route path="team/tasks" element={<TasksTimeline />} />
        <Route path="team/timeline" element={<TasksTimeline />} />
        <Route path="team/chat" element={<TeamWorkspace />} />
        <Route path="team/submission" element={<SubmissionHub />} />
        <Route path="team/feedback" element={<MentorDashboard />} />

        {/* Rulebook & AI Tools */}
        <Route path="rulebook" element={<RulebookPage />} />
        <Route path="rulebook/assistant" element={<RulebookPage />} />
        <Route path="ai-planner" element={<AiPlanner />} />

        {/* Reputation & Activity */}
        <Route path="reputation" element={<ReputationPage />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="settings" element={<SettingsPage />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  );
};
