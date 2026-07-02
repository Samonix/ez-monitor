<script setup lang="ts">
import { computed } from 'vue';
import { Download, FileCheck2, FileWarning, ShieldCheck } from '@lucide/vue';
import { formatLiters, signedLiters } from '../domain/formatters';
import type { EvidenceQuality, Trip } from '../domain/types';
import StatusBadge from './StatusBadge.vue';

const props = defineProps<{
  trip: Trip;
}>();

const loadingEvidence = computed(() => props.trip.evidence.filter((record) => (
  record.type === 'manual_depot_volume'
  || record.type === 'pts_depot_volume'
  || record.type === 'tanker_level'
)));

const deliveryEvidence = computed(() => props.trip.evidence.filter((record) => (
  record.type === 'atg_station_volume'
  || record.type === 'manual_station_volume'
)));

const riskEvidence = computed(() => props.trip.evidence.filter((record) => (
  record.type === 'gps_point'
  || record.type === 'hatch_event'
  || record.type === 'connectivity_outage'
  || record.type === 'route_stop'
)));

const reportVerdict = computed(() => {
  if (props.trip.risk === 'high' || props.trip.reconciliation.status === 'investigation') {
    return {
      tone: 'alarm' as EvidenceQuality,
      title: 'Потрібне розслідування',
      text: 'Чернетка фіксує значну розбіжність і пов’язані evidence records. Закривати рейс без review не можна.',
    };
  }

  if (props.trip.reconciliation.status === 'within_tolerance' || props.trip.status === 'reconciled') {
    return {
      tone: 'confirmed' as EvidenceQuality,
      title: 'У межах tolerance',
      text: 'Чернетка показує узгоджений рейс. Юридичне затвердження все одно виконується окремо.',
    };
  }

  return {
    tone: 'warning' as EvidenceQuality,
    title: 'Потребує перевірки',
    text: 'Дані достатні для попереднього висновку, але є відкриті питання до evidence або оператора.',
  };
});
</script>

