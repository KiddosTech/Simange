<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useGameStore } from '../stores/gameStore';
import { musicPlayer } from '../utils/musicPlayer';
import AssetIcon from './AssetIcon.vue';
import type { GameModeType } from '../types';

const store = useGameStore();

const showModeModal = ref(false);
const showCustomModal = ref(false);
const showRanksModal = ref(false);
const showSettingsModal = ref(false);
const showCeoModal = ref(false);

// Music state
const isMusicPlaying = ref(false);
const musicVolume = ref(0.45);

// Video background selection
const currentVideo = ref<string>('/video/stock_exchange.mp4');

const videoOptions = [
  { label: 'Trading Floor', src: '/video/stock_exchange.mp4' },
  { label: 'Cyber Matrix', src: '/video/cyber_matrix.mp4' },
  { label: 'Minimal Grid', src: '' },
];

function toggleSoundtrack() {
  isMusicPlaying.value = musicPlayer.toggle();
}

function updateVolume() {
  musicPlayer.setVolume(musicVolume.value);
}

// Custom mode form state
const customCash = ref<number>(50000);
const customVolatility = ref<number>(1.5);
const selectedCustomAssets = ref<string[]>([
  'byte',
  'aeth',
  'pear',
  'mhd',
  'tslax',
  'pixl',
  'goog',
  'mate',
]);

const allAssetsList = [
  // Cryptos
  { id: 'byte', symbol: 'BYTE', name: 'Bytecoin', type: 'Crypto' },
  { id: 'aeth', symbol: 'AETH', name: 'Aethereum', type: 'Crypto' },
  { id: 'sola', symbol: 'SOLA', name: 'Solona', type: 'Crypto' },
  { id: 'meow', symbol: 'MEOW', name: 'MeowCoin', type: 'Crypto' },
  { id: 'usdf', symbol: 'USDF', name: 'USD-Fake', type: 'Crypto' },
  // Core Stocks
  { id: 'pear', symbol: 'PEAR', name: 'Pear Inc.', type: 'Stock' },
  { id: 'mhd', symbol: 'MHD', name: 'MicroHard', type: 'Stock' },
  { id: 'tslax', symbol: 'TSLA-X', name: 'MuskCar', type: 'Stock' },
  { id: 'pixl', symbol: 'PIXL', name: 'Nvidiot', type: 'Stock' },
  // New Companies
  { id: 'goog', symbol: 'GOOG', name: 'Googol', type: 'Stock' },
  { id: 'mate', symbol: 'MATE', name: 'Mate', type: 'Stock' },
  { id: 'xomm', symbol: 'XOMM', name: 'XennonMobile', type: 'Stock' },
  { id: 'msm', symbol: 'MS-M', name: 'Sergei Manly', type: 'Stock' },
  { id: 'bae', symbol: 'BA-E', name: 'Baeing', type: 'Stock' },
  { id: 'ccn', symbol: 'CCN', name: 'CCN', type: 'Stock' },
  { id: 'ambk', symbol: 'AMBK', name: 'American Bank', type: 'Stock' },
  { id: 'bcly', symbol: 'BCLY', name: 'Boreclay', type: 'Stock' },
];

const ceoList = [
  {
    name: 'Willy Bate',
    realParody: 'Bill Gates',
    role: 'Chief Architect & Sovereign Founder',
    company: 'MicroHard (MHD)',
    image: '/ceo/willy_bate.jpg',
    netWorth: '$135,000,000,000',
    influence: 'Enterprise software ubiquity and cloud AI datacenter monopolization.',
  },
  {
    name: 'Elon Mowsk',
    realParody: 'Elon Musk',
    role: 'Techno-King & Doge Emperor',
    company: 'MuskCar (TSLA-X) & MeowCoin (MEOW)',
    image: '/ceo/elon_mowsk.jpg',
    netWorth: '$240,000,000,000',
    influence: 'Autonomous EV humanoid robots and volatile 3:00 AM meme coin market shocks.',
  },
  {
    name: 'John Ternas',
    realParody: 'John Ternus',
    role: 'Hardware Engineering Tsar',
    company: 'Pear Inc. (PEAR)',
    image: '/ceo/john_ternas.jpg',
    netWorth: '$850,000,000',
    influence: 'Titanium micro-architecture and designer ecosystem lock-in.',
  },
  {
    name: 'James Huang',
    realParody: 'Jensen Huang',
    role: 'Leather Jacket CEO & GPU Overlord',
    company: 'Nvidiot (PIXL)',
    image: '/ceo/james_huang.jpg',
    netWorth: '$110,000,000,000',
    influence: 'Monopolistic GPU silicon clusters fueling the global AI compute arms race.',
  },
];

