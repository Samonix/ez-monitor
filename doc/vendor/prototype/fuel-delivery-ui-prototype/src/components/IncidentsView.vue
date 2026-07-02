<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { ExternalLink, MapPinned, Search, ShieldAlert } from '@lucide/vue';
import { formatLiters, signedLiters } from '../domain/formatters';
import type { EvidenceRecord, IncidentItem, IncidentSeverity, PlatformEvent, Trip } from '../domain/types';
import StatusBadge from './StatusBadge.vue';

type IncidentStatusFilter = IncidentItem['status'] | 'all';
type IncidentSeverityFilter = IncidentSeverity | 'all';
type IncidentScopeFilter = 'all' | 'live' | 'closed_route';

interface IncidentRecord {
  id: string;
  incident: IncidentItem;
  trip: Trip;
  evidence: EvidenceRecord[];
  events: PlatformEvent[];
}

const props = defineProps<{
  trips: Trip[];
  events: PlatformEvent[];
  selectedId?: string;
}>();

const emit = defineEmits<{
  openTrip: [id: string];
  openMap: [id: string];
}>();

const search = ref('');
const severityFilter = ref<IncidentSeverityFilter>('all');
const statusFilter = ref<IncidentStatusFilter>('all');
const scopeFilter = ref<IncidentScopeFilter>('all');
const selectedIncidentId = ref('');

const incidentRecords = computed<IncidentRecord[]>(() => (
  props.trips
    .flatMap((trip) => trip.incidentsList.map((incident) => {
      const evidence = trip.evidence.filter((record) => incident.evidenceIds.includes(record.id));
      const events = props.events.filter((event) => (
        event.relatedIncidentId === incident.id || incident.eventIds.includes(event.id)
      ));

      return {
        id: incident.id,
        incident,
        trip,
        evidence,
        events,
      };
    }))
    .sort((left, right) => (
      severityWeight(right.incident.severity) - severityWeight(left.incident.severity)
        || statusWeight(right.incident.status) - statusWeight(left.incident.status)
        || right.events.length - left.events.length
    ))
));

const filteredIncidentRecords = computed(() => incidentRecords.value.filter((record) => {
  const query = search.value.trim().toLowerCase();
  const matchesQuery = !query || [
    record.trip.ttn,
    record.trip.truck,
    record.trip.depot,
    record.trip.station,
    record.trip.product,
    record.incident.title,
    record.incident.detail,
  ].join(' ').toLowerCase().includes(query);

  const matchesSeverity = severityFilter.value === 'all' || record.incident.severity === severityFilter.value;
  const matchesStatus = statusFilter.value === 'all' || record.incident.status === statusFilter.value;
  const matchesScope = scopeFilter.value === 'all'
    || (scopeFilter.value === 'live' && record.trip.status === 'in_transit')
    || (scopeFilter.value === 'closed_route' && record.trip.status !== 'in_transit');

  return matchesQuery && matchesSeverity && matchesStatus && matchesScope;
}));

const selectedRecord = computed(() => (
  filteredIncidentRecords.value.find((record) => record.id === selectedIncidentId.value)
    ?? filteredIncidentRecords.value[0]
    ?? null
));

const summary = computed(() => ({
  total: incidentRecords.value.length,
  high: incidentRecords.value.filter((record) => record.incident.severity === 'high').length,
  open: incidentRecords.value.filter((record) => record.incident.status === 'open').length,
  live: incidentRecords.value.filter((record) => record.trip.status === 'in_transit').length,
}));

const selectedRouteContext = computed(() => {
  const record = selectedRecord.value;
  if (!record) return [];

  return [
    { label: 'TTN', value: record.trip.ttn },
    { label: 'Бензовоз', value: record.trip.truck },
    { label: 'Продукт', value: record.trip.product },
    { label: 'Маршрут', value: `${record.trip.depot} → ${record.trip.station}` },
  ];
});

watch(
  incidentRecords,
  (records) => {
    if (selectedIncidentId.value) return;

    const preferred = records.find((record) => record.trip.id === props.selectedId);
    selectedIncidentId.value = preferred?.id ?? records[0]?.id ?? '';
  },
  { immediate: true },
);

watch(
  filteredIncidentRecords,
  (records) => {
    if (!records.length) {
      selectedIncidentId.value = '';
      return;
    }

    if (!records.some((record) => record.id === selectedIncidentId.value)) {
      selectedIncidentId.value = records[0].id;
    }
  },
);

