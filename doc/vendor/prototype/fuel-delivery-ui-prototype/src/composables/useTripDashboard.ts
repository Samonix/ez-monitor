import { computed, ref, watch } from 'vue';
import { trips } from '../mocks/trips';
import { buildMetrics } from '../domain/tripMetrics';
import type { TabId, TripFilters } from '../domain/types';

export function useTripDashboard() {
  const selectedTripId = ref(trips[0]?.id ?? '');
  const activeTab = ref<TabId>('timeline');
  const toastMessage = ref('');
  const filters = ref<TripFilters>({
    search: '',
    status: 'all',
    risk: 'all',
    onlyIncidents: false,
  });

  const archivedTrips = computed(() => trips.filter((trip) => trip.status !== 'in_transit'));

  const filteredTrips = computed(() => archivedTrips.value.filter((trip) => {
    const haystack = `${trip.ttn} ${trip.truck} ${trip.station} ${trip.depot} ${trip.driver}`.toLowerCase();
    const search = filters.value.search.trim().toLowerCase();
    const matchesSearch = !search || haystack.includes(search);
    const matchesStatus = filters.value.status === 'all' || trip.status === filters.value.status;
    const matchesRisk = filters.value.risk === 'all' || trip.risk === filters.value.risk;
    const matchesIncidents = !filters.value.onlyIncidents || trip.incidents > 0;
    return matchesSearch && matchesStatus && matchesRisk && matchesIncidents;
  }));

  watch(filteredTrips, (visibleTrips) => {
    const selectedStillVisible = visibleTrips.some((trip) => trip.id === selectedTripId.value);
    if (!selectedStillVisible) {
      selectedTripId.value = visibleTrips[0]?.id ?? '';
    }
  }, { immediate: true });

  const selectedTrip = computed(() => (
    filteredTrips.value.find((trip) => trip.id === selectedTripId.value) ?? filteredTrips.value[0] ?? archivedTrips.value[0] ?? trips[0]
  ));

  const metrics = computed(() => buildMetrics(archivedTrips.value));

  function selectTrip(id: string) {
    selectedTripId.value = id;
  }

  function setActiveTab(tab: TabId) {
    activeTab.value = tab;
  }

  function showToast(message: string) {
    toastMessage.value = message;
    window.setTimeout(() => {
      if (toastMessage.value === message) {
        toastMessage.value = '';
      }
    }, 2200);
  }

  return {
    trips,
    archivedTrips,
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
  };
}
