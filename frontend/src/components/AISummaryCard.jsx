import PropTypes from 'prop-types';

export default function AISummaryCard({ summary, generatedAt, isLoading }) {
  return (
    <>
      <h2>AI Analyst Summary</h2>
      {isLoading ? (
        <p className="subtext">Synthesizing report…</p>
      ) : summary ? (
        <>
          <pre
            style={{
              whiteSpace: 'pre-wrap',
              margin: 0,
              fontFamily: 'inherit',
              fontSize: '0.9rem',
              lineHeight: 1.6,
              color: 'var(--text-secondary)',
              maxHeight: '400px',
              overflowY: 'auto'
            }}
          >
            {summary}
          </pre>
          {generatedAt && (
            <p className="subtext" style={{ marginTop: '0.75rem', fontSize: '0.8rem' }}>
              Generated at {new Date(generatedAt).toLocaleString()}
            </p>
          )}
        </>
      ) : (
        <p className="subtext">
          Summary unavailable. Trigger a refresh or check API credentials.
        </p>
      )}
    </>
  );
}

AISummaryCard.propTypes = {
  summary: PropTypes.string,
  generatedAt: PropTypes.string,
  isLoading: PropTypes.bool
};

