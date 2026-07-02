<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { Flag } from '@lucide/vue';
import { formatLiters } from '../domain/formatters';
import type { RoutePoint, Trip } from '../domain/types';
import { loadGoogleMaps } from '../services/googleMapsLoader';
import StatusBadge from './StatusBadge.vue';

type GoogleAuthWindow = Window & { gm_authFailure?: () => void };

const props = defineProps<{
  trips: Trip[];
  selectedId: string;
}>();

const emit = defineEmits<{
  select: [id: string];
  openTrip: [id: string];
}>();

const showStops = ref(true);
const showRisk = ref(true);
const selectedTruckId = ref('all');
const telemetryTripId = ref<string | null>(null);
const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY?.trim();
const mapId = import.meta.env.VITE_GOOGLE_MAPS_MAP_ID?.trim() || undefined;
const mapElement = ref<HTMLElement | null>(null);
const isLoadingMap = ref(false);
const mapError = ref('');
const mapErrorDetail = ref('');
const routeMode = ref<'road' | 'straight' | 'none'>('none');
const routeModeDetail = ref('');

let googleMap: google.maps.Map | null = null;
let googleMapContainer: HTMLElement | null = null;
let routeLayers: google.maps.Polyline[] = [];
let googleMarkers: google.maps.OverlayView[] = [];
let isUnmounted = false;

const activeTrips = computed(() => props.trips.filter((trip) => trip.status === 'in_transit'));
const hasActiveTrips = computed(() => activeTrips.value.length > 0);
const canUseGoogleMap = computed(() => Boolean(apiKey));

const selectedTrip = computed(() => (
  activeTrips.value.find((trip) => trip.id === selectedTruckId.value) ?? null
));

const telemetryTrip = computed(() => (
  activeTrips.value.find((trip) => trip.id === telemetryTripId.value) ?? null
));

const visibleRouteTrips = computed(() => (selectedTrip.value ? [selectedTrip.value] : []));

const visibleRoutePoints = computed(() => visibleRouteTrips.value.flatMap((trip) => (
  trip.route
    .filter((point) => {
      const isStop = point.type.includes('stop');
      const isRisk = point.type.includes('high');

      if (isRisk && !showRisk.value) return false;
      if (isStop && !showStops.value) return false;
      return true;
    })
    .map((point) => ({ trip, point }))
)));

const routeStats = computed(() => ({
  routes: activeTrips.value.length,
  stops: activeTrips.value.reduce((sum, trip) => sum + trip.route.filter((point) => point.type.includes('stop')).length, 0),
  riskPoints: activeTrips.value.reduce((sum, trip) => sum + trip.route.filter((point) => point.type.includes('high')).length, 0),
  incidents: activeTrips.value.reduce((sum, trip) => sum + trip.incidents, 0),
}));

const fleetStats = computed(() => ({
  active: activeTrips.value.length,
  highRisk: activeTrips.value.filter((trip) => trip.risk === 'high').length,
  incidents: activeTrips.value.reduce((sum, trip) => sum + trip.incidents, 0),
}));

const currentTruckPositions = computed(() => activeTrips.value.map((trip) => ({
  trip,
  point: getCurrentTruckPoint(trip),
})).filter((item): item is { trip: Trip; point: RoutePoint } => Boolean(item.point)));

const visibleTruckPositions = computed(() => (
  selectedTrip.value
    ? currentTruckPositions.value.filter(({ trip }) => trip.id === selectedTrip.value?.id)
    : currentTruckPositions.value
));

const selectedCurrentIndex = computed(() => {
  const trip = selectedTrip.value;
  if (!trip) return -1;
  const current = getCurrentTruckPoint(trip);
  return current ? trip.route.findIndex((point) => point === current) : -1;
});

const selectedPassedRoute = computed(() => {
  const trip = selectedTrip.value;
  if (!trip || selectedCurrentIndex.value < 0) return '';
  return trip.route
    .slice(0, selectedCurrentIndex.value + 1)
    .map((point) => `${point.x},${point.y}`)
    .join(' ');
});

