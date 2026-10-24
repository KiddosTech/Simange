<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useGameStore } from '../stores/gameStore';
import type { OrderSide, OrderType } from '../types';

const store = useGameStore();

const activeSide = ref<OrderSide>('Buy');
const orderType = ref<OrderType>('Market');
const quantity = ref<number>(1);
const limitPrice = ref<number>(0);

const asset = computed(() => store.selectedAsset);
const currentPrice = computed(() => asset.value?.current_price ?? 0);
const cash = computed(() => store.cash);
const holding = computed(() => {
  if (!asset.value) return null;
  return store.portfolio?.holdings[asset.value.symbol] ?? null;
});

// Update limit price default whenever asset changes
watch(
  currentPrice,
  (newPrice) => {
    if (orderType.value === 'Limit' && limitPrice.value === 0) {
      limitPrice.value = newPrice;
    }
  },
  { immediate: true }
);

const effectivePrice = computed(() => {
  if (orderType.value === 'Limit') {
    return limitPrice.value || currentPrice.value;
  }
  return currentPrice.value;
});

const feeRate = computed(() => {
  const rank = store.currentRank?.id;
  switch (rank) {
    case 'RetailNoob': return 0.0025;
    case 'DayTraderKids': return 0.0020;
    case 'WallStreetWannabe': return 0.0015;
    case 'MarketChad': return 0.0008;
    case 'CryptoWhale': return 0.0004;
    case 'WallStreetLegend': return 0.0;
    default: return 0.0025;
  }
});

const estimatedSubtotal = computed(() => {
  return quantity.value * effectivePrice.value;
});

const estimatedFee = computed(() => {
  return estimatedSubtotal.value * feeRate.value;
});

const estimatedTotal = computed(() => {
  if (activeSide.value === 'Buy') {
    return estimatedSubtotal.value + estimatedFee.value;
  }
  return estimatedSubtotal.value - estimatedFee.value;
});

function setPercentQuantity(pct: number) {
  if (!effectivePrice.value || effectivePrice.value <= 0) return;

  if (activeSide.value === 'Buy') {
    const usableCash = cash.value * (pct / 100);
    const approxQty = usableCash / (effectivePrice.value * (1 + feeRate.value));
    quantity.value = Math.max(0.0001, parseFloat(approxQty.toFixed(4)));
  } else {
    const owned = holding.value?.quantity ?? 0;
    const qty = owned * (pct / 100);
    quantity.value = Math.max(0.0001, parseFloat(qty.toFixed(4)));
  }
}

async function handleExecute() {
  if (quantity.value <= 0) {
    store.showNotification('Quantity must be greater than zero', 'error');
    return;
  }

  await store.executeTrade(
    activeSide.value,
    orderType.value,
    quantity.value,
    orderType.value === 'Limit' ? limitPrice.value : undefined
  );
}
</script>

