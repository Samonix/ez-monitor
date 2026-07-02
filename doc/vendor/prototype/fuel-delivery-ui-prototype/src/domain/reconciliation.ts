import type { ReconciliationRow, Trip } from './types';

export function buildReconciliationRows(trip: Trip): ReconciliationRow[] {
  if (trip.reconciliation?.rows.length) {
    return trip.reconciliation.rows;
  }

  return [
    { label: 'НБ manual', value: trip.depotManual, diff: 0 },
    { label: 'НБ PTS', value: trip.depotPts, diff: trip.depotPts - trip.depotManual },
    { label: 'Бензовоз loaded', value: trip.tankerLoaded, diff: trip.tankerLoaded - trip.depotManual },
    {
      label: 'АЗС ATG',
      value: trip.stationAtg || null,
      diff: trip.stationAtg ? trip.stationAtg - trip.depotManual : null,
    },
    {
      label: 'АЗС manual',
      value: trip.stationManual || null,
      diff: trip.stationManual ? trip.stationManual - trip.depotManual : null,
    },
  ];
}
