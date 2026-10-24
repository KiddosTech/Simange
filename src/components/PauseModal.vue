<script setup lang="ts">
import { useGameStore } from '../stores/gameStore';

const store = useGameStore();

function handleResume() {
  store.togglePause();
}

async function handleSave() {
  await store.saveCurrentGame();
}

function handleQuit() {
  store.inGame = false;
  store.isPaused = false;
  store.showPauseModal = false;
}
</script>

<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm select-none p-4">
    <div class="w-full max-w-md cyber-panel border-2 border-cyber-blue p-6 rounded-lg shadow-glow-blue space-y-6">
      <div class="text-center">
        <h2 class="text-2xl font-bold text-white tracking-widest uppercase">SIMULATION PAUSED</h2>
        <p class="text-xs text-terminal-muted mt-1 font-mono">Simange Core Engine Suspended</p>
      </div>

      <div class="space-y-3 font-mono">
        <button
          @click="handleResume"
          class="w-full py-3 rounded bg-cyber-blue text-black font-bold uppercase tracking-wider hover:bg-cyber-blue/90 transition shadow-glow-blue"
        >
          Resume (ESC)
        </button>

        <button
          @click="handleSave"
          class="w-full py-3 rounded bg-terminal-surface border border-terminal-border text-white font-bold uppercase tracking-wider hover:border-cyber-green hover:text-cyber-green transition"
        >
          Save Simulation State
        </button>

        <div class="grid grid-cols-2 gap-3">
          <button
            @click="store.toggleSound()"
            class="py-2.5 rounded bg-terminal-surface border border-terminal-border text-xs text-terminal-text hover:text-white transition"
          >
            SFX: {{ store.soundEnabled ? 'ON' : 'OFF' }}
          </button>
          <button
            @click="store.toggleScanlines()"
            class="py-2.5 rounded bg-terminal-surface border border-terminal-border text-xs text-terminal-text hover:text-white transition"
          >
            CRT: {{ store.scanlinesEnabled ? 'ON' : 'OFF' }}
          </button>
        </div>

        <button
          @click="handleQuit"
          class="w-full py-2.5 rounded bg-cyber-red/10 border border-cyber-red/40 text-cyber-red font-bold uppercase tracking-wider hover:bg-cyber-red hover:text-white transition text-xs"
        >
          Quit to Main Menu
        </button>
      </div>
    </div>
  </div>
</template>
