use std::collections::HashMap;
use serde::{Deserialize, Serialize};
use super::asset::Asset;
use super::order::OrderSide;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Holding {
    pub symbol: String,
    pub quantity: f64,
    pub average_buy_price: f64,
    pub total_cost_basis: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Transaction {
    pub id: String,
    pub timestamp: i64,
    pub symbol: String,
    pub side: OrderSide,
    pub quantity: f64,
    pub price: f64,
    pub fee: f64,
    pub total: f64,
    pub realized_pnl: Option<f64>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BankAccount {
    pub loan_balance: f64,
    pub max_borrow_limit: f64,
    pub interest_rate_apr: f64, // e.g. 0.08 for 8%
    pub accumulated_dividends: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Portfolio {
    pub cash: f64,
    pub starting_cash: f64,
    pub holdings: HashMap<String, Holding>,
    pub transactions: Vec<Transaction>,
    pub bank: BankAccount,
    pub total_realized_pnl: f64,
}

impl Portfolio {
    pub fn new(initial_cash: f64) -> Self {
        Self {
            cash: initial_cash,
            starting_cash: initial_cash,
            holdings: HashMap::new(),
            transactions: Vec::new(),
            bank: BankAccount {
                loan_balance: 0.0,
                max_borrow_limit: (initial_cash * 0.8).max(5000.0),
                interest_rate_apr: 0.065,
                accumulated_dividends: 0.0,
            },
            total_realized_pnl: 0.0,
        }
    }

    pub fn calculate_net_worth(&self, assets: &[Asset]) -> f64 {
        let mut asset_value = 0.0;
        for (symbol, holding) in &self.holdings {
            if let Some(asset) = assets.iter().find(|a| &a.symbol == symbol) {
                asset_value += holding.quantity * asset.current_price;
            }
        }
        (self.cash + asset_value) - self.bank.loan_balance
    }

    pub fn calculate_unrealized_pnl(&self, assets: &[Asset]) -> f64 {
        let mut pnl = 0.0;
        for (symbol, holding) in &self.holdings {
            if let Some(asset) = assets.iter().find(|a| &a.symbol == symbol) {
                let current_val = holding.quantity * asset.current_price;
                pnl += current_val - holding.total_cost_basis;
            }
        }
        pnl
    }
}
