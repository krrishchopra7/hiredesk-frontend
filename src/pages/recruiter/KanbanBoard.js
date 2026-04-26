import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import API from '../../services/api';

export default function KanbanBoard({ jobId, jobTitle }) {
  const [pipeline, setPipeline] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (jobId) fetchPipeline();
  }, [jobId]);

  const fetchPipeline = async () => {
    try {
      const res = await API.get(`/api/candidates/pipeline/${jobId}`);
      setPipeline(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const onDragEnd = async (result) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId) return;

    const newStage = parseInt(destination.droppableId);
    const candidateId = parseInt(draggableId);

    const newPipeline = { ...pipeline };
    const candidate = newPipeline.stages[source.droppableId]
      .find(c => c.id === candidateId);

    newPipeline.stages[source.droppableId] =
      newPipeline.stages[source.droppableId]
        .filter(c => c.id !== candidateId);

    if (!newPipeline.stages[destination.droppableId]) {
      newPipeline.stages[destination.droppableId] = [];
    }

    newPipeline.stages[destination.droppableId].push({
      ...candidate,
      currentStage: newStage,
    });

    setPipeline(newPipeline);

    try {
      await API.patch(`/api/candidates/${candidateId}/stage?stage=${newStage}`);
    } catch (err) {
      console.error('Failed to update stage');
      fetchPipeline();
    }
  };

  const handleReject = async (candidateId) => {
    if (!window.confirm('Reject this candidate?')) return;
    try {
      await API.patch(`/api/candidates/${candidateId}/status?status=REJECTED`);
      fetchPipeline();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSelect = async (candidateId) => {
    if (!window.confirm('Mark this candidate as Selected?')) return;
    try {
      await API.patch(`/api/candidates/${candidateId}/status?status=SELECTED`);
      fetchPipeline();
    } catch (err) {
      console.error(err);
    }
  };

  const handleRequestFeedback = async (candidateId) => {
    const roundId = prompt('Enter Round Number (1 for Round 1, 2 for Round 2):');
    if (!roundId) return;
    try {
      const res = await API.post(
        `/api/feedback/request?candidateId=${candidateId}&roundId=${roundId}`
      );
      alert(
        `Feedback requested!\n\nShare this link with the interviewer:\nhttp://localhost:3000/feedback/${res.data.feedbackToken}`
      );
    } catch (err) {
      alert('Feedback already requested for this round or error occurred');
    }
  };

  if (loading) return (
    <div style={styles.loading}>Loading pipeline...</div>
  );

  if (!pipeline) return null;

  const stageNames = ['Applied', 'Round 1', 'Round 2', 'Round 3', 'Round 4', 'Round 5'];
  const stageColors = ['#667eea', '#ed8936', '#48bb78', '#e53e3e', '#9f7aea', '#38b2ac'];
  const stages = Object.keys(pipeline.stages).sort((a, b) => parseInt(a) - parseInt(b));

  return (
    <div>
      {/* Header */}
      <div style={styles.header}>
        <h2 style={styles.title}>Pipeline — {jobTitle}</h2>
        <div style={styles.stats}>
          <span style={styles.stat}>Total: {pipeline.totalCandidates}</span>
          <span style={{ ...styles.stat, color: '#48bb78' }}>
            Selected: {pipeline.selected}
          </span>
          <span style={{ ...styles.stat, color: '#e53e3e' }}>
            Rejected: {pipeline.rejected}
          </span>
        </div>
      </div>

      {/* Kanban Board */}
      <DragDropContext onDragEnd={onDragEnd}>
        <div style={styles.board}>
          {stages.map((stageKey, index) => {
            const candidates = pipeline.stages[stageKey] || [];
            const stageName = stageNames[parseInt(stageKey)] || `Round ${stageKey}`;
            const color = stageColors[index % stageColors.length];

            return (
              <div key={stageKey} style={styles.column}>

                {/* Column Header */}
                <div style={{ ...styles.columnHeader, borderTop: `3px solid ${color}` }}>
                  <span style={styles.columnTitle}>{stageName}</span>
                  <span style={{ ...styles.columnCount, background: color }}>
                    {candidates.length}
                  </span>
                </div>

                {/* Droppable */}
                <Droppable droppableId={stageKey}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      style={{
                        ...styles.droppable,
                        background: snapshot.isDraggingOver ? '#f0f4ff' : 'transparent',
                      }}
                    >
                      {candidates.map((candidate, idx) => (
                        <Draggable
                          key={candidate.id}
                          draggableId={String(candidate.id)}
                          index={idx}
                        >
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              style={{
                                ...styles.card,
                                boxShadow: snapshot.isDragging
                                  ? '0 8px 24px rgba(0,0,0,0.15)'
                                  : '0 2px 8px rgba(0,0,0,0.06)',
                                ...provided.draggableProps.style,
                              }}
                            >
                              {/* Avatar + Name */}
                              <div style={styles.cardTop}>
                                <div style={{ ...styles.avatar, background: color }}>
                                  {candidate.name.charAt(0).toUpperCase()}
                                </div>
                                <div style={{ flex: 1 }}>
                                  <p style={styles.cardName}>{candidate.name}</p>
                                  <p style={styles.cardCompany}>
                                    {candidate.currentCompany || 'No company'}
                                  </p>
                                </div>
                              </div>

                              {/* Tags */}
                              <div style={styles.tags}>
                                <span style={styles.tag}>
                                  {candidate.experienceYears}y exp
                                </span>
                                <span style={{ ...styles.tag, background: '#e9d8fd', color: '#553c9a' }}>
                                  {candidate.source}
                                </span>
                              </div>

                              {/* Action Buttons */}
                              <div style={styles.cardActions}>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleReject(candidate.id);
                                  }}
                                  style={styles.rejectBtn}>
                                  ✕ Reject
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSelect(candidate.id);
                                  }}
                                  style={styles.selectBtn}>
                                  ✓ Select
                                </button>
                              </div>

                              {/* Feedback Button */}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRequestFeedback(candidate.id);
                                }}
                                style={styles.feedbackBtn}>
                                📝 Request Feedback
                              </button>

                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}

                      {candidates.length === 0 && (
                        <div style={styles.emptyColumn}>Drop here</div>
                      )}
                    </div>
                  )}
                </Droppable>
              </div>
            );
          })}
        </div>
      </DragDropContext>
    </div>
  );
}

