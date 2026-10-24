use std::fs;
use std::path::PathBuf;
use serde::{Deserialize, Serialize};
use crate::models::{Portfolio, Asset, NewsItem, GameModeConfig};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SaveData {
    pub version: String,
    pub timestamp: i64,
    pub portfolio: Portfolio,
    pub config: GameModeConfig,
    pub assets: Vec<Asset>,
    pub news: Vec<NewsItem>,
    pub elapsed_game_seconds: u64,
}

pub struct SaveManager;

impl SaveManager {
    fn get_save_path() -> PathBuf {
        let base_dir = std::env::var("LOCALAPPDATA")
            .map(PathBuf::from)
            .or_else(|_| std::env::var("HOME").map(|h| PathBuf::from(h).join(".local/share")))
            .unwrap_or_else(|_| PathBuf::from("."));

        let simange_dir = base_dir.join("simange");
        if !simange_dir.exists() {
            let _ = fs::create_dir_all(&simange_dir);
        }

        simange_dir.join("simange_savegame.json")
    }

    pub fn save(data: &SaveData) -> Result<(), String> {
        let path = Self::get_save_path();
        let json = serde_json::to_string_pretty(data).map_err(|e| e.to_string())?;
        fs::write(&path, json).map_err(|e| format!("Failed to write save file at {:?}: {}", path, e))?;
        Ok(())
    }

    pub fn load() -> Result<SaveData, String> {
        let path = Self::get_save_path();
        if !path.exists() {
            return Err("No existing save file found".into());
        }

        let content = fs::read_to_string(&path).map_err(|e| e.to_string())?;
        let data: SaveData = serde_json::from_str(&content).map_err(|e| e.to_string())?;
        Ok(data)
    }

    pub fn save_exists() -> bool {
        Self::get_save_path().exists()
    }
}
