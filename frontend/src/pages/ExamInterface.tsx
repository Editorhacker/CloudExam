import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../context/AuthContext';
import { Clock, AlertTriangle, CheckCircle, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';

const ExamInterface: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [exam, setExam] = useState<any>(null);
  const [answers, setAnswers] = useState<{ [key: number]: number }>({});
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [warnings, setWarnings] = useState(0);
  const [currentQ, setCurrentQ] = useState(0);

  const fetchExam = useCallback(async () => {
    try {
      const { data } = await api.get(`/exams/student/${id}`);
      setExam(data.exam);
      setTimeLeft(data.exam.durationMinutes * 60);
    } catch {
      navigate('/dashboard');
    }
  }, [id, navigate]);

  useEffect(() => { fetchExam(); }, [fetchExam]);

  useEffect(() => {
    if (timeLeft === null || isSubmitting || result) return;
    if (timeLeft <= 0) { handleSubmit(); return; }
    const t = setInterval(() => setTimeLeft(p => p !== null ? p - 1 : null), 1000);
    return () => clearInterval(t);
  }, [timeLeft, isSubmitting, result]);

  useEffect(() => {
    const onVisibility = () => {
      if (document.hidden && !result && !isSubmitting) {
        setWarnings(w => w + 1);
        alert('Warning: Tab switching is not allowed during the exam!');
      }
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, [result, isSubmitting]);

  const handleOptionSelect = (qi: number, oi: number) =>
    setAnswers(prev => ({ ...prev, [qi]: oi }));

  const handleSubmit = async () => {
    if (isSubmitting || result) return;
    setIsSubmitting(true);
    try {
      const answersArray = exam.questions.map((_: any, i: number) => answers[i] ?? -1);
      const { data } = await api.post('/exams/student/submit', { examId: exam.id, answers: answersArray });
      setResult(data.result);
    } catch {
      alert('Failed to submit exam. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  };

  const optionLetters = ['A', 'B', 'C', 'D'];

  /* ── Loading ── */
  if (!exam) return (
    <div className="container" style={{ textAlign: 'center' }}>
      <div className="spinner" />
      <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '1rem' }}>Loading examination…</p>
    </div>
  );

  /* ── Result Screen ── */
  if (result) {
    const pct = ((result.score / result.totalMarks) * 100).toFixed(1);
    const passed = parseFloat(pct) >= 60;

    return (
      <div className="container animate-fade-in" style={{ maxWidth: '760px', paddingTop: '3rem', paddingBottom: '4rem' }}>

        {/* Hero result */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 72, height: 72, borderRadius: '50%',
            background: passed ? 'rgba(77,191,154,0.1)' : 'rgba(232,96,77,0.1)',
            border: `2px solid ${passed ? 'var(--jade)' : 'var(--crimson)'}`,
            marginBottom: '1.5rem',
          }}>
            <CheckCircle size={32} style={{ color: passed ? 'var(--jade)' : 'var(--crimson)' }} />
          </div>
          <h2 style={{ marginBottom: '0.4rem' }}>Exam Submitted</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{exam.title}</p>
        </div>

        {/* Score card */}
        <div className="card" style={{ textAlign: 'center', padding: '2.5rem', marginBottom: '2rem', borderColor: passed ? 'rgba(77,191,154,0.2)' : 'rgba(232,96,77,0.2)' }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '3rem', flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Score</div>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '3rem', fontWeight: 900, color: passed ? 'var(--jade)' : 'var(--crimson)', lineHeight: 1 }}>
                {result.score}
                <span style={{ fontSize: '1.5rem', color: 'var(--text-muted)', marginLeft: '0.3rem' }}>/ {result.totalMarks}</span>
              </div>
            </div>
            <div style={{ width: 1, background: 'var(--border)' }} />
            <div>
              <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Percentage</div>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '3rem', fontWeight: 900, color: passed ? 'var(--jade)' : 'var(--crimson)', lineHeight: 1 }}>
                {pct}%
              </div>
            </div>
          </div>
          <div style={{ marginTop: '1.5rem' }}>
            <span className={`badge ${passed ? 'badge-jade' : 'badge-red'}`} style={{ fontSize: '0.78rem', padding: '0.35rem 1rem' }}>
              {passed ? '✓ Passed' : '✗ Did not pass'}
            </span>
          </div>
        </div>

        {/* Per-question review */}
        <h3 style={{ marginBottom: '1rem' }}>Review</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', marginBottom: '2.5rem' }}>
          {result.evaluation?.map((ev: any, i: number) => (
            <div key={i} style={{
              padding: '1.2rem',
              background: 'var(--ink-2)',
              borderRadius: 'var(--radius)',
              borderLeft: `3px solid ${ev.isCorrect ? 'var(--jade)' : 'var(--crimson)'}`,
              border: '1px solid var(--border-dim)',
              borderLeftWidth: '3px',
              borderLeftColor: ev.isCorrect ? 'var(--jade)' : 'var(--crimson)',
            }}>
              <div style={{ fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.9rem', lineHeight: 1.5 }}>
                <span style={{ fontFamily: "'DM Mono', monospace", color: 'var(--text-dim)', marginRight: '0.5rem', fontSize: '0.75rem' }}>
                  Q{String(i + 1).padStart(2, '0')}
                </span>
                {ev.questionText}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Your answer: <span style={{ color: ev.isCorrect ? 'var(--jade)' : 'var(--crimson)', fontWeight: 600 }}>
                  {ev.selectedOption !== -1 ? `Option ${optionLetters[ev.selectedOption]}` : 'Not answered'}
                </span>
              </div>
              {!ev.isCorrect && (
                <div style={{ fontSize: '0.8rem', color: 'var(--jade)', marginTop: '0.2rem' }}>
                  Correct: <span style={{ fontWeight: 600 }}>Option {optionLetters[ev.correctOption]}</span>
                </div>
              )}
            </div>
          ))}
        </div>

        <div style={{ textAlign: 'center' }}>
          <button onClick={() => navigate('/dashboard')} className="btn btn-primary" style={{ padding: '0.85rem 2.5rem' }}>
            Return to Dashboard <ArrowRight size={15} />
          </button>
        </div>
      </div>
    );
  }

  /* ── Exam Interface ── */
  const q = exam.questions[currentQ];
  const answered = Object.keys(answers).length;
  const total = exam.questions.length;
  const isLow = timeLeft !== null && timeLeft < 300;

  return (
    <div style={{ userSelect: 'none' }} onCopy={e => { e.preventDefault(); }}>

      {/* Sticky top bar */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(12,12,16,0.9)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--border)',
        padding: '0.85rem 0',
      }}>
        <div className="container flex justify-between items-center" style={{ padding: '0 2rem' }}>
          <div>
            <div style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: '1rem' }}>{exam.title}</div>
            {warnings > 0 && (
              <div className="flex items-center gap-2" style={{ color: 'var(--crimson)', fontSize: '0.75rem', marginTop: '0.2rem' }}>
                <AlertTriangle size={13} />
                {warnings} tab-switch warning{warnings > 1 ? 's' : ''} logged
              </div>
            )}
          </div>

          {/* Timer */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.6rem',
            background: isLow ? 'rgba(232,96,77,0.1)' : 'var(--ink-3)',
            border: `1px solid ${isLow ? 'rgba(232,96,77,0.4)' : 'var(--border)'}`,
            borderRadius: 'var(--radius)',
            padding: '0.5rem 1rem',
            fontFamily: "'DM Mono', monospace",
            fontSize: '1.1rem', fontWeight: 500,
            color: isLow ? 'var(--crimson)' : 'var(--text)',
            transition: 'var(--transition)',
          }}>
            <Clock size={16} style={{ color: isLow ? 'var(--crimson)' : 'var(--amber)' }} />
            {timeLeft !== null ? formatTime(timeLeft) : '--:--'}
          </div>
        </div>

        {/* Progress bar */}
        <div style={{ height: '2px', background: 'var(--ink-3)', marginTop: '0.85rem', position: 'relative' }}>
          <div style={{
            height: '100%',
            width: `${((currentQ + 1) / total) * 100}%`,
            background: 'linear-gradient(90deg, var(--amber-dim), var(--amber))',
            transition: 'width 0.4s var(--ease)',
          }} />
        </div>
      </div>

      <div className="container" style={{ maxWidth: '720px', paddingTop: '2.5rem', paddingBottom: '6rem' }}>

        {/* Question navigator dots */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '2rem' }}>
          {exam.questions.map((_: any, i: number) => (
            <button
              key={i}
              onClick={() => setCurrentQ(i)}
              style={{
                width: 32, height: 32, borderRadius: 'var(--radius)',
                fontFamily: "'DM Mono', monospace", fontSize: '0.7rem', fontWeight: 600,
                border: `1px solid ${i === currentQ ? 'var(--amber)' : answers[i] !== undefined ? 'rgba(77,191,154,0.5)' : 'var(--border-dim)'}`,
                background: i === currentQ ? 'var(--amber-glow)' : answers[i] !== undefined ? 'rgba(77,191,154,0.08)' : 'var(--ink-3)',
                color: i === currentQ ? 'var(--amber)' : answers[i] !== undefined ? 'var(--jade)' : 'var(--text-muted)',
                cursor: 'pointer',
                transition: 'var(--transition)',
              }}
            >
              {i + 1}
            </button>
          ))}
        </div>

        {/* Question card */}
        <div className="card animate-fade-in" key={currentQ} style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.2rem' }}>
            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.75rem', color: 'var(--amber)', letterSpacing: '0.06em' }}>
              Q{String(currentQ + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
            </span>
            {q.subject && <span className="badge badge-amber">{q.subject}</span>}
          </div>

          <h3 style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: '1rem', lineHeight: 1.65, marginBottom: '1.8rem', letterSpacing: 0 }}>
            {q.questionText}
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {q.options.map((opt: string, j: number) => {
              const selected = answers[currentQ] === j;
              return (
                <label
                  key={j}
                  className={`option-label ${selected ? 'selected' : ''}`}
                  onClick={() => handleOptionSelect(currentQ, j)}
                >
                  <div className="option-bullet">{optionLetters[j]}</div>
                  <span style={{ fontSize: '0.9rem', lineHeight: 1.5 }}>{opt}</span>
                </label>
              );
            })}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <button
            onClick={() => setCurrentQ(q => Math.max(0, q - 1))}
            disabled={currentQ === 0}
            className="btn btn-ghost"
            style={{ gap: '0.4rem' }}
          >
            <ChevronLeft size={15} /> Previous
          </button>

          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontFamily: "'DM Mono', monospace" }}>
            {answered}/{total} answered
          </span>

          {currentQ < total - 1 ? (
            <button onClick={() => setCurrentQ(q => q + 1)} className="btn btn-ghost" style={{ gap: '0.4rem' }}>
              Next <ChevronRight size={15} />
            </button>
          ) : (
            <button
              onClick={() => {
                if (window.confirm(`Submit exam? You've answered ${answered} of ${total} questions.`))
                  handleSubmit();
              }}
              className="btn btn-primary"
              disabled={isSubmitting}
              style={{ gap: '0.5rem' }}
            >
              {isSubmitting ? 'Submitting…' : <> Submit Exam <ArrowRight size={14} /></>}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExamInterface;
