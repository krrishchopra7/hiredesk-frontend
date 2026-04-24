import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, PieChart, Pie, Cell,
  ResponsiveContainer
} from 'recharts';

export default function AnalyticsPage() {
  const [funnel, setFunnel] = useState([]);
  const [sources, setSources] = useState([]);
  const [interviewers, setInterviewers] = useState([]);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      const [funnelRes, sourcesRes, interviewersRes] =
        await Promise.all([
          API.get('/api/analytics/funnel/1'),
          API.get('/api/analytics/sources'),
          API.get('/api/analytics/interviewers'),
        ]);

      setFunnel(funnelRes.data);

      const sourcesArray = Object.entries(sourcesRes.data)
        .map(([name, value]) => ({ name, value }));
      setSources(sourcesArray);

      setInterviewers(interviewersRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  const COLORS = [
    '#667eea', '#48bb78', '#ed8936',
    '#e53e3e', '#9f7aea'
  ];

  return (
    <div>
      <h2 style={styles.pageTitle}>
        📊 Analytics Dashboard
      </h2>

      {/* Hiring Funnel */}
      <div style={styles.chartCard}>
        <h3 style={styles.chartTitle}>Hiring Funnel</h3>
        <p style={styles.chartSubtitle}>
          Candidate drop-off at each stage
        </p>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={funnel}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="stageName" />
            <YAxis />
            <Tooltip />
            <Bar
              dataKey="count"
              fill="#667eea"
              radius={[6, 6, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div style={styles.row}>

        {/* Source Breakdown */}
        <div style={{ ...styles.chartCard, flex: 1 }}>
          <h3 style={styles.chartTitle}>
            Source Breakdown
          </h3>
          <p style={styles.chartSubtitle}>
            Where candidates are coming from
          </p>
          {sources.length === 0 ? (
            <p style={styles.noData}>No data yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={sources}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="value"
                  label={({ name, value }) =>
                    `${name}: ${value}`
                  }
                >
                  {sources.map((entry, index) => (
                    <Cell
                      key={index}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Interviewer Stats */}
        <div style={{ ...styles.chartCard, flex: 1 }}>
          <h3 style={styles.chartTitle}>
            Interviewer Performance
          </h3>
          <p style={styles.chartSubtitle}>
            Feedback submission rates
          </p>
          {interviewers.length === 0 ? (
            <p style={styles.noData}>
              No interviewers yet
            </p>
          ) : (
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Name</th>
                  <th style={styles.th}>Assigned</th>
                  <th style={styles.th}>Submitted</th>
                  <th style={styles.th}>Rate</th>
                </tr>
              </thead>
              <tbody>
                {interviewers.map(i => (
                  <tr key={i.interviewerId}>
                    <td style={styles.td}>
                      {i.interviewerName}
                    </td>
                    <td style={styles.td}>
                      {i.totalAssigned}
                    </td>
                    <td style={styles.td}>
                      {i.submitted}
                    </td>
                    <td style={styles.td}>
                      <span style={{
                        color: i.submissionRate >= 80
                          ? '#48bb78' : '#e53e3e',
                        fontWeight: '700',
                      }}>
                        {i.submissionRate}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

      </div>
    </div>
  );
}

const styles = {
  pageTitle: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#333',
    marginBottom: '24px',
  },
  chartCard: {
    background: 'white',
    borderRadius: '12px',
    padding: '24px',
    marginBottom: '24px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
  },
  chartTitle: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#333',
    marginBottom: '4px',
  },
  chartSubtitle: {
    fontSize: '13px',
    color: '#888',
    marginBottom: '20px',
  },
  row: {
    display: 'flex',
    gap: '24px',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  th: {
    textAlign: 'left',
    padding: '12px',
    fontSize: '13px',
    color: '#888',
    borderBottom: '1px solid #f0f0f0',
  },
  td: {
    padding: '12px',
    fontSize: '14px',
    color: '#333',
    borderBottom: '1px solid #f0f0f0',
  },
  noData: {
    color: '#888',
    textAlign: 'center',
    padding: '40px',
  },
};