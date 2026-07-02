<script setup lang="ts">
import { formatLiters } from '../domain/formatters';
import type { Trip } from '../domain/types';
import StatusBadge from './StatusBadge.vue';

defineProps<{
  trip: Trip;
}>();
</script>

<template>
  <section class="panel trip-summary">
    <div class="summary-title">
      <div>
        <h2>{{ trip.ttn }} · {{ trip.product }}</h2>
        <p>{{ trip.depot }} → {{ trip.station }}</p>
      </div>
      <StatusBadge :tone="trip.risk" :label="trip.statusLabel" />
    </div>

    <div class="summary-grid">
      <div class="summary-item">
        <span>Бензовоз</span>
        <strong class="summary-value code-value">{{ trip.truck }}</strong>
      </div>
      <div class="summary-item">
        <span>Водій</span>
        <strong class="summary-value">{{ trip.driver }}</strong>
      </div>
      <div class="summary-item">
        <span>Старт / ETA</span>
        <strong class="summary-value compact-value">{{ trip.startedAt }} / {{ trip.eta }}</strong>
      </div>
      <div class="summary-item">
        <span>Confidence</span>
        <strong class="summary-value compact-value">{{ trip.confidence }}%</strong>
      </div>
      <div class="summary-item">
        <span>Розбіжність</span>
        <strong
          class="summary-value compact-value"
          :class="trip.discrepancy < -100 ? 'difference-negative' : 'difference-ok'"
        >
          {{ formatLiters(trip.discrepancy) }}
        </strong>
      </div>
    </div>
  </section>
</template>
