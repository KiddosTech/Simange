<script setup lang="ts">
import { ref, computed } from 'vue';
import { useGameStore } from '../stores/gameStore';
import AssetIcon from './AssetIcon.vue';
import type { NewsImpact } from '../types';

const store = useGameStore();
const activeFilter = ref<'ALL' | NewsImpact>('ALL');

const filteredNews = computed(() => {
  if (activeFilter.value === 'ALL') return store.newsFeed;
  return store.newsFeed.filter((n) => n.impact === activeFilter.value);
});

function formatDate(ts: number): string {
  return new Date(ts * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}
</script>

<template>
  <div class="flex-1 bg-terminal-bg p-6 overflow-y-auto select-none">
    <div class="max-w-4xl mx-auto space-y-5">
      <!-- Title & Filters -->
      <div class="flex flex-wrap items-center justify-between gap-3 border-b border-terminal-border pb-4">
        <div>
          <h2 class="text-xl font-bold text-white tracking-wide">MARKET WIRE // HYPE & FUD STREAM</h2>
          <p class="text-xs text-terminal-muted">Real-time macro alerts, influencer posts, and regulatory leaks</p>
        </div>

        <div class="flex items-center space-x-1 bg-terminal-surface p-1 rounded border border-terminal-border text-xs">
          <button
            @click="activeFilter = 'ALL'"
            :class="[
              'px-3 py-1 rounded font-medium transition',
              activeFilter === 'ALL' ? 'bg-terminal-border text-white' : 'text-terminal-muted hover:text-white'
            ]"
          >
            ALL
          </button>
          <button
            @click="activeFilter = 'Bullish'"
            :class="[
              'px-3 py-1 rounded font-medium transition',
              activeFilter === 'Bullish' ? 'bg-cyber-green/20 text-cyber-green border border-cyber-green/40' : 'text-terminal-muted hover:text-white'
            ]"
          >
            BULLISH
          </button>
          <button
            @click="activeFilter = 'Bearish'"
            :class="[
              'px-3 py-1 rounded font-medium transition',
              activeFilter === 'Bearish' ? 'bg-cyber-red/20 text-cyber-red border border-cyber-red/40' : 'text-terminal-muted hover:text-white'
            ]"
          >
            BEARISH
          </button>
        </div>
      </div>

      <!-- Feed List -->
      <div class="space-y-3">
        <div
          v-if="filteredNews.length === 0"
          class="cyber-panel p-8 rounded text-center text-terminal-muted text-sm"
        >
          No news events matching this criteria yet. Market moves will trigger real-time bulletins.
        </div>

        <div
          v-for="item in filteredNews"
          :key="item.id"
          class="cyber-panel p-4 rounded hover:border-terminal-highlight transition space-y-3"
        >
          <div class="flex items-center justify-between text-xs">
            <div class="flex items-center space-x-2">
              <span class="font-mono text-terminal-muted">{{ formatDate(item.timestamp) }}</span>
              <span class="text-terminal-border">•</span>
              <span class="text-cyber-blue font-semibold uppercase">{{ item.source }}</span>
              <div
                v-if="item.affected_symbol"
                @click="store.selectAsset(item.affected_symbol); store.activeTab = 'terminal'"
                class="cursor-pointer flex items-center space-x-1.5 px-2 py-0.5 rounded bg-terminal-surface border border-terminal-border text-white font-bold hover:border-cyber-blue transition"
              >
                <AssetIcon :symbol="item.affected_symbol" :size="16" />
                <span>${{ item.affected_symbol }}</span>
              </div>
            </div>

            <!-- Impact Badge -->
            <span
              :class="[
                'px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider',
                item.impact === 'Bullish'
                  ? 'bg-cyber-green/15 text-cyber-green border border-cyber-green/30'
                  : item.impact === 'Bearish'
                  ? 'bg-cyber-red/15 text-cyber-red border border-cyber-red/30'
                  : 'bg-terminal-surface text-terminal-muted'
              ]"
            >
              {{ item.impact }} ({{ item.shock_magnitude >= 0 ? '+' : '' }}{{ (item.shock_magnitude * 100).toFixed(1) }}%)
            </span>
          </div>

          <!-- Main Content Area with Optional CEO Portrait -->
          <div class="flex items-start space-x-3.5">
            <div
              v-if="item.ceo_image"
              class="relative flex-shrink-0 group"
            >
              <img
                :src="item.ceo_image"
                :alt="item.ceo_name || 'CEO'"
                class="w-14 h-14 rounded-lg object-cover border-2 border-cyber-amber shadow-glow-amber"
              />
              <span class="absolute -bottom-1 -right-1 px-1 rounded bg-black/90 text-[9px] font-mono text-cyber-amber border border-cyber-amber">
                CEO
              </span>
            </div>

            <div class="space-y-1 flex-1">
              <div v-if="item.ceo_name" class="text-[11px] font-semibold text-cyber-amber flex items-center space-x-1">
                <span>INSIDER INTEL // {{ item.ceo_name }}</span>
              </div>
              <h3 class="text-base font-bold text-white leading-snug">{{ item.headline }}</h3>
              <p class="text-xs text-terminal-text leading-relaxed">{{ item.body }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