const selectedRemainingRoute = computed(() => {
  const trip = selectedTrip.value;
  if (!trip || selectedCurrentIndex.value < 0) return '';
  return trip.route
    .slice(selectedCurrentIndex.value)
    .map((point) => `${point.x},${point.y}`)
    .join(' ');
});

const selectedDestination = computed(() => {
  const trip = selectedTrip.value;
  return trip?.route[trip.route.length - 1] ?? null;
});

watch(
  [
    () => props.selectedId,
    () => activeTrips.value.map((trip) => trip.id).join('|'),
  ],
  ([id]) => {
    if (id && activeTrips.value.some((trip) => trip.id === id)) {
      selectedTruckId.value = id;
      telemetryTripId.value = id;
      return;
    }

    if (selectedTruckId.value !== 'all' && !activeTrips.value.some((trip) => trip.id === selectedTruckId.value)) {
      selectedTruckId.value = 'all';
      telemetryTripId.value = null;
    }
  },
  { immediate: true },
);

function getCurrentTruckPoint(trip: Trip) {
  if (trip.status === 'in_transit') {
    return trip.route.find((point) => point.type.includes('stop')) ?? trip.route[1] ?? trip.route[0];
  }

  if (trip.status === 'investigation') {
    return trip.route[trip.route.length - 1] ?? trip.route[0];
  }

  return trip.route[trip.route.length - 1] ?? trip.route[0];
}

function pointTone(point: RoutePoint) {
  if (point.type.includes('high')) return 'danger';
  if (point.type.includes('station')) return 'success';
  if (point.type.includes('depot')) return 'info';
  return 'warning';
}

function selectTruck(id: string) {
  selectedTruckId.value = id;
  if (id === 'all') {
    telemetryTripId.value = null;
  }
  if (id !== 'all') {
    telemetryTripId.value = id;
    emit('select', id);
  }
}

function handleTruckSelect() {
  if (selectedTruckId.value !== 'all') {
    telemetryTripId.value = selectedTruckId.value;
    emit('select', selectedTruckId.value);
  } else {
    telemetryTripId.value = null;
  }
}

function openTruckTelemetry(id: string) {
  selectTruck(id);
  telemetryTripId.value = id;
}

function closeTruckTelemetry() {
  telemetryTripId.value = null;
}

function openSelectedTrip() {
  if (selectedTrip.value) {
    emit('openTrip', selectedTrip.value.id);
  }
}

function getTankerLevelEvidence(trip: Trip) {
  return trip.evidence.find((record) => record.type === 'tanker_level');
}

function getControllerMeasurementTimestamp(trip: Trip) {
  const measurementTime = getTankerLevelEvidence(trip)?.timestamp ?? trip.startedAt;
  const match = trip.id.match(/^TR-(\d{4})-(\d{2})(\d{2})-/);
  if (!match) return measurementTime;

  const [, year, month, day] = match;
  return `${day}.${month}.${year} ${measurementTime}`;
}

function getControllerMeasurementSource(trip: Trip) {
  return getTankerLevelEvidence(trip)?.source ?? 'Контролер бензовоза';
}

function getCurrentVolume(trip: Trip) {
  return trip.compartments.reduce((sum, compartment) => sum + compartment.current, 0);
}

function getLoadedVolume(trip: Trip) {
  return trip.compartments.reduce((sum, compartment) => sum + compartment.loaded, 0);
}

function getVolumeDelta(trip: Trip) {
  return trip.compartments.reduce((sum, compartment) => sum + compartment.delta, 0);
}

function getCompartmentLevelPercent(loaded: number, current: number) {
  if (!loaded) return 0;
  return Math.max(0, Math.min(100, Math.round((current / loaded) * 100)));
}

function clearGoogleMapLayers() {
  routeLayers.forEach((routeLayer) => routeLayer.setMap(null));
  routeLayers = [];

  googleMarkers.forEach((marker) => marker.setMap(null));
  googleMarkers = [];
}

