import PropTypes from 'prop-types';
import dayjs from 'dayjs';
import clsx from 'clsx';

function sentimentBadge(sentiment) {
  if (!sentiment) return 'badge';
  if (sentiment === 'positive') return 'badge positive';
  if (sentiment === 'negative') return 'badge negative';
  return 'badge';
}

export default function NewsFeed({ news }) {
  return (
    <>
      <h2>Latest Headlines</h2>
      <div className="card-list" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
        {(!news || news.length === 0) && <p className="subtext">No recent news found.</p>}
        {news?.map((article) => (
          <article
            key={article.id}
            style={{
              border: '1px solid var(--border-color)',
              borderRadius: '12px',
              padding: '1rem',
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
            <div className={clsx(sentimentBadge(article.sentiment), 'badge')} style={{ fontSize: '0.7rem' }}>
              {(article.sentiment ?? 'neutral').toUpperCase()}
            </div>
            <h3 className="headline" style={{ marginTop: '0.75rem', fontSize: '0.95rem' }}>
              <a href={article.url} target="_blank" rel="noreferrer">
                {article.title}
              </a>
            </h3>
            <p className="subtext" style={{ marginTop: '0.5rem', fontSize: '0.8rem' }}>
              {article.source} ·{' '}
              {article.publishedAt ? dayjs(article.publishedAt).format('MMM D, YYYY h:mm A') : '—'}
            </p>
            <p className="subtext" style={{ marginTop: '0.75rem', lineHeight: 1.5, fontSize: '0.85rem' }}>
              {article.summary ?? 'No summary provided.'}
            </p>
          </article>
        ))}
      </div>
    </>
  );
}

NewsFeed.propTypes = {
  news: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      title: PropTypes.string,
      url: PropTypes.string,
      publishedAt: PropTypes.string,
      source: PropTypes.string,
      sentiment: PropTypes.string,
      summary: PropTypes.string
    })
  )
};

