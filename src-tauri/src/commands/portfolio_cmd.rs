use std::collections::HashMap;
use serde::Serialize;
use tauri::State;
use crate::models::{BankAccount, Holding, RankInfo, RankSystem, Transaction};
use crate::state::SafeAppState;
use crate::engine::BankEngine;

#[derive(Debug, Clone, Serialize)]
pub struct PortfolioSummary {
    pub cash: f64,
    pub net_worth: f64,
    pub unrealized_pnl: f64,
    pub realized_pnl: f64,
    pub holdings: HashMap<String, Holding>,
    pub recent_transactions: Vec<Transaction>,
    pub rank: RankInfo,
    pub bank: BankAccount,
}

#[tauri::command]
pub async fn get_portfolio_summary(state: State<'_, SafeAppState>) -> Result<PortfolioSummary, String> {
    let engine = state.read().await;
    let net_worth = engine.portfolio.calculate_net_worth(&engine.market.assets);
    let unrealized_pnl = engine.portfolio.calculate_unrealized_pnl(&engine.market.assets);
    let rank = RankSystem::get_rank(net_worth);

    let summary = PortfolioSummary {
        cash: engine.portfolio.cash,
        net_worth,
        unrealized_pnl,
        realized_pnl: engine.portfolio.total_realized_pnl,
        holdings: engine.portfolio.holdings.clone(),
        recent_transactions: engine.portfolio.transactions.iter().take(20).cloned().collect(),
        rank,
        bank: engine.portfolio.bank.clone(),
    };

    Ok(summary)
}

#[tauri::command]
pub async fn borrow_loan(amount: f64, state: State<'_, SafeAppState>) -> Result<f64, String> {
    let mut engine = state.write().await;
    BankEngine::borrow(&mut engine.portfolio, amount)
}

#[tauri::command]
pub async fn repay_loan(amount: f64, state: State<'_, SafeAppState>) -> Result<f64, String> {
    let mut engine = state.write().await;
    BankEngine::repay(&mut engine.portfolio, amount)
}