const styles = {
  loading: { textAlign: 'center', padding: '40px', color: '#888' },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
  },
  title: { fontSize: '20px', fontWeight: '700', color: '#333' },
  stats: { display: 'flex', gap: '16px' },
  stat: { fontSize: '14px', fontWeight: '600', color: '#666' },
  board: { display: 'flex', gap: '16px', overflowX: 'auto', paddingBottom: '16px' },
  column: {
    minWidth: '240px',
    maxWidth: '240px',
    background: 'white',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    overflow: 'hidden',
  },
  columnHeader: {
    padding: '12px 16px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: 'white',
  },
  columnTitle: { fontWeight: '600', fontSize: '14px', color: '#333' },
  columnCount: {
    color: 'white',
    borderRadius: '12px',
    padding: '2px 8px',
    fontSize: '12px',
    fontWeight: '700',
  },
  droppable: {
    padding: '8px',
    minHeight: '400px',
    borderRadius: '0 0 12px 12px',
    transition: 'background 0.2s',
  },
  card: {
    background: 'white',
    borderRadius: '10px',
    padding: '14px',
    marginBottom: '10px',
    border: '1px solid #f0f0f0',
    cursor: 'grab',
  },
  cardTop: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '10px',
  },
  avatar: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontWeight: '700',
    fontSize: '14px',
    flexShrink: 0,
  },
  cardName: { fontSize: '14px', fontWeight: '600', color: '#333', marginBottom: '2px' },
  cardCompany: { fontSize: '12px', color: '#888' },
  tags: { display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '10px' },
  tag: {
    background: '#e2f0d9',
    color: '#276749',
    padding: '2px 8px',
    borderRadius: '10px',
    fontSize: '11px',
    fontWeight: '600',
  },
  cardActions: { display: 'flex', gap: '6px', marginBottom: '6px' },
  rejectBtn: {
    flex: 1,
    padding: '5px',
    background: '#fff5f5',
    color: '#e53e3e',
    border: '1px solid #fed7d7',
    borderRadius: '6px',
    fontSize: '11px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  selectBtn: {
    flex: 1,
    padding: '5px',
    background: '#f0fff4',
    color: '#276749',
    border: '1px solid #c6f6d5',
    borderRadius: '6px',
    fontSize: '11px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  feedbackBtn: {
    width: '100%',
    padding: '5px',
    background: '#ebf8ff',
    color: '#2b6cb0',
    border: '1px solid #bee3f8',
    borderRadius: '6px',
    fontSize: '11px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  emptyColumn: {
    textAlign: 'center',
    color: '#ccc',
    padding: '40px 16px',
    fontSize: '13px',
    border: '2px dashed #e2e8f0',
    borderRadius: '8px',
    margin: '8px',
  },
};