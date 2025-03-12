/**
 * Game Statistics Module
 * Tracks game statistics and handles displaying them to the user
 */

const GameStats = {
    initialized: false,
    db: null,
    statsData: {
        localGamesPlayed: 0,
        lastSessionId: null,
        sessionStartTime: null
    },
    
    /**
     * Initialize the game statistics module
     */
    init: function() {
        // Initialize Firebase database reference (use same Firebase instance as HighScores)
        if (typeof firebase !== 'undefined' && firebase.apps.length > 0) {
            this.db = firebase.database();
            this.initialized = true;
        } else {
            console.warn('Firebase not available. Stats will only be tracked locally.');
        }
        
        // Load local stats
        this.loadLocalStats();
        
        // Generate a session ID if not exist
        if (!this.statsData.lastSessionId) {
            this.statsData.lastSessionId = this.generateSessionId();
            this.statsData.sessionStartTime = Date.now();
            this.saveLocalStats();
        }
        
        // Add event listener for the stats button
        const statsBtn = document.getElementById('stats-btn');
        if (statsBtn) {
            statsBtn.addEventListener('click', () => {
                this.showStatsModal();
            });
        }
        
        // Add event listener for the close stats button
        const closeStatsBtn = document.getElementById('close-stats');
        if (closeStatsBtn) {
            closeStatsBtn.addEventListener('click', () => {
                document.getElementById('stats-modal').style.display = 'none';
            });
        }
        
        if (window.GameLogger) {
            GameLogger.info('GameStats initialized');
        }
    },
    
    /**
     * Generate a unique session ID
     * @returns {string} A unique session ID
     */
    generateSessionId: function() {
        return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    },
    
    /**
     * Load statistics from local storage
     */
    loadLocalStats: function() {
        try {
            const savedStats = localStorage.getItem(CONFIG.STORAGE_KEYS.STATS);
            if (savedStats) {
                this.statsData = JSON.parse(savedStats);
            }
        } catch (e) {
            console.error('Error loading local stats:', e);
            if (window.GameLogger) {
                GameLogger.error('Error loading local stats', e);
            }
        }
    },
    
    /**
     * Save statistics to local storage
     */
    saveLocalStats: function() {
        try {
            localStorage.setItem(CONFIG.STORAGE_KEYS.STATS, JSON.stringify(this.statsData));
        } catch (e) {
            console.error('Error saving local stats:', e);
            if (window.GameLogger) {
                GameLogger.error('Error saving local stats', e);
            }
        }
    },
    
    /**
     * Record a completed game
     * @param {number} score - The score achieved in the game
     */
    recordGamePlayed: function(score) {
        // Increment local games played counter
        this.statsData.localGamesPlayed++;
        this.saveLocalStats();
        
        // Record to Firebase if available
        if (this.initialized && this.db) {
            // Record the game in the games collection
            this.db.ref('games').push({
                sessionId: this.statsData.lastSessionId,
                score: score,
                timestamp: firebase.database.ServerValue.TIMESTAMP
            }).catch(error => {
                console.error('Error recording game to Firebase:', error);
                if (window.GameLogger) {
                    GameLogger.error('Error recording game to Firebase', error);
                }
            });
            
            // Update the global stats counters
            const statsRef = this.db.ref('gameStats');
            statsRef.transaction((currentStats) => {
                if (currentStats === null) {
                    return {
                        totalGamesPlayed: 1,
                        totalScore: score,
                        uniquePlayers: 1
                    };
                }
                
                // Increment games played and total score
                currentStats.totalGamesPlayed = (currentStats.totalGamesPlayed || 0) + 1;
                currentStats.totalScore = (currentStats.totalScore || 0) + score;
                
                // We'll handle unique players in a separate transaction
                return currentStats;
            }).catch(error => {
                console.error('Error updating game stats:', error);
                if (window.GameLogger) {
                    GameLogger.error('Error updating game stats', error);
                }
            });
            
            // Update unique players counter
            this.updateUniquePlayersCounter();
        }
    },
    
    /**
     * Update the unique players counter in Firebase
     */
    updateUniquePlayersCounter: function() {
        if (!this.initialized || !this.db) return;
        
        // Check if this session has already been counted
        this.db.ref('sessions').child(this.statsData.lastSessionId).once('value')
            .then(snapshot => {
                if (!snapshot.exists()) {
                    // This is a new session, record it
                    this.db.ref('sessions').child(this.statsData.lastSessionId).set({
                        startTime: this.statsData.sessionStartTime,
                        lastActive: firebase.database.ServerValue.TIMESTAMP
                    });
                    
                    // Increment unique players counter
                    this.db.ref('gameStats').transaction((currentStats) => {
                        if (currentStats === null) {
                            return { uniquePlayers: 1 };
                        }
                        
                        currentStats.uniquePlayers = (currentStats.uniquePlayers || 0) + 1;
                        return currentStats;
                    });
                } else {
                    // Session exists, just update last active time
                    this.db.ref('sessions').child(this.statsData.lastSessionId).update({
                        lastActive: firebase.database.ServerValue.TIMESTAMP
                    });
                }
            })
            .catch(error => {
                console.error('Error updating unique players:', error);
                if (window.GameLogger) {
                    GameLogger.error('Error updating unique players', error);
                }
            });
    },
    
    /**
     * Show the statistics modal with current stats
     */
    showStatsModal: function() {
        // Get stats elements
        const localGamesCount = document.getElementById('local-games-count');
        const globalGamesCount = document.getElementById('global-games-count');
        const uniquePlayers = document.getElementById('unique-players');
        const averageScore = document.getElementById('average-score');
        
        // Set local stats immediately
        localGamesCount.textContent = this.statsData.localGamesPlayed.toString();
        
        // Set loading indicator for Firebase stats
        globalGamesCount.textContent = "Loading...";
        uniquePlayers.textContent = "Loading...";
        averageScore.textContent = "Loading...";
        
        // Show the modal
        document.getElementById('stats-modal').style.display = 'block';
        
        // Fetch global stats if Firebase is available
        if (this.initialized && this.db) {
            this.db.ref('gameStats').once('value')
                .then(snapshot => {
                    const stats = snapshot.val() || { totalGamesPlayed: 0, uniquePlayers: 0, totalScore: 0 };
                    
                    // Update displayed stats
                    globalGamesCount.textContent = stats.totalGamesPlayed.toString();
                    uniquePlayers.textContent = stats.uniquePlayers.toString();
                    
                    // Calculate average score
                    const avg = stats.totalGamesPlayed > 0 
                        ? Math.round(stats.totalScore / stats.totalGamesPlayed) 
                        : 0;
                    averageScore.textContent = avg.toString();
                })
                .catch(error => {
                    console.error('Error fetching game stats:', error);
                    if (window.GameLogger) {
                        GameLogger.error('Error fetching game stats', error);
                    }
                    
                    // Show error message
                    globalGamesCount.textContent = "Error";
                    uniquePlayers.textContent = "Error";
                    averageScore.textContent = "Error";
                });
        } else {
            // Firebase not available, show local only
            globalGamesCount.textContent = "N/A";
            uniquePlayers.textContent = "N/A";
            averageScore.textContent = "N/A";
        }
    }
};

// Initialize when document is ready
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        GameStats.init();
    }, 1000); // Initialize after a delay to ensure Firebase is ready
}); 