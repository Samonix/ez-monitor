<script setup lang="ts">
import { computed } from 'vue';
import { Bell, Map, Route, SlidersHorizontal, TestTube2, Wifi } from '@lucide/vue';
import type { PlatformEvent, Trip } from '../domain/types';

const props = defineProps<{
  events: PlatformEvent[];
  trips: Trip[];
}>();

const activeTrips = computed(() => props.trips.filter((trip) => trip.status === 'in_transit'));
const trackedEventTypes = computed(() => [
  { label: 'Люки поза геозонами', enabled: true, count: props.events.filter((event) => event.category === 'hatch').length },
  { label: 'Втрати зв’язку PTS / replay', enabled: true, count: props.events.filter((event) => event.category === 'pts').length },
  { label: 'GPS-зупинки з ризиком', enabled: true, count: props.events.filter((event) => event.category === 'gps').length },
  { label: 'ATG та ручне приймання', enabled: true, count: props.events.filter((event) => event.category === 'atg' || event.category === 'manual').length },
  { label: 'Фінальна звірка обсягів', enabled: true, count: props.events.filter((event) => event.category === 'reconciliation').length },
]);

const toleranceRules = [
  { label: 'High risk delta', value: '100 л', note: 'Підсвічує рейс як високий ризик' },
  { label: 'Manual vs ATG', value: '40 л', note: 'Поріг розбіжності приймання на АЗС' },
  { label: 'PTS outage', value: '7 хв', note: 'Після цього подія потрапляє в журнал' },
];
</script>

<template>
  <section class="settings-workspace" aria-label="Налаштування прототипу">
    <div class="settings-hero panel">
      <div>
        <p class="eyebrow">Prototype controls</p>
        <h2>Налаштування</h2>
        <p>
          Робочий MVP для того, як надалі користувач керуватиме подіями, tolerance-правилами,
          режимом mock-даних і станом карт. Зараз це локальний прототип без production persistence.
        </p>
      </div>
      <div class="settings-status-strip" aria-label="Стан прототипу">
        <article>
          <span>Live рейсів</span>
          <strong>{{ activeTrips.length }}</strong>
        </article>
        <article>
          <span>Подій у push</span>
          <strong>{{ events.length }}</strong>
        </article>
        <article>
          <span>Режим</span>
          <strong>Mock</strong>
        </article>
      </div>
    </div>

    <div class="settings-grid">
      <section class="panel setting-card">
        <div class="setting-card-header">
          <span class="setting-icon"><Bell :size="18" :stroke-width="1.8" /></span>
          <div>
            <h3>Відстеження подій</h3>
            <p>Типи подій, які потрапляють у push-панель та розділ “Події”.</p>
          </div>
        </div>

        <div class="settings-toggle-list">
          <label v-for="item in trackedEventTypes" :key="item.label" class="setting-toggle-row">
            <span>
              <strong>{{ item.label }}</strong>
              <small>{{ item.count }} mock подій</small>
            </span>
            <input type="checkbox" :checked="item.enabled">
          </label>
        </div>
      </section>

      <section class="panel setting-card">
        <div class="setting-card-header">
          <span class="setting-icon"><SlidersHorizontal :size="18" :stroke-width="1.8" /></span>
          <div>
            <h3>Tolerance правила</h3>
            <p>Пороги для risk scoring і reconciliation у mock-сценаріях.</p>
          </div>
        </div>

        <div class="tolerance-list">
          <article v-for="rule in toleranceRules" :key="rule.label" class="tolerance-row">
            <span>
              <strong>{{ rule.label }}</strong>
              <small>{{ rule.note }}</small>
            </span>
            <code>{{ rule.value }}</code>
          </article>
        </div>
      </section>

      <section class="panel setting-card">
        <div class="setting-card-header">
          <span class="setting-icon"><Map :size="18" :stroke-width="1.8" /></span>
          <div>
            <h3>Карта</h3>
            <p>Google Maps працює через environment variables, fallback лишається для dev/mock.</p>
          </div>
        </div>

        <div class="settings-health-list">
          <article>
            <Wifi :size="16" :stroke-width="1.8" />
            <span>
              <strong>VITE_GOOGLE_MAPS_API_KEY</strong>
              <small>Production env налаштовується у Vercel, ключі не комітяться.</small>
            </span>
            <b>Env</b>
          </article>
          <article>
            <Route :size="16" :stroke-width="1.8" />
            <span>
              <strong>Routes by roads</strong>
              <small>Увімкнено для конкретного бензовоза; fleet mode показує тільки live-позиції.</small>
            </span>
            <b>Live</b>
          </article>
        </div>
      </section>

      <section class="panel setting-card">
        <div class="setting-card-header">
          <span class="setting-icon"><TestTube2 :size="18" :stroke-width="1.8" /></span>
          <div>
            <h3>Mock adapter</h3>
            <p>Поточний UI керується консистентними mock-даними до production API.</p>
          </div>
        </div>

        <div class="mock-mode-box">
          <strong>PTS adapter disabled</strong>
          <span>Дані рейсів, подій, evidence, reconciliation і live telemetry беруться з `src/mocks`.</span>
        </div>
      </section>
    </div>
  </section>
</template>
