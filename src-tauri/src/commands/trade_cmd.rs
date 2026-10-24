use tauri::State;
use crate::models::{OrderSide, OrderType, Transaction};
use crate::state::SafeAppState;

#[tauri::command]
pub async fn execute_order(
    symbol: String,
    side: String,
    order_type: String,
    quantity: f64,
    limit_price: Option<f64>,
    state: State<'_, SafeAppState>,
) -> Result<Transaction, String> {
    let side_enum = match side.to_lowercase().as_str() {
        "buy" => OrderSide::Buy,
        "sell" => OrderSide::Sell,
        _ => return Err("Invalid order side. Must be 'buy' or 'sell'".into()),
    };

    let type_enum = match order_type.to_lowercase().as_str() {
        "market" => OrderType::Market,
        "limit" => OrderType::Limit,
        _ => return Err("Invalid order type. Must be 'market' or 'limit'".into()),
    };

    let mut engine = state.write().await;
    engine.execute_trade(&symbol, side_enum, type_enum, quantity, limit_price)
}
