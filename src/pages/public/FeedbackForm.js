import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import API from '../../services/api';

export default function FeedbackForm() {
  const { token } = useParams();
  const [feedback, setFeedback] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    technicalRating: 3,
    communicationRating: 3,
    problemSolvingRating: 3,
    attitudeRating: 3,
    writtenNotes: '',
    strengths: '',
    weaknesses: '',
    recommendation: 'YES',
  });

  useEffect(() => {
    fetchFeedback();
  // eslint-disable-next-line
  }, []);

  const fetchFeedback = async () => {
    try {
      const res = await API.get(`/api/feedback/form/${token}`);
      setFeedback(res.data);
      if (res.data.isSubmitted) setSubmitted(true);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post(`/api/feedback/submit/${token}`, form);
      setSubmitted(true);
    } catch (err) {
      alert('Failed to submit feedback');
    }
  };

  const RatingSelector = ({ label, field }) => (
    <div style={styles.ratingGroup}>
      <label style={styles.label}>{label}</label>
      <div style={styles.stars}>
        {[1, 2, 3, 4, 5].map(star => (
          <button
            key={star}
            type="button"
            onClick={() => setForm({ ...form, [field]: star })}
            style={{
              ...styles.star,
              color: star <= form[field] ? '#f6ad55' : '#e2e8f0',
            }}>
            ★
          </button>
        ))}
        <span style={styles.ratingValue}>{form[field]}/5</span>
      </div>
    </div>
  );

  if (loading) return (
    <div style={styles.center}>
      <p>Loading feedback form...</p>
    </div>
  );

  if (submitted) return (
    <div style={styles.center}>
      <div style={styles.successCard}>
        <div style={styles.successIcon}>✅</div>
        <h2 style={styles.successTitle}>Feedback Submitted!</h2>
        <p style={styles.successText}>
          Thank you. The recruiter has been notified.
        </p>
      </div>
    </div>
  );

  return (
    <div style={styles.container}>
      <div style={styles.card}>

        {/* Header */}
        <div style={styles.header}>
          <span style={styles.logo}>💼 HireDesk</span>
          <h1 style={styles.title}>Interview Feedback</h1>
          {feedback && (
            <div style={styles.candidateInfo}>
              <p style={styles.candidateName}>
                Candidate — {feedback.candidateName}
              </p>
              <p style={styles.roundName}>
                {feedback.roundName}
              </p>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit}>

          {/* Ratings */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>
              Rate the Candidate
            </h3>
            <RatingSelector
              label="Technical Skills"
              field="technicalRating"
            />
            <RatingSelector
              label="Communication"
              field="communicationRating"
            />
            <RatingSelector
              label="Problem Solving"
              field="problemSolvingRating"
            />
            <RatingSelector
              label="Attitude & Culture Fit"
              field="attitudeRating"
            />
          </div>

          {/* Notes */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>
              Detailed Feedback
            </h3>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Overall Notes</label>
              <textarea
                value={form.writtenNotes}
                onChange={(e) => setForm({
                  ...form, writtenNotes: e.target.value
                })}
                placeholder="Write your overall impression..."
                style={styles.textarea}
              />
            </div>
            <div style={styles.row}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Strengths</label>
                <textarea
                  value={form.strengths}
                  onChange={(e) => setForm({
                    ...form, strengths: e.target.value
                  })}
                  placeholder="Key strengths observed..."
                  style={{ ...styles.textarea, height: '80px' }}
                />
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>
                  Areas of Improvement
                </label>
                <textarea
                  value={form.weaknesses}
                  onChange={(e) => setForm({
                    ...form, weaknesses: e.target.value
                  })}
                  placeholder="Areas to improve..."
                  style={{ ...styles.textarea, height: '80px' }}
                />
              </div>
            </div>
          </div>

          {/* Recommendation */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>
              Final Recommendation
            </h3>
            <div style={styles.recommendations}>
              {[
                { value: 'STRONG_YES', label: '💪 Strong Yes', color: '#276749', bg: '#c6f6d5' },
                { value: 'YES', label: '✅ Yes', color: '#276749', bg: '#e8f5e9' },
                { value: 'MAYBE', label: '🤔 Maybe', color: '#744210', bg: '#fefcbf' },
                { value: 'NO', label: '❌ No', color: '#9b2c2c', bg: '#fff5f5' },
                { value: 'STRONG_NO', label: '🚫 Strong No', color: '#9b2c2c', bg: '#fed7d7' },
              ].map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setForm({
                    ...form, recommendation: opt.value
                  })}
                  style={{
                    padding: '10px 16px',
                    background: form.recommendation === opt.value
                      ? opt.bg : '#f7fafc',
                    color: form.recommendation === opt.value
                      ? opt.color : '#666',
                    border: form.recommendation === opt.value
                      ? `2px solid ${opt.color}`
                      : '2px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: 'pointer',
                  }}>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <button type="submit" style={styles.submitBtn}>
            Submit Feedback
          </button>

        </form>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    background: '#f5f6fa',
    padding: '32px 16px',
  },
  card: {
    background: 'white',
    borderRadius: '16px',
    padding: '32px',
    maxWidth: '700px',
    margin: '0 auto',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
  },
  header: {
    marginBottom: '32px',
    textAlign: 'center',
  },
  logo: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#667eea',
  },
  title: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#333',
    margin: '8px 0',
  },
  candidateInfo: {
    background: '#f0f4ff',
    borderRadius: '8px',
    padding: '12px',
    marginTop: '12px',
  },
  candidateName: {
    fontWeight: '700',
    color: '#333',
    marginBottom: '4px',
  },
  roundName: {
    color: '#667eea',
    fontSize: '14px',
  },
  section: {
    background: '#f8f9ff',
    borderRadius: '12px',
    padding: '20px',
    marginBottom: '20px',
  },
  sectionTitle: {
    fontSize: '15px',
    fontWeight: '700',
    color: '#333',
    marginBottom: '16px',
  },
  ratingGroup: { marginBottom: '16px' },
  label: {
    display: 'block',
    fontSize: '14px',
    fontWeight: '600',
    color: '#444',
    marginBottom: '6px',
  },
  stars: { display: 'flex', alignItems: 'center', gap: '4px' },
  star: {
    fontSize: '28px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '0',
    lineHeight: 1,
  },
  ratingValue: {
    fontSize: '14px',
    color: '#888',
    marginLeft: '8px',
  },
  row: { display: 'flex', gap: '16px' },
  inputGroup: { flex: 1, marginBottom: '14px' },
  textarea: {
    width: '100%',
    padding: '10px 14px',
    border: '2px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '14px',
    height: '100px',
    resize: 'vertical',
    boxSizing: 'border-box',
    outline: 'none',
  },
  recommendations: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
  },
  submitBtn: {
    width: '100%',
    padding: '14px',
    background: 'linear-gradient(135deg, #667eea, #764ba2)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: '8px',
  },
  center: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  successCard: {
    background: 'white',
    borderRadius: '16px',
    padding: '48px',
    textAlign: 'center',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
  },
  successIcon: { fontSize: '48px', marginBottom: '16px' },
  successTitle: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#333',
    marginBottom: '8px',
  },
  successText: { color: '#888', fontSize: '15px' },
};