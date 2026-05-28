import React from 'react';
import {
  BitcoinPriceHeader,
  FearAndGreedChartLine,
} from '../features/market-insights';

export const MarketInsightsPage = () => {
  return (
    <div className="App">
      <header className="App-header">
        <h1>
          <BitcoinPriceHeader />
        </h1>
      </header>

      <div className="chart-container">
        <FearAndGreedChartLine />
      </div>
    </div>
  );
};

export default MarketInsightsPage;
