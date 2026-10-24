<script setup lang="ts">
import { ref, computed } from 'vue';
import { useGameStore } from '../stores/gameStore';
import AssetIcon from './AssetIcon.vue';
import type { Candle } from '../types';

const store = useGameStore();
const chartType = ref<'candle' | 'line'>('candle');
const hoverCandle = ref<Candle | null>(null);

const asset = computed(() => store.selectedAsset);
const candles = computed(() => asset.value?.candles ?? []);

const width = 800;
const height = 400;
const padding = { top: 20, right: 60, bottom: 30, left: 10 };

const chartStats = computed(() => {
  if (candles.value.length === 0) return { min: 0, max: 100, range: 100 };
  let min = Infinity;
  let max = -Infinity;
  candles.value.forEach((c) => {
    if (c.low < min) min = c.low;
    if (c.high > max) max = c.high;
  });
  if (min === max) {
    min *= 0.98;
    max *= 1.02;
  }
  const pad = (max - min) * 0.05;
  return { min: min - pad, max: max + pad, range: max - min + pad * 2 };
});

function getY(price: number): number {
  const innerHeight = height - padding.top - padding.bottom;
  const ratio = (price - chartStats.value.min) / chartStats.value.range;
  return height - padding.bottom - ratio * innerHeight;
}

const candleRenderData = computed(() => {
  const list = candles.value;
  if (list.length === 0) return [];
  const innerWidth = width - padding.left - padding.right;
  const candleWidth = Math.max(4, Math.min(18, (innerWidth / list.length) * 0.7));
  const step = innerWidth / Math.max(1, list.length - 1);

  return list.map((c, i) => {
    const x = padding.left + i * step;
    const isBull = c.close >= c.open;
    const yHigh = getY(c.high);
    const yLow = getY(c.low);
    const yOpen = getY(c.open);
    const yClose = getY(c.close);
    const top = Math.min(yOpen, yClose);
    const bodyHeight = Math.max(2, Math.abs(yClose - yOpen));

    return {
      candle: c,
      x,
      candleWidth,
      isBull,
      yHigh,
      yLow,
      top,
      bodyHeight,
    };
  });
});

const linePath = computed(() => {
  if (candleRenderData.value.length === 0) return '';
  return candleRenderData.value
    .map((d, i) => `${i === 0 ? 'M' : 'L'} ${d.x} ${getY(d.candle.close)}`)
    .join(' ');
});

const lineAreaPath = computed(() => {
  if (candleRenderData.value.length === 0) return '';
  const first = candleRenderData.value[0];
  const last = candleRenderData.value[candleRenderData.value.length - 1];
  const baseline = height - padding.bottom;
  return `${linePath.value} L ${last.x} ${baseline} L ${first.x} ${baseline} Z`;
});

const priceLabels = computed(() => {
  const steps = 5;
  const res: { price: number; y: number }[] = [];
  for (let i = 0; i <= steps; i++) {
    const p = chartStats.value.min + (chartStats.value.range / steps) * i;
    res.push({ price: p, y: getY(p) });
  }
  return res;
});

