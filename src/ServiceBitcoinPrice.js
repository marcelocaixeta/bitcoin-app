import axios from 'axios';

export default async function getBitcoinPriceData(days) {
  const response = await axios.get(`https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=${days}`);
  
  // Extrair os preços de fechamento do último valor de cada dia
  const dailyPrices = response.data.prices.reduce((acc, price) => {
    const date = new Date(price[0]).toLocaleDateString();
    const lastPrice = acc.find(item => item.date === date);
    if (!lastPrice) {
      acc.push({ date, price: price[1] });
    } else {
      lastPrice.price = price[1];
    }
    return acc;
  }, []);

  // Retornar apenas os preços
  return dailyPrices.map(item => item.price);
}
