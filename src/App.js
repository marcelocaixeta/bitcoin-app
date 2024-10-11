import './App.css';
import ChartLine from './FearAndGreedChartLine';
import MyComponent from './MyComponent';

const App = () => {
  return (
    <div className="App">
      
      <header className="App-header">
        <h1><MyComponent /></h1>
      </header>

      <div class="chart-container">
        <ChartLine />
      </div>


    </div>

  );
};

export default App;
