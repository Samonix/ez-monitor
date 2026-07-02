<script setup lang="ts">
import { computed, ref } from 'vue';
import type { PlatformEvent, PlatformEventCategory, PlatformEventTone, Trip } from '../domain/types';

const props = defineProps<{
  events: PlatformEvent[];
  trips: Trip[];
}>();

const emit = defineEmits<{
  'event-action': [action: 'open-trip' | 'show-evidence' | 'mark-read', event: PlatformEvent];
}>();

const toneFilter = ref<PlatformEventTone | 'all'>('all');
const categoryFilter = ref<PlatformEventCategory | 'all'>('all');
const tripFilter = ref<string>('all');

const toneLabels: Record<PlatformEventTone, string> = {
  alarm: 'Тривога',
  warning: 'Увага',
  info: 'Інфо',
  success: 'ОК',
};

const categoryLabels: Record<PlatformEventCategory, string> = {
  pts: 'PTS',
  gps: 'GPS',
  hatch: 'Люк',
  atg: 'ATG',
  manual: 'Ручний ввід',
  reconciliation: 'Звірка',
  platform: 'Платформа',
};

const tripById = computed(() => new Map(props.trips.map((trip) => [trip.id, trip])));

const filteredEvents = computed(() => props.events.filter((event) => {
  const matchesTone = toneFilter.value === 'all' || event.tone === toneFilter.value;
  const matchesCategory = categoryFilter.value === 'all' || event.category === categoryFilter.value;
  const matchesTrip = tripFilter.value === 'all' || event.tripId === tripFilter.value;

  return matchesTone && matchesCategory && matchesTrip;
}));

const alarmAndWarnings = computed(() => props.events.filter((event) => (
  event.tone === 'alarm' || event.tone === 'warning'
)).length);

const filteredToneCounts = computed(() => ({
  attention: filteredEvents.value.filter((event) => event.tone === 'alarm' || event.tone === 'warning').length,
  alarm: filteredEvents.value.filter((event) => event.tone === 'alarm').length,
  info: filteredEvents.value.filter((event) => event.tone === 'info').length,
  success: filteredEvents.value.filter((event) => event.tone === 'success').length,
}));

const groupedEvents = computed(() => [
  {
    id: 'attention',
    title: 'Потребують уваги',
    description: 'Тривоги й попередження, які варто розібрати першими.',
    events: filteredEvents.value.filter((event) => event.tone === 'alarm' || event.tone === 'warning'),
  },
  {
    id: 'updates',
    title: 'Операційні оновлення',
    description: 'Інформаційні й успішно закриті події платформи.',
    events: filteredEvents.value.filter((event) => event.tone === 'info' || event.tone === 'success'),
  },
].filter((group) => group.events.length > 0));

function getTripLabel(event: PlatformEvent) {
  if (!event.tripId) {
    return 'Без прив’язки до рейсу';
  }

  const trip = tripById.value.get(event.tripId);
  return trip ? `${trip.ttn} · ${trip.station}` : event.tripId;
}
</script>

