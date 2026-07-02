<script setup lang="ts">
import type { BadgeTone } from '../domain/types';

withDefaults(defineProps<{
  tone?: BadgeTone;
  label: string;
}>(), {
  tone: 'low',
});
</script>

<template>
  <span class="badge" :class="`tone-${tone}`">{{ label }}</span>
</template>