function handleGoogleAuthFailure() {
  mapErrorDetail.value = 'BillingNotEnabledMapError / Google Maps API authorization failed. Enable billing and Maps JavaScript API for this key.';
  mapError.value = 'Google Maps зараз недоступна';
  clearGoogleMapLayers();
  googleMap = null;
  googleMapContainer = null;
}

function registerGoogleAuthFailureHandler() {
  (window as GoogleAuthWindow).gm_authFailure = handleGoogleAuthFailure;
}

function waitForGoogleMapCanvas(element: HTMLElement) {
  return new Promise<boolean>((resolve) => {
    let attempts = 0;
    const checkCanvas = () => {
      if (element.querySelector('.gm-style')) {
        resolve(true);
        return;
      }

      attempts += 1;
      if (attempts >= 10) {
        resolve(false);
        return;
      }

      window.setTimeout(checkCanvas, 120);
    };

    checkCanvas();
  });
}

function pointToLatLng(point: RoutePoint) {
  return { lat: point.lat, lng: point.lng };
}

function latLngToLiteral(latLng: google.maps.LatLng | google.maps.LatLngLiteral | google.maps.LatLngAltitudeLiteral) {
  if (typeof latLng.lat === 'number' && typeof latLng.lng === 'number') {
    return {
      lat: latLng.lat,
      lng: latLng.lng,
    };
  }

  return {
    lat: latLng.lat(),
    lng: latLng.lng(),
  };
}

function findNearestRouteIndex(path: google.maps.LatLngLiteral[], target: google.maps.LatLngLiteral) {
  let nearestIndex = 0;
  let nearestDistance = Number.POSITIVE_INFINITY;

  path.forEach((point, index) => {
    const distance = ((point.lat - target.lat) ** 2) + ((point.lng - target.lng) ** 2);
    if (distance < nearestDistance) {
      nearestDistance = distance;
      nearestIndex = index;
    }
  });

  return nearestIndex;
}

function makeMapMarkerContent(className: string, text: string) {
  const element = document.createElement('button');
  element.type = 'button';
  element.className = className;
  element.textContent = text;
  return element;
}

function makeTruckMarkerContent(trip: Trip) {
  const element = document.createElement('button');
  const isHighRisk = trip.risk === 'high';
  element.type = 'button';
  element.className = `google-truck-marker tanker-truck-marker${isHighRisk ? ' high' : ''}`;

  const pulse = document.createElement('span');
  pulse.className = 'truck-marker-pulse';
  pulse.setAttribute('aria-hidden', 'true');

  const vehicle = document.createElement('span');
  vehicle.className = 'truck-marker-vehicle';
  vehicle.setAttribute('aria-hidden', 'true');

  const tank = document.createElement('span');
  tank.className = 'truck-marker-tank';

  const cab = document.createElement('span');
  cab.className = 'truck-marker-cab';

  const wheelBack = document.createElement('span');
  wheelBack.className = 'truck-marker-wheel wheel-back';

  const wheelFront = document.createElement('span');
  wheelFront.className = 'truck-marker-wheel wheel-front';

  vehicle.append(tank, cab, wheelBack, wheelFront);

  const label = document.createElement('span');
  label.className = 'truck-marker-label';
  label.textContent = trip.ttn.replace('TTN-', '');

  element.append(pulse, vehicle, label);
  return element;
}

