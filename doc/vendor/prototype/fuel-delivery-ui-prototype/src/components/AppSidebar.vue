<script setup lang="ts">
import {
  Activity,
  Bell,
  FileText,
  Fuel,
  Map,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
  TriangleAlert,
  Truck,
} from '@lucide/vue';
import type { Component } from 'vue';
import type { DashboardSection } from '../domain/types';

defineProps<{
  collapsed: boolean;
  activeSection: DashboardSection;
}>();

defineEmits<{
  toggleCollapse: [];
  changeSection: [section: DashboardSection];
}>();

const navItems: { id: DashboardSection; label: string; icon: Component }[] = [
  { id: 'trips', label: 'Рейси', icon: Truck },
  { id: 'map', label: 'Карта', icon: Map },
  { id: 'events', label: 'Події', icon: Bell },
  { id: 'incidents', label: 'Інциденти', icon: TriangleAlert },
  { id: 'reports', label: 'Звіти', icon: FileText },
  { id: 'settings', label: 'Налаштування', icon: Settings },
];
</script>

<template>
  <aside class="sidebar" :class="{ collapsed }" aria-label="Основна навігація">
    <div class="sidebar-top">
      <div class="brand" :title="collapsed ? 'Fuel Delivery Control Prototype' : undefined">
        <div class="brand-mark">
          <Fuel :size="20" :stroke-width="2.2" aria-hidden="true" />
        </div>
        <div class="brand-copy" :aria-hidden="collapsed ? 'true' : undefined">
          <strong>Fuel Delivery</strong>
          <span>Control Prototype</span>
        </div>
      </div>

      <button
        class="sidebar-toggle"
        type="button"
        :title="collapsed ? 'Розгорнути меню' : 'Згорнути меню'"
        :aria-label="collapsed ? 'Розгорнути меню' : 'Згорнути меню'"
        @click="$emit('toggleCollapse')"
      >
        <PanelLeftOpen v-if="collapsed" :size="18" :stroke-width="1.8" aria-hidden="true" />
        <PanelLeftClose v-else :size="18" :stroke-width="1.8" aria-hidden="true" />
      </button>
    </div>

    <nav class="nav-list">
      <button
        v-for="item in navItems"
        :key="item.id"
        class="nav-item"
        :class="{ active: activeSection === item.id }"
        type="button"
        :title="item.label"
        :aria-label="item.label"
        :aria-current="activeSection === item.id ? 'page' : undefined"
        @click="$emit('changeSection', item.id)"
      >
        <span class="icon" aria-hidden="true">
          <component :is="item.icon" :size="18" :stroke-width="1.9" />
        </span>
        <span class="nav-label">{{ item.label }}</span>
      </button>
    </nav>

    <div class="sidebar-status" title="Mock mode: PTS adapter disabled">
      <span class="status-icon" aria-hidden="true">
        <Activity :size="18" :stroke-width="1.9" />
      </span>
      <div class="status-copy" :aria-hidden="collapsed ? 'true' : undefined">
        <strong>Mock mode</strong>
        <span>PTS adapter disabled</span>
      </div>
    </div>
  </aside>
</template>
