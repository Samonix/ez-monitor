export type TripStatus = 'in_transit' | 'investigation' | 'reconciled';
export type RiskLevel = 'high' | 'medium' | 'low';
export type EvidenceQuality = 'confirmed' | 'warning' | 'alarm';
export type IncidentSeverity = 'high' | 'medium' | 'low';
export type TabId = 'timeline' | 'evidence' | 'reconciliation' | 'incidents';
export type DashboardSection = 'trips' | 'map' | 'events' | 'incidents' | 'reports' | 'settings';
export type BadgeTone = RiskLevel | EvidenceQuality | IncidentSeverity;
export type PlatformEventTone = 'alarm' | 'warning' | 'info' | 'success';
export type EvidenceMode = 'manual' | 'automatic';
export type EvidenceRecordType =
  | 'manual_depot_volume'
  | 'pts_depot_volume'
  | 'tanker_level'
  | 'gps_point'
  | 'hatch_event'
  | 'atg_station_volume'
  | 'manual_station_volume'
  | 'connectivity_outage'
  | 'route_stop';
export type PlatformEventCategory = 'pts' | 'gps' | 'hatch' | 'atg' | 'manual' | 'reconciliation' | 'platform';
export type ReconciliationStatus = 'pending' | 'within_tolerance' | 'needs_review' | 'investigation';

export interface TripFilters {
  search: string;
  status: TripStatus | 'all';
  risk: RiskLevel | 'all';
  onlyIncidents: boolean;
}

export interface MetricCard {
  label: string;
  value: string | number;
}

export interface PlatformEvent {
  id: string;
  tripId?: string;
  category: PlatformEventCategory;
  time: string;
  title: string;
  detail: string;
  source: string;
  tone: PlatformEventTone;
  relatedEvidenceId?: string;
  relatedIncidentId?: string;
}

export interface RoutePoint {
  type: string;
  label: string;
  lat: number;
  lng: number;
  x: number;
  y: number;
  time: string;
  note: string;
}

export interface Compartment {
  id: number;
  product: string;
  loaded: number;
  current: number;
  delta: number;
  alarm: boolean;
}

export interface TimelineEvent {
  time: string;
  type: 'loading' | 'movement' | 'risk' | 'alarm' | 'outage' | 'delivery';
  title: string;
  text: string;
}

export interface EvidenceRecord {
  id: string;
  tripId: string;
  type: EvidenceRecordType;
  source: string;
  mode: EvidenceMode;
  timestamp: string;
  value: string;
  numericValue?: number;
  unit?: 'l' | 'points' | 'events' | 'minutes';
  quality: EvidenceQuality;
  note?: string;
}

export interface IncidentItem {
  id: string;
  tripId: string;
  severity: IncidentSeverity;
  title: string;
  detail: string;
  evidenceIds: string[];
  eventIds: string[];
  status: 'open' | 'review' | 'closed';
}

export interface ReconciliationResult {
  id: string;
  tripId: string;
  status: ReconciliationStatus;
  baselineEvidenceId: string;
  rows: ReconciliationRow[];
  finalDiscrepancy: number;
  summary: string;
}

export interface Trip {
  id: string;
  ttn: string;
  truck: string;
  driver: string;
  depot: string;
  station: string;
  product: string;
  status: TripStatus;
  statusLabel: string;
  risk: RiskLevel;
  riskLabel: string;
  startedAt: string;
  eta: string;
  plannedVolume: number;
  depotManual: number;
  depotPts: number;
  tankerLoaded: number;
  stationAtg: number;
  stationManual: number;
  discrepancy: number;
  confidence: number;
  incidents: number;
  outages: number;
  route: RoutePoint[];
  compartments: Compartment[];
  timeline: TimelineEvent[];
  evidence: EvidenceRecord[];
  incidentsList: IncidentItem[];
  reconciliation: ReconciliationResult;
  audit: string[];
}

export interface ReconciliationRow {
  label: string;
  value: number | null;
  diff: number | null;
}
