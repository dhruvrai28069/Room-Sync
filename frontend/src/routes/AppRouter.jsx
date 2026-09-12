import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

import Navbar from '../components/common/Navbar';
import Sidebar from '../components/common/Sidebar';

import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';

import StudentDashboard from '../pages/student/StudentDashboard';
import QuestionnairePage from '../pages/student/QuestionnairePage';
import RoommateViewPage from '../pages/student/RoommateViewPage';
import RoomChangePage from '../pages/student/RoomChangePage';
import FeedbackPage from '../pages/student/FeedbackPage';

import WardenDashboard from '../pages/warden/WardenDashboard';
import MatchingStudioPage from '../pages/warden/MatchingStudioPage';
import HostelRoomsPage from '../pages/warden/HostelRoomsPage';
import AllocationsPage from '../pages/warden/AllocationsPage';
import RequestsPage from '../pages/warden/RequestsPage';

import AdminDashboard from '../pages/admin/AdminDashboard';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center text-slate-600 dark:text-slate-400">
        <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full mr-3"></div>
        Authenticating Smart Hostel...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const MainLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

const AppRouter = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Student Routes */}
      <Route
        path="/student/dashboard"
        element={
          <ProtectedRoute allowedRoles={['STUDENT']}>
            <MainLayout><StudentDashboard /></MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/questionnaire"
        element={
          <ProtectedRoute allowedRoles={['STUDENT']}>
            <MainLayout><QuestionnairePage /></MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/roommate-view"
        element={
          <ProtectedRoute allowedRoles={['STUDENT']}>
            <MainLayout><RoommateViewPage /></MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/change-request"
        element={
          <ProtectedRoute allowedRoles={['STUDENT']}>
            <MainLayout><RoomChangePage /></MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/feedback"
        element={
          <ProtectedRoute allowedRoles={['STUDENT']}>
            <MainLayout><FeedbackPage /></MainLayout>
          </ProtectedRoute>
        }
      />

      {/* Warden Routes */}
      <Route
        path="/warden/dashboard"
        element={
          <ProtectedRoute allowedRoles={['WARDEN', 'SUPER_ADMIN']}>
            <MainLayout><WardenDashboard /></MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/warden/matching-studio"
        element={
          <ProtectedRoute allowedRoles={['WARDEN', 'SUPER_ADMIN']}>
            <MainLayout><MatchingStudioPage /></MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/warden/hostel-rooms"
        element={
          <ProtectedRoute allowedRoles={['WARDEN', 'SUPER_ADMIN']}>
            <MainLayout><HostelRoomsPage /></MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/warden/allocations"
        element={
          <ProtectedRoute allowedRoles={['WARDEN', 'SUPER_ADMIN']}>
            <MainLayout><AllocationsPage /></MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/warden/requests"
        element={
          <ProtectedRoute allowedRoles={['WARDEN', 'SUPER_ADMIN']}>
            <MainLayout><RequestsPage /></MainLayout>
          </ProtectedRoute>
        }
      />

      {/* Admin Routes */}
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
            <MainLayout><AdminDashboard /></MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/matching-config"
        element={
          <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
            <MainLayout><AdminDashboard /></MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/requests"
        element={
          <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
            <MainLayout><RequestsPage /></MainLayout>
          </ProtectedRoute>
        }
      />

      {/* Default Route Redirect */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default AppRouter;
