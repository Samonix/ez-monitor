<script setup lang="ts">
withDefaults(defineProps<{
  message?: string;
}>(), {
  message: '',
});
</script>

<template>
  <div class="toast" :class="{ visible: message }" role="status" aria-live="polite">
    {{ message }}
  </div>
</template>