<template>
  <div class="w-80 bg-terminal-panel flex flex-col h-full border-l border-terminal-border select-none text-xs">
    <!-- Header -->
    <div class="px-4 py-2 border-b border-terminal-border flex items-center justify-between font-semibold text-terminal-muted">
      <span>ORDER EXECUTION</span>
      <span class="text-[10px] text-cyber-blue font-mono">{{ asset?.symbol }}</span>
    </div>

    <!-- Buy / Sell Side Selector -->
    <div class="p-3 border-b border-terminal-border grid grid-cols-2 gap-2">
      <button
        @click="activeSide = 'Buy'"
        :class="[
          'py-2 rounded font-bold transition text-xs tracking-wider',
          activeSide === 'Buy'
            ? 'bg-cyber-green text-black shadow-glow-green'
            : 'bg-terminal-surface text-terminal-muted hover:text-white'
        ]"
      >
        BUY (LONG)
      </button>

      <button
        @click="activeSide = 'Sell'"
        :class="[
          'py-2 rounded font-bold transition text-xs tracking-wider',
          activeSide === 'Sell'
            ? 'bg-cyber-red text-white shadow-glow-red'
            : 'bg-terminal-surface text-terminal-muted hover:text-white'
        ]"
      >
        SELL (SHORT)
      </button>
    </div>

    <!-- Form Body -->
    <div class="p-4 flex-1 flex flex-col space-y-4">
      <!-- Order Type -->
      <div>
        <label class="block text-terminal-muted text-[11px] mb-1">ORDER TYPE</label>
        <div class="grid grid-cols-2 gap-2 bg-terminal-surface p-0.5 rounded border border-terminal-border">
          <button
            @click="orderType = 'Market'"
            :class="[
              'py-1 rounded text-center transition font-semibold text-[11px]',
              orderType === 'Market' ? 'bg-terminal-border text-white' : 'text-terminal-muted hover:text-white'
            ]"
          >
            MARKET
          </button>
          <button
            @click="orderType = 'Limit'"
            :class="[
              'py-1 rounded text-center transition font-semibold text-[11px]',
              orderType === 'Limit' ? 'bg-terminal-border text-white' : 'text-terminal-muted hover:text-white'
            ]"
          >
            LIMIT
          </button>
        </div>
      </div>

      <!-- Limit Price Input (if limit order) -->
      <div v-if="orderType === 'Limit'">
        <label class="block text-terminal-muted text-[11px] mb-1">LIMIT PRICE (USD)</label>
        <div class="relative">
          <span class="absolute left-3 top-2 text-terminal-muted">$</span>
          <input
            v-model.number="limitPrice"
            type="number"
            step="0.01"
            class="w-full bg-terminal-bg border border-terminal-border rounded px-7 py-1.5 text-white font-mono focus:border-cyber-blue outline-none"
          />
        </div>
      </div>

      <!-- Quantity Input -->
      <div>
        <div class="flex items-center justify-between text-[11px] mb-1">
          <label class="text-terminal-muted">AMOUNT ({{ asset?.symbol }})</label>
          <span v-if="activeSide === 'Sell'" class="text-terminal-muted">
            Avail: <span class="text-white font-mono">{{ holding?.quantity?.toFixed(4) ?? '0.0000' }}</span>
          </span>
          <span v-else class="text-terminal-muted">
            Cash: <span class="text-cyber-green font-mono">${{ Math.round(cash).toLocaleString() }}</span>
          </span>
        </div>
        <input
          v-model.number="quantity"
          type="number"
          step="0.001"
          min="0.0001"
          class="w-full bg-terminal-bg border border-terminal-border rounded px-3 py-1.5 text-white font-mono focus:border-cyber-blue outline-none"
        />
      </div>

      <!-- Quick Percentage Buttons -->
      <div class="grid grid-cols-4 gap-1.5">
        <button
          v-for="p in [25, 50, 75, 100]"
          :key="p"
          @click="setPercentQuantity(p)"
          class="py-1 rounded bg-terminal-surface hover:bg-terminal-border border border-terminal-border text-terminal-muted hover:text-white text-[10px] font-mono transition"
        >
          {{ p }}%
        </button>
      </div>

      <!-- Order Details Summary -->
      <div class="bg-terminal-surface/70 border border-terminal-border rounded p-3 space-y-1.5 text-[11px] num-mono">
        <div class="flex justify-between">
          <span class="text-terminal-muted">Unit Price:</span>
          <span class="text-white">${{ effectivePrice.toFixed(2) }}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-terminal-muted">Fee ({{ (feeRate * 100).toFixed(2) }}%):</span>
          <span class="text-terminal-text">${{ estimatedFee.toFixed(2) }}</span>
        </div>
        <div class="flex justify-between border-t border-terminal-border/60 pt-1.5 font-bold">
          <span class="text-terminal-muted">Estimated Total:</span>
          <span :class="activeSide === 'Buy' ? 'text-cyber-green' : 'text-cyber-red'">
            ${{ estimatedTotal.toFixed(2) }}
          </span>
        </div>
      </div>

      <!-- Action Button -->
      <div class="pt-2">
        <button
          @click="handleExecute"
          :class="[
            'w-full py-3 rounded font-bold text-sm tracking-wider transition uppercase flex items-center justify-center space-x-2',
            activeSide === 'Buy'
              ? 'bg-cyber-green hover:bg-cyber-green/90 text-black shadow-glow-green'
              : 'bg-cyber-red hover:bg-cyber-red/90 text-white shadow-glow-red'
          ]"
        >
          <span>{{ activeSide === 'Buy' ? 'Place Buy Order' : 'Place Sell Order' }}</span>
        </button>
      </div>
    </div>
  </div>
</template>
