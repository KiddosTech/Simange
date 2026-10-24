import { defineStore } from 'pinia';
import type {
  Asset,
  GameModeType,
  NewsItem,
  OrderBook,
  OrderSide,
  OrderType,
  PortfolioSummary,
  RankInfo,
  Transaction,
} from '../types';
import { soundManager } from '../utils/sound';
import {
  BrowserSimulationEngine,
  computeRank,
  isTauriEnvironment,
} from './browserEngine';

let browserEngineInstance: BrowserSimulationEngine | null = null;

// Safe Tauri Core Invoker with fallback for browser development
async function tauriInvoke<T>(command: string, args: Record<string, unknown> = {}): Promise<T> {
  if (!isTauriEnvironment()) {
    throw new Error('Not running inside Tauri desktop runtime');
  }

  const tauri = (window as unknown as { __TAURI__?: { core?: { invoke: (cmd: string, args: Record<string, unknown>) => Promise<T> } } });
  if (tauri.__TAURI__?.core?.invoke) {
    return await tauri.__TAURI__.core.invoke(command, args);
  }
  const { invoke } = await import('@tauri-apps/api/core');
  return await invoke(command, args);
}

export const useGameStore = defineStore('game', {
  state: () => ({
    inGame: false,
    activeTab: 'terminal' as 'terminal' | 'portfolio' | 'news' | 'bank' | 'ranks',
    isPaused: false,
    showPauseModal: false,
    showLeaderboardModal: false,
    showSettingsModal: false,
    assets: [] as Asset[],
    selectedSymbol: 'BYTE',
    orderBook: null as OrderBook | null,
    portfolio: null as PortfolioSummary | null,
    newsFeed: [] as NewsItem[],
    allRanks: [] as RankInfo[],
    timeSpeed: 1.0,
    gameMode: 'Cryptocurrency' as GameModeType,
    soundEnabled: true,
    scanlinesEnabled: true,
    hasSaveFile: false,
    notification: null as { message: string; type: 'success' | 'error' | 'info' } | null,
    listenerCleanup: null as (() => void) | null,
    browserTimer: null as ReturnType<typeof setInterval> | null,
  }),

  getters: {
    selectedAsset(state): Asset | undefined {
      return state.assets.find((a) => a.symbol === state.selectedSymbol) || state.assets[0];
    },
    currentRank(state): RankInfo | undefined {
      return state.portfolio?.rank;
    },
    cash(state): number {
      return state.portfolio?.cash ?? 0;
    },
    netWorth(state): number {
      return state.portfolio?.net_worth ?? 0;
    },
    unreadNewsCount(state): number {
      return state.newsFeed.filter((n) => !n.is_read).length;
    },
  },

  actions: {
    showNotification(message: string, type: 'success' | 'error' | 'info' = 'info') {
      this.notification = { message, type };
      setTimeout(() => {
        if (this.notification?.message === message) {
          this.notification = null;
        }
      }, 4000);
    },

    toggleSound() {
      this.soundEnabled = !this.soundEnabled;
      soundManager.setEnabled(this.soundEnabled);
    },

    toggleScanlines() {
      this.scanlinesEnabled = !this.scanlinesEnabled;
    },

    async checkSaveFile() {
      if (isTauriEnvironment()) {
        try {
          this.hasSaveFile = await tauriInvoke<boolean>('has_saved_game');
          return;
        } catch {
          // fallback to localStorage
        }
      }
      this.hasSaveFile = typeof localStorage !== 'undefined' && Boolean(localStorage.getItem('simange_savegame'));
    },

    async startNewGame(
      mode: GameModeType,
      customConfig?: { startingCash: number; volatility: number; assets: string[] }
    ) {
      soundManager.playClick();

      if (isTauriEnvironment()) {
        try {
          await tauriInvoke('start_new_game', {
            mode: mode.toLowerCase(),
            customStartingCash: customConfig?.startingCash,
            customVolatility: customConfig?.volatility,
            customAssets: customConfig?.assets,
          });

          this.gameMode = mode;
          this.inGame = true;
          this.isPaused = false;
          this.showPauseModal = false;

          await this.refreshAll();
          if (this.assets.length > 0) {
            this.selectedSymbol = this.assets[0].symbol;
            await this.fetchOrderBook();
          }

          this.setupEventListeners();
          this.showNotification(`New ${mode} game started. Good luck!`, 'success');
          return;
        } catch (e) {
          console.warn('Tauri start failed, switching to browser simulation engine:', e);
        }
      }

      // Browser-only runtime simulation
      this.initBrowserSimulation(mode, customConfig);
    },

    initBrowserSimulation(
      mode: GameModeType,
      customConfig?: { startingCash: number; volatility: number; assets: string[] }
    ) {
      if (this.browserTimer) {
        clearInterval(this.browserTimer);
        this.browserTimer = null;
      }

      browserEngineInstance = new BrowserSimulationEngine(mode, {
        starting_cash: customConfig?.startingCash,
        volatility_multiplier: customConfig?.volatility,
        active_asset_ids: customConfig?.assets,
      });

      this.gameMode = mode;
      this.inGame = true;
      this.isPaused = false;
      this.showPauseModal = false;

      this.assets = browserEngineInstance.assets.filter((a) =>
        browserEngineInstance!.config.active_asset_ids.includes(a.id)
      );
      this.portfolio = browserEngineInstance.portfolio;
      this.newsFeed = browserEngineInstance.newsHistory;
      if (this.assets.length > 0) {
        this.selectedSymbol = this.assets[0].symbol;
        this.orderBook = browserEngineInstance.getOrderBook(this.selectedSymbol);
      }

      // Start continuous browser simulation tick loop (1000ms)
      this.browserTimer = setInterval(() => {
        if (this.isPaused || !browserEngineInstance) return;

        const { assets, newAlert } = browserEngineInstance.tick(this.timeSpeed);
        this.assets = [...assets];
        this.portfolio = { ...browserEngineInstance.portfolio };
        this.orderBook = browserEngineInstance.getOrderBook(this.selectedSymbol);

        if (newAlert) {
          this.newsFeed = [...browserEngineInstance.newsHistory];
          soundManager.playNewsAlert();
          this.showNotification(`[NEWS] ${newAlert.headline}`, 'info');
        }
      }, 1000);

      this.showNotification(`Simulation running in browser mode (${mode})!`, 'success');
    },

    async loadSavedGame() {
      soundManager.playClick();
      if (isTauriEnvironment()) {
        try {
          await tauriInvoke('load_game');
          this.inGame = true;
          this.isPaused = false;
          this.showPauseModal = false;
          await this.refreshAll();
          this.setupEventListeners();
          this.showNotification('Game save loaded successfully!', 'success');
          return;
        } catch (e) {
          console.warn('Tauri load failed, checking localStorage fallback:', e);
        }
      }

      // Browser load
      if (!browserEngineInstance) {
        browserEngineInstance = new BrowserSimulationEngine('Cryptocurrency');
      }
      const loaded = browserEngineInstance.loadGame();
      if (loaded) {
        this.initBrowserSimulation(browserEngineInstance.config.mode_type);
        this.showNotification('Game save loaded from browser storage!', 'success');
      } else {
        this.showNotification('No browser savegame found.', 'error');
      }
    },

    async saveCurrentGame() {
      soundManager.playClick();
      if (isTauriEnvironment()) {
        try {
          await tauriInvoke('save_game');
          this.hasSaveFile = true;
          this.showNotification('Simulation state saved locally.', 'success');
          return;
        } catch (e) {
          console.warn('Tauri save failed, using browser storage:', e);
        }
      }

      if (browserEngineInstance) {
        browserEngineInstance.saveGame();
        this.hasSaveFile = true;
        this.showNotification('Simulation saved to browser localStorage!', 'success');
      }
    },

    async togglePause() {
      soundManager.playClick();
      if (isTauriEnvironment()) {
        try {
          const paused = await tauriInvoke<boolean>('toggle_pause');
          this.isPaused = paused;
          this.showPauseModal = paused;
          return;
        } catch {
          // fallback
        }
      }
      this.isPaused = !this.isPaused;
      this.showPauseModal = this.isPaused;
    },

    async setTimeSpeed(speed: number) {
      soundManager.playClick();
      if (isTauriEnvironment()) {
        try {
          const newSpeed = await tauriInvoke<number>('set_time_speed', { speed });
          this.timeSpeed = newSpeed;
          return;
        } catch {
          // fallback
        }
      }
      this.timeSpeed = speed;
    },

    selectAsset(symbol: string) {
      soundManager.playClick();
      this.selectedSymbol = symbol;
      this.fetchOrderBook();
    },

    async fetchAssets() {
      if (isTauriEnvironment()) {
        try {
          this.assets = await tauriInvoke<Asset[]>('get_assets');
          return;
        } catch {
          // fallback
        }
      }
      if (browserEngineInstance) {
        this.assets = browserEngineInstance.assets.filter((a) =>
          browserEngineInstance!.config.active_asset_ids.includes(a.id)
        );
      }
    },

    async fetchOrderBook() {
      if (!this.selectedSymbol) return;
      if (isTauriEnvironment()) {
        try {
          const ob = await tauriInvoke<OrderBook | null>('get_order_book', {
            symbol: this.selectedSymbol,
          });
          if (ob) this.orderBook = ob;
          return;
        } catch {
          // fallback
        }
      }
      if (browserEngineInstance) {
        this.orderBook = browserEngineInstance.getOrderBook(this.selectedSymbol);
      }
    },

    async fetchPortfolio() {
      if (isTauriEnvironment()) {
        try {
          const summary = await tauriInvoke<PortfolioSummary>('get_portfolio_summary');
          if (this.portfolio && this.portfolio.rank.id !== summary.rank.id) {
            soundManager.playRankUp();
            this.showNotification(`PROMOTION: You achieved rank ${summary.rank.title}!`, 'success');
          }
          this.portfolio = summary;
          return;
        } catch {
          // fallback
        }
      }
      if (browserEngineInstance) {
        this.portfolio = { ...browserEngineInstance.portfolio };
      }
    },

    async fetchNews() {
      if (isTauriEnvironment()) {
        try {
          this.newsFeed = await tauriInvoke<NewsItem[]>('get_news_feed');
          return;
        } catch {
          // fallback
        }
      }
      if (browserEngineInstance) {
        this.newsFeed = [...browserEngineInstance.newsHistory];
      }
    },

    async fetchAllRanks() {
      if (isTauriEnvironment()) {
        try {
          this.allRanks = await tauriInvoke<RankInfo[]>('get_all_ranks');
          return;
        } catch {
          // fallback
        }
      }
      this.allRanks = [
        computeRank(5000),
        computeRank(25000),
        computeRank(100000),
        computeRank(500000),
        computeRank(3000000),
        computeRank(15000000),
      ];
    },

    async refreshAll() {
      await Promise.all([
        this.fetchAssets(),
        this.fetchOrderBook(),
        this.fetchPortfolio(),
        this.fetchNews(),
        this.fetchAllRanks(),
      ]);
    },

    async executeTrade(
      side: OrderSide,
      orderType: OrderType,
      quantity: number,
      limitPrice?: number
    ): Promise<boolean> {
      if (isTauriEnvironment()) {
        try {
          const tx = await tauriInvoke<Transaction>('execute_order', {
            symbol: this.selectedSymbol,
            side,
            orderType,
            quantity,
            limitPrice: limitPrice ?? null,
          });

          if (side === 'Buy') soundManager.playBuy();
          else soundManager.playSell();

          this.showNotification(
            `${side.toUpperCase()} ${quantity.toFixed(4)} ${tx.symbol} executed at $${tx.price.toFixed(2)}`,
            'success'
          );

          await this.refreshAll();
          return true;
        } catch (err) {
          this.showNotification(`Order rejected: ${err}`, 'error');
          return false;
        }
      }

      // Browser simulation execution
      if (!browserEngineInstance) return false;
      try {
        const tx = browserEngineInstance.executeTrade(
          this.selectedSymbol,
          side,
          orderType,
          quantity,
          limitPrice
        );

        if (side === 'Buy') soundManager.playBuy();
        else soundManager.playSell();

        this.showNotification(
          `${side.toUpperCase()} ${quantity.toFixed(4)} ${tx.symbol} executed at $${tx.price.toFixed(2)}`,
          'success'
        );

        this.portfolio = { ...browserEngineInstance.portfolio };
        this.orderBook = browserEngineInstance.getOrderBook(this.selectedSymbol);
        return true;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        this.showNotification(`Order rejected: ${msg}`, 'error');
        return false;
      }
    },

    async borrowMoney(amount: number) {
      soundManager.playClick();
      if (isTauriEnvironment()) {
        try {
          await tauriInvoke('borrow_loan', { amount });
          soundManager.playBuy();
          this.showNotification(`Loan of $${amount.toLocaleString()} approved.`, 'success');
          await this.fetchPortfolio();
          return;
        } catch (err) {
          this.showNotification(`Borrow failed: ${err}`, 'error');
          return;
        }
      }

      if (browserEngineInstance) {
        try {
          browserEngineInstance.borrow(amount);
          soundManager.playBuy();
          this.showNotification(`Loan of $${amount.toLocaleString()} approved.`, 'success');
          this.portfolio = { ...browserEngineInstance.portfolio };
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : String(err);
          this.showNotification(`Borrow failed: ${msg}`, 'error');
        }
      }
    },

    async repayMoney(amount: number) {
      soundManager.playClick();
      if (isTauriEnvironment()) {
        try {
          await tauriInvoke('repay_loan', { amount });
          soundManager.playSell();
          this.showNotification(`Repaid $${amount.toLocaleString()} against loan balance.`, 'success');
          await this.fetchPortfolio();
          return;
        } catch (err) {
          this.showNotification(`Repay failed: ${err}`, 'error');
          return;
        }
      }

      if (browserEngineInstance) {
        try {
          browserEngineInstance.repay(amount);
          soundManager.playSell();
          this.showNotification(`Repaid $${amount.toLocaleString()} against loan balance.`, 'success');
          this.portfolio = { ...browserEngineInstance.portfolio };
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : String(err);
          this.showNotification(`Repay failed: ${msg}`, 'error');
        }
      }
    },

    async setupEventListeners() {
      if (!isTauriEnvironment()) return;
      try {
        const { listen } = await import('@tauri-apps/api/event');

        const unlistenTick = await listen<Asset[]>('simange:market_tick', (event) => {
          this.assets = event.payload;
          this.fetchOrderBook();
          this.fetchPortfolio();
        });

        const unlistenNews = await listen<NewsItem>('simange:news_alert', (event) => {
          const item = event.payload;
          this.newsFeed.unshift(item);
          soundManager.playNewsAlert();
          this.showNotification(`[NEWS] ${item.headline}`, 'info');
        });

        this.listenerCleanup = () => {
          unlistenTick();
          unlistenNews();
        };
      } catch (err) {
        console.warn('Tauri event listeners not active:', err);
      }
    },
  },
});
