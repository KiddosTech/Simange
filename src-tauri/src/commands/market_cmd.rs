use tauri::State;
use crate::models::{Asset, OrderBook};
use crate::state::SafeAppState;

#[tauri::command]
pub async fn get_assets(state: State<'_, SafeAppState>) -> Result<Vec<Asset>, String> {
    let engine = state.read().await;
    let active_ids = &engine.config.active_asset_ids;
    let filtered = engine
        .market
        .assets
        .iter()
        .filter(|a| active_ids.contains(&a.id))
        .cloned()
        .collect();
    Ok(filtered)
}

#[tauri::command]
pub async fn get_asset(symbol: String, state: State<'_, SafeAppState>) -> Result<Option<Asset>, String> {
    let engine = state.read().await;
    let asset = engine.market.assets.iter().find(|a| a.symbol == symbol).cloned();
    Ok(asset)
}

#[tauri::command]
pub async fn get_order_book(symbol: String, state: State<'_, SafeAppState>) -> Result<Option<OrderBook>, String> {
    let engine = state.read().await;
    Ok(engine.market.get_order_book(&symbol))
}