function addGoogleMarker(
  position: google.maps.LatLngLiteral,
  title: string,
  content: HTMLElement,
  onClick: () => void,
) {
  if (!googleMap) return;

  const handleMarkerClick = (event: MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    onClick();
  };

  const stopMarkerPointerEvent = (event: Event) => {
    event.stopPropagation();
  };

  content.title = title;
  content.setAttribute('aria-label', title);
  content.addEventListener('click', handleMarkerClick);
  content.addEventListener('pointerdown', stopMarkerPointerEvent);
  content.addEventListener('mousedown', stopMarkerPointerEvent);

  class DomMarkerOverlay extends google.maps.OverlayView {
    private element: HTMLElement | null = content;

    onAdd() {
      if (!this.element) return;
      this.element.style.position = 'absolute';
      this.element.style.cursor = 'pointer';
      this.getPanes()?.overlayMouseTarget.appendChild(this.element);
    }

    draw() {
      if (!this.element) return;
      const projection = this.getProjection();
      if (!projection) return;
      const pixel = projection.fromLatLngToDivPixel(new google.maps.LatLng(position.lat, position.lng));
      if (!pixel) return;

      this.element.style.left = `${pixel.x}px`;
      this.element.style.top = `${pixel.y}px`;
      this.element.style.transform = 'translate(-50%, -50%)';
    }

    onRemove() {
      this.element?.removeEventListener('click', handleMarkerClick);
      this.element?.removeEventListener('pointerdown', stopMarkerPointerEvent);
      this.element?.removeEventListener('mousedown', stopMarkerPointerEvent);
      this.element?.remove();
      this.element = null;
    }
  }

  const marker = new DomMarkerOverlay();
  marker.setMap(googleMap);
  googleMarkers.push(marker);
}

async function resolveRoadRoute(trip: Trip, routesLibrary: google.maps.RoutesLibrary) {
  if (trip.route.length < 2) return null;

  const { Route, PolylineQuality } = routesLibrary;
  const [origin, ...rest] = trip.route;
  const destination = rest[rest.length - 1];
  const waypoints = rest.slice(0, -1).map((point) => ({
    location: pointToLatLng(point),
    vehicleStopover: true,
  }));

  try {
    const { routes } = await Route.computeRoutes({
      origin: pointToLatLng(origin),
      destination: pointToLatLng(destination),
      intermediates: waypoints,
      computeAlternativeRoutes: false,
      fields: ['path'],
      optimizeWaypointOrder: false,
      polylineQuality: PolylineQuality.HIGH_QUALITY,
      region: 'UA',
      travelMode: google.maps.TravelMode.DRIVING,
    });

    const path = routes?.[0]?.path?.map(latLngToLiteral) ?? [];
    if (path.length) {
      routeMode.value = 'road';
      routeModeDetail.value = '';
      return path;
    }

    routeMode.value = 'straight';
    routeModeDetail.value = 'Routes API: empty path';
  } catch (error) {
    routeMode.value = 'straight';
    routeModeDetail.value = error instanceof Error ? error.message : String(error);
    if (import.meta.env.DEV) {
      console.warn('Google Routes route failed', routeModeDetail.value);
    }
  }

  return null;
}

