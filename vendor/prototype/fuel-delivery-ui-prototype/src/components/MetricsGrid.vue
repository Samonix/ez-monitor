<script setup lang="ts">
import type { MetricCard } from '../domain/types';

defineProps<{
  metrics: MetricCard[];
}>();
</script>

<template>
  <section class="metrics-grid" aria-label="Операційні показники">
    <article v-for="metric in metrics" :key="metric.label" class="metric-card">
      <span>{{ metric.label }}</span>
      <strong>{{ metric.value }}</strong>
    </article>
  </section>
</template>
