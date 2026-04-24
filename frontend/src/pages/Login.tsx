import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, api } from '../context/AuthContext';
import { LogIn, UserPlus, BookMarked, ArrowRight } from 'lucide-react';

const Login: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'student' | 'admin'>('student');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (isLogin) {
        const { data } = await api.post('/auth/login', { email, password });
        login(data.token, data.user);
        navigate('/dashboard');
      } else {
        await api.post('/auth/register', { email, password, name, role });
        setIsLogin(true);
        setSuccess('Account created — please sign in.');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      position: 'relative',
      overflow: 'hidden',
    }}>

      {/* Ambient glow */}
      <div style={{
        position: 'fixed',
        top: '20%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '600px', height: '400px',
        background: 'radial-gradient(ellipse, rgba(232,169,77,0.08) 0%, transparent 70%)',
        pointerEvents: 'none',
        zIndex: 0,
      }} />

      <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: '420px' }}>

        {/* Brand mark */}
        <div className="animate-fade-in" style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: '52px', height: '52px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, rgba(232,169,77,0.2), rgba(232,169,77,0.05))',
            border: '1px solid rgba(232,169,77,0.3)',
            marginBottom: '1rem',
          }}>
            <BookMarked size={24} style={{ color: 'var(--amber)' }} />
          </div>
          <h1 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: '2rem', fontWeight: 900,
            letterSpacing: '-0.03em',
            marginBottom: '0.4rem',
          }}>
            Cloud<span style={{ color: 'var(--amber)' }}>Exam</span>
          </h1>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            Online Examination Platform
          </p>
        </div>

        {/* Card */}
        <div className="card animate-fade-in-2" style={{ padding: '2.5rem' }}>
          {/* Tab toggle */}
          <div style={{
            display: 'flex',
            background: 'var(--ink-3)',
            borderRadius: 'var(--radius)',
            padding: '3px',
            marginBottom: '2rem',
            border: '1px solid var(--border-dim)',
          }}>
            {['Sign In', 'Create Account'].map((tab, idx) => (
              <button
                key={tab}
                onClick={() => { setIsLogin(idx === 0); setError(''); setSuccess(''); }}
                style={{
                  flex: 1, padding: '0.55rem',
                  borderRadius: 'calc(var(--radius) - 2px)',
                  fontSize: '0.8rem', fontWeight: 600,
                  letterSpacing: '0.04em', textTransform: 'uppercase',
                  transition: 'var(--transition)',
                  background: isLogin === (idx === 0) ? 'var(--ink-4)' : 'transparent',
                  color: isLogin === (idx === 0) ? 'var(--amber)' : 'var(--text-muted)',
                  border: isLogin === (idx === 0) ? '1px solid var(--border)' : '1px solid transparent',
                }}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Feedback */}
          {error && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '0.6rem',
              background: 'rgba(232,96,77,0.08)',
              border: '1px solid rgba(232,96,77,0.25)',
              borderRadius: 'var(--radius)',
              padding: '0.75rem 1rem',
              marginBottom: '1.2rem',
              fontSize: '0.85rem', color: 'var(--crimson)',
            }}>
              {error}
            </div>
          )}
          {success && (
            <div style={{
              background: 'rgba(77,191,154,0.08)',
              border: '1px solid rgba(77,191,154,0.25)',
              borderRadius: 'var(--radius)',
              padding: '0.75rem 1rem',
              marginBottom: '1.2rem',
              fontSize: '0.85rem', color: 'var(--jade)',
            }}>
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {!isLogin && (
              <div className="input-group">
                <label>Full Name</label>
                <input required type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Jane Doe" />
              </div>
            )}

            <div className="input-group">
              <label>Email Address</label>
              <input required type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@university.edu" />
            </div>

            <div className="input-group">
              <label>Password</label>
              <input required type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" />
            </div>

            {!isLogin && (
              <div className="input-group">
                <label>Role</label>
                <select value={role} onChange={e => setRole(e.target.value as any)}>
                  <option value="student">Student</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ width: '100%', padding: '0.85rem', marginTop: '0.5rem', fontSize: '0.85rem', gap: '0.6rem' }}
            >
              {loading ? (
                <span style={{ opacity: 0.7 }}>Please wait…</span>
              ) : (
                <>
                  {isLogin ? <LogIn size={16} /> : <UserPlus size={16} />}
                  {isLogin ? 'Sign In' : 'Create Account'}
                  <ArrowRight size={14} style={{ marginLeft: '2px' }} />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer note */}
        <p className="animate-fade-in-3" style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.78rem', color: 'var(--text-dim)' }}>
          Secure · Monitored · Cloud-Based
        </p>
      </div>
    </div>
  );
};

export default Login;
