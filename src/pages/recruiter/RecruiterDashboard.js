import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import KanbanBoard from './KanbanBoard';
import AnalyticsPage from './AnalyticsPage';
import AddCandidateForm from './AddCandidateForm';
import CreateJobForm from './CreateJobForm';

export default function RecruiterDashboard() {
  const [overview, setOverview] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [selectedJobTitle, setSelectedJobTitle] = useState('');
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showAddCandidate, setShowAddCandidate] = useState(false);
  const [showCreateJob, setShowCreateJob] = useState(false);
  const [activeModal, setActiveModal] = useState(null);
  const [pendingFeedbacks, setPendingFeedbacks] = useState([]);
  const [editingJob, setEditingJob] = useState(null);
  const [editingCandidate, setEditingCandidate] = useState(null);
  const [viewingFeedback, setViewingFeedback] = useState(null);
  const [candidateFeedbacks, setCandidateFeedbacks] = useState([]);
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    fetchOverview();
    fetchJobs();
    fetchAllCandidates();
  }, []);

  const fetchOverview = async () => {
    try {
      const res = await API.get('/api/analytics/overview');
      setOverview(res.data);
    } catch (err) { console.error(err); }
  };

  const fetchJobs = async () => {
    try {
      const res = await API.get('/api/jobs');
      setJobs(res.data);
    } catch (err) { console.error(err); }
  };

  const fetchAllCandidates = async () => {
    try {
      const jobsRes = await API.get('/api/jobs');
      const allCandidates = [];
      for (const job of jobsRes.data) {
        const res = await API.get(`/api/candidates/job/${job.id}`);
        allCandidates.push(...res.data);
      }
      setCandidates(allCandidates);
    } catch (err) { console.error(err); }
  };

  const fetchPendingFeedbacks = async () => {
    try {
      const res = await API.get('/api/feedback/pending');
      setPendingFeedbacks(res.data);
    } catch (err) { console.error(err); }
  };

  const fetchCandidateFeedback = async (candidateId) => {
    try {
      const res = await API.get(`/api/feedback/candidate/${candidateId}`);
      setCandidateFeedbacks(res.data);
      setViewingFeedback(candidateId);
    } catch (err) { console.error(err); }
  };

  const handleDeleteJob = async (jobId) => {
    if (!window.confirm('Delete this job?')) return;
    try {
      await API.delete(`/api/jobs/${jobId}`);
      fetchJobs(); fetchOverview();
    } catch (err) { alert('Failed to delete job'); }
  };

  const handleCloseJob = async (jobId) => {
    if (!window.confirm('Close this job?')) return;
    try {
      await API.patch(`/api/jobs/${jobId}/status?status=CLOSED`);
      fetchJobs(); fetchOverview();
    } catch (err) { alert('Failed to close job'); }
  };

  const handleSaveJob = async () => {
    try {
      await API.patch(`/api/jobs/${editingJob.id}/status?status=${editingJob.status}`);
      setEditingJob(null);
      fetchJobs(); fetchOverview();
      alert('Job updated!');
    } catch (err) { alert('Failed to update job'); }
  };

  const handleDeleteCandidate = async (candidateId) => {
    if (!window.confirm('Delete this candidate?')) return;
    try {
      await API.delete(`/api/candidates/${candidateId}`);
      fetchAllCandidates(); fetchOverview();
    } catch (err) { alert('Failed to delete candidate'); }
  };

  const handleSaveCandidate = async () => {
    try {
      await API.patch(
        `/api/candidates/${editingCandidate.id}/status?status=${editingCandidate.status}`
      );
      setEditingCandidate(null);
      fetchAllCandidates(); fetchOverview();
      alert('Candidate updated!');
    } catch (err) { alert('Failed to update candidate'); }
  };

  const handleSendReminder = async (feedbackId) => {
    try {
      await API.post(`/api/feedback/remind/${feedbackId}`);
      alert('Reminder sent!');
    } catch (err) { alert('Failed to send reminder'); }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  const openModal = (type) => {
    setActiveModal(type);
    setEditingJob(null);
    setEditingCandidate(null);
    setViewingFeedback(null);
    if (type === 'feedback') fetchPendingFeedbacks();
    if (type === 'candidates' || type === 'selected') fetchAllCandidates();
  };

  const closeModal = () => {
    setActiveModal(null);
    setEditingJob(null);
    setEditingCandidate(null);
    setViewingFeedback(null);
  };

  return (
    <div style={styles.container}>

      {/* Navbar */}
      <div style={styles.navbar}>
        <div style={styles.navLeft}>
          <span style={styles.navLogo}>💼 HireDesk</span>
        </div>
        <div style={styles.navRight}>
          <span style={styles.navUser}>👋 {user?.name}</span>
          <button
            onClick={() => setShowAnalytics(!showAnalytics)}
            style={{
              padding: '8px 16px',
              background: showAnalytics ? '#667eea' : '#fff',
              color: showAnalytics ? '#fff' : '#667eea',
              border: '1px solid #667eea',
              borderRadius: '8px', fontSize: '14px', fontWeight: '600',
            }}>
            📊 Analytics
          </button>
          <button
            onClick={() => setShowCreateJob(true)}
            style={{
              padding: '8px 16px', background: '#48bb78',
              color: 'white', border: 'none',
              borderRadius: '8px', fontSize: '14px', fontWeight: '600',
            }}>
            + Create Job
          </button>
          <button
            onClick={() => setShowAddCandidate(true)}
            style={{
              padding: '8px 16px',
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              color: 'white', border: 'none',
              borderRadius: '8px', fontSize: '14px', fontWeight: '600',
            }}>
            + Add Candidate
          </button>
          <button onClick={handleLogout} style={styles.logoutBtn}>
            Logout
          </button>
        </div>
      </div>

      {/* Main */}
      <div style={styles.main}>
        {showAnalytics ? (
          <AnalyticsPage />
        ) : (
          <>
            <h2 style={styles.sectionTitle}>Dashboard Overview</h2>
            <div style={styles.cardGrid}>
              <StatCard label="Open Jobs" value={overview?.totalOpenJobs ?? 0}
                color="#667eea" icon="💼" onClick={() => openModal('jobs')} />
              <StatCard label="Total Candidates" value={overview?.totalCandidates ?? 0}
                color="#48bb78" icon="👥" onClick={() => openModal('candidates')} />
              <StatCard label="Selected" value={overview?.totalSelected ?? 0}
                color="#ed8936" icon="✅" onClick={() => openModal('selected')} />
              <StatCard label="Pending Feedback" value={overview?.pendingFeedbacks ?? 0}
                color="#e53e3e" icon="📝" onClick={() => openModal('feedback')} />
            </div>

            <h2 style={styles.sectionTitle}>Active Jobs</h2>
            <p style={styles.hint}>👆 Click a job to see its Kanban pipeline</p>
            <div style={styles.jobList}>
              {jobs.length === 0 ? (
                <p style={styles.empty}>No jobs yet. Click "+ Create Job"!</p>
              ) : (
                jobs.map(job => (
                  <div key={job.id} style={{
                    ...styles.jobCard,
                    border: selectedJobId === job.id
                      ? '2px solid #667eea' : '2px solid transparent',
                    cursor: 'pointer',
                  }}
                    onClick={() => { setSelectedJobId(job.id); setSelectedJobTitle(job.title); }}>
                    <div style={styles.jobLeft}>
                      <h3 style={styles.jobTitle}>{job.title}</h3>
                      <p style={styles.jobMeta}>
                        {job.department} • {job.location} • {job.totalRounds} rounds
                      </p>
                    </div>
                    <div style={styles.jobRight}>
                      <span style={{
                        ...styles.badge,
                        background: job.status === 'OPEN' ? '#c6f6d5' : '#fed7d7',
                        color: job.status === 'OPEN' ? '#276749' : '#9b2c2c',
                      }}>{job.status}</span>
                      <span style={styles.candidateCount}>
                        {job.candidateCount} candidates
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {selectedJobId && (
              <div style={{ marginTop: '32px' }}>
                <KanbanBoard jobId={selectedJobId} jobTitle={selectedJobTitle} />
              </div>
            )}
          </>
        )}
      </div>

      {/* ── JOBS MODAL ── */}
      {activeModal === 'jobs' && (
        <Modal title="💼 All Jobs" onClose={closeModal}>
          {jobs.map(job => (
            <div key={job.id}>
              {editingJob?.id === job.id ? (
                // Edit Job Form
                <div style={styles.editCard}>
                  <p style={styles.editTitle}>Editing: {job.title}</p>
                  <div style={styles.editRow}>
                    <label style={styles.editLabel}>Status</label>
                    <select
                      value={editingJob.status}
                      onChange={e => setEditingJob({
                        ...editingJob, status: e.target.value
                      })}
                      style={styles.editInput}>
                      <option value="OPEN">OPEN</option>
                      <option value="CLOSED">CLOSED</option>
                      <option value="ON_HOLD">ON_HOLD</option>
                    </select>
                  </div>
                  <div style={styles.editBtns}>
                    <button onClick={() => setEditingJob(null)} style={styles.cancelBtn}>
                      Cancel
                    </button>
                    <button onClick={handleSaveJob} style={styles.saveBtn}>
                      Save Changes
                    </button>
                  </div>
                </div>
              ) : (
                // Job Row
                <div style={styles.modalRow}>
                  <div style={styles.modalRowLeft}>
                    <p style={styles.modalRowTitle}>{job.title}</p>
                    <p style={styles.modalRowMeta}>
                      {job.department} • {job.location} •
                      {job.candidateCount} candidates • {job.totalRounds} rounds
                    </p>
                  </div>
                  <div style={styles.modalRowRight}>
                    <span style={{
                      ...styles.badge,
                      background: job.status === 'OPEN' ? '#c6f6d5' : '#fed7d7',
                      color: job.status === 'OPEN' ? '#276749' : '#9b2c2c',
                    }}>{job.status}</span>
                    <button
                      onClick={() => setEditingJob({ ...job })}
                      style={styles.editBtn}>
                      ✏️ Edit
                    </button>
                    {job.status === 'OPEN' && (
                      <button
                        onClick={() => handleCloseJob(job.id)}
                        style={styles.warningBtn}>
                        Close
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteJob(job.id)}
                      style={styles.dangerBtn}>
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </Modal>
      )}

      {/* ── ALL CANDIDATES MODAL ── */}
      {activeModal === 'candidates' && (
        <Modal title="👥 All Candidates" onClose={closeModal}>
          {viewingFeedback ? (
            // Feedback View
            <div>
              <button
                onClick={() => setViewingFeedback(null)}
                style={{ ...styles.editBtn, marginBottom: '16px' }}>
                ← Back to Candidates
              </button>
              <h3 style={{ marginBottom: '16px', color: '#333' }}>
                Feedback Received
              </h3>
              {candidateFeedbacks.length === 0 ? (
                <p style={styles.noDataText}>No feedback yet for this candidate</p>
              ) : (
                candidateFeedbacks.map(f => (
                  <div key={f.id} style={styles.feedbackCard}>
                    <div style={styles.feedbackHeader}>
                      <p style={styles.feedbackRound}>{f.roundName}</p>
                      <span style={{
                        ...styles.badge,
                        background: f.isSubmitted ? '#c6f6d5' : '#fefcbf',
                        color: f.isSubmitted ? '#276749' : '#744210',
                      }}>
                        {f.isSubmitted ? 'Submitted' : 'Pending'}
                      </span>
                    </div>
                    {f.isSubmitted && (
                      <div style={styles.feedbackBody}>
                        <div style={styles.ratingsRow}>
                          <RatingDisplay label="Technical" value={f.technicalRating} />
                          <RatingDisplay label="Communication" value={f.communicationRating} />
                          <RatingDisplay label="Problem Solving" value={f.problemSolvingRating} />
                          <RatingDisplay label="Attitude" value={f.attitudeRating} />
                        </div>
                        <div style={styles.avgRating}>
                          Average Rating: <strong>{f.averageRating}/5</strong>
                        </div>
                        <div style={styles.recommendationBadge}>
                          Recommendation: <strong>{f.recommendation}</strong>
                        </div>
                        {f.strengths && (
                          <p style={styles.feedbackText}>
                            <strong>Strengths:</strong> {f.strengths}
                          </p>
                        )}
                        {f.weaknesses && (
                          <p style={styles.feedbackText}>
                            <strong>Weaknesses:</strong> {f.weaknesses}
                          </p>
                        )}
                        {f.writtenNotes && (
                          <p style={styles.feedbackText}>
                            <strong>Notes:</strong> {f.writtenNotes}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          ) : editingCandidate ? (
            // Edit Candidate Form
            <div style={styles.editCard}>
              <p style={styles.editTitle}>Editing: {editingCandidate.name}</p>
              <div style={styles.editRow}>
                <label style={styles.editLabel}>Status</label>
                <select
                  value={editingCandidate.status}
                  onChange={e => setEditingCandidate({
                    ...editingCandidate, status: e.target.value
                  })}
                  style={styles.editInput}>
                  <option value="IN_PIPELINE">IN_PIPELINE</option>
                  <option value="SELECTED">SELECTED</option>
                  <option value="REJECTED">REJECTED</option>
                  <option value="ON_HOLD">ON_HOLD</option>
                  <option value="WITHDRAWN">WITHDRAWN</option>
                </select>
              </div>
              <div style={styles.editBtns}>
                <button
                  onClick={() => setEditingCandidate(null)}
                  style={styles.cancelBtn}>
                  Cancel
                </button>
                <button onClick={handleSaveCandidate} style={styles.saveBtn}>
                  Save Changes
                </button>
              </div>
            </div>
          ) : (
            // Candidates List
            candidates.length === 0 ? (
              <p style={styles.noDataText}>No candidates yet</p>
            ) : (
              candidates.map(c => (
                <div key={c.id} style={styles.modalRow}>
                  <div style={styles.modalRowLeft}>
                    <p style={styles.modalRowTitle}>{c.name}</p>
                    <p style={styles.modalRowMeta}>
                      {c.email} • {c.currentCompany || 'No company'} •
                      {c.experienceYears}y • {c.source}
                    </p>
                  </div>
                  <div style={styles.modalRowRight}>
                    <span style={{
                      ...styles.badge,
                      background: c.status === 'SELECTED' ? '#c6f6d5'
                        : c.status === 'REJECTED' ? '#fed7d7' : '#e2e8f0',
                      color: c.status === 'SELECTED' ? '#276749'
                        : c.status === 'REJECTED' ? '#9b2c2c' : '#333',
                    }}>{c.status}</span>
                    <button
                      onClick={() => fetchCandidateFeedback(c.id)}
                      style={styles.feedbackViewBtn}>
                      📋 Feedback
                    </button>
                    <button
                      onClick={() => setEditingCandidate({ ...c })}
                      style={styles.editBtn}>
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => handleDeleteCandidate(c.id)}
                      style={styles.dangerBtn}>
                      🗑️
                    </button>
                  </div>
                </div>
              ))
            )
          )}
        </Modal>
      )}

      {/* ── SELECTED CANDIDATES MODAL ── */}
      {activeModal === 'selected' && (
        <Modal title="✅ Selected Candidates" onClose={closeModal}>
          {viewingFeedback ? (
            <div>
              <button
                onClick={() => setViewingFeedback(null)}
                style={{ ...styles.editBtn, marginBottom: '16px' }}>
                ← Back
              </button>
              <h3 style={{ marginBottom: '16px', color: '#333' }}>
                Feedback Received
              </h3>
              {candidateFeedbacks.length === 0 ? (
                <p style={styles.noDataText}>No feedback yet</p>
              ) : (
                candidateFeedbacks.map(f => (
                  <div key={f.id} style={styles.feedbackCard}>
                    <div style={styles.feedbackHeader}>
                      <p style={styles.feedbackRound}>{f.roundName}</p>
                      <span style={{
                        ...styles.badge,
                        background: f.isSubmitted ? '#c6f6d5' : '#fefcbf',
                        color: f.isSubmitted ? '#276749' : '#744210',
                      }}>
                        {f.isSubmitted ? 'Submitted' : 'Pending'}
                      </span>
                    </div>
                    {f.isSubmitted && (
                      <div style={styles.feedbackBody}>
                        <div style={styles.ratingsRow}>
                          <RatingDisplay label="Technical" value={f.technicalRating} />
                          <RatingDisplay label="Communication" value={f.communicationRating} />
                          <RatingDisplay label="Problem Solving" value={f.problemSolvingRating} />
                          <RatingDisplay label="Attitude" value={f.attitudeRating} />
                        </div>
                        <div style={styles.avgRating}>
                          Average: <strong>{f.averageRating}/5</strong>
                        </div>
                        <div style={styles.recommendationBadge}>
                          Recommendation: <strong>{f.recommendation}</strong>
                        </div>
                        {f.strengths && (
                          <p style={styles.feedbackText}>
                            <strong>Strengths:</strong> {f.strengths}
                          </p>
                        )}
                        {f.weaknesses && (
                          <p style={styles.feedbackText}>
                            <strong>Weaknesses:</strong> {f.weaknesses}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          ) : editingCandidate ? (
            <div style={styles.editCard}>
              <p style={styles.editTitle}>
                Editing: {editingCandidate.name}
              </p>
              <div style={styles.editRow}>
                <label style={styles.editLabel}>Status</label>
                <select
                  value={editingCandidate.status}
                  onChange={e => setEditingCandidate({
                    ...editingCandidate, status: e.target.value
                  })}
                  style={styles.editInput}>
                  <option value="IN_PIPELINE">IN_PIPELINE</option>
                  <option value="SELECTED">SELECTED</option>
                  <option value="REJECTED">REJECTED</option>
                  <option value="ON_HOLD">ON_HOLD</option>
                </select>
              </div>
              <div style={styles.editBtns}>
                <button
                  onClick={() => setEditingCandidate(null)}
                  style={styles.cancelBtn}>
                  Cancel
                </button>
                <button onClick={handleSaveCandidate} style={styles.saveBtn}>
                  Save
                </button>
              </div>
            </div>
          ) : (
            candidates.filter(c => c.status === 'SELECTED').length === 0 ? (
              <p style={styles.noDataText}>No selected candidates yet</p>
            ) : (
              candidates.filter(c => c.status === 'SELECTED').map(c => (
                <div key={c.id} style={styles.modalRow}>
                  <div style={styles.modalRowLeft}>
                    <p style={styles.modalRowTitle}>{c.name}</p>
                    <p style={styles.modalRowMeta}>
                      {c.email} • {c.currentCompany} •
                      {c.experienceYears}y exp • {c.source}
                    </p>
                  </div>
                  <div style={styles.modalRowRight}>
                    <span style={{
                      ...styles.badge,
                      background: '#c6f6d5', color: '#276749',
                    }}>SELECTED ✅</span>
                    <button
                      onClick={() => fetchCandidateFeedback(c.id)}
                      style={styles.feedbackViewBtn}>
                      📋 View Feedback
                    </button>
                    <button
                      onClick={() => setEditingCandidate({ ...c })}
                      style={styles.editBtn}>
                      ✏️ Edit
                    </button>
                  </div>
                </div>
              ))
            )
          )}
        </Modal>
      )}

      {/* ── PENDING FEEDBACK MODAL ── */}
      {activeModal === 'feedback' && (
        <Modal title="📝 Pending Feedback" onClose={closeModal}>
          {pendingFeedbacks.length === 0 ? (
            <p style={styles.noDataText}>No pending feedback 🎉</p>
          ) : (
            pendingFeedbacks.map(f => (
              <div key={f.id} style={styles.modalRow}>
                <div style={styles.modalRowLeft}>
                  <p style={styles.modalRowTitle}>
                    {f.candidateName}
                  </p>
                  <p style={styles.modalRowMeta}>
                    Round: {f.roundName} •
                    Interviewer: {f.interviewerName || 'Not assigned'} •
                    Token: {f.feedbackToken?.substring(0, 8)}...
                  </p>
                  <p style={{ fontSize: '11px', color: '#667eea', marginTop: '4px' }}>
                    Feedback link: http://localhost:3000/feedback/{f.feedbackToken}
                  </p>
                </div>
                <div style={styles.modalRowRight}>
                  <span style={{
                    ...styles.badge,
                    background: '#fefcbf', color: '#744210',
                  }}>Pending</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(
                        `http://localhost:3000/feedback/${f.feedbackToken}`
                      );
                      alert('Feedback link copied!');
                    }}
                    style={styles.editBtn}>
                    📋 Copy Link
                  </button>
                  <button
                    onClick={() => handleSendReminder(f.id)}
                    style={styles.reminderBtn}>
                    🔔 Remind
                  </button>
                </div>
              </div>
            ))
          )}
        </Modal>
      )}

      {/* Add Candidate Modal */}
      {showAddCandidate && (
        <AddCandidateForm
          onClose={() => setShowAddCandidate(false)}
          onSuccess={() => {
            fetchJobs(); fetchOverview(); fetchAllCandidates();
          }}
        />
      )}

      {/* Create Job Modal */}
      {showCreateJob && (
        <CreateJobForm
          onClose={() => setShowCreateJob(false)}
          onSuccess={() => { fetchJobs(); fetchOverview(); }}
        />
      )}
    </div>
  );
}

function RatingDisplay({ label, value }) {
  return (
    <div style={{ textAlign: 'center', minWidth: '80px' }}>
      <p style={{ fontSize: '11px', color: '#888', marginBottom: '4px' }}>
        {label}
      </p>
      <p style={{ fontSize: '18px', fontWeight: '700', color: '#667eea' }}>
        {value}/5
      </p>
    </div>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <div style={modalStyles.overlay}>
      <div style={modalStyles.modal}>
        <div style={modalStyles.header}>
          <h2 style={modalStyles.title}>{title}</h2>
          <button onClick={onClose} style={modalStyles.closeBtn}>✕</button>
        </div>
        <div style={modalStyles.body}>{children}</div>
      </div>
    </div>
  );
}

function StatCard({ label, value, color, icon, onClick }) {
  return (
    <div
      style={{ ...styles.statCard, cursor: 'pointer' }}
      onClick={onClick}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)';
      }}>
      <div style={{ ...styles.statIcon, background: color }}>{icon}</div>
      <div>
        <p style={styles.statLabel}>{label}</p>
        <p style={styles.statValue}>{value}</p>
        <p style={styles.statClick}>Click to view →</p>
      </div>
    </div>
  );
}

const styles = {
  container: { minHeight: '100vh', background: '#f5f6fa' },
  navbar: {
    background: 'white', padding: '16px 32px',
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    position: 'sticky', top: 0, zIndex: 100,
  },
  navLeft: {},
  navLogo: { fontSize: '20px', fontWeight: '700', color: '#667eea' },
  navRight: { display: 'flex', alignItems: 'center', gap: '16px' },
  navUser: { fontSize: '14px', color: '#666' },
  logoutBtn: {
    padding: '8px 16px', background: '#fff',
    border: '1px solid #e2e8f0', borderRadius: '8px',
    fontSize: '14px', color: '#666',
  },
  main: { padding: '32px', maxWidth: '1200px', margin: '0 auto' },
  sectionTitle: {
    fontSize: '20px', fontWeight: '700', color: '#333',
    marginBottom: '8px', marginTop: '32px',
  },
  hint: { fontSize: '13px', color: '#888', marginBottom: '16px' },
  cardGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px',
  },
  statCard: {
    background: 'white', borderRadius: '12px', padding: '24px',
    display: 'flex', alignItems: 'center', gap: '16px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    transition: 'transform 0.1s, box-shadow 0.1s',
  },
  statIcon: {
    width: '48px', height: '48px', borderRadius: '12px',
    display: 'flex', alignItems: 'center',
    justifyContent: 'center', fontSize: '20px',
  },
  statLabel: { fontSize: '13px', color: '#888', marginBottom: '4px' },
  statValue: { fontSize: '24px', fontWeight: '700', color: '#333' },
  statClick: { fontSize: '11px', color: '#667eea', marginTop: '2px' },
  jobList: { display: 'flex', flexDirection: 'column', gap: '12px' },
  jobCard: {
    background: 'white', borderRadius: '12px', padding: '20px 24px',
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
  },
  jobLeft: {},
  jobTitle: { fontSize: '16px', fontWeight: '600', color: '#333', marginBottom: '4px' },
  jobMeta: { fontSize: '13px', color: '#888' },
  jobRight: { display: 'flex', alignItems: 'center', gap: '12px' },
  badge: { padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' },
  candidateCount: { fontSize: '13px', color: '#888' },
  empty: {
    color: '#888', textAlign: 'center', padding: '40px',
    background: 'white', borderRadius: '12px',
  },
  modalRow: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', padding: '16px',
    border: '1px solid #f0f0f0', borderRadius: '10px',
    marginBottom: '10px', background: '#fafafa',
  },
  modalRowLeft: { flex: 1 },
  modalRowTitle: { fontSize: '15px', fontWeight: '600', color: '#333', marginBottom: '4px' },
  modalRowMeta: { fontSize: '12px', color: '#888' },
  modalRowRight: { display: 'flex', alignItems: 'center', gap: '8px' },
  editCard: {
    background: '#f0f4ff', borderRadius: '12px',
    padding: '20px', marginBottom: '16px',
    border: '2px solid #667eea',
  },
  editTitle: { fontSize: '15px', fontWeight: '700', color: '#333', marginBottom: '16px' },
  editRow: { marginBottom: '16px' },
  editLabel: { display: 'block', fontSize: '13px', fontWeight: '600', color: '#444', marginBottom: '6px' },
  editInput: {
    width: '100%', padding: '10px 14px',
    border: '2px solid #e2e8f0', borderRadius: '8px',
    fontSize: '14px', boxSizing: 'border-box',
  },
  editBtns: { display: 'flex', gap: '8px', justifyContent: 'flex-end' },
  saveBtn: {
    padding: '8px 20px',
    background: 'linear-gradient(135deg, #667eea, #764ba2)',
    color: 'white', border: 'none', borderRadius: '8px',
    fontSize: '13px', fontWeight: '600', cursor: 'pointer',
  },
  cancelBtn: {
    padding: '8px 20px', background: '#fff',
    border: '1px solid #e2e8f0', borderRadius: '8px',
    fontSize: '13px', color: '#666', cursor: 'pointer',
  },
  editBtn: {
    padding: '6px 12px', background: '#ebf8ff', color: '#2b6cb0',
    border: '1px solid #bee3f8', borderRadius: '6px',
    fontSize: '12px', fontWeight: '600', cursor: 'pointer',
  },
  dangerBtn: {
    padding: '6px 12px', background: '#fff5f5', color: '#e53e3e',
    border: '1px solid #fed7d7', borderRadius: '6px',
    fontSize: '12px', fontWeight: '600', cursor: 'pointer',
  },
  warningBtn: {
    padding: '6px 12px', background: '#fffbeb', color: '#744210',
    border: '1px solid #fbd38d', borderRadius: '6px',
    fontSize: '12px', fontWeight: '600', cursor: 'pointer',
  },
  reminderBtn: {
    padding: '6px 12px', background: '#ebf8ff', color: '#2b6cb0',
    border: '1px solid #bee3f8', borderRadius: '6px',
    fontSize: '12px', fontWeight: '600', cursor: 'pointer',
  },
  feedbackViewBtn: {
    padding: '6px 12px', background: '#f0fff4', color: '#276749',
    border: '1px solid #c6f6d5', borderRadius: '6px',
    fontSize: '12px', fontWeight: '600', cursor: 'pointer',
  },
  noDataText: { textAlign: 'center', color: '#888', padding: '40px' },
  feedbackCard: {
    background: 'white', borderRadius: '10px', padding: '16px',
    marginBottom: '12px', border: '1px solid #e2e8f0',
  },
  feedbackHeader: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: '12px',
  },
  feedbackRound: { fontWeight: '700', color: '#333', fontSize: '15px' },
  feedbackBody: {},
  ratingsRow: {
    display: 'flex', gap: '16px', marginBottom: '12px',
    background: '#f8f9ff', padding: '12px', borderRadius: '8px',
  },
  avgRating: {
    fontSize: '14px', color: '#333', marginBottom: '8px',
    background: '#e9d8fd', padding: '6px 12px',
    borderRadius: '6px', display: 'inline-block',
  },
  recommendationBadge: {
    fontSize: '14px', color: '#333', marginBottom: '8px',
    marginLeft: '8px', background: '#c6f6d5',
    padding: '6px 12px', borderRadius: '6px', display: 'inline-block',
  },
  feedbackText: { fontSize: '13px', color: '#555', marginTop: '8px' },
};

const modalStyles = {
  overlay: {
    position: 'fixed', top: 0, left: 0,
    width: '100%', height: '100%',
    background: 'rgba(0,0,0,0.5)',
    display: 'flex', alignItems: 'center',
    justifyContent: 'center', zIndex: 1000,
  },
  modal: {
    background: 'white', borderRadius: '16px',
    width: '100%', maxWidth: '750px', maxHeight: '85vh',
    overflow: 'hidden', display: 'flex', flexDirection: 'column',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
  },
  header: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', padding: '20px 24px',
    borderBottom: '1px solid #f0f0f0',
  },
  title: { fontSize: '18px', fontWeight: '700', color: '#333' },
  closeBtn: {
    background: 'none', border: 'none',
    fontSize: '18px', color: '#888', cursor: 'pointer',
  },
  body: { padding: '20px 24px', overflowY: 'auto' },
};