<template>
  <section class="reports-workspace" aria-label="Чернетка фінального звіту">
    <div class="reports-hero panel">
      <div>
        <p class="eyebrow">Final delivery report draft</p>
        <h2>Чернетка звіту по рейсу</h2>
        <p>
          Попередній audit-friendly звіт по вибраному рейсу. Це не юридично фінальний документ:
          дані призначені для review, звірки evidence та підготовки висновку.
        </p>
      </div>

      <div class="report-actions">
        <button class="secondary-action" type="button">
          <Download :size="16" :stroke-width="1.8" aria-hidden="true" />
          Export draft
        </button>
        <button class="primary-action" type="button">
          <FileCheck2 :size="16" :stroke-width="1.8" aria-hidden="true" />
          Підготувати акт
        </button>
      </div>
    </div>

    <section class="panel report-case-card">
      <div class="report-case-header">
        <div>
          <p class="eyebrow">Selected delivery trip</p>
          <h2>{{ trip.ttn }} · {{ trip.product }}</h2>
          <p>{{ trip.depot }} → {{ trip.station }}</p>
        </div>
        <div class="report-case-badges">
          <StatusBadge :tone="trip.risk" :label="trip.riskLabel" />
          <StatusBadge :tone="trip.risk" :label="trip.statusLabel" />
        </div>
      </div>

      <div class="report-summary-grid">
        <article>
          <span>Бензовоз</span>
          <strong class="code-value">{{ trip.truck }}</strong>
        </article>
        <article>
          <span>Водій</span>
          <strong>{{ trip.driver }}</strong>
        </article>
        <article>
          <span>Старт / ETA</span>
          <strong class="code-value">{{ trip.startedAt }} / {{ trip.eta }}</strong>
        </article>
        <article>
          <span>Confidence</span>
          <strong class="code-value">{{ trip.confidence }}%</strong>
        </article>
        <article>
          <span>Плановий обсяг</span>
          <strong class="code-value">{{ formatLiters(trip.plannedVolume) }}</strong>
        </article>
        <article>
          <span>Фінальна розбіжність</span>
          <strong class="code-value" :class="trip.discrepancy < -100 ? 'difference-negative' : 'difference-ok'">
            {{ signedLiters(trip.discrepancy) }}
          </strong>
        </article>
      </div>
    </section>

    <div class="report-layout">
      <section class="panel report-main-card">
        <div class="report-section-header">
          <div>
            <p class="eyebrow">Reconciliation</p>
            <h2>Звірка обсягів</h2>
          </div>
          <StatusBadge :tone="reportVerdict.tone" :label="reportVerdict.title" />
        </div>

        <div class="report-reconciliation-table">
          <div v-for="row in trip.reconciliation.rows" :key="row.label" class="report-table-row">
            <span>{{ row.label }}</span>
            <strong>{{ formatLiters(row.value) }}</strong>
            <em :class="row.diff !== null && row.diff < -100 ? 'difference-negative' : 'difference-ok'">
              {{ signedLiters(row.diff) }}
            </em>
          </div>
        </div>

        <div class="report-verdict">
          <FileWarning :size="18" :stroke-width="1.8" aria-hidden="true" />
          <div>
            <strong>{{ reportVerdict.title }}</strong>
            <p>{{ reportVerdict.text }}</p>
            <small>{{ trip.reconciliation.summary }}</small>
          </div>
        </div>
      </section>

      <aside class="panel report-side-card">
        <div class="report-section-header compact">
          <div>
            <p class="eyebrow">Audit package</p>
            <h2>Пакет доказів</h2>
          </div>
          <span class="report-count">{{ trip.evidence.length }} records</span>
        </div>

        <div class="report-audit-list">
          <article>
            <span>Loading evidence</span>
            <strong>{{ loadingEvidence.length }}</strong>
          </article>
          <article>
            <span>Risk / route evidence</span>
            <strong>{{ riskEvidence.length }}</strong>
          </article>
          <article>
            <span>Delivery evidence</span>
            <strong>{{ deliveryEvidence.length }}</strong>
          </article>
          <article>
            <span>Incidents</span>
            <strong>{{ trip.incidentsList.length }}</strong>
          </article>
        </div>
      </aside>
    </div>

    <div class="report-layout">
      <section class="panel report-main-card">
        <div class="report-section-header">
          <div>
            <p class="eyebrow">Evidence chain</p>
            <h2>Джерела даних</h2>
          </div>
        </div>

        <div class="report-evidence-list">
          <article v-for="record in trip.evidence" :key="record.id" class="report-evidence-row">
            <div>
              <strong>{{ record.source }}</strong>
              <span>{{ record.timestamp }} · {{ record.mode === 'manual' ? 'manual' : 'automatic' }} · {{ record.type }}</span>
            </div>
            <code>{{ record.value }}</code>
            <StatusBadge :tone="record.quality" :label="record.quality" />
          </article>
        </div>
      </section>

      <aside class="panel report-side-card">
        <div class="report-section-header compact">
          <div>
            <p class="eyebrow">Incidents</p>
            <h2>Відкриті питання</h2>
          </div>
        </div>

        <div v-if="trip.incidentsList.length" class="report-incident-list">
          <article v-for="incident in trip.incidentsList" :key="incident.id" class="report-incident-row">
            <div>
              <strong>{{ incident.title }}</strong>
              <p>{{ incident.detail }}</p>
              <small>{{ incident.evidenceIds.length }} evidence · {{ incident.status }}</small>
            </div>
            <StatusBadge :tone="incident.severity" :label="incident.severity" />
          </article>
        </div>

        <div v-else class="report-empty-box">
          <ShieldCheck :size="18" :stroke-width="1.8" aria-hidden="true" />
          <span>Активних інцидентів у цьому рейсі немає.</span>
        </div>
      </aside>
    </div>
  </section>
</template>
