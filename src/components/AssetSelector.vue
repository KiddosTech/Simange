<script setup lang="ts">
import { useGameStore } from '../stores/gameStore';
import AssetIcon from './AssetIcon.vue';

const store = useGameStore();

function formatPrice(val: number): string {
  if (val < 1.0) return `$${val.toFixed(4)}`;
  return `$${val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
</script>

<template>
  <aside class="w-64 bg-terminal-panel border-r border-terminal-border flex flex-col h-full overflow-hidden select-none">
    <div class="px-3 py-2 border-b border-terminal-border flex items-center justify-between text-xs font-semibold text-terminal-muted tracking-wider">
      <span>WATCHLIST</span>
      <span>24H CHG</span>
    </div>

    <div class="flex-1 overflow-y-auto divide-y divide-terminal-border/50">
      <button
        v-for="asset in store.assets"
        :key="asset.id"
        @click="store.selectAsset(asset.symbol)"
        :class="[
          'w-full text-left px-3 py-2.5 flex items-center justify-between transition',
          store.selectedSymbol === asset.symbol
            ? 'bg-terminal-surface border-l-2 border-cyber-blue'
            : 'hover:bg-terminal-surface/60'
        ]"
      >
        <div class="flex items-center space-x-2.5 min-w-0">
          <AssetIcon :symbol="asset.symbol" :size="26" />
          <div class="truncate">
            <div class="flex items-center space-x-1">
              <span class="font-bold text-xs text-white">{{ asset.symbol }}</span>
              <span class="text-[9px] px-1 py-0.2 rounded bg-terminal-bg text-terminal-muted">
                {{ asset.category }}
              </span>
            </div>
            <div class="text-[11px] text-terminal-muted truncate">{{ asset.name }}</div>
          </div>
        </div>

        <div class="text-right num-mono flex-shrink-0 ml-2">
          <div class="text-xs font-semibold text-white">{{ formatPrice(asset.current_price) }}</div>
          <div
            :class="asset.change_24h_pct >= 0 ? 'text-cyber-green' : 'text-cyber-red'"
            class="text-[11px] font-bold"
          >
            {{ asset.change_24h_pct >= 0 ? '+' : '' }}{{ asset.change_24h_pct.toFixed(2) }}%
          </div>
        </div>
      </button>
    </div>
  </aside>
</template>
