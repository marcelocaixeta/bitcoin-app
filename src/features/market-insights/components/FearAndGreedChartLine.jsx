import React from 'react';
import { Line } from 'react-chartjs-2';
import 'chart.js/auto';
import getFearAndGreedService from '../services/fearGreedService';
import getBitcoinPriceData from '../services/bitcoinPriceService';

const dataFag = await getFearAndGreedService(30);
const dataBtc = await getBitcoinPriceData(30);

const FearAndGreedChartLine = () => {
  const data = {
    labels: dataFag[1],
    datasets: [
      {
        type: 'line',
        label: 'Preco do Bitcoin (BTC)',
        data: dataBtc.slice(-30),
        borderColor: 'rgb(255, 215, 0)',
        backgroundColor: 'rgba(255, 215, 0, 0.2)',
        yAxisID: 'y1',
      },
      {
        type: 'line',
        label: 'Fear and Greed Index (FGI)',
        data: dataFag[0],
        fill: false,
        borderColor: 'rgb(54, 162, 235)',
        yAxisID: 'y2',
      },
    ],
  };

  const options = {
    scales: {
      x: {
        ticks: { color: '#FFFFFF' },
        grid: { color: 'rgba(255, 255, 255, 0.2)' },
      },
      y1: {
        type: 'linear',
        position: 'left',
        ticks: { color: '#FFD700' },
        grid: { color: 'rgba(255, 215, 0, 0.2)' },
        beginAtZero: false,
      },
      y2: {
        type: 'linear',
        position: 'right',
        ticks: { color: '#36A2EB' },
        grid: { drawOnChartArea: false },
        beginAtZero: true,
      },
    },
    plugins: {
      legend: {
        labels: { color: '#FFFFFF' },
      },
    },
    layout: {
      padding: 0,
    },
  };

  return (
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
      <div style={{ width: '88%' }}>
        <h2 style={{ color: '#FFFFFF' }}>Preco do BTC Diante do FGI nos Ultimos 30 Dias</h2>
        <Line data={data} options={options} />
      </div>
    </div>
  );
};

export default FearAndGreedChartLine;
