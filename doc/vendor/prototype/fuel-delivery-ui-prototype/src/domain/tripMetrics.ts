import { formatLiters } from './formatters';
import type { MetricCard, Trip } from './types';

export function buildMetrics(trips: Trip[]): MetricCard[] {
  const totalVolume = trips.reduce((sum, trip) => sum + trip.plannedVolume, 0);
  const totalDiscrepancy = trips.reduce((sum, trip) => sum + Math.abs(trip.discrepancy), 0);
  const incidentCount = trips.reduce((sum, trip) => sum + trip.incidents, 0);
  const highRiskTrips = trips.filter((trip) => trip.risk === 'high').length;

  return [
    { label: 'Записів у журналі', value: trips.length },
    { label: 'Плановий обсяг', value: formatLiters(totalVolume) },
    { label: 'Сумарна нестача', value: formatLiters(totalDiscrepancy) },
    { label: 'Інциденти / high risk', value: `${incidentCount} / ${highRiskTrips}` },
  ];
}
