import React, { useEffect, useState } from 'react';
import { useAuth, api } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Plus, BookOpen, Clock, Activity, Users, ChevronRight, Trash2, X } from 'lucide-react';

/* ──────────────────────────────────────────────────────────── */
/*  Root: routes to Admin or Student view                       */
/* ──────────────────────────────────────────────────────────── */
const Dashboard: React.FC = () => {
  const { user } = useAuth();
  if (user?.role === 'admin') return <AdminDashboard />;
  return <StudentDashboard />;
};

/* ──────────────────────────────────────────────────────────── */
/*  Stat Card                                                    */
/* ──────────────────────────────────────────────────────────── */
const StatCard: React.FC<{ label: string; value: string | number; icon: React.ReactNode; accent?: string }> = ({
  label, value, icon, accent = 'var(--amber)',
}) => (
  <div className="card" style={{ padding: '1.4rem 1.6rem', display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
    <div style={{
      width: 44, height: 44, borderRadius: 'var(--radius)',
      background: `rgba(${accent === 'var(--amber)' ? '232,169,77' : '77,191,154'}, 0.1)`,
      border: `1px solid rgba(${accent === 'var(--amber)' ? '232,169,77' : '77,191,154'}, 0.25)`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: accent, flexShrink: 0,
    }}>
      {icon}
    </div>
    <div>
      <div style={{ fontSize: '1.6rem', fontFamily: "'Playfair Display', serif", fontWeight: 700, lineHeight: 1 }}>
        {value}
      </div>
      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginTop: '0.3rem' }}>
        {label}
      </div>
    </div>
  </div>
);

