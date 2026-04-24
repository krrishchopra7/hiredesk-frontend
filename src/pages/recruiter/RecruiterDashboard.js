import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import KanbanBoard from './KanbanBoard';
import AnalyticsPage from './AnalyticsPage';
import AddCandidateForm from './AddCandidateForm';
import CreateJobForm from './CreateJobForm';

export default function RecruiterDashboard() {
  const [overview, setOverview] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [selectedJobTitle, setSelectedJobTitle] = useState('');
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showAddCandidate, setShowAddCandidate] = useState(false);
  const [showCreateJob, setShowCreateJob] = useState(false);
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    fetchOverview();
    fetchJobs();
  }, []);

  const fetchOverview = async () => {
    try {
      const res = await API.get('/api/analytics/overview');
      setOverview(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchJobs = async () => {
    try {
      const res = await API.get('/api/jobs');
      setJobs(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
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
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
            }}>
            📊 Analytics
          </button>

          <button
            onClick={() => setShowCreateJob(true)}
            style={{
              padding: '8px 16px',
              background: '#48bb78',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
            }}>
            + Create Job
          </button>

          <button
            onClick={() => setShowAddCandidate(true)}
            style={{
              padding: '8px 16px',
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
            }}>
            + Add Candidate
          </button>

          <button
            onClick={handleLogout}
            style={styles.logoutBtn}>
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={styles.main}>
        {showAnalytics ? (
          <AnalyticsPage />
        ) : (
          <>
            {/* Overview Cards */}
            <h2 style={styles.sectionTitle}>Dashboard Overview</h2>
            <div style={styles.cardGrid}>
              <StatCard
                label="Open Jobs"
                value={overview?.totalOpenJobs ?? 0}
                color="#667eea"
                icon="💼"
              />
              <StatCard
                label="Total Candidates"
                value={overview?.totalCandidates ?? 0}
                color="#48bb78"
                icon="👥"
              />
              <StatCard
                label="Selected"
                value={overview?.totalSelected ?? 0}
                color="#ed8936"
                icon="✅"
              />
              <StatCard
                label="Pending Feedback"
                value={overview?.pendingFeedbacks ?? 0}
                color="#e53e3e"
                icon="📝"
              />
            </div>

            {/* Jobs List */}
            <h2 style={styles.sectionTitle}>Active Jobs</h2>
            <p style={styles.hint}>
              👆 Click a job to see its Kanban pipeline
            </p>
            <div style={styles.jobList}>
              {jobs.length === 0 ? (
                <p style={styles.empty}>
                  No jobs yet. Click "+ Create Job" to add one!
                </p>
              ) : (
                jobs.map(job => (
                  <div
                    key={job.id}
                    style={{
                      ...styles.jobCard,
                      border: selectedJobId === job.id
                        ? '2px solid #667eea'
                        : '2px solid transparent',
                      cursor: 'pointer',
                    }}
                    onClick={() => {
                      setSelectedJobId(job.id);
                      setSelectedJobTitle(job.title);
                    }}
                  >
                    <div style={styles.jobLeft}>
                      <h3 style={styles.jobTitle}>
                        {job.title}
                      </h3>
                      <p style={styles.jobMeta}>
                        {job.department} • {job.location} •
                        {job.totalRounds} rounds
                      </p>
                    </div>
                    <div style={styles.jobRight}>
                      <span style={{
                        ...styles.badge,
                        background: job.status === 'OPEN'
                          ? '#c6f6d5' : '#fed7d7',
                        color: job.status === 'OPEN'
                          ? '#276749' : '#9b2c2c',
                      }}>
                        {job.status}
                      </span>
                      <span style={styles.candidateCount}>
                        {job.candidateCount} candidates
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Kanban Pipeline */}
            {selectedJobId && (
              <div style={{ marginTop: '32px' }}>
                <KanbanBoard
                  jobId={selectedJobId}
                  jobTitle={selectedJobTitle}
                />
              </div>
            )}
          </>
        )}
      </div>

      {/* Add Candidate Modal */}
      {showAddCandidate && (
        <AddCandidateForm
          onClose={() => setShowAddCandidate(false)}
          onSuccess={() => {
            fetchJobs();
            fetchOverview();
          }}
        />
      )}

      {/* Create Job Modal */}
      {showCreateJob && (
        <CreateJobForm
          onClose={() => setShowCreateJob(false)}
          onSuccess={() => {
            fetchJobs();
            fetchOverview();
          }}
        />
      )}

    </div>
  );
}

function StatCard({ label, value, color, icon }) {
  return (
    <div style={styles.statCard}>
      <div style={{ ...styles.statIcon, background: color }}>
        {icon}
      </div>
      <div>
        <p style={styles.statLabel}>{label}</p>
        <p style={styles.statValue}>{value}</p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    background: '#f5f6fa',
  },
  navbar: {
    background: 'white',
    padding: '16px 32px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    position: 'sticky',
    top: 0,
    zIndex: 100,
  },
  navLeft: {},
  navLogo: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#667eea',
  },
  navRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  navUser: {
    fontSize: '14px',
    color: '#666',
  },
  logoutBtn: {
    padding: '8px 16px',
    background: '#fff',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '14px',
    color: '#666',
  },
  main: {
    padding: '32px',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  sectionTitle: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#333',
    marginBottom: '8px',
    marginTop: '32px',
  },
  hint: {
    fontSize: '13px',
    color: '#888',
    marginBottom: '16px',
  },
  cardGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '16px',
  },
  statCard: {
    background: 'white',
    borderRadius: '12px',
    padding: '24px',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
  },
  statIcon: {
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '20px',
  },
  statLabel: {
    fontSize: '13px',
    color: '#888',
    marginBottom: '4px',
  },
  statValue: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#333',
  },
  jobList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  jobCard: {
    background: 'white',
    borderRadius: '12px',
    padding: '20px 24px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
  },
  jobLeft: {},
  jobTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#333',
    marginBottom: '4px',
  },
  jobMeta: {
    fontSize: '13px',
    color: '#888',
  },
  jobRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  badge: {
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '600',
  },
  candidateCount: {
    fontSize: '13px',
    color: '#888',
  },
  empty: {
    color: '#888',
    textAlign: 'center',
    padding: '40px',
    background: 'white',
    borderRadius: '12px',
  },
};