<script setup lang="ts">
import { ref, computed } from 'vue';
import { useGameStore } from '../stores/gameStore';

const store = useGameStore();

const borrowAmount = ref<number>(1000);
const repayAmount = ref<number>(1000);

const bank = computed(() => store.portfolio?.bank);
const cash = computed(() => store.cash);

const availableCredit = computed(() => {
  if (!bank.value) return 0;
  return Math.max(0, bank.value.max_borrow_limit - bank.value.loan_balance);
});

function formatCurrency(val: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(val);
}

async function handleBorrow() {
  if (borrowAmount.value <= 0) return;
  await store.borrowMoney(borrowAmount.value);
}

async function handleRepay() {
  if (repayAmount.value <= 0) return;
  await store.repayMoney(repayAmount.value);
}
</script>

<template>
  <div class="flex-1 bg-terminal-bg p-6 overflow-y-auto select-none">
    <div class="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 class="text-xl font-bold text-white tracking-wide">CENTRAL CREDIT LINE & MARGIN BANK</h2>
        <p class="text-xs text-terminal-muted">Borrow capital to leverage positions or repay outstanding credit to avoid interest accrual.</p>
      </div>

      <!-- Bank Metric Cards -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 num-mono">
        <div class="cyber-panel p-4 rounded">
          <span class="text-xs text-terminal-muted block mb-1">LOAN BALANCE</span>
          <span class="text-xl font-bold text-cyber-red">{{ formatCurrency(bank?.loan_balance ?? 0) }}</span>
        </div>
        <div class="cyber-panel p-4 rounded">
          <span class="text-xs text-terminal-muted block mb-1">MAX CREDIT LIMIT</span>
          <span class="text-xl font-bold text-white">{{ formatCurrency(bank?.max_borrow_limit ?? 0) }}</span>
        </div>
        <div class="cyber-panel p-4 rounded">
          <span class="text-xs text-terminal-muted block mb-1">ANNUAL APR</span>
          <span class="text-xl font-bold text-cyber-amber">{{ ((bank?.interest_rate_apr ?? 0.065) * 100).toFixed(2) }}%</span>
        </div>
        <div class="cyber-panel p-4 rounded">
          <span class="text-xs text-terminal-muted block mb-1">DIVIDENDS EARNED</span>
          <span class="text-xl font-bold text-cyber-green">{{ formatCurrency(bank?.accumulated_dividends ?? 0) }}</span>
        </div>
      </div>

      <!-- Borrow & Repay Sections -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Borrow Panel -->
        <div class="cyber-panel p-5 rounded space-y-4">
          <h3 class="text-sm font-bold text-white tracking-wider flex items-center justify-between">
            <span>DRAWDOWN LOAN</span>
            <span class="text-xs text-terminal-muted font-mono font-normal">
              Avail: <span class="text-cyber-green">{{ formatCurrency(availableCredit) }}</span>
            </span>
          </h3>

          <div class="space-y-1">
            <label class="text-[11px] text-terminal-muted">AMOUNT TO BORROW ($)</label>
            <input
              v-model.number="borrowAmount"
              type="number"
              step="500"
              class="w-full bg-terminal-bg border border-terminal-border rounded px-3 py-2 text-white font-mono focus:border-cyber-blue outline-none text-sm"
            />
          </div>

          <!-- Quick presets -->
          <div class="grid grid-cols-4 gap-2">
            <button
              v-for="preset in [1000, 5000, 10000, availableCredit]"
              :key="preset"
              @click="borrowAmount = Math.min(preset, availableCredit)"
              class="py-1 rounded bg-terminal-surface hover:bg-terminal-border border border-terminal-border text-terminal-muted hover:text-white text-xs font-mono transition"
            >
              ${{ Math.round(preset).toLocaleString() }}
            </button>
          </div>

          <button
            @click="handleBorrow"
            :disabled="availableCredit <= 0 || borrowAmount > availableCredit"
            class="w-full py-2.5 rounded font-bold text-xs uppercase tracking-wider bg-cyber-blue text-black hover:bg-cyber-blue/90 disabled:opacity-40 transition shadow-glow-blue"
          >
            Confirm Loan Drawdown
          </button>
        </div>

        <!-- Repay Panel -->
        <div class="cyber-panel p-5 rounded space-y-4">
          <h3 class="text-sm font-bold text-white tracking-wider flex items-center justify-between">
            <span>REPAY DEBT</span>
            <span class="text-xs text-terminal-muted font-mono font-normal">
              Cash: <span class="text-cyber-green">{{ formatCurrency(cash) }}</span>
            </span>
          </h3>

          <div class="space-y-1">
            <label class="text-[11px] text-terminal-muted">AMOUNT TO REPAY ($)</label>
            <input
              v-model.number="repayAmount"
              type="number"
              step="500"
              class="w-full bg-terminal-bg border border-terminal-border rounded px-3 py-2 text-white font-mono focus:border-cyber-blue outline-none text-sm"
            />
          </div>

          <!-- Quick presets -->
          <div class="grid grid-cols-4 gap-2">
            <button
              v-for="p in [25, 50, 75, 100]"
              :key="p"
              @click="repayAmount = Math.min(cash, (bank?.loan_balance ?? 0) * (p / 100))"
              class="py-1 rounded bg-terminal-surface hover:bg-terminal-border border border-terminal-border text-terminal-muted hover:text-white text-xs font-mono transition"
            >
              {{ p }}%
            </button>
          </div>

          <button
            @click="handleRepay"
            :disabled="(bank?.loan_balance ?? 0) <= 0 || repayAmount <= 0"
            class="w-full py-2.5 rounded font-bold text-xs uppercase tracking-wider bg-cyber-green text-black hover:bg-cyber-green/90 disabled:opacity-40 transition shadow-glow-green"
          >
            Pay Loan Balance
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
