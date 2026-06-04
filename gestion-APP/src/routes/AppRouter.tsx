import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LoginPage } from '../modules/auth/LoginPage';
import { RegisterPage } from '../modules/auth/RegisterPage';
import { DashboardPage } from '../modules/dashboard/DashboardPage';
import { ProjectDetailPage } from '../modules/projects/ProjectDetailPage';
import { ProjectEditPage } from '../modules/projects/ProjectEditPage';
import { ProjectFormPage } from '../modules/projects/ProjectFormPage';
import { TaskListPage } from '../modules/tasks/TaskListPage';
import { TaskFormPage } from '../modules/tasks/TaskFormPage';
import { KanbanBoard } from '../modules/kanban/KanbanBoard';
import { ChatPage } from '../modules/chat/ChatPage';
import { ProjectChatPage } from '../modules/chat/ProjectChatPage';
import { ProfilePage } from '../modules/profile/ProfilePage';
import { PrivateRoute } from '../components/PrivateRoute';
import { NotFoundPage } from '../modules/NotFoundPage';

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <motion.div
      key={location.pathname}
      initial={{ y: 8, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
      style={{ minHeight: '100vh' }}
      className="bg-gray-50 dark:bg-gray-950"
    >
      <Routes location={location}>
        <Route path="/"         element={<Navigate to="/login" replace />} />
        <Route path="/login"    element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route path="/dashboard"              element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
        <Route path="/projects/:id"           element={<PrivateRoute><ProjectDetailPage /></PrivateRoute>} />
        <Route path="/projects/:id/edit"      element={<PrivateRoute><ProjectEditPage /></PrivateRoute>} />
        <Route path="/projects/new"           element={<PrivateRoute><ProjectFormPage /></PrivateRoute>} />
        <Route path="/projects/:id/tasks"     element={<PrivateRoute><TaskListPage /></PrivateRoute>} />
        <Route path="/projects/:id/tasks/new" element={<PrivateRoute><TaskFormPage /></PrivateRoute>} />
        <Route path="/projects/:id/kanban"    element={<PrivateRoute><KanbanBoard /></PrivateRoute>} />
        <Route path="/chat"                   element={<PrivateRoute><ChatPage /></PrivateRoute>} />
        <Route path="/projects/:id/chat"      element={<PrivateRoute><ProjectChatPage /></PrivateRoute>} />
        <Route path="/profile"                element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
        <Route path="*"                       element={<NotFoundPage />} />
      </Routes>
    </motion.div>
  );
};

export const AppRouter = () => (
  <BrowserRouter>
    <AnimatedRoutes />
  </BrowserRouter>
);
