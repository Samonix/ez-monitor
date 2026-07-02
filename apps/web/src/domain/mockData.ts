export const stations = [
  { id: 'station-4', name: 'АЗС №4', city: 'Київ', status: 'online', revenue: 4810.42, volume: 84.2, alerts: 2 },
  { id: 'station-1', name: 'АЗС №1', city: 'Бориспіль', status: 'online', revenue: 2580.9, volume: 44.1, alerts: 0 },
  { id: 'station-7', name: 'АЗС №7', city: 'Житомир', status: 'attention', revenue: 0, volume: 0, alerts: 5 },
];
export const pumps = [
  { id: 1, stationId: 'station-4', status: 'idle', nozzle: 0, fuel: 'Diesel', tag: '', amount: 0 },
  { id: 2, stationId: 'station-4', status: 'idle', nozzle: 0, fuel: 'A-95', tag: '', amount: 0 },
  { id: 3, stationId: 'station-4', status: 'filling', nozzle: 1, fuel: 'A-95', tag: '1234567890ABCDEF', amount: 698.12 },
  { id: 4, stationId: 'station-4', status: 'offline', nozzle: 0, fuel: 'LPG', tag: '', amount: 0 },
];
export const tanks = [
  { id: 'tank-1', stationId: 'station-4', tank: 1, fuel: 'Diesel', volume: 11250, percent: 68, status: 'OK' },
  { id: 'tank-2', stationId: 'station-4', tank: 2, fuel: 'A-95', volume: 6420, percent: 41, status: 'LowProduct' },
  { id: 'tank-3', stationId: 'station-4', tank: 3, fuel: 'LPG', volume: 2870, percent: 29, status: 'HighWater' },
];
export const transactions = [
  { id: 'trn-1001', stationId: 'station-4', time: '09:15', pump: 1, fuel: 'Diesel', volume: 52.4, amount: 2950.12, tag: '1234567890ABCDEF' },
  { id: 'trn-1002', stationId: 'station-4', time: '10:05', pump: 3, fuel: 'A-95', volume: 31.8, amount: 1860.3, tag: '' },
  { id: 'trn-1003', stationId: 'station-1', time: '10:35', pump: 2, fuel: 'A-95', volume: 44.1, amount: 2580.9, tag: '1122334455667788' },
];
export const cards = [
  { id: 'card-1', tag: '1234567890ABCDEF', owner: 'ТОВ Логістика Плюс', vehicle: 'AA1234OE', type: 'Amount', balance: 18500, status: 'active' },
  { id: 'card-2', tag: '1122334455667788', owner: 'Парк Сервіс', vehicle: 'AA5677KK', type: 'Volume', balance: 320, status: 'active' },
  { id: 'card-3', tag: '0400527EC4', owner: 'Сервісна картка', vehicle: '-', type: 'Amount', balance: 0, status: 'blocked' },
];
export const alerts = [
  { id: 'alert-1', stationId: 'station-4', severity: 'warning', title: 'Низький рівень A-95', text: 'Резервуар 2 нижче робочого порогу.', time: '10:30' },
  { id: 'alert-2', stationId: 'station-7', severity: 'critical', title: 'Немає UploadStatus', text: 'Контролер PTS-2 не надсилає статус понад 5 хвилин.', time: '10:33' },
];