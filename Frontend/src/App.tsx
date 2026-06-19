import { useState, useEffect } from 'react';
import { authAPI } from './lib/api';
import LandingPage from './components/LandingPage';
import AuthPage from './components/AuthPage';
import ResumeUserDashboard from './components/ResumeUserDashboard';
import RecruiterDashboard from './components/RecruiterDashboard';
import AdminDashboard from './components/AdminDashboard';
import EmailVerificationPage from './components/EmailVerificationPage';

export default function App() {
  const [currentView, setCurrentView] = useState<'landing' | 'auth' | 'dashboard' | 'verify'>('landing');
  const [selectedRole, setSelectedRole] = useState<'user' | 'recruiter' | 'admin' | null>(null);
  const [user, setUser] = useState<any>(null);
  const [error, setError] = useState('');
  const [verificationToken, setVerificationToken] = useState<string | null>(null);

  useEffect(() => {
    const url = new URL(window.location.href);
    if (url.pathname === '/verify-email') {
      setVerificationToken(url.searchParams.get('token'));
      setCurrentView('verify');
      return;
    }

    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await authAPI.getCurrentUser();
      if (response.user) {
        setUser(response.user);
        setSelectedRole(response.user.role || 'user');
        setCurrentView('dashboard');
      }
    } catch (error) {
      console.log('Not authenticated');
    }
  };

  const handleRoleSelect = (role: 'user' | 'recruiter' | 'admin') => {
    setSelectedRole(role);
    setCurrentView('auth');
  };

  const handleLogin = async (email: string, password: string, name?: string, role?: string) => {
    setError('');
    try {
      let response;
      if (name) {
        // Signup
        response = await authAPI.signup(name, email, password, role);
      } else {
        // Login
        response = await authAPI.login(email, password);
      }

      if (response.user) {
        setUser(response.user);
        setCurrentView('dashboard');
      } else {
        setError(response.message || 'Authentication failed');
      }
    } catch (error: any) {
      setError(error.message || 'An error occurred. Please try again.');
      console.error('Auth error:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await authAPI.logout();
      setUser(null);
      setSelectedRole(null);
      setCurrentView('landing');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleBackToRoleSelection = () => {
    setSelectedRole(null);
    setCurrentView('landing');
    setError('');
  };

  const handleVerificationDone = () => {
    setCurrentView('landing');
    setSelectedRole(null);
    setVerificationToken(null);
  };

  return (
    <div className="min-h-screen">
      {currentView === 'landing' && (
        <LandingPage onRoleSelect={handleRoleSelect} />
      )}

      {currentView === 'auth' && selectedRole && (
        <AuthPage
          role={selectedRole}
          onLogin={handleLogin}
          onBack={handleBackToRoleSelection}
          error={error}
        />
      )}

      {currentView === 'verify' && (
        <EmailVerificationPage token={verificationToken} onDone={handleVerificationDone} />
      )}

      {currentView === 'dashboard' && user && selectedRole === 'user' && (
        <ResumeUserDashboard user={user} onLogout={handleLogout} />
      )}

      {currentView === 'dashboard' && user && selectedRole === 'recruiter' && (
        <RecruiterDashboard user={user} onLogout={handleLogout} />
      )}

      {currentView === 'dashboard' && user && selectedRole === 'admin' && (
        <AdminDashboard user={user} onLogout={handleLogout} />
      )}
    </div>
  );
}
