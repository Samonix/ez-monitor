<script setup lang="ts">
import { computed, ref } from 'vue';
import AppSidebar from './components/AppSidebar.vue';
import TopBar from './components/TopBar.vue';
import FiltersBar from './components/FiltersBar.vue';
import MetricsGrid from './components/MetricsGrid.vue';
import TripList from './components/TripList.vue';
import TripSummary from './components/TripSummary.vue';
import RouteMap from './components/RouteMap.vue';
import DetailTabs from './components/DetailTabs.vue';
import CompartmentPanel from './components/CompartmentPanel.vue';
import MapSectionView from './components/MapSectionView.vue';
import PlatformEventsView from './components/PlatformEventsView.vue';
import IncidentsView from './components/IncidentsView.vue';
import ReportsView from './components/ReportsView.vue';
import SettingsView from './components/SettingsView.vue';
import ToastMessage from './components/ToastMessage.vue';
import { useTripDashboard } from './composables/useTripDashboard';
import { platformEvents } from './mocks/platformEvents';
import type { DashboardSection } from './domain/types';

const {
  trips,
  filters,
  metrics,
  activeTab,
  selectedTrip,
  toastMessage,
  filteredTrips,
  selectedTripId,
  selectTrip,
  setActiveTab,
  showToast,
} = useTripDashboard();

const isSidebarCollapsed = ref(false);
const activeSection = ref<DashboardSection>('trips');

type PlaceholderSection = Exclude<DashboardSection, 'trips' | 'map' | 'events'>;

const sectionMeta = computed<Record<PlaceholderSection, {
  eyebrow: string;
  title: string;
  description: string;
  items: string[];
}>>(() => ({
  incidents: {
    eyebrow: 'Security review',
    title: 'Інциденти',
    description: 'Окремий workspace для підозр, alarm-подій і розслідувань. Поки detail-level incidents лишаються в рейсі.',
    items: [`Активні інциденти в selected trip: ${selectedTrip.value.incidentsList.length}`, 'Зв’язки з evidence records', 'Статуси open / review / closed'],
  },
  reports: {
    eyebrow: 'Reporting',
    title: 'Звіти',
    description: 'Майбутній розділ для final delivery report draft, export і audit-friendly summary.',
    items: [`Selected TTN: ${selectedTrip.value.ttn}`, 'Route summary', 'Evidence + reconciliation + incidents'],
  },
  settings: {
    eyebrow: 'User preferences',
    title: 'Налаштування',
    description: 'Майбутні налаштування platform events, відображення, tolerance і mock/integration режимів.',
    items: ['Event tracking toggles', 'PTS adapter mode', 'Display and density preferences'],
  },
}));

const activePlaceholderMeta = computed(() => {
  if (activeSection.value === 'trips' || activeSection.value === 'map' || activeSection.value === 'events' || activeSection.value === 'incidents' || activeSection.value === 'reports' || activeSection.value === 'settings') {
    return null;
  }

  return sectionMeta.value[activeSection.value];
});

function changeSection(section: DashboardSection) {
  activeSection.value = section;
}

function openTripFromMap(id: string) {
  const trip = trips.find((item) => item.id === id);
  if (trip?.status === 'in_transit') {
    showToast('Рейс ще в дорозі. Live-перегляд залишається в розділі Карта.');
    activeSection.value = 'map';
    return;
  }

  selectTrip(id);
  activeSection.value = 'trips';
}

function openIncidentOnMap(id: string) {
  const trip = trips.find((item) => item.id === id);
  selectTrip(id);
  activeSection.value = 'map';

  if (trip?.status === 'in_transit') {
    showToast(`Live-карта сфокусована на ${trip.ttn}.`);
    return;
  }

  showToast('Цей рейс вже не в дорозі. На live-карті показуємо тільки активні бензовози.');
}

function handleEventAction(action: 'open-trip' | 'show-evidence' | 'mark-read', eventTitle: string) {
  const messages = {
    'open-trip': `Відкриття рейсу для події: ${eventTitle}`,
    'show-evidence': `Evidence для події буде відкрито в наступному slice: ${eventTitle}`,
    'mark-read': `Подію позначено як переглянуту в mock mode: ${eventTitle}`,
  };

  showToast(messages[action]);
}
</script>

<template>
  <div class="app-shell" :class="{ 'sidebar-collapsed': isSidebarCollapsed }">
    <AppSidebar
      :collapsed="isSidebarCollapsed"
      :active-section="activeSection"
      @toggle-collapse="isSidebarCollapsed = !isSidebarCollapsed"
      @change-section="changeSection"
    />

    <main class="workspace">
      <TopBar
        :events="platformEvents"
        @refresh="showToast('Mock-дані оновлено. Production PTS adapter ще не підключений.')"
        @open-events="changeSection('events')"
        @open-settings="changeSection('settings')"
      />

      <template v-if="activeSection === 'trips'">
        <FiltersBar v-model="filters" />
        <MetricsGrid :metrics="metrics" />

        <section class="main-grid">
          <TripList
            :trips="filteredTrips"
            :selected-id="selectedTripId"
            @select="selectTrip"
          />

          <div class="detail-column">
            <TripSummary :trip="selectedTrip" />
            <RouteMap :points="selectedTrip.route" />
            <DetailTabs
              :trip="selectedTrip"
              :active-tab="activeTab"
              @change-tab="setActiveTab"
            />
          </div>

          <aside class="right-column">
            <CompartmentPanel :compartments="selectedTrip.compartments" />
          </aside>
        </section>
      </template>

      <MapSectionView
        v-else-if="activeSection === 'map'"
        :trips="trips"
        :selected-id="selectedTripId"
        @select="selectTrip"
        @open-trip="openTripFromMap"
      />

      <PlatformEventsView
        v-else-if="activeSection === 'events'"
        id="platform-events"
        :events="platformEvents"
        :trips="trips"
        @event-action="(action, event) => handleEventAction(action, event.title)"
      />

      <IncidentsView
        v-else-if="activeSection === 'incidents'"
        :trips="trips"
        :events="platformEvents"
        :selected-id="selectedTripId"
        @open-trip="openTripFromMap"
        @open-map="openIncidentOnMap"
      />

      <ReportsView
        v-else-if="activeSection === 'reports'"
        :trip="selectedTrip"
      />

      <SettingsView
        v-else-if="activeSection === 'settings'"
        :events="platformEvents"
        :trips="trips"
      />

      <section v-else-if="activePlaceholderMeta" class="section-placeholder" :aria-label="activePlaceholderMeta.title">
        <div class="placeholder-copy">
          <p class="eyebrow">{{ activePlaceholderMeta.eyebrow }}</p>
          <h2>{{ activePlaceholderMeta.title }}</h2>
          <p>{{ activePlaceholderMeta.description }}</p>
        </div>

        <div class="placeholder-grid">
          <article
            v-for="item in activePlaceholderMeta.items"
            :key="item"
            class="panel placeholder-item"
          >
            <span>{{ item }}</span>
          </article>
        </div>

        <button class="primary-action placeholder-action" type="button" @click="changeSection('trips')">
          Повернутися до рейсів
        </button>
      </section>
    </main>

    <ToastMessage :message="toastMessage" />
  </div>
</template>
