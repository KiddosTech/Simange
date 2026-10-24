<script setup lang="ts">
import { ref, computed } from 'vue';

const props = withDefaults(
  defineProps<{
    symbol: string;
    size?: number;
    className?: string;
  }>(),
  {
    size: 24,
    className: '',
  }
);

const hasError = ref(false);

const cleanSymbol = computed(() => {
  return props.symbol.toLowerCase().replace(/[^a-z0-9]/g, '');
});

const symbolColor = computed(() => {
  const map: Record<string, string> = {
    byte: '#F7931A',
    aeth: '#627EEA',
    sola: '#14F195',
    meow: '#FBBF24',
    usdf: '#26A17B',
    pear: '#84CC16',
    mhd: '#0284C7',
    tslax: '#E11D48',
    pixl: '#76B900',
    goog: '#4285F4',
    mate: '#0081FB',
    xomm: '#EA580C',
    msm: '#D97706',
    bae: '#0284C7',
    ccn: '#DC2626',
    ambk: '#2563EB',
    bcly: '#00AEEF',
  };
  return map[cleanSymbol.value] || '#00E5FF';
});

const iconSrc = computed(() => {
  // Direct public path works in both dev and production
  return `/icons/${cleanSymbol.value}.svg`;
});

function handleError() {
  hasError.value = true;
}
</script>

<template>
  <div
    class="inline-flex items-center justify-center rounded-full overflow-hidden flex-shrink-0"
    :style="{ width: `${size}px`, height: `${size}px` }"
  >
    <img
      v-if="!hasError"
      :src="iconSrc"
      :alt="symbol"
      class="w-full h-full object-contain"
      @error="handleError"
    />
    <div
      v-else
      class="w-full h-full rounded-full flex items-center justify-center font-bold text-[10px] text-white border"
      :style="{
        backgroundColor: `${symbolColor}25`,
        borderColor: symbolColor,
        color: symbolColor,
      }"
    >
      {{ symbol.slice(0, 2).toUpperCase() }}
    </div>
  </div>
</template>
