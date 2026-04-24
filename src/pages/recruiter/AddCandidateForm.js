import React, { useState, useEffect } from 'react';
import API from '../../services/api';

export default function AddCandidateForm({ onClose, onSuccess }) {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    currentCompany: '',
    experienceYears: '',
    source: 'LINKEDIN',
    jobId: '',
  });

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const res = await API.get('/api/jobs');
      setJobs(res.data);
      if (res.data.length > 0) {
        setForm(f => ({ ...f, jobId: res.data[0].id }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await API.post('/api/candidates', {
        ...form,
        experienceYears: parseInt(form.experienceYears),
        jobId: parseInt(form.jobId),
      });
      onSuccess();
      onClose();
    } catch (err) {
      setError('Failed to add candidate. Please try again.');
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
            👤 Add New Candidate
          </h2>
          <button
            onClick={onClose}
            style={styles.closeBtn}>
            ✕
          </button>
        </div>

        {/* Error */}
        {error && (
          <div style={styles.error}>{error}</div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>

          <div style={styles.row}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>
                Full Name *
              </label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Rahul Sharma"
                style={styles.input}
                required
              />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>
                Email *
              </label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="rahul@gmail.com"
                style={styles.input}
                required
              />
            </div>
          </div>

          <div style={styles.row}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Phone</label>
              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="9876543210"
                style={styles.input}
              />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>
                Current Company
              </label>
              <input
                name="currentCompany"
                value={form.currentCompany}
                onChange={handleChange}
                placeholder="Infosys"
                style={styles.input}
              />
            </div>
          </div>

          <div style={styles.row}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>
                Experience (Years)
              </label>
              <input
                name="experienceYears"
                type="number"
                value={form.experienceYears}
                onChange={handleChange}
                placeholder="3"
                style={styles.input}
                min="0"
                max="30"
              />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Source *</label>
              <select
                name="source"
                value={form.source}
                onChange={handleChange}
                style={styles.input}
              >
                <option value="LINKEDIN">LinkedIn</option>
                <option value="REFERRAL">Referral</option>
                <option value="CAMPUS">Campus</option>
                <option value="PORTAL">Job Portal</option>
                <option value="WALK_IN">Walk In</option>
              </select>
            </div>
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>
              Applying For *
            </label>
            <select
              name="jobId"
              value={form.jobId}
              onChange={handleChange}
              style={styles.input}
              required
            >
              {jobs.map(job => (
                <option key={job.id} value={job.id}>
                  {job.title} — {job.department}
                </option>
              ))}
            </select>
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
              {loading ? 'Adding...' : 'Add Candidate'}
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
    maxWidth: '600px',
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
  row: {
    display: 'flex',
    gap: '16px',
  },
  inputGroup: {
    flex: 1,
    marginBottom: '16px',
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
  },
  btnRow: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'flex-end',
    marginTop: '24px',
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