import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import 'chart.js/auto';
import getServiceFearAndGreed from './ServiceFearAndGreed';
import getBitcoinPriceData from './ServiceBitcoinPrice';

const dataFag = await getServiceFearAndGreed(30);
const dataBtc = await getBitcoinPriceData(30);

const ChartLineDouble = ({ bitcoinPrices, fearAndGreedIndex, labels }) => {

  const data = {
    labels: dataFag[1],
    datasets: [
      {
        type: 'line',
        label: 'Preço do Bitcoin (BTC)',
        data: dataBtc.slice(-30), // Valores do preço do Bitcoin
        borderColor: 'rgb(255, 215, 0)', // Cor amarela para o preço do Bitcoin
        backgroundColor: 'rgba(255, 215, 0, 0.2)',
        yAxisID: 'y1', // Associa este dataset ao eixo y1
      },
      {
        type: 'line',
        label: 'Fear and Greed Index (FGI)',
        data: dataFag[0], // Valores do Fear and Greed Index
        fill: false,
        borderColor: 'rgb(54, 162, 235)', // Cor azul para o índice
        yAxisID: 'y2', // Associa este dataset ao eixo y2
      }
    ]
  };

  const options = {
    scales: {
      x: {
        ticks: { color: '#FFFFFF' }, // Cor do texto do eixo X
        grid: { color: 'rgba(255, 255, 255, 0.2)' } // Cor da grade do eixo X
      },
      y1: {
        type: 'linear',
        position: 'left',
        ticks: { color: '#FFD700' }, // Cor do texto do eixo Y1
        grid: { color: 'rgba(255, 215, 0, 0.2)' }, // Cor da grade do eixo Y1
        beginAtZero: false, // Para ajustar a escala ao valor mínimo do BTC
      },
      y2: {
        type: 'linear',
        position: 'right',
        ticks: { color: '#36A2EB' }, // Cor do texto do eixo Y2
        grid: { drawOnChartArea: false }, // Evita sobreposição de grids
        beginAtZero: true, // Mantém o índice começando em 0
      }
    },
    plugins: {
      legend: {
        labels: { color: '#FFFFFF' } // Cor do texto da legenda
      }
    },
    layout: {
      padding: 0
    }
  };

  return (
    <div id='planoFundo' style={{
      backgroundColor: '#282c34',
      padding: '0',
      width: '100%',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center'
    }} >
      <div style={{ width: '88%' }}>
        <h2 style={{ color: '#FFFFFF' }}>Evolução do Preço do BTC Diante do FGI nos Últimos 30 Dias</h2>
        <Line data={data} options={options} />
      </div>
    </div>
  );
};

export default ChartLineDouble;
