import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import socket from '../utils/socket';
import styles from './Team.module.css';

const getSeverityColor = (severity) => {
  switch (severity) {
    case 'critical': return '#ef4444';
    case 'warning': return '#f59e0b';
    case 'suggestion': return '#10b981';
    default: return '#aaa';
  }
};

const Team = () => {
  const { } = useAuth();
  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [selectedSnippet, setSelectedSnippet] = useState(null);
  const [view, setView] = useState('list');
  const [loading, setLoading] = useState(true);

  // Create team
  const [teamName, setTeamName] = useState('');
  const [inviteCode, setInviteCode] = useState('');

  // Share snippet
  const [snippetCode, setSnippetCode] = useState('');
  const [snippetLang, setSnippetLang] = useState('javascript');
  const [sharing, setSharing] = useState(false);

  // Comment
  const [commentText, setCommentText] = useState('');

  useEffect(() => {
    fetchTeams();
  }, []);

  useEffect(() => {
    if (!selectedTeam) return;

    // Join socket room
    socket.emit('join-team', selectedTeam._id);

    // Listen for new snippets
    socket.on('new-snippet', (snippet) => {
      setSelectedTeam(prev => ({
        ...prev,
        snippets: [snippet, ...prev.snippets]
      }));
    });

    // Listen for new comments
    socket.on('new-comment', ({ snippetId, comment }) => {
      setSelectedTeam(prev => ({
        ...prev,
        snippets: prev.snippets.map(s =>
          s._id === snippetId
            ? { ...s, comments: [...s.comments, comment] }
            : s
        )
      }));
      setSelectedSnippet(prev =>
        prev?._id === snippetId
          ? { ...prev, comments: [...prev.comments, comment] }
          : prev
      );
    });

    return () => {
      socket.off('new-snippet');
      socket.off('new-comment');
    };
  }, [selectedTeam?._id]);

  const fetchTeams = async () => {
    try {
      const res = await api.get('/team');
      setTeams(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTeam = async () => {
    if (!teamName.trim()) return;
    try {
      const res = await api.post('/team', { name: teamName });
      setTeams(prev => [...prev, res.data]);
      setTeamName('');
      alert(`Team created! Invite Code: ${res.data.inviteCode}`);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create team');
    }
  };

  const handleJoinTeam = async () => {
    if (!inviteCode.trim()) return;
    try {
      const res = await api.post('/team/join', { inviteCode });
      setTeams(prev => [...prev, res.data]);
      setInviteCode('');
      alert('Joined team successfully!');
    } catch (err) {
      alert(err.response?.data?.message || 'Invalid invite code');
    }
  };

  const handleSelectTeam = async (team) => {
    try {
      const res = await api.get(`/team/${team._id}`);
      setSelectedTeam(res.data);
      setSelectedSnippet(null);
      setView('team');
    } catch (err) {
      console.error(err);
    }
  };

  const handleShareSnippet = async () => {
    if (!snippetCode.trim()) return;
    setSharing(true);
    try {
      await api.post(`/team/${selectedTeam._id}/snippets`, {
        code: snippetCode,
        language: snippetLang
      });
      setSnippetCode('');
      alert('Snippet shared with AI review!');
    } catch (err) {
      alert('Failed to share snippet');
    } finally {
      setSharing(false);
    }
  };

  const handleAddComment = async () => {
    if (!commentText.trim() || !selectedSnippet) return;
    try {
      await api.post(
        `/team/${selectedTeam._id}/snippets/${selectedSnippet._id}/comments`,
        { text: commentText }
      );
      setCommentText('');
    } catch (err) {
      alert('Failed to add comment');
    }
  };

  if (loading) {
    return (
      <div className={styles.page}>
        <Navbar />
        <div className={styles.loading}>Loading teams...</div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <Navbar />

      <div className={styles.content}>

        {/* Teams List View */}
        {view === 'list' && (
          <div className={styles.listView}>
            <h1 className={styles.title}>👥 Team Mode</h1>

            {/* Create + Join */}
            <div className={styles.actionsRow}>
              <div className={styles.actionCard}>
                <h3>➕ Create Team</h3>
                <div className={styles.inputRow}>
                  <input
                    type="text"
                    placeholder="Team name"
                    value={teamName}
                    onChange={e => setTeamName(e.target.value)}
                    className={styles.input}
                  />
                  <button
                    onClick={handleCreateTeam}
                    className={styles.primaryBtn}
                  >
                    Create
                  </button>
                </div>
              </div>

              <div className={styles.actionCard}>
                <h3>🔗 Join Team</h3>
                <div className={styles.inputRow}>
                  <input
                    type="text"
                    placeholder="Enter invite code"
                    value={inviteCode}
                    onChange={e => setInviteCode(e.target.value.toUpperCase())}
                    className={styles.input}
                  />
                  <button
                    onClick={handleJoinTeam}
                    className={styles.secondaryBtn}
                  >
                    Join
                  </button>
                </div>
              </div>
            </div>

            {/* Teams Grid */}
            {teams.length === 0 ? (
              <div className={styles.emptyState}>
                <div style={{ fontSize: '48px' }}>👥</div>
                <p>No teams yet. Create or join one!</p>
              </div>
            ) : (
              <div className={styles.teamsGrid}>
                {teams.map(team => (
                  <div
                    key={team._id}
                    onClick={() => handleSelectTeam(team)}
                    className={styles.teamCard}
                  >
                    <h3>{team.name}</h3>
                    <p>{team.members?.length} members</p>
                    <div className={styles.inviteCodeBadge}>
                      Code: {team.inviteCode}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Team Detail View */}
        {view === 'team' && selectedTeam && (
          <div className={styles.teamView}>

            {/* Header */}
            <div className={styles.teamHeader}>
              <button
                onClick={() => setView('list')}
                className={styles.backBtn}
              >
                ← Back
              </button>
              <h1>{selectedTeam.name}</h1>
              <div className={styles.inviteCodeBadge}>
                Invite Code: <strong>{selectedTeam.inviteCode}</strong>
              </div>
              <div className={styles.membersBadge}>
                👥 {selectedTeam.members?.length} members
              </div>
            </div>

            <div className={styles.teamMain}>

              {/* Left - Share + Snippets */}
              <div className={styles.leftPanel}>

                {/* Share Code */}
                <div className={styles.shareCard}>
                  <h3>📤 Share Code for Review</h3>
                  <select
                    value={snippetLang}
                    onChange={e => setSnippetLang(e.target.value)}
                    className={styles.select}
                  >
                    {['javascript', 'python', 'java', 'cpp', 'typescript'].map(l => (
                      <option key={l} value={l}>{l}</option>
                    ))}
                  </select>
                  <textarea
                    placeholder="Paste your code here..."
                    value={snippetCode}
                    onChange={e => setSnippetCode(e.target.value)}
                    className={styles.textarea}
                    rows={6}
                  />
                  <button
                    onClick={handleShareSnippet}
                    disabled={sharing}
                    className={styles.primaryBtn}
                  >
                    {sharing ? '⏳ Getting AI Review...' : '🚀 Share with AI Review'}
                  </button>
                </div>

                {/* Snippets List */}
                <div className={styles.snippetsList}>
                  <h3>📋 Shared Snippets ({selectedTeam.snippets?.length})</h3>
                  {selectedTeam.snippets?.length === 0 ? (
                    <div className={styles.emptyState}>
                      <p>No snippets yet. Share your first code!</p>
                    </div>
                  ) : (
                    selectedTeam.snippets?.map(snippet => (
                      <div
                        key={snippet._id}
                        onClick={() => setSelectedSnippet(snippet)}
                        className={`${styles.snippetCard} ${selectedSnippet?._id === snippet._id ? styles.selectedSnippet : ''}`}
                      >
                        <div className={styles.snippetTop}>
                          <span className={styles.langBadge}>
                            {snippet.language}
                          </span>
                          <span style={{
                            fontWeight: 700,
                            color: snippet.aiReview?.score >= 70 ? '#10b981' :
                              snippet.aiReview?.score >= 40 ? '#f59e0b' : '#ef4444'
                          }}>
                            {snippet.aiReview?.score}/100
                          </span>
                          <span style={{ color: '#555', fontSize: '11px' }}>
                            💬 {snippet.comments?.length}
                          </span>
                        </div>
                        <div style={{ color: '#666', fontSize: '12px', marginTop: '4px' }}>
                          by {snippet.sharedBy} · {new Date(snippet.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Right - Snippet Detail + Comments */}
              <div className={styles.rightPanel}>
                {!selectedSnippet ? (
                  <div className={styles.detailEmpty}>
                    <div style={{ fontSize: '40px' }}>👈</div>
                    <p>Click a snippet to see AI review and comments</p>
                  </div>
                ) : (
                  <div className={styles.snippetDetail}>

                    {/* AI Review */}
                    <div className={styles.aiReviewSection}>
                      <h3>🤖 AI Review — Score: <span style={{
                        color: selectedSnippet.aiReview?.score >= 70 ? '#10b981' :
                          selectedSnippet.aiReview?.score >= 40 ? '#f59e0b' : '#ef4444'
                      }}>
                        {selectedSnippet.aiReview?.score}/100
                      </span></h3>

                      <div className={styles.summary}>
                        <p>{selectedSnippet.aiReview?.summary}</p>
                      </div>

                      <div className={styles.issuesList}>
                        {selectedSnippet.aiReview?.issues?.map((issue, i) => (
                          <div key={i} className={styles.issueCard}
                            style={{ borderLeft: `3px solid ${getSeverityColor(issue.severity)}` }}>
                            <div className={styles.issueTop}>
                              <span style={{ textTransform: 'capitalize' }}>{issue.type}</span>
                              <span style={{
                                color: getSeverityColor(issue.severity),
                                fontSize: '11px',
                                fontWeight: 700,
                                textTransform: 'uppercase'
                              }}>
                                {issue.severity}
                              </span>
                            </div>
                            <p className={styles.issueMsg}>{issue.message}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Comments */}
                    <div className={styles.commentsSection}>
                      <h3>💬 Comments ({selectedSnippet.comments?.length})</h3>

                      <div className={styles.commentsList}>
                        {selectedSnippet.comments?.length === 0 && (
                          <p style={{ color: '#555', fontSize: '13px' }}>
                            No comments yet. Be the first!
                          </p>
                        )}
                        {selectedSnippet.comments?.map((comment, i) => (
                          <div key={i} className={styles.commentCard}>
                            <div className={styles.commentHeader}>
                              <span className={styles.commentUser}>
                                {comment.userName}
                              </span>
                              <span className={styles.commentTime}>
                                {new Date(comment.createdAt).toLocaleTimeString()}
                              </span>
                            </div>
                            <p className={styles.commentText}>{comment.text}</p>
                          </div>
                        ))}
                      </div>

                      <div className={styles.commentInput}>
                        <input
                          type="text"
                          placeholder="Add a comment..."
                          value={commentText}
                          onChange={e => setCommentText(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && handleAddComment()}
                          className={styles.input}
                        />
                        <button
                          onClick={handleAddComment}
                          className={styles.primaryBtn}
                        >
                          Send
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Team;