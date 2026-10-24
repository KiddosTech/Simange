use serde::Serialize;
use tauri::State;
use crate::models::{GameModeConfig, GameModeType, NewsItem, RankInfo, RankSystem};
use crate::state::{GameEngine, SafeAppState};
use crate::engine::SaveManager;

#[derive(Debug, Clone, Serialize)]
pub struct GameStatus {
    pub is_paused: bool,
    pub time_speed: f64,
    pub elapsed_seconds: u64,
    pub mode: GameModeType,
}

#[tauri::command]
pub async fn start_new_game(
    mode: String,
    custom_starting_cash: Option<f64>,
    custom_volatility: Option<f64>,
    custom_assets: Option<Vec<String>>,
    state: State<'_, SafeAppState>,
) -> Result<(), String> {
    let config = match mode.to_lowercase().as_str() {
        "crypto" | "cryptocurrency" => GameModeConfig::crypto_mode(),
        "stock" | "stockexchange" => GameModeConfig::stock_mode(),
        "test" => GameModeConfig::test_mode(),
        "custom" => {
            let cash = custom_starting_cash.unwrap_or(50_000.0);
            let vol = custom_volatility.unwrap_or(1.5);
            let assets = custom_assets.unwrap_or_else(|| vec![
                "byte".into(),
                "aeth".into(),
                "pear".into(),
                "tslax".into(),
            ]);
            GameModeConfig::custom_mode(cash, vol, 25, true, assets, 1.0)
        }
        _ => return Err(format!("Unknown game mode: '{}'", mode)),
    };

    let mut engine = state.write().await;
    *engine = GameEngine::new(config);
    Ok(())
}

#[tauri::command]
pub async fn get_game_status(state: State<'_, SafeAppState>) -> Result<GameStatus, String> {
    let engine = state.read().await;
    Ok(GameStatus {
        is_paused: engine.is_paused,
        time_speed: engine.time_speed,
        elapsed_seconds: engine.elapsed_seconds,
        mode: engine.config.mode_type,
    })
}

#[tauri::command]
pub async fn toggle_pause(state: State<'_, SafeAppState>) -> Result<bool, String> {
    let mut engine = state.write().await;
    engine.is_paused = !engine.is_paused;
    Ok(engine.is_paused)
}

#[tauri::command]
pub async fn set_time_speed(speed: f64, state: State<'_, SafeAppState>) -> Result<f64, String> {
    let mut engine = state.write().await;
    let clamped = speed.clamp(0.25, 10.0);
    engine.time_speed = clamped;
    Ok(clamped)
}

#[tauri::command]
pub async fn save_game(state: State<'_, SafeAppState>) -> Result<(), String> {
    let engine = state.read().await;
    let data = engine.to_save_data();
    SaveManager::save(&data)
}

#[tauri::command]
pub async fn load_game(state: State<'_, SafeAppState>) -> Result<(), String> {
    let data = SaveManager::load()?;
    let mut engine = state.write().await;
    engine.restore_save_data(data);
    Ok(())
}

#[tauri::command]
pub async fn has_saved_game() -> Result<bool, String> {
    Ok(SaveManager::save_exists())
}

#[tauri::command]
pub async fn get_news_feed(state: State<'_, SafeAppState>) -> Result<Vec<NewsItem>, String> {
    let engine = state.read().await;
    Ok(engine.news.history.clone())
}

#[tauri::command]
pub async fn get_all_ranks() -> Result<Vec<RankInfo>, String> {
    Ok(RankSystem::get_all_ranks())
}
