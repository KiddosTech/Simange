// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod models;
mod engine;
mod state;
mod commands;

use std::sync::Arc;
use tokio::sync::RwLock;
use tauri::Emitter;
use state::{GameEngine, SafeAppState};
use models::GameModeConfig;

#[tokio::main]
async fn main() {
    let initial_config = GameModeConfig::crypto_mode();
    let game_engine = GameEngine::new(initial_config);
    let app_state: SafeAppState = Arc::new(RwLock::new(game_engine));

    let background_state = Arc::clone(&app_state);

    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .manage(app_state)
        .setup(move |app| {
            let handle = app.handle().clone();

            // Background simulation tick worker
            tokio::spawn(async move {
                let mut interval = tokio::time::interval(std::time::Duration::from_millis(500));
                loop {
                    interval.tick().await;

                    let (assets, news_option, is_paused) = {
                        let mut engine = background_state.write().await;
                        let news = engine.tick();
                        let paused = engine.is_paused;
                        let active_ids = engine.config.active_asset_ids.clone();
                        let active_assets: Vec<_> = engine
                            .market
                            .assets
                            .iter()
                            .filter(|a| active_ids.contains(&a.id))
                            .cloned()
                            .collect();
                        (active_assets, news, paused)
                    };

                    if !is_paused {
                        let _ = handle.emit("simange:market_tick", &assets);
                        if let Some(news) = news_option {
                            let _ = handle.emit("simange:news_alert", &news);
                        }
                    }
                }
            });

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::get_assets,
            commands::get_asset,
            commands::get_order_book,
            commands::execute_order,
            commands::get_portfolio_summary,
            commands::borrow_loan,
            commands::repay_loan,
            commands::start_new_game,
            commands::get_game_status,
            commands::toggle_pause,
            commands::set_time_speed,
            commands::save_game,
            commands::load_game,
            commands::has_saved_game,
            commands::get_news_feed,
            commands::get_all_ranks,
        ])
        .run(tauri::generate_context!())
        .expect("error while running Simange desktop application");
}
