use crate::models::{Portfolio, Asset, AssetCategory};

pub struct BankEngine;

impl BankEngine {
    /// Accrues loan interest continuously. Called on game ticks.
    pub fn process_interest(portfolio: &mut Portfolio, delta_seconds: f64) {
        if portfolio.bank.loan_balance > 0.0 {
            // APR converted to delta_seconds fraction (assuming 1 year = 365 * 86400 seconds)
            let year_fraction = delta_seconds / 31536000.0;
            let interest = portfolio.bank.loan_balance * portfolio.bank.interest_rate_apr * year_fraction;
            portfolio.bank.loan_balance += interest;
        }
    }

    /// Process stock dividends on tick cycle
    pub fn process_dividends(portfolio: &mut Portfolio, assets: &[Asset], delta_seconds: f64) -> f64 {
        let mut total_dividend = 0.0;
        let year_fraction = delta_seconds / 31536000.0;

        for (symbol, holding) in &portfolio.holdings {
            if let Some(asset) = assets.iter().find(|a| &a.symbol == symbol && a.category == AssetCategory::Stock) {
                if asset.dividend_yield > 0.0 {
                    let div_payout = holding.quantity * asset.current_price * asset.dividend_yield * year_fraction;
                    total_dividend += div_payout;
                }
            }
        }

        if total_dividend > 0.0 {
            portfolio.cash += total_dividend;
            portfolio.bank.accumulated_dividends += total_dividend;
        }

        total_dividend
    }

    pub fn borrow(portfolio: &mut Portfolio, amount: f64) -> Result<f64, String> {
        if amount <= 0.0 {
            return Err("Borrow amount must be greater than zero".into());
        }

        let available_borrow = portfolio.bank.max_borrow_limit - portfolio.bank.loan_balance;
        if amount > available_borrow {
            return Err(format!("Exceeds available credit line: max borrowable is ${:.2}", available_borrow));
        }

        portfolio.bank.loan_balance += amount;
        portfolio.cash += amount;
        Ok(portfolio.bank.loan_balance)
    }

    pub fn repay(portfolio: &mut Portfolio, amount: f64) -> Result<f64, String> {
        if amount <= 0.0 {
            return Err("Repayment amount must be greater than zero".into());
        }

        if amount > portfolio.cash {
            return Err(format!("Insufficient cash balance: available ${:.2}", portfolio.cash));
        }

        let actual_repay = amount.min(portfolio.bank.loan_balance);
        portfolio.cash -= actual_repay;
        portfolio.bank.loan_balance -= actual_repay;

        Ok(portfolio.bank.loan_balance)
    }
}
