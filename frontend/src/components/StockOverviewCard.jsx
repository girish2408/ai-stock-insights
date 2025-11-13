import PropTypes from 'prop-types';
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import clsx from 'clsx';

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 2
});

function formatNumber(value) {
  if (value === null || value === undefined) return '—';
  if (Math.abs(value) >= 1_000_000_000) {
    return `${(value / 1_000_000_000).toFixed(1)}B`;
  }
  if (Math.abs(value) >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}M`;
  }
  return value.toLocaleString();
}

function formatChange(percentage) {
  if (percentage === null || percentage === undefined) return '—';
  const sign = percentage > 0 ? '+' : '';
  return `${sign}${percentage.toFixed(2)}%`;
}

function formatHistorical(data) {
  return (data ?? [])
    .slice()
    .reverse()
    .map((item) => ({
      date: item.date,
      close: item.close
    }));
}

export default function StockOverviewCard({ overview }) {
  if (!overview) {
    return (
      <>
        <h2>Overview</h2>
        <p className="subtext">Enter a ticker to load company details.</p>
      </>
    );
  }

  const changeClass = clsx('badge', {
    positive: overview.changesPercentage > 0,
    negative: overview.changesPercentage < 0
  });

  const historicalData = formatHistorical(overview.historical);

  return (
    <>
      <h2>{overview.companyName ?? overview.symbol}</h2>
      <div className="subtext" style={{ fontSize: '0.85rem' }}>
        {overview.sector ?? 'Unknown sector'} · CEO: {overview.ceo ?? 'N/A'} ·{' '}
        {overview.exchange ?? '—'}
      </div>

      <div style={{ display: 'flex', alignItems: 'flex-end', marginTop: '1rem', gap: '1.5rem', flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 auto', minWidth: '150px' }}>
          <div style={{ fontSize: '2.25rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.2 }}>
            {overview.price ? currencyFormatter.format(overview.price) : '—'}
          </div>
          <div className={changeClass} style={{ marginTop: '0.5rem', display: 'inline-block' }}>
            {formatChange(overview.changesPercentage)}
          </div>
          <div className="subtext" style={{ marginTop: '0.75rem', fontSize: '0.8rem' }}>
            Volume {formatNumber(overview.volume)} · Market Cap{' '}
            {overview.marketCap ? formatNumber(overview.marketCap) : '—'}
          </div>
        </div>
        <div className="chart-container" style={{ flex: '1 1 200px', minWidth: '200px' }}>
          <ResponsiveContainer>
            <AreaChart data={historicalData}>
              <defs>
                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--accent-primary)" stopOpacity={0.6} />
                  <stop offset="95%" stopColor="var(--accent-primary)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" hide />
              <YAxis domain={['auto', 'auto']} hide />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '12px',
                  color: 'var(--text-primary)'
                }}
                labelStyle={{ color: 'var(--text-secondary)' }}
              />
              <Area
                type="monotone"
                dataKey="close"
                stroke="var(--accent-primary)"
                strokeWidth={2}
                fill="url(#colorPrice)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {overview.description && (
        <p className="subtext" style={{ marginTop: '1rem', lineHeight: 1.5, fontSize: '0.85rem', maxHeight: '120px', overflowY: 'auto' }}>
          {overview.description}
        </p>
      )}

      {overview.website && (
        <div style={{ marginTop: '0.75rem' }}>
          <a href={overview.website} target="_blank" rel="noreferrer" style={{ fontSize: '0.85rem' }}>
            Company Website →
          </a>
        </div>
      )}
    </>
  );
}

StockOverviewCard.propTypes = {
  overview: PropTypes.shape({
    symbol: PropTypes.string,
    companyName: PropTypes.string,
    description: PropTypes.string,
    industry: PropTypes.string,
    sector: PropTypes.string,
    ceo: PropTypes.string,
    website: PropTypes.string,
    exchange: PropTypes.string,
    price: PropTypes.number,
    change: PropTypes.number,
    changesPercentage: PropTypes.number,
    volume: PropTypes.number,
    marketCap: PropTypes.number,
    historical: PropTypes.arrayOf(
      PropTypes.shape({
        date: PropTypes.string,
        close: PropTypes.number
      })
    )
  })
};

