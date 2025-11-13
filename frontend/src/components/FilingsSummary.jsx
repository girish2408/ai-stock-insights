import PropTypes from 'prop-types';
import dayjs from 'dayjs';

export default function FilingsSummary({ filings }) {
  const items = filings ?? [];

  return (
    <>
      <h2>Recent SEC Filings</h2>
      <div className="card-list" style={{ maxHeight: '400px', overflowY: 'auto' }}>
        {items.length === 0 && <p className="subtext">No filings found.</p>}
        {items.slice(0, 5).map((filing) => (
          <article
            key={`${filing.form}-${filing.filingDate}-${filing.accessionNumber}`}
            style={{
              border: '1px solid var(--border-color)',
              borderRadius: '12px',
              padding: '0.875rem',
              background: 'var(--bg-tertiary)',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-hover)';
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = 'var(--shadow-md)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-color)';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <div className="badge" style={{ fontSize: '0.7rem' }}>{filing.form}</div>
            <h3 className="headline" style={{ marginTop: '0.75rem', fontSize: '0.9rem' }}>
              {filing.companyName}
            </h3>
            <p className="subtext" style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>
              Filed {filing.filingDate ? dayjs(filing.filingDate).format('MMM D, YYYY') : '—'} ·
              Report {filing.reportDate ? dayjs(filing.reportDate).format('MMM D, YYYY') : '—'}
            </p>
            <p className="subtext" style={{ marginTop: '0.75rem', lineHeight: 1.5, fontSize: '0.85rem', maxHeight: '60px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {filing.summary ?? 'Summary unavailable.'}
            </p>
            <div style={{ marginTop: '0.75rem' }}>
              <a href={filing.documentUrl} target="_blank" rel="noreferrer" style={{ fontSize: '0.85rem' }}>
                View Filing →
              </a>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}

FilingsSummary.propTypes = {
  filings: PropTypes.arrayOf(
    PropTypes.shape({
      form: PropTypes.string,
      filingDate: PropTypes.string,
      reportDate: PropTypes.string,
      accessionNumber: PropTypes.string,
      documentUrl: PropTypes.string,
      summary: PropTypes.string,
      companyName: PropTypes.string
    })
  )
};