onMounted(() => {
  store.checkSaveFile();
  // Auto-init music player
  musicPlayer.init();
});

function handleModeSelect(mode: GameModeType) {
  if (mode === 'Custom') {
    showModeModal.value = false;
    showCustomModal.value = true;
  } else {
    showModeModal.value = false;
    store.startNewGame(mode);
  }
}

function handleStartCustom() {
  showCustomModal.value = false;
  store.startNewGame('Custom', {
    startingCash: customCash.value,
    volatility: customVolatility.value,
    assets: selectedCustomAssets.value,
  });
}
</script>

<template>
  <div class="h-full w-full flex flex-col items-center justify-center bg-terminal-bg relative select-none overflow-hidden p-6">
    <!-- Live Video Background Layer -->
    <video
      v-if="currentVideo"
      :key="currentVideo"
      autoplay
      loop
      muted
      playsinline
      class="absolute inset-0 w-full h-full object-cover opacity-25 filter contrast-125 brightness-75 pointer-events-none"
    >
      <source :src="currentVideo" type="video/mp4" />
    </video>

    <!-- Dark Vignette & Cyber Grid Overlay -->
    <div class="absolute inset-0 bg-gradient-to-t from-terminal-bg via-terminal-bg/70 to-terminal-bg/90 pointer-events-none"></div>
    <div class="absolute inset-0 bg-[radial-gradient(#1f293d_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none"></div>

    <!-- Top Utility Bar: Video Selector & Soundtrack Controls -->
    <div class="absolute top-4 right-4 z-20 flex items-center space-x-3 text-xs font-mono">
      <!-- Video BG Switcher -->
      <div class="flex items-center space-x-1 bg-terminal-panel/90 border border-terminal-border p-1 rounded-md backdrop-blur-md">
        <span class="text-terminal-muted px-1.5 text-[10px]">VIDEO:</span>
        <button
          v-for="v in videoOptions"
          :key="v.label"
          @click="currentVideo = v.src"
          :class="[
            'px-2 py-0.5 rounded text-[10px] font-semibold transition',
            currentVideo === v.src ? 'bg-cyber-blue text-black font-bold' : 'text-terminal-muted hover:text-white'
          ]"
        >
          {{ v.label }}
        </button>
      </div>

      <!-- Soundtrack Audio Player -->
      <div class="flex items-center space-x-2 bg-terminal-panel/90 border border-terminal-border px-3 py-1.5 rounded-md backdrop-blur-md">
        <button
          @click="toggleSoundtrack"
          class="flex items-center space-x-1.5 text-xs font-bold transition"
          :class="isMusicPlaying ? 'text-cyber-green' : 'text-terminal-muted hover:text-white'"
        >
          <!-- Animated sound waves if playing -->
          <div v-if="isMusicPlaying" class="flex items-end space-x-0.5 h-3">
            <span class="w-0.5 bg-cyber-green animate-pulse h-2"></span>
            <span class="w-0.5 bg-cyber-green animate-pulse h-3"></span>
            <span class="w-0.5 bg-cyber-green animate-pulse h-1.5"></span>
          </div>
          <span v-else>▶</span>
          <span>OST: {{ isMusicPlaying ? 'PLAYING' : 'MUTED' }}</span>
        </button>

        <input
          v-if="isMusicPlaying"
          v-model.number="musicVolume"
          @input="updateVolume"
          type="range"
          min="0"
          max="1"
          step="0.05"
          class="w-16 accent-cyber-green h-1 cursor-pointer"
          title="Music Volume"
        />
      </div>
    </div>

    <!-- Center Main Menu Content -->
    <div class="max-w-md w-full relative z-10 space-y-7 text-center">
      <!-- Brand & Title -->
      <div class="space-y-2">
        <div class="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyber-blue/15 border border-cyber-blue/40 text-cyber-blue text-xs font-mono font-semibold tracking-wider shadow-glow-blue">
          <span class="w-2 h-2 rounded-full bg-cyber-blue animate-ping"></span>
          <span>HIGH-FREQUENCY TRADING TERMINAL // GPL-3.0</span>
        </div>
        <h1 class="text-6xl font-black tracking-widest text-white drop-shadow-[0_0_35px_rgba(0,229,255,0.5)] font-mono">
          SIMANGE
        </h1>
        <p class="text-xs text-terminal-muted font-mono tracking-widest uppercase">
          Simulation of Exchange // Global Parody Markets
        </p>
      </div>

      <!-- Main Action Buttons -->
      <div class="space-y-3 font-mono">
        <button
          @click="showModeModal = true"
          class="w-full py-4 rounded-lg bg-cyber-blue text-black font-bold uppercase tracking-wider hover:bg-cyber-blue/90 transition shadow-glow-blue text-sm flex items-center justify-center space-x-2 group"
        >
          <span class="group-hover:translate-x-1 transition">START NEW SIMULATION</span>
          <span>→</span>
        </button>

        <button
          @click="store.loadSavedGame"
          :disabled="!store.hasSaveFile"
          class="w-full py-3.5 rounded-lg cyber-panel border border-terminal-border text-white font-semibold uppercase tracking-wider hover:border-cyber-green hover:text-cyber-green disabled:opacity-30 disabled:pointer-events-none transition text-sm flex items-center justify-center space-x-2"
        >
          <span>CONTINUE LAST SESSION</span>
          <span v-if="store.hasSaveFile" class="text-cyber-green font-mono text-xs">(SAVED)</span>
        </button>

        <!-- CEO Dossier Button -->
        <button
          @click="showCeoModal = true"
          class="w-full py-3 rounded-lg cyber-panel border border-cyber-amber/50 text-cyber-amber font-semibold uppercase tracking-wider hover:border-cyber-amber hover:bg-cyber-amber/10 transition text-xs flex items-center justify-center space-x-2"
        >
          <span>👑</span>
          <span>CEO INSIDERS & MARKET WHALES</span>
        </button>

        <div class="grid grid-cols-2 gap-3">
          <button
            @click="showRanksModal = true"
            class="py-3 rounded-lg cyber-panel border border-terminal-border text-terminal-text font-semibold uppercase tracking-wider hover:border-terminal-highlight hover:text-white transition text-xs"
          >
            Ranks & Perks
          </button>

          <button
            @click="showSettingsModal = true"
            class="py-3 rounded-lg cyber-panel border border-terminal-border text-terminal-muted font-semibold uppercase tracking-wider hover:border-terminal-highlight hover:text-white transition text-xs"
          >
            Settings
          </button>
        </div>
      </div>

      <!-- Quick Ticker Marquee Preview -->
      <div class="cyber-panel p-2.5 rounded-md border border-terminal-border/80 flex items-center justify-center space-x-3 overflow-hidden text-xs num-mono">
        <div class="flex items-center space-x-1.5 text-cyber-green">
          <AssetIcon symbol="BYTE" :size="16" />
          <span class="font-bold">BYTE</span>
          <span>$68,450</span>
        </div>
        <span class="text-terminal-border">•</span>
        <div class="flex items-center space-x-1.5 text-cyber-blue">
          <AssetIcon symbol="GOOG" :size="16" />
          <span class="font-bold">GOOG</span>
          <span>$178.40</span>
        </div>
        <span class="text-terminal-border">•</span>
        <div class="flex items-center space-x-1.5 text-cyber-amber">
          <AssetIcon symbol="TSLA-X" :size="16" />
          <span class="font-bold">TSLA-X</span>
          <span>$262.30</span>
        </div>
      </div>

      <!-- Footer Info -->
      <div class="text-[11px] text-terminal-muted space-y-1">
        <div>17 Parody Equities & Cryptos • Real-Time Order Book Engine</div>
        <div>Licensed under GNU General Public License v3.0 (FOSS)</div>
      </div>
    </div>

    <!-- CEO Insiders Dossier Modal -->
    <div
      v-if="showCeoModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4"
    >
      <div class="max-w-3xl w-full cyber-panel border-2 border-cyber-amber p-6 rounded-lg shadow-glow-amber space-y-5 max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between border-b border-terminal-border pb-3">
          <div>
            <h2 class="text-xl font-bold text-white tracking-wider flex items-center space-x-2">
              <span class="text-cyber-amber">★</span>
              <span>CEO LEADERSHIP ROSTER & INSIDER INTEL</span>
            </h2>
            <p class="text-xs text-terminal-muted">Track the top billionaire movers behind corporate and meme coin market shocks.</p>
          </div>
          <button @click="showCeoModal = false" class="text-terminal-muted hover:text-white text-lg">✕</button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div
            v-for="ceo in ceoList"
            :key="ceo.name"
            class="cyber-panel p-4 rounded-lg border border-terminal-border hover:border-cyber-amber transition space-y-3"
          >
            <div class="flex items-start space-x-4">
              <img
                :src="ceo.image"
                :alt="ceo.name"
                class="w-20 h-20 rounded-lg object-cover border-2 border-cyber-amber shadow-glow-amber flex-shrink-0"
              />
              <div class="space-y-1 min-w-0">
                <div class="flex items-center space-x-2">
                  <h3 class="font-bold text-white text-base truncate">{{ ceo.name }}</h3>
                </div>
                <div class="text-[11px] text-terminal-muted italic">Parody of {{ ceo.realParody }}</div>
                <div class="text-xs font-semibold text-cyber-blue">{{ ceo.company }}</div>
                <div class="text-xs text-cyber-green font-mono font-bold">{{ ceo.netWorth }}</div>
              </div>
            </div>
            <div class="border-t border-terminal-border pt-2 text-xs text-terminal-text">
              <span class="text-terminal-muted text-[10px] block uppercase font-mono">Market Influence:</span>
              <span>{{ ceo.influence }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Mode Selection Modal -->
    <div
      v-if="showModeModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4"
    >
      <div class="max-w-2xl w-full cyber-panel border border-cyber-blue p-6 rounded-lg shadow-glow-blue space-y-5">
        <div class="flex items-center justify-between border-b border-terminal-border pb-3">
          <h2 class="text-lg font-bold text-white tracking-wider">SELECT SIMULATION MODE</h2>
          <button @click="showModeModal = false" class="text-terminal-muted hover:text-white text-sm">✕</button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Stock Mode -->
          <div
            @click="handleModeSelect('StockExchange')"
            class="cyber-panel p-4 rounded hover:border-cyber-blue cursor-pointer transition space-y-2 group"
          >
            <div class="flex items-center justify-between">
              <span class="font-bold text-white group-hover:text-cyber-blue">Stock Exchange Mode</span>
              <span class="text-[10px] px-1.5 py-0.5 rounded bg-terminal-surface text-cyber-green font-mono">12 STOCKS</span>
            </div>
            <p class="text-xs text-terminal-text">
              Trade Pear, MicroHard, MuskCar, Nvidiot, Googol, Mate, XennonMobile, Sergei Manly, Baeing, CCN, American Bank & Boreclay. Slower macro pace, quarterly earnings & dividends.
            </p>
            <div class="text-[11px] text-terminal-muted num-mono">Starting Capital: $25,000</div>
          </div>

          <!-- Crypto Mode -->
          <div
            @click="handleModeSelect('Cryptocurrency')"
            class="cyber-panel p-4 rounded hover:border-cyber-amber cursor-pointer transition space-y-2 group"
          >
            <div class="flex items-center justify-between">
              <span class="font-bold text-white group-hover:text-cyber-amber">Cryptocurrency Mode</span>
              <span class="text-[10px] px-1.5 py-0.5 rounded bg-terminal-surface text-cyber-amber font-mono">5 CRYPTOS</span>
            </div>
            <p class="text-xs text-terminal-text">
              24/7 hyper-volatility. Trade Bytecoin, Aethereum, Solona, MeowCoin & USD-Fake. Driven by social media pump & dump FUD.
            </p>
            <div class="text-[11px] text-terminal-muted num-mono">Starting Capital: $10,000</div>
          </div>

          <!-- Test Mode -->
          <div
            @click="handleModeSelect('Test')"
            class="cyber-panel p-4 rounded hover:border-cyber-green cursor-pointer transition space-y-2 group"
          >
            <div class="flex items-center justify-between">
              <span class="font-bold text-white group-hover:text-cyber-green">Test Mode (Sandbox)</span>
              <span class="text-[10px] px-1.5 py-0.5 rounded bg-terminal-surface text-cyber-purple font-mono">ALL 17 ASSETS</span>
            </div>
            <p class="text-xs text-terminal-text">
              Unlimited cash ($100,000,000). All cryptos and all 12 corporate stocks active simultaneously. Fast-forward up to 5x.
            </p>
            <div class="text-[11px] text-terminal-muted num-mono">Starting Capital: $100M (Infinite)</div>
          </div>

          <!-- Custom Mode -->
          <div
            @click="handleModeSelect('Custom')"
            class="cyber-panel p-4 rounded hover:border-white cursor-pointer transition space-y-2 group"
          >
            <div class="flex items-center justify-between">
              <span class="font-bold text-white group-hover:text-white">Custom Mode</span>
              <span class="text-[10px] px-1.5 py-0.5 rounded bg-terminal-surface text-terminal-muted font-mono">CUSTOM</span>
            </div>
            <p class="text-xs text-terminal-text">
              Customize starting capital, volatility multipliers, and toggle which specific assets appear on your terminal.
            </p>
            <div class="text-[11px] text-terminal-muted num-mono">Fully Configurable</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Custom Mode Config Modal -->
    <div
      v-if="showCustomModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4"
    >
      <div class="max-w-xl w-full cyber-panel border border-terminal-highlight p-6 rounded-lg space-y-5 max-h-[85vh] overflow-y-auto">
        <div class="flex items-center justify-between border-b border-terminal-border pb-3">
          <h2 class="text-lg font-bold text-white tracking-wider">CUSTOM SIMULATION CONFIG</h2>
          <button @click="showCustomModal = false" class="text-terminal-muted hover:text-white text-sm">✕</button>
        </div>

        <div class="space-y-4 text-xs">
          <!-- Starting cash -->
          <div>
            <label class="block text-terminal-muted mb-1">STARTING CASH ($)</label>
            <input
              v-model.number="customCash"
              type="number"
              step="5000"
              class="w-full bg-terminal-bg border border-terminal-border rounded px-3 py-2 text-white font-mono focus:border-cyber-blue outline-none"
            />
          </div>

          <!-- Volatility multiplier slider -->
          <div>
            <div class="flex justify-between mb-1">
              <label class="text-terminal-muted">VOLATILITY MULTIPLIER</label>
              <span class="text-cyber-amber font-mono font-bold">{{ customVolatility.toFixed(1) }}x</span>
            </div>
            <input
              v-model.number="customVolatility"
              type="range"
              min="0.2"
              max="5.0"
              step="0.1"
              class="w-full accent-cyber-blue cursor-pointer"
            />
          </div>

          <!-- Asset Toggles -->
          <div>
            <label class="block text-terminal-muted mb-2">ACTIVE ASSETS ({{ selectedCustomAssets.length }} SELECTED)</label>
            <div class="grid grid-cols-2 md:grid-cols-3 gap-2">
              <label
                v-for="asset in allAssetsList"
                :key="asset.id"
                class="flex items-center space-x-2 cursor-pointer p-2 rounded bg-terminal-surface hover:bg-terminal-border/60 transition"
              >
                <input
                  type="checkbox"
                  :value="asset.id"
                  v-model="selectedCustomAssets"
                  class="accent-cyber-blue rounded"
                />
                <AssetIcon :symbol="asset.symbol" :size="18" />
                <div class="truncate">
                  <span class="text-white font-bold block leading-none">{{ asset.symbol }}</span>
                  <span class="text-[9px] text-terminal-muted leading-none">{{ asset.name }}</span>
                </div>
              </label>
            </div>
          </div>
        </div>

        <button
          @click="handleStartCustom"
          class="w-full py-3.5 rounded bg-cyber-blue text-black font-bold uppercase tracking-wider hover:bg-cyber-blue/90 transition shadow-glow-blue text-xs font-mono"
        >
          Launch Custom Simulation
        </button>
      </div>
    </div>

    <!-- Ranks Modal -->
    <div
      v-if="showRanksModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4"
    >
      <div class="max-w-2xl w-full cyber-panel border border-terminal-border p-6 rounded-lg space-y-4 max-h-[85vh] overflow-y-auto">
        <div class="flex items-center justify-between border-b border-terminal-border pb-3">
          <h2 class="text-lg font-bold text-white tracking-wider">RANK PROGRESSION SYSTEM</h2>
          <button @click="showRanksModal = false" class="text-terminal-muted hover:text-white text-sm">✕</button>
        </div>

        <div class="space-y-3 text-xs">
          <div class="cyber-panel p-3 rounded border border-gray-600">
            <h4 class="font-bold text-gray-400 text-sm">1. Retail Noob (&lt; $15,000)</h4>
            <p class="text-terminal-muted mt-0.5">Base trading fee 0.25%. Limited bank loan lines.</p>
          </div>
          <div class="cyber-panel p-3 rounded border border-blue-500">
            <h4 class="font-bold text-blue-400 text-sm">2. Day Trader Kids ($15,000 - $50,000)</h4>
            <p class="text-terminal-muted mt-0.5">Fee discounted to 0.20%. Unlocks 2x Margin trading.</p>
          </div>
          <div class="cyber-panel p-3 rounded border border-emerald-500">
            <h4 class="font-bold text-emerald-400 text-sm">3. Wall Street Wannabe ($50,000 - $250,000)</h4>
            <p class="text-terminal-muted mt-0.5">Fee discounted to 0.15%. Bank credit line up to $100,000.</p>
          </div>
          <div class="cyber-panel p-3 rounded border border-amber-500">
            <h4 class="font-bold text-amber-400 text-sm">4. Market Chad ($250,000 - $1,000,000)</h4>
            <p class="text-terminal-muted mt-0.5">VIP Dark Pool execution. Low 0.08% maker fee.</p>
          </div>
          <div class="cyber-panel p-3 rounded border border-purple-500">
            <h4 class="font-bold text-purple-400 text-sm">5. Crypto Whale ($1,000,000 - $10,000,000)</h4>
            <p class="text-terminal-muted mt-0.5">Priority pump alerts. Market moving order volume capacity.</p>
          </div>
          <div class="cyber-panel p-3 rounded border border-cyber-green">
            <h4 class="font-bold text-cyber-green text-sm">6. Wall Street Legend (&gt; $10,000,000)</h4>
            <p class="text-terminal-muted mt-0.5">Zero trading fees. Infinite credit lines. Master of Markets.</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Settings Modal -->
    <div
      v-if="showSettingsModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4"
    >
      <div class="max-w-md w-full cyber-panel border border-terminal-border p-6 rounded-lg space-y-4">
        <div class="flex items-center justify-between border-b border-terminal-border pb-3">
          <h2 class="text-lg font-bold text-white tracking-wider">SETTINGS & LICENSE</h2>
          <button @click="showSettingsModal = false" class="text-terminal-muted hover:text-white text-sm">✕</button>
        </div>

        <div class="space-y-3 text-xs">
          <div class="flex items-center justify-between p-2 rounded bg-terminal-surface">
            <span>Sound Effects (SFX)</span>
            <button
              @click="store.toggleSound()"
              :class="store.soundEnabled ? 'text-cyber-green' : 'text-terminal-muted'"
              class="font-mono font-bold"
            >
              {{ store.soundEnabled ? 'ENABLED' : 'MUTED' }}
            </button>
          </div>

          <div class="flex items-center justify-between p-2 rounded bg-terminal-surface">
            <span>Soundtrack BGM</span>
            <button
              @click="toggleSoundtrack()"
              :class="isMusicPlaying ? 'text-cyber-green' : 'text-terminal-muted'"
              class="font-mono font-bold"
            >
              {{ isMusicPlaying ? 'PLAYING' : 'MUTED' }}
            </button>
          </div>

          <div class="flex items-center justify-between p-2 rounded bg-terminal-surface">
            <span>CRT Scanline Shader</span>
            <button
              @click="store.toggleScanlines()"
              :class="store.scanlinesEnabled ? 'text-cyber-green' : 'text-terminal-muted'"
              class="font-mono font-bold"
            >
              {{ store.scanlinesEnabled ? 'ENABLED' : 'DISABLED' }}
            </button>
          </div>

          <div class="p-3 rounded bg-terminal-surface/60 space-y-1.5 text-terminal-muted leading-relaxed">
            <div class="text-white font-semibold">Simange // Simulation of Exchange</div>
            <div>Free & Open Source Software licensed under GNU GPL v3.0.</div>
            <div>Automated multi-platform desktop release powered by Bun, Vite, Vue 3, and Tauri v2.</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