/* ──────────────────────────────────────────────────────────── */
/*  Admin Dashboard                                             */
/* ──────────────────────────────────────────────────────────── */
const AdminDashboard: React.FC = () => {
  const [exams, setExams] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [newExam, setNewExam] = useState({ title: '', description: '', durationMinutes: 60 });
  const [questions, setQuestions] = useState<any[]>([
    { questionText: '', options: ['', '', '', ''], correctOptionIndex: 0, subject: '' },
  ]);
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchExams(); fetchSubmissions(); }, []);

  const fetchExams = async () => {
    const { data } = await api.get('/exams/admin');
    setExams(data.exams);
  };
  const fetchSubmissions = async () => {
    const { data } = await api.get('/exams/admin/submissions');
    setSubmissions(data.submissions);
  };

  const handleAddQuestion = () =>
    setQuestions([...questions, { questionText: '', options: ['', '', '', ''], correctOptionIndex: 0, subject: '' }]);

  const handleRemoveQuestion = (i: number) =>
    setQuestions(questions.filter((_, idx) => idx !== i));

  const handleQuestionChange = (i: number, field: string, value: any) => {
    const u = [...questions];
    u[i] = { ...u[i], [field]: value };
    setQuestions(u);
  };

  const handleOptionChange = (qi: number, oi: number, value: string) => {
    const u = [...questions];
    const opts = [...u[qi].options];
    opts[oi] = value;
    u[qi].options = opts;
    setQuestions(u);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/exams/admin', { ...newExam, questions });
      setShowCreate(false);
      setNewExam({ title: '', description: '', durationMinutes: 60 });
      setQuestions([{ questionText: '', options: ['', '', '', ''], correctOptionIndex: 0, subject: '' }]);
      fetchExams();
    } finally {
      setSaving(false);
    }
  };

  const optionLetters = ['A', 'B', 'C', 'D'];

  return (
    <div className="container">
      {/* Page header */}
      <div className="animate-fade-in" style={{ marginTop: '2rem', marginBottom: '2.5rem' }}>
        <p style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--amber)', marginBottom: '0.4rem' }}>
          Administrator Panel
        </p>
        <div className="flex justify-between items-center">
          <h2 style={{ margin: 0 }}>Exam Management</h2>
          <button
            onClick={() => setShowCreate(!showCreate)}
            className="btn btn-primary"
            style={{ gap: '0.5rem' }}
          >
            {showCreate ? <X size={15} /> : <Plus size={15} />}
            {showCreate ? 'Cancel' : 'New Exam'}
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div className="animate-fade-in-2" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2.5rem' }}>
        <StatCard label="Total Exams" value={exams.length} icon={<BookOpen size={18} />} />
        <StatCard label="Submissions" value={submissions.length} icon={<Activity size={18} />} accent="var(--jade)" />
        <StatCard label="Students" value={[...new Set(submissions.map((s: any) => s.studentId))].length} icon={<Users size={18} />} accent="var(--jade)" />
      </div>

      {/* Create exam panel */}
      {showCreate && (
        <div className="card animate-fade-in" style={{ marginBottom: '2.5rem', borderColor: 'rgba(232,169,77,0.2)' }}>
          <h3 style={{ marginBottom: '0.4rem' }}>New Examination</h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '2rem' }}>
            Fill in the exam details and build your question set below.
          </p>

          <form onSubmit={handleCreate}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1.5rem' }}>
              <div className="input-group" style={{ gridColumn: '1 / -1' }}>
                <label>Exam Title</label>
                <input required value={newExam.title} onChange={e => setNewExam({ ...newExam, title: e.target.value })} placeholder="e.g. Semester Finals — Physics" />
              </div>
              <div className="input-group" style={{ gridColumn: '1 / -1' }}>
                <label>Description</label>
                <input required value={newExam.description} onChange={e => setNewExam({ ...newExam, description: e.target.value })} placeholder="Brief description of the exam" />
              </div>
              <div className="input-group">
                <label>Duration (minutes)</label>
                <input type="number" required min={5} value={newExam.durationMinutes} onChange={e => setNewExam({ ...newExam, durationMinutes: Number(e.target.value) })} />
              </div>
            </div>

            {/* Questions */}
            <div className="divider" />
            <div className="flex justify-between items-center" style={{ marginBottom: '1.2rem' }}>
              <h4 style={{ color: 'var(--amber)' }}>Questions <span style={{ color: 'var(--text-dim)', fontFamily: "'DM Mono', monospace", fontSize: '0.85rem' }}>({questions.length})</span></h4>
            </div>

            {questions.map((q, qi) => (
              <div key={qi} style={{
                background: 'var(--ink-3)',
                border: '1px solid var(--border-dim)',
                borderRadius: 'var(--radius-lg)',
                padding: '1.4rem',
                marginBottom: '1rem',
                position: 'relative',
              }}>
                {/* Q header */}
                <div className="flex justify-between items-center" style={{ marginBottom: '1rem' }}>
                  <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.75rem', color: 'var(--amber)', letterSpacing: '0.06em' }}>
                    Q{String(qi + 1).padStart(2, '0')}
                  </span>
                  {questions.length > 1 && (
                    <button type="button" onClick={() => handleRemoveQuestion(qi)} className="btn btn-danger" style={{ padding: '0.3rem 0.6rem', fontSize: '0.72rem' }}>
                      <Trash2 size={12} /> Remove
                    </button>
                  )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '0 1rem' }}>
                  <div className="input-group" style={{ marginBottom: '0.8rem', gridColumn: '1 / -1' }}>
                    <label>Question Text</label>
                    <input required value={q.questionText} onChange={e => handleQuestionChange(qi, 'questionText', e.target.value)} placeholder="Enter your question…" />
                  </div>
                  <div className="input-group" style={{ marginBottom: '1rem' }}>
                    <label>Subject / Topic</label>
                    <input required value={q.subject} onChange={e => handleQuestionChange(qi, 'subject', e.target.value)} placeholder="e.g. Calculus" />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
                  {q.options.map((opt: string, oi: number) => (
                    <label
                      key={oi}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '0.7rem',
                        padding: '0.6rem 0.9rem',
                        borderRadius: 'var(--radius)',
                        background: q.correctOptionIndex === oi ? 'rgba(232,169,77,0.08)' : 'var(--ink-4)',
                        border: `1px solid ${q.correctOptionIndex === oi ? 'rgba(232,169,77,0.4)' : 'var(--border-dim)'}`,
                        cursor: 'pointer',
                        transition: 'var(--transition)',
                      }}
                    >
                      <input
                        type="radio"
                        name={`correct-${qi}`}
                        checked={q.correctOptionIndex === oi}
                        onChange={() => handleQuestionChange(qi, 'correctOptionIndex', oi)}
                        style={{ accentColor: 'var(--amber)', margin: 0, cursor: 'pointer' }}
                      />
                      <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.7rem', color: 'var(--amber)', minWidth: 14 }}>
                        {optionLetters[oi]}
                      </span>
                      <input
                        required
                        value={opt}
                        onChange={e => handleOptionChange(qi, oi, e.target.value)}
                        placeholder={`Option ${optionLetters[oi]}`}
                        style={{ flex: 1, background: 'transparent', border: 'none', color: 'var(--text)', fontSize: '0.85rem', fontFamily: "'DM Sans', sans-serif", outline: 'none', padding: 0 }}
                      />
                    </label>
                  ))}
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={handleAddQuestion}
              className="btn btn-ghost"
              style={{ width: '100%', padding: '0.85rem', marginBottom: '1.5rem', borderStyle: 'dashed' }}
            >
              <Plus size={15} /> Add Question
            </button>

            <button type="submit" className="btn btn-primary" disabled={saving} style={{ width: '100%', padding: '0.9rem' }}>
              {saving ? 'Saving…' : 'Publish Exam'}
            </button>
          </form>
        </div>
      )}

      {/* Bottom grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>

        {/* Exams list */}
        <div className="card animate-fade-in-3">
          <h3 style={{ marginBottom: '0.3rem' }}>Active Exams</h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.4rem' }}>
            {exams.length} examination{exams.length !== 1 ? 's' : ''} published
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            {exams.length === 0 && (
              <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)', textAlign: 'center', padding: '2rem 0' }}>
                No exams yet. Create one above.
              </p>
            )}
            {exams.map((exam, i) => (
              <div key={i} style={{
                padding: '1rem 1.2rem',
                background: 'var(--ink-3)',
                borderRadius: 'var(--radius)',
                border: '1px solid var(--border-dim)',
                display: 'flex', alignItems: 'center', gap: '1rem',
                transition: 'var(--transition)',
              }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(232,169,77,0.25)')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border-dim)')}
              >
                <div style={{
                  width: 36, height: 36, borderRadius: 'var(--radius)',
                  background: 'var(--amber-glow)', border: '1px solid rgba(232,169,77,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--amber)', flexShrink: 0,
                }}>
                  <BookOpen size={16} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {exam.title}
                  </div>
                  <div className="flex gap-2 mt-2" style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                    <span className="flex items-center gap-2"><Clock size={12} /> {exam.durationMinutes}m</span>
                    <span className="flex items-center gap-2"><BookOpen size={12} /> {exam.questions?.length || 0} Qs</span>
                  </div>
                </div>
                <ChevronRight size={16} style={{ color: 'var(--text-dim)', flexShrink: 0 }} />
              </div>
            ))}
          </div>
        </div>

        {/* Submissions list */}
        <div className="card animate-fade-in-4">
          <h3 style={{ marginBottom: '0.3rem' }}>Submissions</h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.4rem' }}>
            {submissions.length} result{submissions.length !== 1 ? 's' : ''} recorded
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            {submissions.length === 0 && (
              <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)', textAlign: 'center', padding: '2rem 0' }}>
                No submissions yet.
              </p>
            )}
            {submissions.map((sub, i) => {
              const pct = Math.round((sub.score / sub.totalMarks) * 100);
              const good = pct >= 60;
              return (
                <div key={i} style={{
                  padding: '1rem 1.2rem',
                  background: 'var(--ink-3)',
                  borderRadius: 'var(--radius)',
                  border: '1px solid var(--border-dim)',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}>
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>{sub.examTitle}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: "'DM Mono', monospace" }}>
                      {sub.studentId}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.1rem', fontWeight: 700, color: good ? 'var(--jade)' : 'var(--crimson)' }}>
                      {sub.score}/{sub.totalMarks}
                    </div>
                    <span className={`badge ${good ? 'badge-jade' : 'badge-red'}`} style={{ marginTop: '0.2rem' }}>
                      {pct}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ──────────────────────────────────────────────────────────── */
/*  Student Dashboard                                           */
/* ──────────────────────────────────────────────────────────── */
const StudentDashboard: React.FC = () => {
  const [exams, setExams] = useState<any[]>([]);
  const [results, setResults] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => { fetchExams(); fetchResults(); }, []);

  const fetchExams = async () => {
    const { data } = await api.get('/exams/student');
    setExams(data.exams);
  };
  const fetchResults = async () => {
    const { data } = await api.get('/exams/student/results/me');
    setResults(data.results);
  };

  return (
    <div className="container">
      <div className="animate-fade-in" style={{ marginTop: '2rem', marginBottom: '2.5rem' }}>
        <p style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--amber)', marginBottom: '0.4rem' }}>
          Student Portal
        </p>
        <h2 style={{ margin: 0 }}>My Dashboard</h2>
      </div>

      {/* Stats */}
      <div className="animate-fade-in-2" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2.5rem' }}>
        <StatCard label="Available Exams" value={exams.length} icon={<BookOpen size={18} />} />
        <StatCard label="Completed" value={results.length} icon={<Activity size={18} />} accent="var(--jade)" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>

        {/* Available exams */}
        <div className="card animate-fade-in-3">
          <h3 style={{ marginBottom: '0.3rem' }}>Available Exams</h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.4rem' }}>
            Select an exam to begin
          </p>
          {exams.length === 0 && (
            <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)', textAlign: 'center', padding: '2rem 0' }}>
              No exams available right now.
            </p>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            {exams.map((exam, i) => (
              <div key={i} style={{
                padding: '1.2rem',
                background: 'var(--ink-3)',
                borderRadius: 'var(--radius)',
                border: '1px solid var(--border-dim)',
                transition: 'var(--transition)',
              }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(232,169,77,0.25)')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border-dim)')}
              >
                <div style={{ fontWeight: 600, marginBottom: '0.35rem' }}>{exam.title}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem', lineHeight: 1.5 }}>
                  {exam.description}
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2" style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                    <Clock size={13} />
                    <span style={{ fontFamily: "'DM Mono', monospace" }}>{exam.durationMinutes}m</span>
                  </div>
                  <button
                    onClick={() => navigate(`/exam/${exam.id}`)}
                    className="btn btn-primary"
                    style={{ padding: '0.45rem 1rem', fontSize: '0.78rem' }}
                  >
                    Start <ChevronRight size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Results */}
        <div className="card animate-fade-in-4">
          <h3 style={{ marginBottom: '0.3rem' }}>My Results</h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.4rem' }}>
            Your exam history
          </p>
          {results.length === 0 && (
            <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)', textAlign: 'center', padding: '2rem 0' }}>
              You haven't taken any exams yet.
            </p>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            {results.map((res, i) => {
              const pct = Math.round((res.score / res.totalMarks) * 100);
              const good = pct >= 60;
              return (
                <div key={i} style={{
                  padding: '1.2rem',
                  background: 'var(--ink-3)',
                  borderRadius: 'var(--radius)',
                  borderLeft: `3px solid ${good ? 'var(--jade)' : 'var(--crimson)'}`,
                  border: `1px solid var(--border-dim)`,
                  borderLeftWidth: '3px',
                  borderLeftColor: good ? 'var(--jade)' : 'var(--crimson)',
                }}>
                  <div className="flex justify-between items-center">
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{res.examTitle}</div>
                    <span className={`badge ${good ? 'badge-jade' : 'badge-red'}`}>{pct}%</span>
                  </div>
                  <div className="flex justify-between" style={{ marginTop: '0.5rem' }}>
                    <span style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.25rem', fontWeight: 700, color: good ? 'var(--jade)' : 'var(--crimson)' }}>
                      {res.score} <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontFamily: "'DM Sans', sans-serif" }}>/ {res.totalMarks}</span>
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontFamily: "'DM Mono', monospace", alignSelf: 'flex-end' }}>
                      {new Date(res.submittedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
