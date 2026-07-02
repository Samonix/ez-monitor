<script setup lang="ts">
import { computed, ref } from 'vue';
import { Activity, Bell, CreditCard, Database, Fuel, Gauge, LayoutDashboard, Settings, Shield, Users } from '@lucide/vue';
import { alerts, cards, pumps, stations, tanks, transactions } from './domain/mockData';

type Section = 'dashboard' | 'station' | 'cards' | 'alerts' | 'users' | 'settings';
const activeSection = ref<Section>('dashboard');
const selectedStationId = ref('station-4');
const search = ref('');
const selectedStation = computed(() => stations.find((station) => station.id === selectedStationId.value) ?? stations[0]);
const stationPumps = computed(() => pumps.filter((pump) => pump.stationId === selectedStation.value.id));
const stationTanks = computed(() => tanks.filter((tank) => tank.stationId === selectedStation.value.id));
const stationTransactions = computed(() => transactions.filter((transaction) => transaction.stationId === selectedStation.value.id));
const filteredCards = computed(() => cards.filter((card) => `${card.tag} ${card.owner} ${card.vehicle}`.toLowerCase().includes(search.value.toLowerCase())));
const networkTotals = computed(() => ({ revenue: stations.reduce((sum, station) => sum + station.revenue, 0), volume: stations.reduce((sum, station) => sum + station.volume, 0), alerts: stations.reduce((sum, station) => sum + station.alerts, 0), online: stations.filter((station) => station.status === 'online').length }));
const navItems = [
  { id: 'dashboard', label: 'Мережа', icon: LayoutDashboard }, { id: 'station', label: 'Станція', icon: Fuel }, { id: 'cards', label: 'Картки', icon: CreditCard },
  { id: 'alerts', label: 'Події', icon: Bell }, { id: 'users', label: 'Доступи', icon: Users }, { id: 'settings', label: 'Налаштування', icon: Settings },
] as const;
function money(value: number) { return new Intl.NumberFormat('uk-UA', { style: 'currency', currency: 'UAH', maximumFractionDigits: 0 }).format(value); }
</script>

