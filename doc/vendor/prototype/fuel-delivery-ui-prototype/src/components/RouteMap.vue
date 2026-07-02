<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import type { RoutePoint } from '../domain/types';
import { loadGoogleMaps } from '../services/googleMapsLoader';

type GoogleAuthWindow = Window & { gm_authFailure?: () => void };

const props = defineProps<{
  points: RoutePoint[];
}>();

const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY?.trim();
const mapId = import.meta.env.VITE_GOOGLE_MAPS_MAP_ID?.trim() || undefined;
const mapElement = ref<HTMLElement | null>(null);
const isLoadingMap = ref(false);
const mapError = ref('');
const mapErrorDetail = ref('');
const routeMode = ref<'road' | 'straight'>('straight');

let map: google.maps.Map | null = null;
let mapContainer: HTMLElement | null = null;
let routeLayers: google.maps.Polyline[] = [];
let markers: google.maps.OverlayView[] = [];
let isUnmounted = false;

const canUseGoogleMap = computed(() => Boolean(apiKey));
const routePath = computed(() => props.points.map((point) => ({ lat: point.lat, lng: point.lng })));

function pointTone(point: RoutePoint) {
  if (point.type.includes('high')) return 'danger';
  if (point.type.includes('station')) return 'success';
  if (point.type.includes('depot')) return 'info';
  return 'warning';
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

function makeRouteMarkerContent(point: RoutePoint) {
  const element = document.createElement('button');
  element.type = 'button';
  element.className = `google-route-point tone-${pointTone(point)}`;
  element.textContent = point.label;
  return element;
}

function clearGoogleMapLayers() {
  routeLayers.forEach((routeLayer) => routeLayer.setMap(null));
  routeLayers = [];
  markers.forEach((marker) => marker.setMap(null));
  markers = [];
}

function handleGoogleAuthFailure() {
  mapErrorDetail.value = 'BillingNotEnabledMapError / Google Maps API authorization failed. Enable billing and Maps JavaScript API for this key.';
  mapError.value = 'Google Maps зараз недоступна';
  clearGoogleMapLayers();
  map = null;
  mapContainer = null;
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

function addGoogleDomMarker(
  mapInstance: google.maps.Map,
  position: google.maps.LatLngLiteral,
  title: string,
  content: HTMLElement,
) {
  content.title = title;
  content.setAttribute('aria-label', title);

  class DomMarkerOverlay extends google.maps.OverlayView {
    private element: HTMLElement | null = content;

    onAdd() {
      if (!this.element) return;
      this.element.style.position = 'absolute';
      this.element.style.cursor = 'default';
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
      this.element?.remove();
      this.element = null;
    }
  }

  const overlay = new DomMarkerOverlay();
  overlay.setMap(mapInstance);
  markers.push(overlay);
}

async function resolveRoadRoute(routesLibrary: google.maps.RoutesLibrary) {
  if (props.points.length < 2) return null;

  const { Route, PolylineQuality } = routesLibrary;
  const [origin, ...rest] = props.points;
  const destination = rest[rest.length - 1];
  const intermediates = rest.slice(0, -1).map((point) => ({
    location: { lat: point.lat, lng: point.lng },
    vehicleStopover: true,
  }));

  try {
    const { routes } = await Route.computeRoutes({
      origin: { lat: origin.lat, lng: origin.lng },
      destination: { lat: destination.lat, lng: destination.lng },
      intermediates,
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
      return path;
    }
  } catch (error) {
    routeMode.value = 'straight';
    if (import.meta.env.DEV) {
      console.warn('Google Routes route failed', error instanceof Error ? error.message : String(error));
    }
  }

  routeMode.value = 'straight';
  return null;
}

async function renderGoogleMap() {
  const container = mapElement.value;
  if (!apiKey || !container || !props.points.length || isUnmounted) return;

  isLoadingMap.value = true;
  mapError.value = '';
  mapErrorDetail.value = '';

  try {
    registerGoogleAuthFailureHandler();
    const { mapsLibrary, routesLibrary } = await loadGoogleMaps(apiKey);
    const { Map, Polyline } = mapsLibrary;
    const roadPath = await resolveRoadRoute(routesLibrary);
    const path = roadPath ?? routePath.value;
    const center = path[0];

    if (isUnmounted || mapElement.value !== container) return;

    if (!map || mapContainer !== container) {
      container.replaceChildren();
      map = new Map(container, {
        center,
        zoom: 12,
        mapId,
        disableDefaultUI: true,
        fullscreenControl: true,
        mapTypeControl: false,
        streetViewControl: false,
        zoomControl: true,
      });
      mapContainer = container;
    }

    const hasGoogleCanvas = await waitForGoogleMapCanvas(container);
    if (isUnmounted || mapElement.value !== container) return;

    if (!hasGoogleCanvas) {
      throw new Error('Google Maps canvas did not initialize. Check API key billing, quota, enabled APIs, or referrer restrictions.');
    }

    clearGoogleMapLayers();

    const bounds = new google.maps.LatLngBounds();
    path.forEach((position) => bounds.extend(position));

    props.points.forEach((point) => {
      const position = { lat: point.lat, lng: point.lng };
      bounds.extend(position);

      addGoogleDomMarker(
        map,
        position,
        `${point.time} - ${point.note}`,
        makeRouteMarkerContent(point),
      );
    });

    const dashSymbol = {
      path: 'M 0,-1 0,1',
      strokeColor: '#3D3D3A',
      strokeOpacity: 0.74,
      scale: 3,
    };

    routeLayers.push(new Polyline({
      path,
      geodesic: true,
      strokeColor: '#3D3D3A',
      strokeOpacity: 0,
      strokeWeight: 4,
      icons: [{
        icon: dashSymbol,
        offset: '0',
        repeat: '14px',
      }],
      map,
    }));

    routeLayers.push(new Polyline({
      path,
      geodesic: true,
      strokeColor: '#CC785C',
      strokeOpacity: 0.78,
      strokeWeight: 2,
      map,
    }));

    map.fitBounds(bounds, 46);
  } catch (error) {
    if (isUnmounted) return;
    mapErrorDetail.value = error instanceof Error ? error.message : String(error);
    if (import.meta.env.DEV) {
      console.warn('Google Maps init failed', error);
    }
    mapError.value = 'Google Maps зараз недоступна';
    clearGoogleMapLayers();
    map = null;
    mapContainer = null;
  } finally {
    if (!isUnmounted) {
      isLoadingMap.value = false;
    }
  }
}

watch(
  () => props.points,
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
  map = null;
  mapContainer = null;
});

onMounted(async () => {
  if (!canUseGoogleMap.value) return;
  await nextTick();
  await renderGoogleMap();
});
</script>

<template>
  <section class="panel route-panel">
    <div class="panel-header compact">
      <h2>Маршрут і точки ризику</h2>
      <div class="legend">
        <span><i class="legend-depot"></i>НБ</span>
        <span><i class="legend-stop"></i>Зупинка</span>
        <span><i class="legend-station"></i>АЗС</span>
      </div>
    </div>

    <div v-if="canUseGoogleMap && !mapError" class="google-map-shell">
      <div ref="mapElement" class="google-map" aria-label="Google карта маршруту"></div>
      <div v-if="isLoadingMap" class="map-overlay">Завантаження карти...</div>
    </div>

    <div v-else class="route-map" aria-label="Схематична карта маршруту" :data-map-error-detail="mapErrorDetail">
      <div v-if="mapError" class="map-overlay fallback">{{ mapError }}, показуємо mock-схему</div>
      <svg class="route-line" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        <polyline
          :points="points.map((point) => `${point.x},${point.y}`).join(' ')"
          fill="none"
          stroke="#3D3D3A"
          stroke-width="1.3"
          stroke-dasharray="2 1.4"
        />
      </svg>

      <template v-for="point in points" :key="`${point.label}-${point.time}`">
        <div class="map-point" :class="point.type" :style="{ left: `${point.x}%`, top: `${point.y}%` }">
          {{ point.label }}
        </div>
        <div class="map-label" :style="{ left: `${point.x}%`, top: `${point.y}%` }">
          <strong>{{ point.time }}</strong>
          {{ point.note }}
        </div>
      </template>
    </div>
  </section>
</template>
