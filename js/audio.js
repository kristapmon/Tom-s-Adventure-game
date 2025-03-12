/**
 * Audio Manager
 * Handles all game sound effects
 */

const AudioManager = {
    sounds: {
        jump: document.getElementById('jump-sound'),
        land: document.getElementById('land-sound'),
        death: document.getElementById('death-sound'),
        point: document.getElementById('point-sound'),
        powerup: document.getElementById('powerup-sound'),
        joke: document.getElementById('joke-sound')
    },
    
    /**
     * Play a sound if sound is enabled
     * @param {string} soundName - Name of the sound to play
     */
    play: function(soundName) {
        if (CONFIG.SOUND_ENABLED && this.sounds[soundName]) {
            // Clone the audio element to allow overlapping sounds
            const sound = this.sounds[soundName].cloneNode();
            sound.volume = 0.5; // Set volume to 50%
            
            // Play the sound
            sound.play()
                .catch(error => {
                    console.warn(`Error playing sound: ${error.message}`);
                });
            
            // Remove the cloned element when done playing
            sound.onended = function() {
                sound.remove();
            };
        }
    },
    
    /**
     * Initialize audio elements
     * This needs to be called after user interaction due to browser autoplay policies
     */
    init: function() {
        // Preload all sounds
        Object.values(this.sounds).forEach(sound => {
            if (sound) {
                sound.load();
            } else {
                console.warn('Missing sound element in AudioManager initialization');
            }
        });
        
        // Set up event listener for sound toggle
        const soundToggle = document.getElementById('sound-toggle');
        if (soundToggle) {
            soundToggle.addEventListener('change', function() {
                CONFIG.SOUND_ENABLED = this.checked;
                updateSoundSetting();
            });
        }

        if (window.GameLogger) {
            GameLogger.info('Audio system initialized');
        }
    }
};

// Initialize audio when page loads
document.addEventListener('DOMContentLoaded', function() {
    // We need to wait for user interaction before initializing audio
    // due to browser autoplay policies
    const startBtn = document.getElementById('start-btn');
    if (startBtn) {
        startBtn.addEventListener('click', function() {
            AudioManager.init();
        });
    }
}); 