function severityWeight(severity: IncidentSeverity) {
  return {
    high: 3,
    medium: 2,
    low: 1,
  }[severity];
}

function statusWeight(status: IncidentItem['status']) {
  return {
    open: 3,
    review: 2,
    closed: 1,
  }[status];
}

function severityLabel(severity: IncidentSeverity) {
  return {
    high: 'Високий',
    medium: 'Середній',
    low: 'Низький',
  }[severity];
}

function statusLabel(status: IncidentItem['status']) {
  return {
    open: 'Відкритий',
    review: 'На перевірці',
    closed: 'Закритий',
  }[status];
}

function scopeLabel(trip: Trip) {
  return trip.status === 'in_transit' ? 'Live маршрут' : 'Післярейсовий аналіз';
}

function evidenceSummary(record: IncidentRecord) {
  const alarmCount = record.evidence.filter((item) => item.quality === 'alarm').length;
  const warningCount = record.evidence.filter((item) => item.quality === 'warning').length;

  if (alarmCount) return `${alarmCount} alarm evidence`;
  if (warningCount) return `${warningCount} warning evidence`;
  return `${record.evidence.length} evidence`;
}

function openTrip(record: IncidentRecord) {
  emit('openTrip', record.trip.id);
}

function openMap(record: IncidentRecord) {
  emit('openMap', record.trip.id);
}
</script>

