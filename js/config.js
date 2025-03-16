/**
 * Game Configuration
 * Contains all game settings and difficulty parameters
 */

const CONFIG = {
    // Game settings
    FPS: 60,
    GRAVITY: 0.6,
    JUMP_POWER: 15,
    FLOAT_POWER: 0.3,
    MAX_FLOAT_TIME: 30,
    BASE_SPEED: 8,
    SPEED_INCREMENT: 0.8,
    SPEED_INCREMENT_SCORE: 500,
    JOKE_DISPLAY_TIME: 5000,
    DEATH_SCREEN_TIME: 5000,
    
    // Default difficulty - can be 'easy', 'medium', or 'hard'
    DEFAULT_DIFFICULTY: 'hard',
    
    // Difficulty settings
    DIFFICULTY: {
        easy: {
            TROLL_SPAWN_RATE: 0.010,
            SPEED_MULTIPLIER: 0.8,
            GRAVITY_MULTIPLIER: 0.9,
            JUMP_POWER_MULTIPLIER: 1.2,
            POWERUP_SPAWN_RATE: 0.015
        },
        medium: {
            TROLL_SPAWN_RATE: 0.030,
            SPEED_MULTIPLIER: 1.0,
            GRAVITY_MULTIPLIER: 1.0,
            JUMP_POWER_MULTIPLIER: 1.0,
            POWERUP_SPAWN_RATE: 0.012
        },
        hard: {
            TROLL_SPAWN_RATE: 0.020,
            SPEED_MULTIPLIER: 1.2,
            GRAVITY_MULTIPLIER: 1.1,
            JUMP_POWER_MULTIPLIER: 0.9,
            POWERUP_SPAWN_RATE: 0.008
        }
    },
    
    // Player settings
    PLAYER: {
        WIDTH: 60,
        HEIGHT: 90,
        BOTTOM: 60,
        LEFT: 100
    },
    
    // Troll settings
    TROLL: {
        WIDTH: 60,
        HEIGHT: 60,
        BOTTOM: 60
    },
    
    // Power-up settings
    POWERUP: {
        WIDTH: 60,
        HEIGHT: 60,
        MIN_BOTTOM: 50,  // Minimum height from ground
        MAX_BOTTOM: 150, // Maximum height from ground
        LIFESPAN: 8000,  // How long power-ups stay on screen if not collected (ms)
        MIN_DISTANCE: 300, // Reduced from 400 to allow more frequent spawning
        TYPES: {
            CLOVER: {
                NAME: 'clover',
                EFFECT_DURATION: 3000,
                PROBABILITY: 0.3
            },
            GOLD: {
                NAME: 'gold',
                SCORE_BONUS: 150,
                PROBABILITY: 0.4
            },
            WHISKEY: {
                NAME: 'whiskey',
                EFFECT_DURATION: 5000,
                SPEED_MULTIPLIER: 0.5,
                JUMP_DELAY: 200,
                PROBABILITY: 0.3
            }
        }
    },
    
    // Cloud settings
    CLOUD: {
        MIN_SIZE: 50,
        MAX_SIZE: 150,
        MIN_SPEED: 1,
        MAX_SPEED: 3,
        SPAWN_RATE: 0.01
    },
    
    // Mountain settings
    MOUNTAIN: {
        MIN_SIZE: 100,
        MAX_SIZE: 150,
        MIN_SPEED: 0.5,
        MAX_SPEED: 1.0,
        COUNT: 5
    },
    
    // Sound settings
    SOUND_ENABLED: true,
    
    // Local storage keys
    STORAGE_KEYS: {
        HIGH_SCORE: 'toms_adventure_high_score',
        SETTINGS: 'toms_adventure_settings',
        STATS: 'toms_adventure_stats'
    },
    
    // Update power-up configurations
    POWER_UPS: {
        TYPES: ['clover', 'gold', 'whiskey'],
        WIDTH: 80,
        HEIGHT: 80,
        SPAWN_RATE: 0.01, // Increased from 0.005 for more frequent spawns
        MIN_DISTANCE: 300, // Reduced from 500 to be consistent with POWERUP.MIN_DISTANCE
        EFFECTS: {
            CLOVER: {
                DURATION: 10000, // 10 seconds (increased from 3)
                TROLL_POINTS: 50 // Reduced from 50
            },
            GOLD: {
                POINTS: 150
            },
            WHISKEY: {
                DURATION: 10000, // 10 seconds
                SPEED_MULTIPLIER: 1.5,
                JUMP_DELAY: 150 // Reduced delay for key press
            }
        }
    }
};

// Load saved settings if available
function loadSavedSettings() {
    const savedSettings = localStorage.getItem(CONFIG.STORAGE_KEYS.SETTINGS);
    if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        
        // Apply saved settings
        // Note: difficulty selection has been removed, so we no longer need to set it
        
        if (settings.soundEnabled !== undefined) {
            CONFIG.SOUND_ENABLED = settings.soundEnabled;
            document.getElementById('sound-toggle').checked = settings.soundEnabled;
        }
        
        // Load debug mode setting
        if (settings.debugMode !== undefined && document.getElementById('debug-toggle')) {
            document.getElementById('debug-toggle').checked = settings.debugMode;
        }
    }
}

// Save current settings
function saveSettings() {
    const settings = {
        soundEnabled: document.getElementById('sound-toggle').checked
    };
    
    // Add debug mode if it exists
    const debugToggle = document.getElementById('debug-toggle');
    if (debugToggle) {
        settings.debugMode = debugToggle.checked;
    }
    
    localStorage.setItem(CONFIG.STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
}

// Get current difficulty settings
function getCurrentDifficultySettings() {
    // Use the default difficulty setting from CONFIG
    return CONFIG.DIFFICULTY[CONFIG.DEFAULT_DIFFICULTY];
}

// Update sound setting
function updateSoundSetting() {
    CONFIG.SOUND_ENABLED = document.getElementById('sound-toggle').checked;
    saveSettings();
}

// Initialize settings when page loads
document.addEventListener('DOMContentLoaded', loadSavedSettings); 