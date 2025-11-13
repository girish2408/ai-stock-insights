import PropTypes from 'prop-types';
import AISummaryCard from './AISummaryCard.jsx';
import StockOverviewCard from './StockOverviewCard.jsx';
import EarningsTable from './EarningsTable.jsx';
import RatingsChart from './RatingsChart.jsx';
import FilingsSummary from './FilingsSummary.jsx';
import NewsFeed from './NewsFeed.jsx';
import AgentStatusPanel from './AgentStatusPanel.jsx';

export default function StockReportCard({ report, isLoading }) {
  if (!report) {
    return (
      <div className="dashboard-grid">
        <div className="card grid-col-6">
          <AISummaryCard isLoading={isLoading} />
        </div>
        <div className="card grid-col-6">
          <StockOverviewCard overview={null} />
        </div>
        <div className="card grid-col-4">
          <RatingsChart ratings={[]} />
        </div>
        <div className="card grid-col-4">
          <EarningsTable earnings={[]} />
        </div>
        <div className="card grid-col-4">
          <FilingsSummary filings={[]} />
        </div>
        <div className="card grid-col-12">
          <NewsFeed news={[]} />
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Top Row: AI Summary and Stock Overview */}
      <div className="dashboard-grid">
        <div className="card grid-col-6">
          <AISummaryCard
            summary={report.summary}
            generatedAt={report.generatedAt}
            isLoading={isLoading}
          />
        </div>
        <div className="card grid-col-6">
          <StockOverviewCard overview={report.overview} />
        </div>
      </div>

      {/* Second Row: Charts and Tables */}
      <div className="dashboard-grid">
        <div className="card grid-col-4">
          <RatingsChart ratings={report.analystRatings ?? []} />
        </div>
        <div className="card grid-col-4">
          <EarningsTable earnings={report.earnings} />
        </div>
        <div className="card grid-col-4">
          <FilingsSummary filings={report.filings ?? []} />
        </div>
      </div>

      {/* Third Row: News Feed (Full Width) */}
      <div className="dashboard-grid">
        <div className="card grid-col-12">
          <NewsFeed news={report.news ?? []} />
        </div>
      </div>

      {/* Agent Status Panel */}
      <div className="dashboard-grid">
        <div className="card grid-col-12">
          <AgentStatusPanel agentStates={report.agentStates ?? []} />
        </div>
      </div>
    </>
  );
}

StockReportCard.propTypes = {
  report: PropTypes.shape({
    summary: PropTypes.string,
    generatedAt: PropTypes.string,
    overview: PropTypes.object,
    earnings: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
    analystRatings: PropTypes.array,
    filings: PropTypes.array,
    news: PropTypes.array,
    agentStates: PropTypes.array
  }),
  isLoading: PropTypes.bool
};

