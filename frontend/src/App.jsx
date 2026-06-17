import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import CoursesPage from './pages/CoursesPage';
import CourseDetailPage from './pages/CourseDetailPage';
import CreateCoursePage from './pages/CreateCoursePage';
import CreateLessonPage from './pages/CreateLessonPage';
import LessonPage from './pages/LessonPage';
import CreateTaskPage from './pages/CreateTaskPage';
import TaskPage from './pages/TaskPage';
import SuperAdminPage from './pages/SuperAdminPage';

function PrivateRoute({ children, roles }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="text-center py-16 text-zinc-400">Cargando...</div>;
  if (!user) return <Navigate to="/login" />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" />;
  return children;
}

function AppRoutes() {
  const { user } = useAuth();
  const location = useLocation();
  const isLanding = location.pathname === '/';
  const isAuthPage = ['/login', '/register'].includes(location.pathname);
  const hideNavbar = isLanding || isAuthPage;

  const homeRedirect = user
    ? user.role === 'SUPER_ADMIN'
      ? '/superadmin'
      : '/dashboard'
    : null;

  return (
    <div className="min-h-screen bg-zinc-950">
      {!hideNavbar && <Navbar />}
      <main>
        <Routes>
          <Route path="/" element={homeRedirect ? <Navigate to={homeRedirect} /> : <Landing />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/courses" element={<CoursesPage />} />
          <Route path="/courses/:id" element={<CourseDetailPage />} />
          <Route path="/dashboard" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
          <Route path="/courses/create" element={<PrivateRoute><CreateCoursePage /></PrivateRoute>} />
          <Route path="/courses/:courseId/lessons/create" element={<PrivateRoute><CreateLessonPage /></PrivateRoute>} />
          <Route path="/lessons/:id" element={<PrivateRoute><LessonPage /></PrivateRoute>} />
          <Route path="/courses/:courseId/tasks/create" element={<PrivateRoute><CreateTaskPage /></PrivateRoute>} />
          <Route path="/tasks/:id" element={<PrivateRoute><TaskPage /></PrivateRoute>} />
          <Route
            path="/superadmin"
            element={
              <PrivateRoute roles={['SUPER_ADMIN']}>
                <SuperAdminPage />
              </PrivateRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#18181b',
            color: '#fafafa',
            border: '1px solid #3f3f46',
          },
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