<template>
  <section class="events-view" aria-label="Події платформи">
    <div class="events-hero panel">
      <div>
        <p class="eyebrow">Platform events</p>
        <h2>Події</h2>
        <p>
          Загальний потік важливих подій платформи. Надалі користувач зможе
          налаштувати, які типи подій відстежувати й отримувати у push-панелі.
        </p>
      </div>

      <div class="events-summary-grid" aria-label="Зведення подій">
        <article class="event-summary-card">
          <span>Усього</span>
          <strong>{{ events.length }}</strong>
        </article>
        <article class="event-summary-card">
          <span>Тривоги / увага</span>
          <strong>{{ alarmAndWarnings }}</strong>
        </article>
        <article class="event-summary-card">
          <span>Зараз показано</span>
          <strong>{{ filteredEvents.length }}</strong>
        </article>
      </div>
    </div>

    <div class="events-layout">
      <section class="panel events-main" aria-label="Список подій">
        <div class="events-toolbar">
          <label for="event-tone-filter">
            Рівень
            <select id="event-tone-filter" v-model="toneFilter" aria-label="Фільтр за рівнем">
              <option value="all">Усі рівні</option>
              <option value="alarm">Тривога</option>
              <option value="warning">Увага</option>
              <option value="info">Інфо</option>
              <option value="success">ОК</option>
            </select>
          </label>

          <label for="event-category-filter">
            Джерело
            <select id="event-category-filter" v-model="categoryFilter" aria-label="Фільтр за джерелом">
              <option value="all">Усі джерела</option>
              <option
                v-for="(label, value) in categoryLabels"
                :key="value"
                :value="value"
              >
                {{ label }}
              </option>
            </select>
          </label>

          <label for="event-trip-filter">
            TTN
            <select id="event-trip-filter" v-model="tripFilter" aria-label="Фільтр за TTN">
              <option value="all">Усі TTN</option>
              <option v-for="trip in trips" :key="trip.id" :value="trip.id">
                {{ trip.ttn }}
              </option>
            </select>
          </label>
        </div>

        <div class="events-report-header">
          <div>
            <h2>Журнал подій</h2>
            <p>Один потік подій платформи, не прив’язаний лише до вибраного рейсу.</p>
          </div>
          <span>{{ filteredEvents.length }} записів</span>
        </div>

        <div v-if="groupedEvents.length" class="events-report-list">
          <section v-for="group in groupedEvents" :key="group.id" class="event-group">
            <div class="event-group-header">
              <div>
                <h3>{{ group.title }}</h3>
                <p>{{ group.description }}</p>
              </div>
              <span>{{ group.events.length }}</span>
            </div>

            <article
              v-for="event in group.events"
              :key="event.id"
              class="event-report-row"
              :class="`tone-${event.tone}`"
            >
              <div class="event-report-time">
                <span>{{ event.time }}</span>
                <small>{{ categoryLabels[event.category] }}</small>
              </div>

              <span class="event-report-dot" aria-hidden="true"></span>

              <div class="event-report-copy">
                <div class="event-report-title">
                  <h3>{{ event.title }}</h3>
                  <span class="event-tone" :class="`tone-${event.tone}`">
                    {{ toneLabels[event.tone] }}
                  </span>
                </div>
                <p>{{ event.detail }}</p>
                <div class="event-meta">
                  <span>{{ event.source }}</span>
                  <span>{{ getTripLabel(event) }}</span>
                </div>
              </div>

              <div class="event-actions" aria-label="Дії події">
                <button type="button" @click="emit('event-action', 'open-trip', event)">Рейс</button>
                <button type="button" @click="emit('event-action', 'show-evidence', event)">Evidence</button>
                <button type="button" @click="emit('event-action', 'mark-read', event)">Переглянуто</button>
              </div>
            </article>
          </section>
        </div>

        <div v-else class="empty-state event-empty">
          Немає подій для вибраних фільтрів. Змініть рівень, джерело або TTN.
        </div>
      </section>

      <aside class="panel event-control-panel" aria-label="Контроль подій">
        <div class="panel-header compact">
          <div>
            <h2>Контроль подій</h2>
            <p>За поточними фільтрами</p>
          </div>
        </div>

        <div class="event-control-body">
          <div class="event-control-grid">
            <article>
              <span>Потребують уваги</span>
              <strong>{{ filteredToneCounts.attention }}</strong>
            </article>
            <article>
              <span>Тривоги</span>
              <strong>{{ filteredToneCounts.alarm }}</strong>
            </article>
            <article>
              <span>Інфо</span>
              <strong>{{ filteredToneCounts.info }}</strong>
            </article>
            <article>
              <span>Закрито ОК</span>
              <strong>{{ filteredToneCounts.success }}</strong>
            </article>
          </div>

          <div class="event-control-section">
            <h3>Фокус оператора</h3>
            <p v-if="filteredToneCounts.attention">
              Спочатку перегляньте тривоги й попередження, потім відкрийте evidence для пов’язаних TTN.
            </p>
            <p v-else>
              У поточному зрізі немає подій, що потребують негайної уваги.
            </p>
          </div>

          <div class="event-control-section">
            <h3>Швидкі налаштування</h3>
            <label class="event-setting-row">
              <input type="checkbox" checked disabled>
              <span>Показувати тривоги люків</span>
            </label>
            <label class="event-setting-row">
              <input type="checkbox" checked disabled>
              <span>Показувати PTS replay/outage</span>
            </label>
            <label class="event-setting-row">
              <input type="checkbox" checked disabled>
              <span>Показувати звірку обсягів</span>
            </label>
          </div>
        </div>
      </aside>
    </div>
  </section>
</template>
