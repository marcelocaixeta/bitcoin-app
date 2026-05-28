import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import HighchartsMore from 'highcharts/highcharts-more';
import getFearAndGreedService from '../services/fearGreedService';

const translateClassification = (classification) => {
  const translations = {
    'Extreme Fear': 'Comprar muito',
    Fear: 'Comprar um pouco',
    Neutral: 'Juntar Dolares',
    Greed: 'Vender um pouco',
    'Extreme Greed': 'Vender muito',
  };

  return translations[classification] || classification;
};

const classifyByValue = (value) => {
  if (value >= 0 && value <= 24) {
    return 'Comprar muito';
  } else if (value >= 25 && value <= 44) {
    return 'Comprar um pouco';
  } else if (value >= 45 && value <= 54) {
    return 'Juntar Dolares';
  } else if (value >= 55 && value <= 74) {
    return 'Vender um pouco';
  } else if (value >= 75 && value <= 100) {
    return 'Vender muito';
  } else {
    return 'Valor fora do intervalo';
  }
};

const val = await getFearAndGreedService(1);
const ontem = await getFearAndGreedService(2);
const semana = await getFearAndGreedService(7);
const mes = await getFearAndGreedService(30);
const valor = parseInt(val[0][0], 10);
const classificacao = translateClassification(val[2][0]);

HighchartsMore(Highcharts);

const options = {
  chart: {
    type: 'gauge',
    backgroundColor: '#282c34',
    plotBackgroundColor: null,
    plotBackgroundImage: null,
    plotBorderWidth: 0,
    plotShadow: false,
    height: '80%',
  },
  title: {
    text: 'Indicador de Compra e Venda de Bitcoin',
    style: { color: '#FFFFFF' },
  },
  pane: {
    startAngle: -90,
    endAngle: 89.9,
    background: null,
    center: ['50%', '75%'],
    size: '110%',
  },
  yAxis: {
    min: 0,
    max: 100,
    tickPixelInterval: 72,
    tickPosition: 'inside',
    tickColor: '#282c34',
    tickLength: 20,
    tickWidth: 2,
    minorTickInterval: null,
    labels: {
      distance: 20,
      style: {
        fontSize: '14px',
        color: '#FFFFFF',
      },
    },
    lineWidth: 0,
    plotBands: [
      { from: 0, to: 25, color: 'green', thickness: 20 },
      { from: 25, to: 44.99, color: '#55BF3B', thickness: 20 },
      { from: 45, to: 54.99, color: '#DDDF0D', thickness: 20 },
      { from: 55, to: 74.99, color: '#DF5353', thickness: 20 },
      { from: 75, to: 100, color: 'red', thickness: 20 },
    ],
  },
  series: [
    {
      name: 'Classificacao',
      data: [valor],
      tooltip: {
        valueSuffix: ' ' + classificacao,
        backgroundColor: '#333333',
        style: { color: '#FFFFFF' },
      },
      dataLabels: {
        format: '{y} ' + classificacao,
        borderWidth: 0,
        color: '#FFFFFF',
        style: { fontSize: '16px' },
      },
      dial: {
        radius: '80%',
        backgroundColor: '#CCCCCC',
        baseWidth: 12,
        baseLength: '0%',
        rearLength: '0%',
      },
      pivot: {
        backgroundColor: '#FFFFFF',
        radius: 6,
      },
    },
  ],
};

const FearGreedGauge = () => {
  function getColorForValue(value) {
    const band = options.yAxis.plotBands.find((item) => value >= item.from && value <= item.to);
    return band ? band.color : null;
  }

  const valuesSemana = semana[0];
  const valuesMes = mes[0];
  const averageSemana = Math.round(
    valuesSemana.map(Number).reduce((acc, current) => acc + current, 0) / valuesSemana.length
  );
  const averageMes = Math.round(
    valuesMes.map(Number).reduce((acc, current) => acc + current, 0) / valuesMes.length
  );

  const rangeSemana = classifyByValue(averageSemana);
  const rangeMes = classifyByValue(averageMes);

  const data = [
    {
      phase: 'Ontem',
      range: translateClassification(ontem[2][0]),
      color: getColorForValue(ontem[0][0]),
      value: ontem[0][0],
    },
    { phase: '7 Dias', range: rangeSemana, color: getColorForValue(averageSemana), value: averageSemana },
    { phase: '30 Dias', range: rangeMes, color: getColorForValue(averageMes), value: averageMes },
  ];

  return (
    <div>
      <HighchartsReact highcharts={Highcharts} options={options} />
      <div style={{ marginTop: '1%' }}>
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            color: '#FFFFFF',
            backgroundColor: '#282c34',
          }}
        >
          <thead>
            <tr />
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr key={index}>
                <td style={{ border: '1px solid #FFFFFF', padding: '8px' }}>{item.phase}</td>
                <td style={{ border: '1px solid #FFFFFF', padding: '8px' }}>{item.range}</td>
                <td style={{ border: '1px solid #FFFFFF', padding: '8px', backgroundColor: item.color }}>
                  {item.value}
                </td>
              </tr>
            ))}
            <tr>
              <td style={{ border: '1px solid #FFFFFF', padding: '8px' }} colSpan={3}>
                Atualiza em {val[3]}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FearGreedGauge;
