import PropTypes from 'prop-types';
import { Bar, BarChart, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

function transformRatings(data = []) {
  return data.slice(0, 6).map((entry) => ({
    period: entry.period,
    strongBuy: entry.strongBuy ?? 0,
    buy: entry.buy ?? 0,
    hold: entry.hold ?? 0,
    sell: entry.sell ?? 0,
    strongSell: entry.strongSell ?? 0
  }));
}

export default function RatingsChart({ ratings }) {
  const chartData = transformRatings(ratings);

  return (
    <>
      <h2>Analyst Recommendations</h2>
      {chartData.length === 0 ? (
        <p className="subtext">No analyst trend data available.</p>
      ) : (
        <div className="chart-container" style={{ height: '240px' }}>
          <ResponsiveContainer>
            <BarChart data={chartData}>
              <XAxis dataKey="period" tick={{ fill: 'var(--text-tertiary)', fontSize: 11 }} />
              <YAxis allowDecimals={false} tick={{ fill: 'var(--text-tertiary)', fontSize: 11 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '12px',
                  color: 'var(--text-primary)'
                }}
                labelStyle={{ color: 'var(--text-secondary)' }}
              />
              <Legend
                wrapperStyle={{
                  color: 'var(--text-secondary)',
                  fontSize: '0.75rem'
                }}
              />
              <Bar dataKey="strongBuy" stackId="a" fill="#22d3ee" />
              <Bar dataKey="buy" stackId="a" fill="#0ea5e9" />
              <Bar dataKey="hold" stackId="a" fill="#facc15" />
              <Bar dataKey="sell" stackId="a" fill="#fb7185" />
              <Bar dataKey="strongSell" stackId="a" fill="#ef4444" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </>
  );
}

RatingsChart.propTypes = {
  ratings: PropTypes.arrayOf(
    PropTypes.shape({
      period: PropTypes.string,
      strongBuy: PropTypes.number,
      buy: PropTypes.number,
      hold: PropTypes.number,
      sell: PropTypes.number,
      strongSell: PropTypes.number
    })
  )
};

