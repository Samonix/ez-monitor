<script setup lang="ts">
import { Download } from '@lucide/vue';
import { formatLiters, signedLiters } from '../domain/formatters';
import type { Trip } from '../domain/types';
import StatusBadge from './StatusBadge.vue';

defineProps<{
  trips: Trip[];
  selectedId: string;
}>();

defineEmits<{
  select: [id: string];
}>();
</script>

<template>
  <div class="panel trips-panel">
    <div class="panel-header">
      <div>
        <h2>Журнал рейсів</h2>
        <p>{{ trips.length }} записів</p>
      </div>
      <button class="icon-button" type="button" title="Експорт" aria-label="Експорт">
        <Download :size="18" :stroke-width="1.8" aria-hidden="true" />
      </button>
    </div>

    <div class="trip-list">
      <button
        v-for="trip in trips"
        :key="trip.id"
        class="trip-row"
        :class="{ active: trip.id === selectedId }"
        type="button"
        @click="$emit('select', trip.id)"
      >
        <div class="trip-row-top">
          <strong>{{ trip.ttn }}</strong>
          <StatusBadge :tone="trip.risk" :label="trip.riskLabel" />
        </div>
        <div class="trip-row-meta">
          <span>{{ trip.truck }}</span>
          <span>{{ trip.statusLabel }}</span>
        </div>
        <div class="trip-row-meta station-row">
          <span>{{ trip.depot }}</span>
          <span>{{ trip.station }}</span>
        </div>
        <div class="trip-row-meta volume-row">
          <span>{{ formatLiters(trip.plannedVolume) }}</span>
          <span>{{ signedLiters(trip.discrepancy) }}</span>
        </div>
      </button>

      <div v-if="!trips.length" class="empty-state">Немає завершених або післярейсових записів за вибраними фільтрами</div>
    </div>
  </div>
</template>
