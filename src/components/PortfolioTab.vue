<script setup lang="ts">
import { computed } from 'vue';
import { useGameStore } from '../stores/gameStore';
import AssetIcon from './AssetIcon.vue';

const store = useGameStore();

const summary = computed(() => store.portfolio);
const holdingsList = computed(() => {
  if (!summary.value) return [];
  return Object.values(summary.value.holdings).map((holding) => {
    const asset = store.assets.find((a) => a.symbol === holding.symbol);
    const currentPrice = asset?.current_price ?? 0;
    const marketValue = holding.quantity * currentPrice;
    const pnl = marketValue - holding.total_cost_basis;
    const pnlPct = holding.total_cost_basis > 0 ? (pnl / holding.total_cost_basis) * 100 : 0;

    return {
      ...holding,
      assetName: asset?.name ?? holding.symbol,
      currentPrice,
      marketValue,
      pnl,
      pnlPct,
    };
  });
});

function formatCurrency(val: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(val);
}

function formatDate(ts: number): string {
  return new Date(ts * 1000).toLocaleTimeString();
}
</script>

<template>
  <div class="flex-1 bg-terminal-bg p-6 overflow-y-auto select-none">
    <div class="max-w-6xl mx-auto space-y-6">
      <!-- Title & Financial Stat Cards -->
      <div>
        <h2 class="text-xl font-bold text-white tracking-wide mb-4">PORTFOLIO OVERVIEW</h2>
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 num-mono">
          <div class="cyber-panel p-4 rounded">
            <span class="text-xs text-terminal-muted block mb-1">TOTAL NET WORTH</span>
            <span class="text-xl font-bold text-white">{{ formatCurrency(summary?.net_worth ?? 0) }}</span>
          </div>
          <div class="cyber-panel p-4 rounded">
            <span class="text-xs text-terminal-muted block mb-1">AVAILABLE CASH</span>
            <span class="text-xl font-bold text-cyber-green">{{ formatCurrency(summary?.cash ?? 0) }}</span>
          </div>
          <div class="cyber-panel p-4 rounded">
            <span class="text-xs text-terminal-muted block mb-1">UNREALIZED PnL</span>
            <span
              :class="(summary?.unrealized_pnl ?? 0) >= 0 ? 'text-cyber-green' : 'text-cyber-red'"
              class="text-xl font-bold"
            >
              {{ (summary?.unrealized_pnl ?? 0) >= 0 ? '+' : '' }}{{ formatCurrency(summary?.unrealized_pnl ?? 0) }}
            </span>
          </div>
          <div class="cyber-panel p-4 rounded">
            <span class="text-xs text-terminal-muted block mb-1">REALIZED PnL</span>
            <span
              :class="(summary?.realized_pnl ?? 0) >= 0 ? 'text-cyber-green' : 'text-cyber-red'"
              class="text-xl font-bold"
            >
              {{ (summary?.realized_pnl ?? 0) >= 0 ? '+' : '' }}{{ formatCurrency(summary?.realized_pnl ?? 0) }}
            </span>
          </div>
        </div>
      </div>

      <!-- Holdings Table -->
      <div class="cyber-panel rounded overflow-hidden">
        <div class="px-4 py-3 border-b border-terminal-border flex items-center justify-between">
          <h3 class="text-sm font-bold text-white tracking-wider">OPEN ASSET POSITIONS</h3>
          <span class="text-xs text-terminal-muted">{{ holdingsList.length }} Assets Held</span>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs num-mono">
            <thead class="bg-terminal-surface text-terminal-muted border-b border-terminal-border text-[11px]">
              <tr>
                <th class="px-4 py-2.5">ASSET</th>
                <th class="px-4 py-2.5 text-right">QUANTITY</th>
                <th class="px-4 py-2.5 text-right">AVG BUY</th>
                <th class="px-4 py-2.5 text-right">CURRENT PRICE</th>
                <th class="px-4 py-2.5 text-right">TOTAL VALUE</th>
                <th class="px-4 py-2.5 text-right">UNREALIZED PnL</th>
                <th class="px-4 py-2.5 text-center">ACTION</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-terminal-border/50">
              <tr v-if="holdingsList.length === 0">
                <td colspan="7" class="px-4 py-8 text-center text-terminal-muted">
                  No active holdings. Go to the Terminal to execute orders.
                </td>
              </tr>
              <tr
                v-for="h in holdingsList"
                :key="h.symbol"
                class="hover:bg-terminal-surface/40 transition"
              >
                <td class="px-4 py-3">
                  <div class="flex items-center space-x-2">
                    <AssetIcon :symbol="h.symbol" :size="22" />
                    <div>
                      <div class="font-bold text-white">{{ h.symbol }}</div>
                      <div class="text-[10px] text-terminal-muted">{{ h.assetName }}</div>
                    </div>
                  </div>
                </td>
                <td class="px-4 py-3 text-right font-medium">{{ h.quantity.toFixed(4) }}</td>
                <td class="px-4 py-3 text-right text-terminal-muted">${{ h.average_buy_price.toFixed(2) }}</td>
                <td class="px-4 py-3 text-right text-white font-semibold">${{ h.currentPrice.toFixed(2) }}</td>
                <td class="px-4 py-3 text-right text-white font-bold">{{ formatCurrency(h.marketValue) }}</td>
                <td
                  class="px-4 py-3 text-right font-bold"
                  :class="h.pnl >= 0 ? 'text-cyber-green' : 'text-cyber-red'"
                >
                  <div>{{ h.pnl >= 0 ? '+' : '' }}{{ formatCurrency(h.pnl) }}</div>
                  <div class="text-[10px]">({{ h.pnl >= 0 ? '+' : '' }}{{ h.pnlPct.toFixed(2) }}%)</div>
                </td>
                <td class="px-4 py-3 text-center">
                  <button
                    @click="store.selectAsset(h.symbol); store.activeTab = 'terminal'"
                    class="px-2.5 py-1 rounded bg-terminal-surface hover:bg-terminal-border text-cyber-blue font-sans text-xs transition"
                  >
                    Trade
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Recent Transactions Ledger -->
      <div class="cyber-panel rounded overflow-hidden">
        <div class="px-4 py-3 border-b border-terminal-border flex items-center justify-between">
          <h3 class="text-sm font-bold text-white tracking-wider">TRADE EXECUTION HISTORY</h3>
          <span class="text-xs text-terminal-muted">{{ summary?.recent_transactions.length ?? 0 }} Transactions</span>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs num-mono">
            <thead class="bg-terminal-surface text-terminal-muted border-b border-terminal-border text-[11px]">
              <tr>
                <th class="px-4 py-2">TIME</th>
                <th class="px-4 py-2">SIDE</th>
                <th class="px-4 py-2">ASSET</th>
                <th class="px-4 py-2 text-right">QTY</th>
                <th class="px-4 py-2 text-right">EXEC PRICE</th>
                <th class="px-4 py-2 text-right">FEE</th>
                <th class="px-4 py-2 text-right">TOTAL</th>
                <th class="px-4 py-2 text-right">REALIZED PnL</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-terminal-border/50">
              <tr v-if="!summary?.recent_transactions?.length">
                <td colspan="8" class="px-4 py-6 text-center text-terminal-muted">
                  No trade history yet.
                </td>
              </tr>
              <tr
                v-for="tx in summary?.recent_transactions ?? []"
                :key="tx.id"
                class="hover:bg-terminal-surface/30"
              >
                <td class="px-4 py-2.5 text-terminal-muted">{{ formatDate(tx.timestamp) }}</td>
                <td class="px-4 py-2.5">
                  <span
                    :class="tx.side === 'Buy' ? 'text-cyber-green bg-cyber-green/10 border-cyber-green/30' : 'text-cyber-red bg-cyber-red/10 border-cyber-red/30'"
                    class="px-1.5 py-0.5 rounded text-[10px] font-bold border uppercase"
                  >
                    {{ tx.side }}
                  </span>
                </td>
                <td class="px-4 py-2.5 font-bold text-white">{{ tx.symbol }}</td>
                <td class="px-4 py-2.5 text-right">{{ tx.quantity.toFixed(4) }}</td>
                <td class="px-4 py-2.5 text-right">${{ tx.price.toFixed(2) }}</td>
                <td class="px-4 py-2.5 text-right text-terminal-muted">${{ tx.fee.toFixed(2) }}</td>
                <td class="px-4 py-2.5 text-right font-semibold text-white">{{ formatCurrency(tx.total) }}</td>
                <td
                  class="px-4 py-2.5 text-right font-bold"
                  :class="
                    tx.realized_pnl !== null && tx.realized_pnl !== undefined
                      ? tx.realized_pnl >= 0 ? 'text-cyber-green' : 'text-cyber-red'
                      : 'text-terminal-muted'
                  "
                >
                  {{
                    tx.realized_pnl !== null && tx.realized_pnl !== undefined
                      ? `${tx.realized_pnl >= 0 ? '+' : ''}${formatCurrency(tx.realized_pnl)}`
                      : '-'
                  }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>
