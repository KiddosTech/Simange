<script setup lang="ts">
import { computed } from 'vue';
import { useGameStore } from '../stores/gameStore';

const store = useGameStore();
const orderBook = computed(() => store.orderBook);

const maxBidTotal = computed(() => {
  if (!orderBook.value?.bids?.length) return 1;
  return Math.max(...orderBook.value.bids.map((b) => b.total), 1);
});

const maxAskTotal = computed(() => {
  if (!orderBook.value?.asks?.length) return 1;
  return Math.max(...orderBook.value.asks.map((a) => a.total), 1);
});

function formatPrice(p: number): string {
  if (p < 1.0) return p.toFixed(4);
  return p.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
</script>

<template>
  <div class="w-72 bg-terminal-panel border-r border-terminal-border flex flex-col h-full select-none text-xs">
    <!-- Header -->
    <div class="px-3 py-2 border-b border-terminal-border flex items-center justify-between font-semibold text-terminal-muted">
      <span>ORDER BOOK</span>
      <span class="text-[10px] text-terminal-muted">DEPTH</span>
    </div>

    <!-- Table Columns Header -->
    <div class="grid grid-cols-3 px-3 py-1 text-[10px] text-terminal-muted border-b border-terminal-border/50 num-mono">
      <span>PRICE</span>
      <span class="text-right">QTY</span>
      <span class="text-right">TOTAL</span>
    </div>

    <!-- Asks (Sells / Red) - in reverse order so lowest ask is at bottom -->
    <div class="flex-1 overflow-hidden flex flex-col-reverse justify-end py-1 num-mono text-[11px]">
      <div
        v-for="(ask, i) in orderBook?.asks.slice(0, 7)"
        :key="`ask-${i}`"
        class="relative grid grid-cols-3 px-3 py-0.5 hover:bg-terminal-surface/60 cursor-pointer"
        @click="store.executeTrade('Buy', 'Limit', ask.quantity, ask.price)"
      >
        <!-- Depth Fill Bar -->
        <div
          class="absolute inset-0 bg-cyber-red/10 pointer-events-none transition-all"
          :style="{ width: `${(ask.total / maxAskTotal) * 100}%` }"
        ></div>

        <span class="text-cyber-red font-semibold relative z-10">${{ formatPrice(ask.price) }}</span>
        <span class="text-right text-terminal-text relative z-10">{{ ask.quantity.toFixed(3) }}</span>
        <span class="text-right text-terminal-muted relative z-10">${{ Math.round(ask.total).toLocaleString() }}</span>
      </div>
    </div>

    <!-- Mid-Market Spread -->
    <div class="px-3 py-1.5 bg-terminal-surface border-y border-terminal-border flex items-center justify-between text-[11px] num-mono">
      <div class="flex items-center space-x-1">
        <span class="text-terminal-muted text-[10px]">SPREAD:</span>
        <span class="text-white font-bold">${{ orderBook?.spread?.toFixed(2) ?? '0.00' }}</span>
      </div>
      <span class="text-cyber-amber text-[10px]">
        {{ orderBook?.spread_pct?.toFixed(2) ?? '0.00' }}%
      </span>
    </div>

    <!-- Bids (Buys / Green) -->
    <div class="flex-1 overflow-hidden flex flex-col justify-start py-1 num-mono text-[11px]">
      <div
        v-for="(bid, i) in orderBook?.bids.slice(0, 7)"
        :key="`bid-${i}`"
        class="relative grid grid-cols-3 px-3 py-0.5 hover:bg-terminal-surface/60 cursor-pointer"
        @click="store.executeTrade('Sell', 'Limit', bid.quantity, bid.price)"
      >
        <!-- Depth Fill Bar -->
        <div
          class="absolute inset-0 bg-cyber-green/10 pointer-events-none transition-all"
          :style="{ width: `${(bid.total / maxBidTotal) * 100}%` }"
        ></div>

        <span class="text-cyber-green font-semibold relative z-10">${{ formatPrice(bid.price) }}</span>
        <span class="text-right text-terminal-text relative z-10">{{ bid.quantity.toFixed(3) }}</span>
        <span class="text-right text-terminal-muted relative z-10">${{ Math.round(bid.total).toLocaleString() }}</span>
      </div>
    </div>
  </div>
</template>