<template>
  <section class="incidents-workspace" aria-label="Робочий простір інцидентів">
    <div class="panel incidents-hero">
      <div>
        <p class="eyebrow">Security review</p>
        <h2>Інциденти</h2>
        <p>
          Окремий workspace для підозр, alarm-подій і розслідувань. Дані зібрані з рейсів,
          evidence records і platform events, щоб оператор бачив не тільки факт інциденту,
          а й чому система його підняла.
        </p>
      </div>

      <div class="incidents-summary-grid" aria-label="Підсумок інцидентів">
        <article>
          <span>Усього</span>
          <strong>{{ summary.total }}</strong>
        </article>
        <article>
          <span>Високий ризик</span>
          <strong>{{ summary.high }}</strong>
        </article>
        <article>
          <span>Відкриті</span>
          <strong>{{ summary.open }}</strong>
        </article>
        <article>
          <span>Live рейси</span>
          <strong>{{ summary.live }}</strong>
        </article>
      </div>
    </div>

    <div class="incidents-layout">
      <section class="panel incidents-main" aria-label="Журнал інцидентів">
        <div class="incident-filters">
          <label class="search-box incident-search">
            <Search :size="16" aria-hidden="true" />
            <input v-model="search" type="search" placeholder="TTN, бензовоз, АЗС, опис інциденту">
          </label>

          <label>
            <span>Рівень</span>
            <select v-model="severityFilter">
              <option value="all">Усі рівні</option>
              <option value="high">Високий</option>
              <option value="medium">Середній</option>
              <option value="low">Низький</option>
            </select>
          </label>

          <label>
            <span>Статус</span>
            <select v-model="statusFilter">
              <option value="all">Усі статуси</option>
              <option value="open">Відкритий</option>
              <option value="review">На перевірці</option>
              <option value="closed">Закритий</option>
            </select>
          </label>

          <label>
            <span>Область</span>
            <select v-model="scopeFilter">
              <option value="all">Усі рейси</option>
              <option value="live">Тільки live</option>
              <option value="closed_route">Післярейсові</option>
            </select>
          </label>
        </div>

        <div class="incidents-list-header">
          <div>
            <h3>Журнал інцидентів</h3>
            <p>{{ filteredIncidentRecords.length }} із {{ incidentRecords.length }} записів</p>
          </div>
          <span class="report-count">{{ summary.high }} high</span>
        </div>

        <div v-if="filteredIncidentRecords.length" class="incident-board-list">
          <button
            v-for="record in filteredIncidentRecords"
            :key="record.id"
            class="incident-workspace-row"
            :class="{ active: selectedRecord?.id === record.id }"
            type="button"
            @click="selectedIncidentId = record.id"
          >
            <span class="incident-row-accent" :class="`tone-${record.incident.severity}`" aria-hidden="true"></span>
            <span class="incident-row-time">
              <strong>{{ record.events[0]?.time ?? record.trip.startedAt }}</strong>
              <small>{{ scopeLabel(record.trip) }}</small>
            </span>
            <span class="incident-row-main">
              <span class="incident-row-title">
                <strong>{{ record.incident.title }}</strong>
                <StatusBadge :tone="record.incident.severity" :label="severityLabel(record.incident.severity)" />
              </span>
              <span>{{ record.incident.detail }}</span>
              <small>{{ record.trip.ttn }} · {{ record.trip.truck }} · {{ evidenceSummary(record) }}</small>
            </span>
            <span class="incident-row-status" :class="`status-${record.incident.status}`">
              {{ statusLabel(record.incident.status) }}
            </span>
          </button>
        </div>

        <div v-else class="incident-empty-state">
          <ShieldAlert :size="20" aria-hidden="true" />
          <span>За цими фільтрами інцидентів немає.</span>
        </div>
      </section>

      <aside class="panel incident-detail-panel" aria-label="Деталі вибраного інциденту">
        <template v-if="selectedRecord">
          <div class="incident-detail-header">
            <div>
              <p class="eyebrow">{{ selectedRecord.trip.ttn }} · {{ selectedRecord.trip.truck }}</p>
              <h3>{{ selectedRecord.incident.title }}</h3>
              <p>{{ selectedRecord.incident.detail }}</p>
            </div>
            <div class="incident-detail-badges">
              <StatusBadge :tone="selectedRecord.incident.severity" :label="severityLabel(selectedRecord.incident.severity)" />
              <span class="incident-status-chip" :class="`status-${selectedRecord.incident.status}`">
                {{ statusLabel(selectedRecord.incident.status) }}
              </span>
            </div>
          </div>

          <div class="incident-meta-grid">
            <article v-for="item in selectedRouteContext" :key="item.label">
              <span>{{ item.label }}</span>
              <strong>{{ item.value }}</strong>
            </article>
            <article>
              <span>Розбіжність</span>
              <strong :class="selectedRecord.trip.discrepancy < -100 ? 'difference-negative' : 'difference-ok'">
                {{ signedLiters(selectedRecord.trip.discrepancy) }}
              </strong>
            </article>
            <article>
              <span>Поточний обсяг</span>
              <strong>{{ formatLiters(selectedRecord.trip.tankerLoaded + selectedRecord.trip.discrepancy) }}</strong>
            </article>
          </div>

          <div class="incident-actions">
            <button type="button" class="secondary-action" @click="openMap(selectedRecord)">
              <MapPinned :size="16" aria-hidden="true" />
              Показати на карті
            </button>
            <button type="button" class="secondary-action" @click="openTrip(selectedRecord)">
              <ExternalLink :size="16" aria-hidden="true" />
              Відкрити рейс
            </button>
          </div>

          <section class="incident-detail-section" aria-label="Evidence">
            <div class="incident-section-header">
              <h4>Evidence</h4>
              <span>{{ selectedRecord.evidence.length }} записів</span>
            </div>
            <div class="incident-evidence-list">
              <article v-for="record in selectedRecord.evidence" :key="record.id">
                <div>
                  <strong>{{ record.source }}</strong>
                  <span>{{ record.type }} · {{ record.mode }}</span>
                </div>
                <code>{{ record.timestamp }}</code>
                <strong>{{ record.value }}</strong>
                <span class="incident-quality-chip" :class="`quality-${record.quality}`">{{ record.quality }}</span>
              </article>
            </div>
          </section>

          <section class="incident-detail-section" aria-label="Пов'язані події">
            <div class="incident-section-header">
              <h4>Пов'язані події</h4>
              <span>{{ selectedRecord.events.length }} записів</span>
            </div>
            <div class="incident-event-list">
              <article v-for="event in selectedRecord.events" :key="event.id">
                <span class="incident-event-time">{{ event.time }}</span>
                <div>
                  <strong>{{ event.title }}</strong>
                  <p>{{ event.detail }}</p>
                  <small>{{ event.source }}</small>
                </div>
                <span class="incident-event-tone" :class="`event-${event.tone}`">{{ event.tone }}</span>
              </article>
            </div>
          </section>
        </template>

        <div v-else class="incident-empty-state">
          <ShieldAlert :size="20" aria-hidden="true" />
          <span>Оберіть інцидент у журналі.</span>
        </div>
      </aside>
    </div>
  </section>
</template>
