import { useState } from 'react';
import Editor from '@monaco-editor/react';
import Navbar from '../components/Navbar';
import api from '../utils/api';
import styles from './Review.module.css';

const LANGUAGES = [
  'javascript', 'python', 'java', 'cpp',
  'typescript', 'go', 'rust', 'php'
];

const getSeverityColor = (severity) => {
  switch (severity) {
    case 'critical': return '#ef4444';
    case 'warning': return '#f59e0b';
    case 'suggestion': return '#10b981';
    default: return '#aaa';
  }
};

const getTypeIcon = (type) => {
  switch (type) {
    case 'bug': return '🐛';
    case 'security': return '🔒';
    case 'performance': return '⚡';
    case 'style': return '🎨';
    default: return '💡';
  }
};

const getScoreColor = (score) => {
  if (score >= 70) return '#10b981';
  if (score >= 40) return '#f59e0b';
  return '#ef4444';
};

const Review = () => {
  const [code, setCode] = useState('// Paste your code here and click Review\n');
  const [language, setLanguage] = useState('javascript');
  const [loading, setLoading] = useState(false);
  const [review, setReview] = useState(null);
  const [error, setError] = useState('');
  const [panelOpen, setPanelOpen] = useState(false);
  const [showOptimized, setShowOptimized] = useState(true);

  const handleReview = async () => {
    if (!code.trim() || code.trim() === '// Paste your code here and click Review') {
      setError('Please enter some code to review');
      return;
    }
    setLoading(true);
    setError('');
    setPanelOpen(true);

    try {
      const res = await api.post('/review', { code, language });
      setReview(res.data.review);

      if (res.data.review.languageMismatch && res.data.review.detectedLanguage) {
        setLanguage(res.data.review.detectedLanguage);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to review code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <Navbar />

      {/* Toolbar */}
      <div className={styles.toolbar}>
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className={styles.select}
        >
          {LANGUAGES.map(lang => (
            <option key={lang} value={lang}>
              {lang.charAt(0).toUpperCase() + lang.slice(1)}
            </option>
          ))}
        </select>

        <button
          onClick={handleReview}
          disabled={loading}
          className={styles.reviewBtn}
        >
          {loading ? (
            <>
              <span className={styles.spinner}></span>
              Analyzing...
            </>
          ) : (
            <>✦ Review Code</>
          )}
        </button>

        {review && !loading && (
          <div className={styles.toolbarRight}>
            <div
              className={styles.scorePill}
              style={{
                background: `${getScoreColor(review.score)}18`,
                border: `1px solid ${getScoreColor(review.score)}40`,
                color: getScoreColor(review.score)
              }}
            >
              Score {review.score}/100
            </div>
            {review.complexity && (
              <div className={styles.complexityPill}>
                {review.complexity.time?.current}
                {review.complexity.time?.optimized !== review.complexity.time?.current && (
                  <span style={{ color: '#10b981' }}> → {review.complexity.time?.optimized}</span>
                )}
              </div>
            )}
            {!panelOpen && (
              <button className={styles.reopenBtn} onClick={() => setPanelOpen(true)}>
                Show review
              </button>
            )}
          </div>
        )}
      </div>

      {error && <div className={styles.errorBar}>{error}</div>}

      {/* Main Layout */}
      <div className={styles.main}>

        {/* Editor */}
        <div className={styles.editorPanel} style={{ flex: 1 }}>
          <div className={styles.panelHeader}>
            <span className={styles.panelTitle}>Code Editor</span>
            <span className={styles.langTag}>{language}</span>
          </div>
          <Editor
            height="calc(100vh - 130px)"
            language={language}
            value={code}
            onChange={(val) => setCode(val || '')}
            theme="vs-dark"
            options={{
              fontSize: 13,
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              wordWrap: 'on',
              padding: { top: 16 },
              fontFamily: "'Fira Code', 'Cascadia Code', monospace",
              fontLigatures: true
            }}
          />
        </div>

        {/* AI Review Panel — only mounted when panelOpen is true */}
        {panelOpen && (
          <div className={styles.reviewPanel}>
            <div className={styles.panelHeader}>
              <span className={styles.panelTitle}>AI Review</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {review && !loading && (
                  <span className={styles.issueCount}>{review.issues?.length} issues</span>
                )}
                <button
                  className={styles.closeBtn}
                  onClick={() => setPanelOpen(false)}
                  title="Close panel"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className={styles.reviewContent}>

              {/* Loading */}
              {loading && (
                <div className={styles.centerState}>
                  <div className={styles.loadingRing}></div>
                  <p style={{ color: '#aaa', marginTop: '16px', fontSize: '13px' }}>
                    Analyzing your code...
                  </p>
                </div>
              )}

              {/* Results */}
              {!loading && review && (
                <div className={styles.results}>

                  {/* Language mismatch banner */}
                  {review.languageMismatch && (
                    <div className={styles.mismatchBanner}>
                      Detected {review.detectedLanguage} code — switched language automatically
                    </div>
                  )}

                  {/* Complexity cards */}
                  {review.complexity && (
                    <div className={styles.complexityGrid}>
                      <div className={styles.complexityCard}>
                        <div className={styles.compLabel}>Time</div>
                        <div className={styles.compCurrent} style={{ color: '#ef4444' }}>
                          {review.complexity.time?.current}
                        </div>
                        {review.complexity.time?.optimized !== review.complexity.time?.current && (
                          <div className={styles.compOptimized}>→ {review.complexity.time?.optimized}</div>
                        )}
                      </div>
                      <div className={styles.complexityCard}>
                        <div className={styles.compLabel}>Space</div>
                        <div className={styles.compCurrent} style={{ color: '#f59e0b' }}>
                          {review.complexity.space?.current}
                        </div>
                        {review.complexity.space?.optimized !== review.complexity.space?.current && (
                          <div className={styles.compOptimized}>→ {review.complexity.space?.optimized}</div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Optimized Code Section */}
                  {review.optimizedCode && (
                    <div className={styles.optimizedSection}>
                      <div className={styles.optimizedHeader}>
                        <span className={styles.optimizedTitle}>⚡ Optimized Version</span>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button
                            className={styles.useCodeBtn}
                            onClick={() => setCode(review.optimizedCode)}
                          >
                            Use this code
                          </button>
                          <button
                            className={styles.toggleBtn}
                            onClick={() => setShowOptimized(!showOptimized)}
                          >
                            {showOptimized ? 'Hide' : 'Show'}
                          </button>
                        </div>
                      </div>

                      {showOptimized && (
                        <div className={styles.optimizedGrid}>
                          <div className={styles.optimizedBlock}>
                            <div className={styles.diffLabel}>original</div>
                            <pre className={styles.optimizedCodeBox}>{code}</pre>
                          </div>
                          <div className={styles.optimizedBlock}>
                            <div className={styles.diffLabel} style={{ color: '#10b981' }}>optimized</div>
                            <pre className={styles.optimizedCodeBoxGood}>{review.optimizedCode}</pre>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Issues - pure before/after diff cards */}
                  <div className={styles.issuesSection}>
                    {review.issues?.length === 0 && (
                      <div className={styles.noIssues}>✅ No issues found</div>
                    )}

                    {review.issues?.map((issue, index) => (
                      <div key={index} className={styles.issueCard}>

                        <div className={styles.issueHeader}>
                          <span className={styles.issueIcon}>{getTypeIcon(issue.type)}</span>
                          <span className={styles.issueType}>{issue.type}</span>
                          {issue.line && (
                            <span className={styles.issueLine}>
                              L{issue.line}{issue.lineEnd && issue.lineEnd !== issue.line ? `-${issue.lineEnd}` : ''}
                            </span>
                          )}
                          <span
                            className={styles.severityBadge}
                            style={{
                              background: `${getSeverityColor(issue.severity)}18`,
                              color: getSeverityColor(issue.severity)
                            }}
                          >
                            {issue.severity}
                          </span>
                        </div>

                        {(issue.before || issue.after) && (
                          <div className={styles.diffGrid}>
                            {issue.before && (
                              <div className={styles.diffBlock}>
                                <div className={styles.diffLabel}>before</div>
                                {issue.before.split('\n').map((line, i) => (
                                  <div key={i} className={styles.diffLineBad}>
                                    <code>{line}</code>
                                  </div>
                                ))}
                              </div>
                            )}
                            {issue.after && (
                              <div className={styles.diffBlock}>
                                <div className={styles.diffLabel}>after</div>
                                {issue.after.split('\n').map((line, i) => (
                                  <div key={i} className={styles.diffLineGood}>
                                    <code>{line}</code>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}

                        <p className={styles.issueMessage}>{issue.message}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Review;