import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Jobs from './pages/Jobs';
import JobDetails from './pages/JobDetails';
import CollabSpace from './pages/CollabSpace';
import CommunityLayout from './components/CommunityLayout';
import { AuthProvider, useAuth } from './context/AuthContext';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import Portal from './pages/Portal';
import './index.css';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { token } = useAuth();
  if (!token) return <Navigate to="/auth" replace />;
  return <>{children}</>;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/portal" element={<ProtectedRoute><Portal /></ProtectedRoute>} />
          
          <Route path="/jobs" element={<ProtectedRoute><CommunityLayout><Jobs /></CommunityLayout></ProtectedRoute>} />
          <Route path="/jobs/:id" element={<ProtectedRoute><CommunityLayout><JobDetails /></CommunityLayout></ProtectedRoute>} />
          <Route path="/collab" element={<ProtectedRoute><CommunityLayout><CollabSpace /></CommunityLayout></ProtectedRoute>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
