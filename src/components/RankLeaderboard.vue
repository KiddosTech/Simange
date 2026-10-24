<script setup lang="ts">
import { computed } from 'vue';
import { useGameStore } from '../stores/gameStore';

const store = useGameStore();

const currentRank = computed(() => store.currentRank);
const netWorth = computed(() => store.netWorth);

const rankTiers = [
  {
    id: 'RetailNoob',
    title: 'Retail Noob',
    min: 0,
    max: 15000,
    color: '#6b7280',
    perk: 'Base trading fee 0.25%. Limited bank borrowing facilities. High slippage vulnerability.',
  },
  {
    id: 'DayTraderKids',
    title: 'Day Trader Kids',
    min: 15000,
    max: 50000,
    color: '#3b82f6',
    perk: 'Fee lowered to 0.20%. Unlocks 2x Margin trading options and basic technical charts.',
  },
  {
    id: 'WallStreetWannabe',
    title: 'Wall Street Wannabe',
    min: 50000,
    max: 250000,
    color: '#10b981',
    perk: 'Fee lowered to 0.15%. Bank credit line increased up to $100,000. Early insider rumor alerts.',
  },
  {
    id: 'MarketChad',
    title: 'Market Chad',
    min: 250000,
    max: 1000000,
    color: '#f59e0b',
    perk: 'Maker fee 0.08%. Unlocks VIP Dark Pool block execution and high-frequency order placement.',
  },
  {
    id: 'CryptoWhale',
    title: 'Crypto Whale',
    min: 1000000,
    max: 10000000,
    color: '#a855f7',
    perk: 'Fee 0.04%. Market-moving volume authority. Instant pump notifications and OTC settlement.',
  },
  {
    id: 'WallStreetLegend',
    title: 'Wall Street Legend',
    min: 10000000,
    max: null,
    color: '#00f796',
    perk: 'Zero trading fees. Infinite sovereign credit lines. Supreme master of global financial markets.',
  },
];

function formatCurrency(val: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(val);
}
</script>

<template>
  <div class="flex-1 bg-terminal-bg p-6 overflow-y-auto select-none">
    <div class="max-w-4xl mx-auto space-y-6">
      <!-- Top Status Banner -->
      <div class="cyber-panel p-6 rounded relative overflow-hidden">
        <div class="flex flex-wrap items-center justify-between gap-4">
          <div>
            <span class="text-xs text-terminal-muted uppercase tracking-wider block mb-1">CURRENT RANK STATUS</span>
            <h2 class="text-2xl font-bold text-white flex items-center space-x-3">
              <span
                class="w-3.5 h-3.5 rounded-full inline-block"
                :style="{ backgroundColor: currentRank?.badge_color, boxShadow: `0 0 12px ${currentRank?.badge_color}` }"
              ></span>
              <span>{{ currentRank?.title }}</span>
            </h2>
          </div>

          <div class="text-right num-mono">
            <span class="text-xs text-terminal-muted uppercase tracking-wider block mb-1">TOTAL NET WORTH</span>
            <span class="text-2xl font-bold text-cyber-blue">{{ formatCurrency(netWorth) }}</span>
          </div>
        </div>

        <!-- Progress to Next Tier -->
        <div class="mt-5 space-y-2">
          <div class="flex justify-between text-xs num-mono">
            <span class="text-terminal-muted">Tier Progress</span>
            <span class="text-white font-semibold">
              <template v-if="currentRank?.next_tier_needed">
                ${{ formatCurrency(currentRank.next_tier_needed) }} needed for next rank
              </template>
              <template v-else>
                MAX RANK REACHED
              </template>
            </span>
          </div>
          <div class="w-full h-3 rounded-full bg-terminal-bg border border-terminal-border overflow-hidden">
            <div
              class="h-full rounded-full transition-all duration-500"
              :style="{
                width: `${currentRank?.progress_pct ?? 0}%`,
                backgroundColor: currentRank?.badge_color ?? '#3b82f6',
                boxShadow: `0 0 10px ${currentRank?.badge_color ?? '#3b82f6'}`
              }"
            ></div>
          </div>
        </div>
      </div>

      <!-- Rank Ladder Tiers List -->
      <div class="space-y-3">
        <h3 class="text-sm font-bold text-white tracking-wider">RANK PROGRESSION & PERKS</h3>

        <div
          v-for="tier in rankTiers"
          :key="tier.id"
          :class="[
            'cyber-panel p-4 rounded transition border flex flex-col md:flex-row md:items-center justify-between gap-4',
            currentRank?.id === tier.id ? 'border-cyber-blue bg-terminal-surface/90 shadow-glow-blue' : 'hover:border-terminal-highlight'
          ]"
        >
          <div class="flex items-start space-x-3.5">
            <div
              class="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0"
              :style="{ backgroundColor: `${tier.color}20`, color: tier.color, border: `2px solid ${tier.color}` }"
            >
              ★
            </div>
            <div>
              <div class="flex items-center space-x-2">
                <h4 class="font-bold text-white text-base">{{ tier.title }}</h4>
                <span
                  v-if="currentRank?.id === tier.id"
                  class="text-[10px] px-2 py-0.5 rounded font-bold uppercase bg-cyber-blue text-black"
                >
                  YOU ARE HERE
                </span>
              </div>
              <p class="text-xs text-terminal-text mt-1 max-w-xl">{{ tier.perk }}</p>
            </div>
          </div>

          <div class="text-right num-mono flex-shrink-0">
            <span class="text-[11px] text-terminal-muted block">THRESHOLD</span>
            <span class="text-sm font-bold text-white">
              <template v-if="tier.max">
                {{ formatCurrency(tier.min) }} - {{ formatCurrency(tier.max) }}
              </template>
              <template v-else>
                &gt; {{ formatCurrency(tier.min) }}
              </template>
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