async function renderGoogleMap() {
  const container = mapElement.value;
  if (!apiKey || !container || isUnmounted) return;

  if (!visibleTruckPositions.value.length) {
    clearGoogleMapLayers();
    routeMode.value = 'none';
    routeModeDetail.value = '';
    return;
  }

  isLoadingMap.value = true;
  mapError.value = '';
  mapErrorDetail.value = '';

  try {
    registerGoogleAuthFailureHandler();
    const { mapsLibrary, routesLibrary } = await loadGoogleMaps(apiKey);
    const { Map, Polyline } = mapsLibrary;
    let roadRoutePath: google.maps.LatLngLiteral[] | null = null;

    if (selectedTrip.value) {
      roadRoutePath = await resolveRoadRoute(selectedTrip.value, routesLibrary);
    } else {
      routeMode.value = 'none';
      routeModeDetail.value = '';
    }

    if (isUnmounted || mapElement.value !== container) return;

    const mapPoints = selectedTrip.value
      ? (roadRoutePath ?? selectedTrip.value.route.map(pointToLatLng))
      : visibleTruckPositions.value.map(({ point }) => point);
    const center = 'lat' in mapPoints[0] && 'lng' in mapPoints[0]
      ? mapPoints[0]
      : pointToLatLng(mapPoints[0]);

    if (!googleMap || googleMapContainer !== container) {
      container.replaceChildren();
      googleMap = new Map(container, {
        center,
        zoom: selectedTrip.value ? 11 : 7,
        mapId,
        disableDefaultUI: true,
        fullscreenControl: true,
        mapTypeControl: false,
        streetViewControl: false,
        zoomControl: true,
      });
      googleMapContainer = container;
    }

    const hasGoogleCanvas = await waitForGoogleMapCanvas(container);
    if (isUnmounted || mapElement.value !== container) return;

    if (!hasGoogleCanvas) {
      throw new Error('Google Maps canvas did not initialize. Check API key billing, quota, enabled APIs, or referrer restrictions.');
    }

    clearGoogleMapLayers();

    const bounds = new google.maps.LatLngBounds();
    mapPoints.forEach((point) => bounds.extend('lat' in point && 'lng' in point ? point : pointToLatLng(point)));

    if (selectedTrip.value && selectedCurrentIndex.value >= 0) {
      const selectedCurrentPoint = pointToLatLng(selectedTrip.value.route[selectedCurrentIndex.value]);
      const selectedPath = roadRoutePath ?? selectedTrip.value.route.map(pointToLatLng);
      const splitIndex = roadRoutePath
        ? findNearestRouteIndex(roadRoutePath, selectedCurrentPoint)
        : selectedCurrentIndex.value;
      const passedPath = selectedPath.slice(0, splitIndex + 1);
      const remainingPath = selectedPath.slice(splitIndex);
      const dashSymbol = {
        path: 'M 0,-1 0,1',
        strokeColor: '#3D3D3A',
        strokeOpacity: 0.74,
        scale: 3,
      };

      routeLayers.push(new Polyline({
        path: passedPath,
        geodesic: true,
        strokeColor: '#CC785C',
        strokeOpacity: 0.95,
        strokeWeight: 5,
        map: googleMap,
      }));

      routeLayers.push(new Polyline({
        path: remainingPath,
        geodesic: true,
        strokeColor: '#3D3D3A',
        strokeOpacity: 0,
        strokeWeight: 4,
        icons: [{
          icon: dashSymbol,
          offset: '0',
          repeat: '14px',
        }],
        map: googleMap,
      }));

      visibleRoutePoints.value.forEach(({ trip, point }) => {
        const markerClass = `google-route-point tone-${pointTone(point)}`;
        addGoogleMarker(
          pointToLatLng(point),
          `${trip.ttn} · ${point.time}: ${point.note}`,
          makeMapMarkerContent(markerClass, point.label),
          () => selectTruck(trip.id),
        );
      });

      if (selectedDestination.value) {
        addGoogleMarker(
          pointToLatLng(selectedDestination.value),
          `${selectedTrip.value.ttn}: пункт призначення`,
          makeMapMarkerContent('google-destination-marker', 'Фініш'),
          openSelectedTrip,
        );
      }
    }

    visibleTruckPositions.value.forEach(({ trip, point }) => {
      addGoogleMarker(
        pointToLatLng(point),
        `${trip.ttn}: поточна позиція бензовоза`,
        makeTruckMarkerContent(trip),
        () => openTruckTelemetry(trip.id),
      );
    });

    googleMap.fitBounds(bounds, 64);
  } catch (error) {
    if (isUnmounted) return;
    mapErrorDetail.value = error instanceof Error ? error.message : String(error);
    if (import.meta.env.DEV) {
      console.warn('Live Google Maps init failed', error);
    }
    mapError.value = 'Google Maps зараз недоступна';
    clearGoogleMapLayers();
    googleMap = null;
    googleMapContainer = null;
  } finally {
    if (!isUnmounted) {
      isLoadingMap.value = false;
    }
  }
}

watch(
  [
    () => props.trips,
    selectedTruckId,
    showStops,
    showRisk,
  ],
  async () => {
    if (!canUseGoogleMap.value) return;
    await nextTick();
    await renderGoogleMap();
  },
  { deep: true, immediate: true },
);

onBeforeUnmount(() => {
  isUnmounted = true;
  clearGoogleMapLayers();
  googleMap = null;
  googleMapContainer = null;
});

onMounted(async () => {
  if (!canUseGoogleMap.value) return;
  await nextTick();
  await renderGoogleMap();
});
</script>

