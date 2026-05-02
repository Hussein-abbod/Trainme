import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import { ToastProvider } from './context/ToastContext.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

// Pages
import Home from './pages/Home.jsx';
import Login from './pages/auth/Login.jsx';
import RoleSelection from './pages/auth/RoleSelection.jsx';
import StudentRegister from './pages/auth/StudentRegister.jsx';
import CompanyRegister from './pages/auth/CompanyRegister.jsx';
import ForgotPassword from './pages/auth/ForgotPassword.jsx';

import DiscoveryFeed from './pages/student/DiscoveryFeed.jsx';
import InternshipDetail from './pages/student/InternshipDetail.jsx';
import MyApplications from './pages/student/MyApplications.jsx';
import StudentProfile from './pages/student/StudentProfile.jsx';
import SavedInternships from './pages/student/SavedInternships.jsx';
import ApplicationSuccess from './pages/student/ApplicationSuccess.jsx';

import CompanyDashboard from './pages/company/CompanyDashboard.jsx';
import ApplicantTracking from './pages/company/ApplicantTracking.jsx';
import CreateInternship from './pages/company/CreateInternship.jsx';
import CompanyProfileEdit from './pages/company/CompanyProfileEdit.jsx';
import CompaniesDirectory from './pages/company/CompaniesDirectory.jsx';

import Messages from './pages/shared/Messages.jsx';
import Notifications from './pages/shared/Notifications.jsx';

import About from './pages/info/About.jsx';
import Privacy from './pages/info/Privacy.jsx';
import Terms from './pages/info/Terms.jsx';
import Settings from './pages/info/Settings.jsx';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            {/* Public */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<RoleSelection />} />
            <Route path="/register/student" element={<StudentRegister />} />
            <Route path="/register/company" element={<CompanyRegister />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            {/* Info */}
            <Route path="/about" element={<About />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/settings" element={<Settings />} />

            {/* Student - protected */}
            <Route element={<ProtectedRoute requiredRole="student" />}>
              <Route path="/discover" element={<DiscoveryFeed />} />
              <Route path="/internship/:id" element={<InternshipDetail />} />
              <Route path="/applications" element={<MyApplications />} />
              <Route path="/profile" element={<StudentProfile />} />
              <Route path="/saved" element={<SavedInternships />} />
              <Route path="/application-success" element={<ApplicationSuccess />} />
            </Route>

            {/* Company - protected */}
            <Route element={<ProtectedRoute requiredRole="company" />}>
              <Route path="/dashboard" element={<CompanyDashboard />} />
              <Route path="/applicants" element={<ApplicantTracking />} />
              <Route path="/post-internship" element={<CreateInternship />} />
              <Route path="/company-profile" element={<CompanyProfileEdit />} />
            </Route>

            {/* Shared - any authenticated */}
            <Route element={<ProtectedRoute />}>
              <Route path="/companies" element={<CompaniesDirectory />} />
              <Route path="/messages" element={<Messages />} />
              <Route path="/notifications" element={<Notifications />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
