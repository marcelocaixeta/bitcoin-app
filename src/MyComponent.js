import React, { useState, useEffect } from 'react';
import axios from 'axios';

import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';
import PointerChart from './PointerChart';
import getBitcoinPriceData from './ServiceBitcoinPrice'; 

const precoBtcHoje = await getBitcoinPriceData(1);

ChartJS.register(ArcElement, Tooltip, Legend);

const MyComponent = () => {
    const [data, setData] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get('https://api.alternative.me/fng/?limit=1');
                setData(response.data.data);
            } catch (error) {
                console.error('Error fetching the data:', error);
            }
        };

        fetchData();
    }, []);

    const doughnutData = {
        labels: ['Medo Extremo', 'Medo', 'Ganância', 'Ganância Extrema'],
        datasets: [{
            label: 'My First Dataset',
            data: [25, 25, 25, 25],
            backgroundColor: [
                '#9e0000',
                '#ff8080',
                '#42ff82',
                '#004718'
            ],
            hoverOffset: 4
        }]
    };
console.log(precoBtcHoje);
    const formattedNumber = precoBtcHoje[1].toFixed(2).toLocaleString('en-US', { style: 'currency', currency: 'USD' });
    return (
        <div className="App">
            <h3>BTC: $ {formattedNumber}</h3>
            <div id='planoFundo' style={{
              backgroundColor: '#282c34', 
              padding: '0', 
              width: '100%',
              display: 'flex', 
              justifyContent: 'center', /* Centraliza horizontalmente */
              alignItems: 'center' /* Centraliza verticalmente */
            }} >
            <div>
              <PointerChart />
            </div>
            </div>
            {data ? (''
        
            ) : (
                <p>Carregando...</p>
            )}
              
        </div>
        
    );
};

export default MyComponent;