<template>
  <div class="app-shell">
    <aside class="sidebar">
      <div class="brand"><div class="brand-mark">EZ</div><div><strong>EZ MONITOR</strong><span>PTS-2 network cabinet</span></div></div>
      <nav class="nav-list" aria-label="Головна навігація">
        <button v-for="item in navItems" :key="item.id" class="nav-item" :class="{ active: activeSection === item.id }" type="button" @click="activeSection = item.id">
          <component :is="item.icon" :size="18" /><span>{{ item.label }}</span>
        </button>
      </nav>
      <div class="sidebar-status"><Activity :size="18" /><div><strong>{{ networkTotals.online }}/{{ stations.length }} online</strong><span>HTTP ingestion MVP</span></div></div>
    </aside>

    <main class="workspace">
      <header class="topbar">
        <div><p class="eyebrow">Операційний кабінет</p><h1>{{ activeSection === 'station' ? selectedStation.name : 'Мережа АЗС' }}</h1></div>
        <div class="topbar-actions">
          <select v-model="selectedStationId" class="select-control" aria-label="Станція"><option v-for="station in stations" :key="station.id" :value="station.id">{{ station.name }} · {{ station.city }}</option></select>
          <button class="icon-button" type="button" aria-label="OpenAPI"><Database :size="18" /></button>
          <button class="icon-button" type="button" aria-label="Безпека"><Shield :size="18" /></button>
        </div>
      </header>

      <section v-if="activeSection === 'dashboard'" class="screen-stack">
        <div class="metrics-grid">
          <article class="metric"><span>Виручка сьогодні</span><strong>{{ money(networkTotals.revenue) }}</strong></article>
          <article class="metric"><span>Відпущено літрів</span><strong>{{ networkTotals.volume.toFixed(1) }} л</strong></article>
          <article class="metric"><span>Активні станції</span><strong>{{ networkTotals.online }}</strong></article>
          <article class="metric danger"><span>Події</span><strong>{{ networkTotals.alerts }}</strong></article>
        </div>
        <section class="panel"><div class="panel-header"><h2>Станції</h2><span>live snapshot із UploadStatus</span></div><div class="station-grid">
          <button v-for="station in stations" :key="station.id" class="station-card" type="button" @click="selectedStationId = station.id; activeSection = 'station'">
            <span class="status-dot" :class="station.status"></span><strong>{{ station.name }}</strong><span>{{ station.city }}</span><span>{{ money(station.revenue) }} · {{ station.volume.toFixed(1) }} л</span>
          </button>
        </div></section>
      </section>

      <section v-else-if="activeSection === 'station'" class="station-layout">
        <section class="panel wide"><div class="panel-header"><h2>Паливороздавальні колонки</h2><span>{{ selectedStation.name }}</span></div><div class="pump-grid">
          <article v-for="pump in stationPumps" :key="pump.id" class="pump-card" :class="pump.status"><div><span>Колонка</span><strong>#{{ pump.id }}</strong></div><Gauge :size="28" /><p>{{ pump.status }}</p><small>{{ pump.fuel }} · {{ money(pump.amount) }}</small></article>
        </div></section>
        <section class="panel"><div class="panel-header"><h2>Резервуари</h2><span>останній замір</span></div><div class="tank-list">
          <article v-for="tank in stationTanks" :key="tank.id" class="tank-row"><div><strong>Танк {{ tank.tank }}</strong><span>{{ tank.fuel }} · {{ tank.volume }} л</span></div><div class="bar"><span :style="{ width: `${tank.percent}%` }"></span></div><em>{{ tank.percent }}%</em></article>
        </div></section>
        <section class="panel wide"><div class="panel-header"><h2>Останні транзакції</h2><span>UploadPumpTransaction</span></div><table class="data-table"><thead><tr><th>Час</th><th>Колонка</th><th>Пальне</th><th>Літри</th><th>Сума</th><th>Тег</th></tr></thead><tbody><tr v-for="row in stationTransactions" :key="row.id"><td>{{ row.time }}</td><td>#{{ row.pump }}</td><td>{{ row.fuel }}</td><td>{{ row.volume }}</td><td>{{ money(row.amount) }}</td><td>{{ row.tag || '-' }}</td></tr></tbody></table></section>
      </section>

      <section v-else-if="activeSection === 'cards'" class="screen-stack"><section class="panel"><div class="panel-header"><h2>Картки та теги</h2><input v-model="search" class="search" placeholder="Пошук за тегом, власником, авто" /></div><table class="data-table"><thead><tr><th>Тег</th><th>Власник</th><th>Авто</th><th>Тип</th><th>Баланс</th><th>Статус</th></tr></thead><tbody><tr v-for="card in filteredCards" :key="card.id"><td class="mono">{{ card.tag }}</td><td>{{ card.owner }}</td><td>{{ card.vehicle }}</td><td>{{ card.type }}</td><td>{{ card.balance }}</td><td><span class="badge" :class="card.status">{{ card.status }}</span></td></tr></tbody></table></section></section>
      <section v-else-if="activeSection === 'alerts'" class="screen-stack"><article v-for="alert in alerts" :key="alert.id" class="alert-card" :class="alert.severity"><Bell :size="20" /><div><strong>{{ alert.title }}</strong><span>{{ alert.text }}</span></div><time>{{ alert.time }}</time></article></section>
      <section v-else class="panel empty-state"><h2>{{ activeSection === 'users' ? 'Доступи та ролі' : 'Налаштування контролерів' }}</h2><p>Каркас розділу готовий для наступного зрізу: RBAC, controller secrets, audit log і OpenAPI permissions.</p></section>
    </main>
  </div>
</template>