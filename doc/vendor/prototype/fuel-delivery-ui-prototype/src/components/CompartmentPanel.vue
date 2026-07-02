<script setup lang="ts">
import { computed } from 'vue';
import { formatLiters } from '../domain/formatters';
import type { Compartment } from '../domain/types';
import StatusBadge from './StatusBadge.vue';

const props = defineProps<{
  compartments: Compartment[];
}>();

const alarmCount = computed(() => props.compartments.filter((item) => item.alarm).length);

function fillPercent(item: Compartment): number {
  return Math.max(4, Math.min(100, Math.round((item.current / item.loaded) * 100)));
}
</script>

<template>
  <section class="panel tanker-panel">
    <div class="panel-header compact">
      <h2>Секції бензовоза</h2>
      <span>{{ alarmCount ? `${alarmCount} alarm` : 'OK' }}</span>
    </div>

    <div>
      <article v-for="item in compartments" :key="item.id" class="compartment">
        <div class="compartment-top">
          <strong>Секція {{ item.id }}</strong>
          <StatusBadge :tone="item.alarm ? 'high' : 'low'" :label="item.product" />
        </div>
        <div class="tank-shell">
          <div
            class="tank-fill"
            :class="{ alarm: item.alarm }"
            :style="{ width: `${fillPercent(item)}%` }"
          ></div>
        </div>
        <div class="compartment-numbers">
          <span>{{ formatLiters(item.current) }} / {{ formatLiters(item.loaded) }}</span>
          <span>{{ formatLiters(item.delta) }}</span>
        </div>
      </article>
    </div>
  </section>
</template>
