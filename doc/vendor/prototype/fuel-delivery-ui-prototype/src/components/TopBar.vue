<script setup lang="ts">
import { computed, ref } from 'vue';
import { Bell, ChevronDown, RefreshCw, Settings, UserRound } from '@lucide/vue';
import type { PlatformEvent, PlatformEventTone } from '../domain/types';

const props = defineProps<{
  events: PlatformEvent[];
}>();

const emit = defineEmits<{
  refresh: [];
  'open-events': [];
  'open-settings': [];
}>();

const isNotificationOpen = ref(false);
const isUserMenuOpen = ref(false);
const visibleEvents = computed(() => props.events.slice(0, 10));

const toneLabels: Record<PlatformEventTone, string> = {
  alarm: 'Тривога',
  warning: 'Увага',
  info: 'Інфо',
  success: 'ОК',
};

function openEventsSection() {
  isNotificationOpen.value = false;
  emit('open-events');
}

function openSettingsSection() {
  isUserMenuOpen.value = false;
  emit('open-settings');
}
</script>

<template>
  <header class="topbar">
    <div>
      <p class="eyebrow">Technotrade MONITOR research</p>
      <h1>Контроль доставки палива</h1>
    </div>

    <div class="topbar-actions">
      <div class="notification-wrap">
        <button
          class="icon-button notification-button"
          type="button"
          title="Події"
          aria-label="Події"
          :aria-expanded="isNotificationOpen"
          @click="isNotificationOpen = !isNotificationOpen"
        >
          <Bell :size="18" :stroke-width="1.8" aria-hidden="true" />
          <span class="notification-count">{{ visibleEvents.length }}</span>
        </button>

        <section class="notification-panel" :class="{ open: isNotificationOpen }" aria-label="Події">
          <div class="notification-header">
            <div>
              <h2>Події</h2>
              <p>{{ visibleEvents.length }} важливих подій платформи</p>
            </div>
          </div>

          <div class="notification-list">
            <article
              v-for="event in visibleEvents"
              :key="event.id"
              class="notification-item"
              :class="`tone-${event.tone}`"
            >
              <span class="notification-time">{{ event.time }}</span>
              <span class="notification-dot" aria-hidden="true"></span>

              <div class="notification-copy">
                <div class="notification-title-row">
                  <strong>{{ event.title }}</strong>
                  <span class="notification-tone" :class="`tone-${event.tone}`">
                    {{ toneLabels[event.tone] }}
                  </span>
                </div>
                <p>{{ event.detail }}</p>
                <small>{{ event.source }}</small>
              </div>
            </article>
          </div>

          <div class="notification-footer">
            <a href="#platform-events" class="notification-link" @click.prevent="openEventsSection">
              Подивитися всі події
            </a>
          </div>
        </section>
      </div>

      <button class="icon-button" type="button" title="Оновити дані" aria-label="Оновити дані" @click="$emit('refresh')">
        <RefreshCw :size="18" :stroke-width="1.8" aria-hidden="true" />
      </button>
      <div class="user-menu-wrap">
        <button
          class="avatar-button"
          type="button"
          title="Профіль та налаштування"
          aria-label="Профіль та налаштування"
          :aria-expanded="isUserMenuOpen"
          @click="isUserMenuOpen = !isUserMenuOpen"
        >
          <span class="avatar-initials">TC</span>
          <ChevronDown :size="14" :stroke-width="1.8" aria-hidden="true" />
        </button>

        <section class="user-menu-panel" :class="{ open: isUserMenuOpen }" aria-label="Меню користувача">
          <div class="user-menu-header">
            <span class="avatar-large">
              <UserRound :size="18" :stroke-width="1.8" aria-hidden="true" />
            </span>
            <div>
              <strong>Technotrade Control</strong>
              <small>Mock prototype</small>
            </div>
          </div>

          <button class="user-menu-item" type="button" @click="openSettingsSection">
            <Settings :size="16" :stroke-width="1.8" aria-hidden="true" />
            Налаштування
          </button>
        </section>
      </div>
    </div>
  </header>
</template>
