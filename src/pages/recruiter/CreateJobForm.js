import React, { useState } from 'react';
import API from '../../services/api';

export default function CreateJobForm({ onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    title: '',
    description: '',
    department: '',
    location: '',
    jobType: 'FULL_TIME',
    deadline: '',
  });
  const [rounds, setRounds] = useState([
    { roundNumber: 1, roundName: 'DSA Round', roundType: 'TECHNICAL' },
  ]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRoundChange = (index, field, value) => {
    const updated = [...rounds];
    updated[index][field] = value;
    setRounds(updated);
  };

  const addRound = () => {
    setRounds([...rounds, {
      roundNumber: rounds.length + 1,
      roundName: '',
      roundType: 'TECHNICAL',
    }]);
  };

  const removeRound = (index) => {
    if (rounds.length === 1) return;
    const updated = rounds.filter((_, i) => i !== index)
      .map((r, i) => ({ ...r, roundNumber: i + 1 }));
    setRounds(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await API.post('/api/jobs', {
        ...form,
        rounds,
      });
      onSuccess();
      onClose();
    } catch (err) {
      setError('Failed to create job. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>

        {/* Header */}
        <div style={styles.modalHeader}>
          <h2 style={styles.modalTitle}>
            💼 Create New Job
          </h2>
          <button onClick={onClose} style={styles.closeBtn}>
            ✕
          </button>
        </div>

        {error && (
          <div style={styles.error}>{error}</div>
        )}

        <form onSubmit={handleSubmit}>

          {/* Job Details */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Job Details</h3>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Job Title *</label>
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="Senior Java Developer"
                style={styles.input}
                required
              />
            </div>

            <div style={styles.row}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Department</label>
                <input
                  name="department"
                  value={form.department}
                  onChange={handleChange}
                  placeholder="Engineering"
                  style={styles.input}
                />
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Location</label>
                <input
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  placeholder="Bangalore"
                  style={styles.input}
                />
              </div>
            </div>

            <div style={styles.row}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Job Type</label>
                <select
                  name="jobType"
                  value={form.jobType}
                  onChange={handleChange}
                  style={styles.input}
                >
                  <option value="FULL_TIME">Full Time</option>
                  <option value="INTERNSHIP">Internship</option>
                  <option value="CONTRACT">Contract</option>
                </select>
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Deadline</label>
                <input
                  name="deadline"
                  type="date"
                  value={form.deadline}
                  onChange={handleChange}
                  style={styles.input}
                />
              </div>
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Description</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Describe the role and requirements..."
                style={{
                  ...styles.input,
                  height: '80px',
                  resize: 'vertical',
                }}
              />
            </div>
          </div>

          {/* Interview Rounds */}
          <div style={styles.section}>
            <div style={styles.roundsHeader}>
              <h3 style={styles.sectionTitle}>
                Interview Rounds
              </h3>
              <button
                type="button"
                onClick={addRound}
                style={styles.addRoundBtn}>
                + Add Round
              </button>
            </div>

            {rounds.map((round, index) => (
              <div key={index} style={styles.roundCard}>
                <div style={styles.roundNumber}>
                  {round.roundNumber}
                </div>
                <div style={styles.roundFields}>
                  <input
                    value={round.roundName}
                    onChange={(e) => handleRoundChange(
                      index, 'roundName', e.target.value
                    )}
                    placeholder="Round name"
                    style={{
                      ...styles.input,
                      marginBottom: 0,
                      flex: 2,
                    }}
                  />
                  <select
                    value={round.roundType}
                    onChange={(e) => handleRoundChange(
                      index, 'roundType', e.target.value
                    )}
                    style={{
                      ...styles.input,
                      marginBottom: 0,
                      flex: 1,
                    }}
                  >
                    <option value="TECHNICAL">Technical</option>
                    <option value="HR">HR</option>
                    <option value="ASSIGNMENT">Assignment</option>
                    <option value="GROUP_DISCUSSION">
                      Group Discussion
                    </option>
                  </select>
                </div>
                {rounds.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeRound(index)}
                    style={styles.removeRoundBtn}>
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Buttons */}
          <div style={styles.btnRow}>
            <button
              type="button"
              onClick={onClose}
              style={styles.cancelBtn}>
              Cancel
            </button>
            <button
              type="submit"
              style={loading
                ? styles.submitBtnDisabled
                : styles.submitBtn}
              disabled={loading}>
              {loading ? 'Creating...' : 'Create Job'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed',
    top: 0, left: 0,
    width: '100%', height: '100%',
    background: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modal: {
    background: 'white',
    borderRadius: '16px',
    padding: '32px',
    width: '100%',
    maxWidth: '620px',
    maxHeight: '90vh',
    overflowY: 'auto',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
  },
  modalTitle: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#333',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    fontSize: '18px',
    color: '#888',
    cursor: 'pointer',
  },
  error: {
    background: '#fff5f5',
    color: '#e53e3e',
    padding: '12px',
    borderRadius: '8px',
    marginBottom: '16px',
    fontSize: '14px',
  },
  section: {
    marginBottom: '24px',
    padding: '20px',
    background: '#f8f9ff',
    borderRadius: '12px',
  },
  sectionTitle: {
    fontSize: '15px',
    fontWeight: '700',
    color: '#333',
    marginBottom: '16px',
  },
  row: {
    display: 'flex',
    gap: '16px',
  },
  inputGroup: {
    flex: 1,
    marginBottom: '14px',
  },
  label: {
    display: 'block',
    marginBottom: '6px',
    fontWeight: '600',
    fontSize: '13px',
    color: '#444',
  },
  input: {
    width: '100%',
    padding: '10px 14px',
    border: '2px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box',
    background: 'white',
  },
  roundsHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px',
  },
  addRoundBtn: {
    padding: '6px 14px',
    background: '#667eea',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: '600',
  },
  roundCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '10px',
    background: 'white',
    padding: '12px',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
  },
  roundNumber: {
    width: '28px',
    height: '28px',
    background: '#667eea',
    color: 'white',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '13px',
    fontWeight: '700',
    flexShrink: 0,
  },
  roundFields: {
    flex: 1,
    display: 'flex',
    gap: '10px',
  },
  removeRoundBtn: {
    background: '#fff5f5',
    border: 'none',
    color: '#e53e3e',
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    fontSize: '12px',
    flexShrink: 0,
  },
  btnRow: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'flex-end',
    marginTop: '8px',
  },
  cancelBtn: {
    padding: '10px 24px',
    background: '#fff',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '14px',
    color: '#666',
  },
  submitBtn: {
    padding: '10px 24px',
    background: 'linear-gradient(135deg, #667eea, #764ba2)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
  },
  submitBtnDisabled: {
    padding: '10px 24px',
    background: '#ccc',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
  },
};