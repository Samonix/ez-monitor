export type StationStatus = 'online' | 'attention' | 'offline';
export type RoleCode = 'owner' | 'admin' | 'manager' | 'operator' | 'service' | 'auditor' | 'card-manager';
export type PumpTransaction = { id: string; stationId: string; pump: number; nozzle: number; fuelGradeName?: string; volume: number; amount: number; dateTime: string; tag?: string };
export type TankSnapshot = { id: string; stationId: string; tank: number; fuelGradeName?: string; productVolume: number; fillingPercentage?: number; status: 'OK' | 'LowProduct' | 'HighWater' | 'TankLeakage' | 'Error' };
export type CardAccountType = 'Amount' | 'Volume';