function formatPrice(p: number): string {
  if (p < 1.0) return p.toFixed(4);
  return p.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
</script>

<template>
  <div class="flex-1 flex flex-col bg-terminal-bg border-r border-terminal-border overflow-hidden select-none">
    <!-- Chart Header Bar -->
    <div class="px-4 py-2 border-b border-terminal-border bg-terminal-panel flex flex-wrap items-center justify-between gap-2 text-xs">
      <div class="flex items-center space-x-3">
        <AssetIcon v-if="asset" :symbol="asset.symbol" :size="26" />
        <span class="font-bold text-white text-base">{{ asset?.symbol }} / USD</span>
        <span class="text-terminal-muted">{{ asset?.name }}</span>
        <span
          class="font-mono font-bold text-sm"
          :class="(asset?.change_24h_pct ?? 0) >= 0 ? 'text-cyber-green' : 'text-cyber-red'"
        >
          ${{ formatPrice(asset?.current_price ?? 0) }}
        </span>
      </div>

      <!-- 24h Stats -->
      <div class="flex items-center space-x-4 num-mono text-[11px]">
        <div>
          <span class="text-terminal-muted mr-1">24h High:</span>
          <span class="text-white font-medium">${{ formatPrice(asset?.high_24h ?? 0) }}</span>
        </div>
        <div>
          <span class="text-terminal-muted mr-1">24h Low:</span>
          <span class="text-white font-medium">${{ formatPrice(asset?.low_24h ?? 0) }}</span>
        </div>
        <div>
          <span class="text-terminal-muted mr-1">24h Vol:</span>
          <span class="text-cyber-blue font-medium">${{ Math.round(asset?.volume_24h ?? 0).toLocaleString() }}</span>
        </div>

        <!-- Mode Toggle -->
        <div class="flex items-center space-x-1 bg-terminal-surface p-0.5 rounded border border-terminal-border">
          <button
            @click="chartType = 'candle'"
            :class="[
              'px-2 py-0.5 rounded text-[10px] font-semibold transition',
              chartType === 'candle' ? 'bg-terminal-border text-white' : 'text-terminal-muted hover:text-white'
            ]"
          >
            CANDLE
          </button>
          <button
            @click="chartType = 'line'"
            :class="[
              'px-2 py-0.5 rounded text-[10px] font-semibold transition',
              chartType === 'line' ? 'bg-terminal-border text-white' : 'text-terminal-muted hover:text-white'
            ]"
          >
            LINE
          </button>
        </div>
      </div>
    </div>

    <!-- Active Hover Inspector -->
    <div class="px-4 py-1.5 bg-terminal-surface/40 border-b border-terminal-border text-[11px] num-mono flex items-center space-x-4 text-terminal-muted">
      <template v-if="hoverCandle">
        <div><span class="text-terminal-muted">O: </span><span class="text-white">${{ formatPrice(hoverCandle.open) }}</span></div>
        <div><span class="text-terminal-muted">H: </span><span class="text-cyber-green">${{ formatPrice(hoverCandle.high) }}</span></div>
        <div><span class="text-terminal-muted">L: </span><span class="text-cyber-red">${{ formatPrice(hoverCandle.low) }}</span></div>
        <div><span class="text-terminal-muted">C: </span><span class="text-white">${{ formatPrice(hoverCandle.close) }}</span></div>
        <div><span class="text-terminal-muted">VOL: </span><span class="text-cyber-blue">${{ Math.round(hoverCandle.volume).toLocaleString() }}</span></div>
      </template>
      <template v-else>
        <span class="italic text-terminal-muted/80">Hover over any candle to inspect tick parameters</span>
      </template>
    </div>

    <!-- Chart Canvas / SVG Container -->
    <div class="flex-1 relative w-full h-full p-2 flex items-center justify-center">
      <svg
        :viewBox="`0 0 ${width} ${height}`"
        class="w-full h-full overflow-visible"
        preserveAspectRatio="none"
      >
        <!-- Horizontal Price Grid Lines -->
        <g v-for="grid in priceLabels" :key="grid.y">
          <line
            :x1="padding.left"
            :y1="grid.y"
            :x2="width - padding.right"
            :y2="grid.y"
            stroke="#1f293d"
            stroke-width="1"
            stroke-dasharray="3 3"
          />
          <text
            :x="width - padding.right + 8"
            :y="grid.y + 3"
            fill="#6b7280"
            font-size="10"
            font-family="monospace"
          >
            ${{ formatPrice(grid.price) }}
          </text>
        </g>

        <!-- Line Mode Rendering -->
        <template v-if="chartType === 'line'">
          <defs>
            <linearGradient id="cyberAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#00e5ff" stop-opacity="0.3" />
              <stop offset="100%" stop-color="#00e5ff" stop-opacity="0.0" />
            </linearGradient>
          </defs>
          <path :d="lineAreaPath" fill="url(#cyberAreaGrad)" />
          <path :d="linePath" fill="none" stroke="#00e5ff" stroke-width="2" />
        </template>

        <!-- Candlestick Mode Rendering -->
        <template v-else>
          <g
            v-for="d in candleRenderData"
            :key="d.candle.timestamp"
            @mouseenter="hoverCandle = d.candle"
            @mouseleave="hoverCandle = null"
            class="cursor-crosshair"
          >
            <!-- Wick (High - Low) -->
            <line
              :x1="d.x"
              :y1="d.yHigh"
              :x2="d.x"
              :y2="d.yLow"
              :stroke="d.isBull ? '#00f796' : '#ff3366'"
              stroke-width="1.2"
            />
            <!-- Body (Open - Close) -->
            <rect
              :x="d.x - d.candleWidth / 2"
              :y="d.top"
              :width="d.candleWidth"
              :height="d.bodyHeight"
              :fill="d.isBull ? '#00f796' : '#ff3366'"
              :stroke="d.isBull ? '#00f796' : '#ff3366'"
              stroke-width="1"
              rx="1"
            />
          </g>
        </template>
      </svg>
    </div>
  </div>
</template>
