import React, { useState, useEffect } from 'react';
import axios from 'axios';

import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import FearGreedGauge from './FearGreedGauge';
import getBitcoinPriceData from '../services/bitcoinPriceService';

ChartJS.register(ArcElement, Tooltip, Legend);

const BitcoinPriceHeader = () => {
  const [data, setData] = useState(null);
  const [bitcoinPrice, setBitcoinPrice] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [fearGreedResponse, bitcoinPrices] = await Promise.all([
          axios.get('https://api.alternative.me/fng/?limit=1'),
          getBitcoinPriceData(1),
        ]);

        setData(fearGreedResponse.data.data);
        setBitcoinPrice(bitcoinPrices.at(-1) ?? null);
      } catch (error) {
        console.error('Error fetching the data:', error);
      }
    };

    fetchData();
  }, []);

  const doughnutData = {
    labels: ['Medo Extremo', 'Medo', 'Ganancia', 'Ganancia Extrema'],
    datasets: [
      {
        label: 'My First Dataset',
        data: [25, 25, 25, 25],
        backgroundColor: ['#9e0000', '#ff8080', '#42ff82', '#004718'],
        hoverOffset: 4,
      },
    ],
  };
  console.log(bitcoinPrice, doughnutData);
  const formattedNumber = bitcoinPrice
    ? bitcoinPrice.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
    : 'Indisponivel';

  return (
    <div className="bitcoin-price-header">
      <h3>BTC: {formattedNumber}</h3>
      <div
        id="planoFundo"
        style={{
          backgroundColor: '#282c34',
          padding: '0',
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <div className="bitcoin-gauge-shell">
          <FearGreedGauge />
        </div>
      </div>
      {data ? '' : <p>Carregando...</p>}
    </div>
  );
};

export default BitcoinPriceHeader;
