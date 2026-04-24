import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ExamInterface from './pages/ExamInterface';
import ProtectedRoute from './components/ProtectedRoute';
import { LogOut, BookMarked } from 'lucide-react';

const TopNav: React.FC = () => {
  const { user, logout } = useAuth();
  if (!user) return null;

  return (
    <header className="glass-header">
      <div className="container flex justify-between items-center" style={{ padding: '0.85rem 2rem' }}>
        {/* Logo */}
        <div className="flex items-center gap-2">
          <BookMarked size={18} style={{ color: 'var(--amber)' }} />
          <h1 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: '1.2rem',
            fontWeight: 700,
            letterSpacing: '-0.01em',
            color: 'var(--text)',
          }}>
            Cloud<span style={{ color: 'var(--amber)' }}>Exam</span>
          </h1>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', letterSpacing: '0.02em' }}>
              {user.name}
            </span>
            <span className={`badge ${user.role === 'admin' ? 'badge-amber' : 'badge-jade'}`}>
              {user.role}
            </span>
          </div>

          <div style={{ width: '1px', height: '20px', background: 'var(--border)' }} />

          <button
            onClick={logout}
            className="btn btn-ghost"
            style={{ padding: '0.4rem 0.8rem', gap: '0.4rem' }}
            title="Sign out"
          >
            <LogOut size={14} />
            <span style={{ fontSize: '0.75rem' }}>Out</span>
          </button>
        </div>
      </div>
    </header>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <TopNav />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/exam/:id" element={<ExamInterface />} />
        </Route>
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
};

export default App;
