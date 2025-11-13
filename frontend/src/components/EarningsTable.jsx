import PropTypes from 'prop-types';
import dayjs from 'dayjs';

function formatDate(dateString) {
  if (!dateString) return '—';
  return dayjs(dateString).format('MMM D, YYYY');
}

export default function EarningsTable({ earnings }) {
  const items = earnings?.earningsCalendar ?? earnings ?? [];

  if (!items.length) {
    return (
      <>
        <h2>Upcoming Earnings</h2>
        <p className="subtext">No earnings events found for the selected window.</p>
      </>
    );
  }

  return (
    <>
      <h2>Upcoming Earnings</h2>
      <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
        <table className="table">
          <thead>
            <tr>
              <th>Date</th>
              <th>EPS Est.</th>
              <th>Revenue Est.</th>
              <th>Time</th>
            </tr>
          </thead>
          <tbody>
            {items.slice(0, 6).map((row) => (
              <tr key={`${row.symbol}-${row.date ?? row.period}`}>
                <td style={{ fontSize: '0.85rem' }}>{formatDate(row.date)}</td>
                <td style={{ fontSize: '0.85rem' }}>{row.epsEstimate ?? '—'}</td>
                <td style={{ fontSize: '0.85rem' }}>{row.revenueEstimate ?? '—'}</td>
                <td style={{ fontSize: '0.85rem' }}>{row.hour ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

EarningsTable.propTypes = {
  earnings: PropTypes.oneOfType([
    PropTypes.shape({
      earningsCalendar: PropTypes.arrayOf(PropTypes.object)
    }),
    PropTypes.arrayOf(PropTypes.object)
  ])
};

