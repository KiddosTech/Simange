<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';
import { useGameStore } from './stores/gameStore';
import HeaderBar from './components/HeaderBar.vue';
import MainMenu from './components/MainMenu.vue';
import AssetSelector from './components/AssetSelector.vue';
import TerminalChart from './components/TerminalChart.vue';
import OrderBook from './components/OrderBook.vue';
import TradeExecution from './components/TradeExecution.vue';
import PortfolioTab from './components/PortfolioTab.vue';
import NewsFeedTab from './components/NewsFeedTab.vue';
import BankLoansTab from './components/BankLoansTab.vue';
import RankLeaderboard from './components/RankLeaderboard.vue';
import PauseModal from './components/PauseModal.vue';

const store = useGameStore();

function handleKeyDown(e: KeyboardEvent) {
  // ESC key for pause
  if (e.key === 'Escape') {
    if (store.inGame) {
      store.togglePause();
    }
    return;
  }

  // Hotkeys only active when in game and not typing in input
  const targetTag = (e.target as HTMLElement)?.tagName?.toLowerCase();
  if (targetTag === 'input' || targetTag === 'textarea') {
    return;
  }

  if (store.inGame) {
    if (e.key === '1') store.activeTab = 'terminal';
    if (e.key === '2') store.activeTab = 'portfolio';
    if (e.key === '3') store.activeTab = 'news';
    if (e.key === '4') store.activeTab = 'bank';
    if (e.key === '5') store.activeTab = 'ranks';
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown);
});
</script>

<template>
  <div :class="['h-screen w-screen flex flex-col bg-terminal-bg text-terminal-text overflow-hidden relative', { 'crt-overlay': store.scanlinesEnabled }]">
    <!-- Notification Toast -->
    <transition name="fade">
      <div
        v-if="store.notification"
        class="fixed top-3 right-4 z-50 flex items-center space-x-2 px-4 py-2.5 rounded shadow-lg border text-xs font-mono font-semibold"
        :class="[
          store.notification.type === 'success'
            ? 'bg-terminal-panel border-cyber-green text-cyber-green shadow-glow-green'
            : store.notification.type === 'error'
            ? 'bg-terminal-panel border-cyber-red text-cyber-red shadow-glow-red'
            : 'bg-terminal-panel border-cyber-blue text-cyber-blue shadow-glow-blue'
        ]"
      >
        <span>{{ store.notification.message }}</span>
      </div>
    </transition>

    <!-- Main Menu Screen (when game is not running) -->
    <MainMenu v-if="!store.inGame" />

    <!-- In-Game Layout -->
    <template v-else>
      <!-- Top Navigation & Stats Bar -->
      <HeaderBar />

      <!-- Main Content Area -->
      <main class="flex-1 flex overflow-hidden">
        <!-- Tab 1: Terminal Market Trading -->
        <template v-if="store.activeTab === 'terminal'">
          <AssetSelector />
          <TerminalChart />
          <OrderBook />
          <TradeExecution />
        </template>

        <!-- Tab 2: Portfolio & Positions -->
        <PortfolioTab v-else-if="store.activeTab === 'portfolio'" />

        <!-- Tab 3: News Feed & Hype Stream -->
        <NewsFeedTab v-else-if="store.activeTab === 'news'" />

        <!-- Tab 4: Central Credit Bank -->
        <BankLoansTab v-else-if="store.activeTab === 'bank'" />

        <!-- Tab 5: Rank Progression & Leaderboard -->
        <RankLeaderboard v-else-if="store.activeTab === 'ranks'" />
      </main>

      <!-- Pause Menu Modal (Triggered by ESC) -->
      <PauseModal v-if="store.showPauseModal" />
    </template>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