<template>
  <section class="map-workspace" aria-label="Live карта рейсів у дорозі">
    <div class="map-hero panel">
      <div>
        <p class="eyebrow">Live fleet map</p>
        <h2>Карта рейсів у дорозі</h2>
        <p>
          Поточна операційна картина: тільки рейси, які фізично ще тривають.
          Виконані, звірені або післярейсові розслідування залишаються в розділі
          “Рейси”. Оберіть бензовоз у фільтрі, щоб побачити його маршрут і фініш.
        </p>
      </div>

    </div>

    <section class="panel map-main map-control-frame" aria-label="Керування картою рейсів у дорозі">
      <div class="map-toolbar map-live-toolbar">
        <div class="map-toolbar-copy">
          <p class="eyebrow">Live monitoring</p>
          <h2>Бензовози на маршруті</h2>
          <div v-if="selectedTrip" class="map-selected-trip-card" aria-label="Вибраний бензовоз">
            <div class="map-selected-trip-title">
              <div>
                <strong>{{ selectedTrip.ttn }} · {{ selectedTrip.product }}</strong>
                <span>{{ selectedTrip.depot }} → {{ selectedTrip.station }}</span>
              </div>
              <div class="map-selected-badges">
                <StatusBadge :tone="selectedTrip.risk" :label="selectedTrip.riskLabel" />
              </div>
            </div>
            <div class="map-selected-data-grid">
              <div class="summary-item">
                <span>Бензовоз</span>
                <strong class="summary-value code-value">{{ selectedTrip.truck }}</strong>
              </div>
              <div class="summary-item">
                <span>Водій</span>
                <strong class="summary-value">{{ selectedTrip.driver }}</strong>
              </div>
              <div class="summary-item">
                <span>Старт / ETA</span>
                <strong class="summary-value compact-value">{{ selectedTrip.startedAt }} / {{ selectedTrip.eta }}</strong>
              </div>
              <div class="summary-item">
                <span>Confidence</span>
                <strong class="summary-value compact-value">{{ selectedTrip.confidence }}%</strong>
              </div>
              <div class="summary-item">
                <span>Плановий обсяг</span>
                <strong class="summary-value compact-value">{{ formatLiters(selectedTrip.plannedVolume) }}</strong>
              </div>
              <div class="summary-item">
                <span>Поточний обсяг</span>
                <strong class="summary-value compact-value">{{ formatLiters(selectedTrip.tankerLoaded + selectedTrip.discrepancy) }}</strong>
              </div>
              <div class="summary-item">
                <span>Статус</span>
                <strong class="summary-value compact-value">{{ selectedTrip.statusLabel }}</strong>
              </div>
              <div class="summary-item">
                <span>Розбіжність</span>
                <strong
                  class="summary-value compact-value"
                  :class="selectedTrip.discrepancy < -100 ? 'difference-negative' : 'difference-ok'"
                >
                  {{ formatLiters(selectedTrip.discrepancy) }}
                </strong>
              </div>
            </div>
          </div>
          <div v-else class="map-selected-trip-card fleet-mode" aria-label="Всі бензовози в дорозі">
            <div class="map-selected-trip-title">
              <div>
                <strong>Всі бензовози в дорозі</strong>
                <span>Поточні координати тільки тих рейсів, які ще тривають.</span>
              </div>
              <StatusBadge tone="info" label="Live fleet" />
            </div>
          </div>
        </div>

      </div>

      <div class="map-detail-grid">
        <article>
          <span>Активних маршрутів</span>
          <strong>{{ routeStats.routes }}</strong>
        </article>
        <article>
          <span>Зупинок</span>
          <strong>{{ routeStats.stops }}</strong>
        </article>
        <article>
          <span>Risk points</span>
          <strong>{{ routeStats.riskPoints }}</strong>
        </article>
        <article>
          <span>Інцидентів</span>
          <strong>{{ routeStats.incidents }}</strong>
        </article>
      </div>
    </section>

    <section class="panel map-map-frame map-full-main" aria-label="Поточна карта рейсів у дорозі">
      <div class="map-frame-header">
        <div>
          <p class="eyebrow">Операційна карта</p>
          <h2>Поточна карта рейсів у дорозі</h2>
        </div>
        <div class="map-frame-actions" aria-label="Шари та легенда карти">
          <label class="map-frame-select-label" for="map-truck-select">
            <select id="map-truck-select" v-model="selectedTruckId" @change="handleTruckSelect">
              <option value="all">Всі бензовози в дорозі</option>
              <option v-for="trip in activeTrips" :key="trip.id" :value="trip.id">
                {{ trip.ttn }} · {{ trip.truck }}
              </option>
            </select>
          </label>

          <div class="legend map-live-legend map-frame-legend" aria-label="Легенда карти">
            <span><i class="legend-truck"></i>Бензовоз</span>
            <span><i class="legend-depot"></i>НБ</span>
            <span><i class="legend-stop"></i>Зупинка</span>
            <span><i class="legend-station"></i>АЗС</span>
          </div>

          <label class="map-layer-toggle" :class="{ active: showStops }">
            <input v-model="showStops" type="checkbox">
            <span class="layer-check" aria-hidden="true"></span>
            Зупинки
          </label>
          <label class="map-layer-toggle" :class="{ active: showRisk }">
            <input v-model="showRisk" type="checkbox">
            <span class="layer-check" aria-hidden="true"></span>
            Ризики
          </label>

          <span class="map-frame-count">{{ selectedTrip ? selectedTrip.ttn : `${routeStats.routes} live` }}</span>
        </div>
      </div>

      <div
        class="map-canvas-shell live-map-canvas full-map-canvas"
        :class="{ 'has-google-map': canUseGoogleMap && !mapError }"
        :data-map-error-detail="mapErrorDetail"
      >
        <div v-if="!hasActiveTrips" class="map-empty-state">
          <strong>Немає live-рейсів у дорозі</strong>
          <span>Карта покаже бензовози, щойно в mock/API з’явиться рейс зі статусом `in_transit`.</span>
        </div>

        <div
          v-if="hasActiveTrips && canUseGoogleMap && !mapError"
          ref="mapElement"
          class="google-live-map"
          aria-label="Google карта бензовозів у дорозі"
        ></div>
        <div v-if="isLoadingMap" class="map-overlay">Завантаження карти...</div>
        <div v-if="mapError" class="map-overlay fallback">{{ mapError }}, показуємо mock-схему</div>

        <aside
          v-if="telemetryTrip"
          class="truck-telemetry-panel"
          :class="{ high: telemetryTrip.risk === 'high' }"
          aria-live="polite"
          aria-label="Поточні виміри бензовоза"
        >
          <div class="truck-telemetry-header">
            <div>
              <p class="eyebrow">Live tanker telemetry</p>
              <strong>Маршрут {{ telemetryTrip.id }}</strong>
              <span>{{ telemetryTrip.ttn }} · {{ telemetryTrip.truck }}</span>
            </div>
            <button type="button" aria-label="Закрити поточні виміри" @click="closeTruckTelemetry">
              ×
            </button>
          </div>

          <div class="truck-telemetry-meta">
            <span>{{ getControllerMeasurementSource(telemetryTrip) }}</span>
            <strong>{{ getControllerMeasurementTimestamp(telemetryTrip) }}</strong>
          </div>

          <div class="truck-telemetry-summary">
            <article>
              <span>Початковий</span>
              <strong>{{ formatLiters(getLoadedVolume(telemetryTrip)) }}</strong>
            </article>
            <article>
              <span>Поточний</span>
              <strong>{{ formatLiters(getCurrentVolume(telemetryTrip)) }}</strong>
            </article>
            <article>
              <span>Різниця</span>
              <strong :class="getVolumeDelta(telemetryTrip) < -100 ? 'difference-negative' : 'difference-ok'">
                {{ formatLiters(getVolumeDelta(telemetryTrip)) }}
              </strong>
            </article>
          </div>

          <div class="truck-compartment-list">
            <div
              v-for="compartment in telemetryTrip.compartments"
              :key="compartment.id"
              class="truck-compartment-row"
              :class="{ alarm: compartment.alarm }"
            >
              <div>
                <strong>Секція {{ compartment.id }}</strong>
                <span>{{ compartment.product }}</span>
              </div>
              <div class="truck-level-meter" aria-hidden="true">
                <i :style="{ width: `${getCompartmentLevelPercent(compartment.loaded, compartment.current)}%` }"></i>
              </div>
              <div class="truck-level-values">
                <strong>{{ formatLiters(compartment.current) }}</strong>
                <span>{{ formatLiters(compartment.delta) }}</span>
              </div>
            </div>
          </div>
        </aside>

        <svg
          v-if="hasActiveTrips && (!canUseGoogleMap || mapError)"
          class="map-route-svg"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <polyline
            v-for="trip in visibleRouteTrips"
            :key="trip.id"
            :points="trip.route.map((point) => `${point.x},${point.y}`).join(' ')"
            fill="none"
            stroke-width="1"
            stroke-dasharray="1.2 1.4"
          />
          <polyline
            v-if="selectedPassedRoute"
            :points="selectedPassedRoute"
            class="map-route-passed"
            fill="none"
            stroke-width="1.9"
          />
          <polyline
            v-if="selectedRemainingRoute"
            :points="selectedRemainingRoute"
            class="map-route-remaining"
            fill="none"
            stroke-width="1.4"
            stroke-dasharray="2 1.4"
          />
        </svg>

        <template
          v-if="hasActiveTrips && (!canUseGoogleMap || mapError)"
          v-for="{ trip, point } in visibleRoutePoints"
          :key="`${trip.id}-${point.label}-${point.time}`"
        >
          <button
            class="google-route-point map-route-point"
            :class="[`tone-${pointTone(point)}`, point.type]"
            type="button"
            :style="{ left: `${point.x}%`, top: `${point.y}%` }"
            :title="`${trip.ttn} · ${point.time}: ${point.note}`"
            @click="openTruckTelemetry(trip.id)"
          >
            {{ point.label }}
          </button>
          <div class="map-risk-label" :style="{ left: `${point.x}%`, top: `${point.y}%` }">
            <strong>{{ point.time }}</strong>
            <span>{{ point.note }}</span>
          </div>
        </template>

        <button
          v-if="hasActiveTrips && (!canUseGoogleMap || mapError) && selectedTrip && selectedDestination"
          class="google-destination-marker map-destination-marker"
          type="button"
          :style="{ left: `${selectedDestination.x}%`, top: `${selectedDestination.y}%` }"
          :title="`${selectedTrip.ttn}: пункт призначення`"
          @click="openSelectedTrip"
        >
          <Flag :size="16" :stroke-width="2.2" aria-hidden="true" />
          <span>Фініш</span>
        </button>

        <button
          v-if="hasActiveTrips && (!canUseGoogleMap || mapError)"
          v-for="{ trip, point } in currentTruckPositions"
          :key="`${trip.id}-truck`"
          class="google-truck-marker tanker-truck-marker truck-live-marker"
          :class="{
            active: selectedTrip?.id === trip.id,
            high: trip.risk === 'high',
            hidden: selectedTrip && selectedTrip.id !== trip.id,
          }"
          type="button"
          :style="{ left: `${point.x}%`, top: `${point.y}%` }"
          :title="`${trip.ttn}: поточна позиція бензовоза`"
          @click="openTruckTelemetry(trip.id)"
        >
          <span class="truck-marker-pulse" aria-hidden="true"></span>
          <span class="truck-marker-vehicle" aria-hidden="true">
            <span class="truck-marker-tank"></span>
            <span class="truck-marker-cab"></span>
            <span class="truck-marker-wheel wheel-back"></span>
            <span class="truck-marker-wheel wheel-front"></span>
          </span>
          <span class="truck-marker-label">{{ trip.ttn.replace('TTN-', '') }}</span>
        </button>
      </div>

    </section>
  </section>
</template>
