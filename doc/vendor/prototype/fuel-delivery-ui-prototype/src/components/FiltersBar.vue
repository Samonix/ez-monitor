<script setup lang="ts">
import type { TripFilters } from '../domain/types';

const model = defineModel<TripFilters>({ required: true });
</script>

<template>
  <section class="filters" aria-label="Фільтри рейсів">
    <label>
      <span>Пошук</span>
      <input v-model="model.search" type="search" placeholder="TTN, бензовоз, АЗС" />
    </label>
    <label>
      <span>Статус</span>
      <select v-model="model.status">
        <option value="all">Усі статуси</option>
        <option value="investigation">Під розслідуванням</option>
        <option value="reconciled">Звірено</option>
      </select>
    </label>
    <label>
      <span>Ризик</span>
      <select v-model="model.risk">
        <option value="all">Усі рівні</option>
        <option value="high">Високий</option>
        <option value="medium">Середній</option>
        <option value="low">Низький</option>
      </select>
    </label>
    <label class="toggle-label">
      <input v-model="model.onlyIncidents" type="checkbox" />
      <span>Тільки з інцидентами</span>
    </label>
  </section>
</template>
