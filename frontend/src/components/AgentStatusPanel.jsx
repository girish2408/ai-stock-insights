import PropTypes from 'prop-types';

const statusColors = {
  success: '#34d399',
  error: '#f87171',
  pending: '#facc15'
};

export default function AgentStatusPanel({ agentStates = [] }) {
  return (
    <div className="card">
      <h2>Agent Orchestration Status</h2>
      {agentStates.length === 0 ? (
        <p className="subtext">No agent activity yet.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '0.8rem' }}>
          {agentStates.map((state) => (
            <li
              key={state.agent}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: 'rgba(15, 23, 42, 0.45)',
                padding: '0.75rem 1rem',
                borderRadius: '12px',
                border: '1px solid rgba(148,163,184,0.1)'
              }}
            >
              <div>
                <strong style={{ color: '#e2e8f0' }}>{state.agent}</strong>
                {state.error?.message && (
                  <div className="subtext" style={{ marginTop: '0.35rem', color: '#f87171' }}>
                    {state.error.message}
                  </div>
                )}
              </div>
              <div style={{ textAlign: 'right' }}>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    color: statusColors[state.status] ?? '#94a3b8',
                    fontWeight: 600
                  }}
                >
                  <span
                    style={{
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      backgroundColor: statusColors[state.status] ?? '#94a3b8'
                    }}
                  />
                  {state.status.toUpperCase()}
                </span>
                {typeof state.durationMs === 'number' && (
                  <div className="subtext" style={{ marginTop: '0.25rem' }}>
                    {state.durationMs.toFixed(0)} ms
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

AgentStatusPanel.propTypes = {
  agentStates: PropTypes.arrayOf(
    PropTypes.shape({
      agent: PropTypes.string.isRequired,
      status: PropTypes.string.isRequired,
      durationMs: PropTypes.number,
      error: PropTypes.shape({
        message: PropTypes.string
      })
    })
  )
};

