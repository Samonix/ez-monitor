import { Injectable } from '@nestjs/common';
import { calculateRevenueSummary } from '@ez-monitor/domain';

const transactions = [
  { id: 'trn-1001', stationId: 'station-4', pump: 1, nozzle: 2, fuelGradeName: 'Diesel', volume: 52.4, amount: 2950.12, dateTime: '2026-07-02T09:15:00Z', tag: '1234567890ABCDEF' },
  { id: 'trn-1002', stationId: 'station-4', pump: 3, nozzle: 1, fuelGradeName: 'A-95', volume: 31.8, amount: 1860.3, dateTime: '2026-07-02T10:05:00Z', tag: '' },
  { id: 'trn-1003', stationId: 'station-1', pump: 2, nozzle: 1, fuelGradeName: 'A-95', volume: 44.1, amount: 2580.9, dateTime: '2026-07-02T10:35:00Z', tag: '1122334455667788' }
];

@Injectable()
export class PublicApiService {
  listStations() {
    return [
      { id: 'station-4', name: 'АЗС №4', city: 'Київ', status: 'online', controllersOnline: 1, alerts: 2 },
      { id: 'station-1', name: 'АЗС №1', city: 'Бориспіль', status: 'online', controllersOnline: 1, alerts: 0 },
      { id: 'station-7', name: 'АЗС №7', city: 'Житомир', status: 'attention', controllersOnline: 0, alerts: 5 }
    ];
  }

  stationSummary(id: string) {
    const scoped = transactions.filter((item) => item.stationId === id);
    return {
      station: this.listStations().find((station) => station.id === id),
      revenue: calculateRevenueSummary(scoped),
      tanks: this.stationTanks(id),
      latestTransactions: scoped
    };
  }

  stationTransactions(id: string) {
    return transactions.filter((item) => item.stationId === id);
  }

  stationTanks(id: string) {
    return [
      { id: `${id}-tank-1`, tank: 1, fuelGradeName: 'Diesel', productVolume: 11250, fillingPercentage: 68, status: 'OK' },
      { id: `${id}-tank-2`, tank: 2, fuelGradeName: 'A-95', productVolume: 6420, fillingPercentage: 41, status: 'LowProduct' }
    ];
  }

  alerts() {
    return [
      { id: 'alert-1', stationId: 'station-4', severity: 'warning', message: 'Низький рівень A-95 у резервуарі 2', dateTime: '2026-07-02T10:30:00Z' },
      { id: 'alert-2', stationId: 'station-7', severity: 'critical', message: 'Контролер PTS-2 не надсилає UploadStatus', dateTime: '2026-07-02T10:33:00Z' }
    ];
  }

  cards() {
    return [
      { id: 'card-1', tag: '1234567890ABCDEF', ownerName: 'ТОВ Логістика Плюс', vehicleNumber: 'AA1234OE', status: 'active', accountType: 'Amount', balance: 18500 },
      { id: 'card-2', tag: '1122334455667788', ownerName: 'Парк Сервіс', vehicleNumber: 'AA5677KK', status: 'active', accountType: 'Volume', balance: 320 }
    ];
  }

  revenue(stationId?: string, period = 'current_month') {
    const scoped = stationId ? transactions.filter((item) => item.stationId === stationId) : transactions;
    return { period, stationId: stationId ?? 'all', ...calculateRevenueSummary(scoped) };
  }
}