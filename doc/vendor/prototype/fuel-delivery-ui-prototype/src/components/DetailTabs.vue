<script setup lang="ts">
import { computed } from 'vue';
import { formatLiters, signedLiters } from '../domain/formatters';
import { buildReconciliationRows } from '../domain/reconciliation';
import type { BadgeTone, TabId, Trip } from '../domain/types';
import StatusBadge from './StatusBadge.vue';

const props = defineProps<{
  trip: Trip;
  activeTab: TabId;
}>();

defineEmits<{
  changeTab: [tab: TabId];
}>();

const tabs: { id: TabId; label: string }[] = [
  { id: 'timeline', label: 'Хронологія' },
  { id: 'evidence', label: 'Докази' },
  { id: 'reconciliation', label: 'Звірка' },
  { id: 'incidents', label: 'Інциденти' },
];

const qualityLabels: Record<string, string> = {
  confirmed: 'підтверджено',
  warning: 'увага',
  alarm: 'тривога',
  high: 'високий',
  medium: 'середній',
  low: 'низький',
};

const reconciliationRows = computed(() => buildReconciliationRows(props.trip));

function labelFor(tone: BadgeTone): string {
  return qualityLabels[tone] ?? tone;
}
</script>

<template>
  <section class="detail-tabs" aria-label="Деталі рейсу">
    <div class="tab-buttons" role="tablist">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        class="tab-button"
        :class="{ active: activeTab === tab.id }"
        type="button"
        @click="$emit('changeTab', tab.id)"
      >
        {{ tab.label }}
      </button>
    </div>

    <div v-if="activeTab === 'timeline'" class="panel tab-panel active">
      <div class="timeline">
        <div v-for="event in trip.timeline" :key="`${event.time}-${event.title}`" class="timeline-item">
          <div class="timeline-time">{{ event.time }}</div>
          <article class="timeline-card" :class="event.type">
            <h3>{{ event.title }}</h3>
            <p>{{ event.text }}</p>
          </article>
        </div>
      </div>
    </div>

    <div v-if="activeTab === 'evidence'" class="panel tab-panel active">
      <div class="detail-list evidence-list">
        <article v-for="item in trip.evidence" :key="`${item.source}-${item.value}`" class="detail-row evidence-row">
          <div class="detail-row-main">
            <h3>{{ item.source }}</h3>
            <span class="source-mode">{{ item.mode === 'manual' ? 'ручне джерело' : 'автоматичне джерело' }}</span>
          </div>
          <strong>{{ item.value }}</strong>
          <StatusBadge :tone="item.quality" :label="labelFor(item.quality)" />
        </article>
      </div>
    </div>

    <div v-if="activeTab === 'reconciliation'" class="panel tab-panel active">
      <div class="detail-list reconciliation-list">
        <div v-for="row in reconciliationRows" :key="row.label" class="detail-row reconciliation-row">
          <span class="row-label">{{ row.label }}</span>
          <strong>{{ formatLiters(row.value) }}</strong>
          <span class="row-diff" :class="row.diff !== null && row.diff < -100 ? 'difference-negative' : 'difference-ok'">
            {{ signedLiters(row.diff) }}
          </span>
        </div>
      </div>
    </div>

    <div v-if="activeTab === 'incidents'" class="panel tab-panel active">
      <div v-if="trip.incidentsList.length" class="detail-list incident-list">
        <article v-for="incident in trip.incidentsList" :key="incident.title" class="detail-row incident-row">
          <div class="detail-row-main">
            <h3>{{ incident.title }}</h3>
            <p>{{ incident.detail }}</p>
          </div>
          <StatusBadge :tone="incident.severity" :label="labelFor(incident.severity)" />
        </article>
      </div>
      <div v-else class="detail-row empty-detail-row">
        Активних інцидентів немає. Рейс можна закривати після фінального підтвердження.
      </div>
    </div>
  </section>
</template>
