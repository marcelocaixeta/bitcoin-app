import axios from 'axios';
import { format, formatDuration, intervalToDuration, addDays} from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default async function getServiceFearAndGreed(limit) {

  const formatTimeUntilUpdate = (seconds) => {
    const duration = intervalToDuration({ start: 0, end: seconds * 1000 });
    return formatDuration(duration, {
        format: ['hours', 'minutes'],
        locale: ptBR
    });
  };

  try {
    const response = await axios.get('https://api.alternative.me/fng/?limit=' + limit); // Aguarda a resposta da API
    const sortedData = response.data.data.sort((a, b) => a.timestamp - b.timestamp);
    const resultArray = [
      sortedData.map(item => item.value),
      sortedData.map(item => {
        const newDate = addDays(new Date(item.timestamp * 1000), 1);
        return format(newDate, 'dd/MM');
      }),
      sortedData.map(item => item.value_classification),
      sortedData.map(item => item.time_until_update ? formatTimeUntilUpdate(item.time_until_update) : 'N/A')
    ];
    return resultArray;
  } catch (error) {
    console.error('Erro ao buscar os dados:', error);
    return [[], [], []];
  }
} 
