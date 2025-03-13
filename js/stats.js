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
            
            // Check if authentication is available through HighScores module
            if (typeof HighScores !== 'undefined') {
                // Wait a bit for HighScores to attempt authentication
                setTimeout(() => {
                    // Use HighScores authentication status if available
                    if (HighScores.authenticated) {
                        console.log("Using authentication from HighScores module");
                    } else {
                        console.log("HighScores module not authenticated, stats will be stored locally only");
                    }
                }, 2000);
            } else {
                console.log("HighScores module not available, stats will be stored locally only");
            }
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
     * Record a game being played
     * @param {number} score - The score from the current game
     */
    recordGamePlayed: function(score) {
        try {
            // Update local stats
            this.statsData.localGamesPlayed++;
            
            // Save updated stats
            this.saveLocalStats();
            
            // Try to update global stats if Firebase is available
            if (this.initialized && this.db) {
                // Check if we should use HighScores authentication status if available
                const useFirebase = typeof HighScores === 'undefined' || HighScores.authenticated;
                
                if (useFirebase) {
                    // Wrap Firebase operations in try/catch to prevent game errors
                    try {
                        // Create game record
                        const gameRecord = {
                            score: score,
                            timestamp: firebase.database.ServerValue.TIMESTAMP,
                            sessionId: this.statsData.lastSessionId
                        };
                        
                        // Update global stats
                        this.db.ref('stats/games').push(gameRecord)
                            .then(() => {
                                console.log('Game recorded in global stats');
                            })
                            .catch(error => {
                                // Check for permission errors
                                if (error && error.message && (error.message.includes('permission_denied') || error.message.includes('PERMISSION_DENIED'))) {
                                    console.log('Permission denied when recording game. Check Firebase rules or authentication.');
                                } else {
                                    console.error('Error recording game in global stats:', error);
                                }
                            });
                            
                        // Update total games counter
                        this.db.ref('stats/totals/gamesPlayed').transaction(current => {
                            return (current || 0) + 1;
                        }).catch(error => {
                            // Check for permission errors
                            if (error && error.message && (error.message.includes('permission_denied') || error.message.includes('PERMISSION_DENIED'))) {
                                console.log('Permission denied when updating game count. Check Firebase rules or authentication.');
                            } else {
                                console.error('Error updating total games played:', error);
                            }
                        });
                        
                        // Update unique players count based on session IDs
                        this.updateUniquePlayers();
                    } catch (innerError) {
                        console.error('Error in Firebase operations:', innerError);
                    }
                } else {
                    console.log('Firebase auth not available, storing stats locally only');
                }
            }
        } catch (error) {
            console.error('Error in recordGamePlayed:', error);
        }
    },
    
    /**
     * Update unique players count based on session IDs
     */
    updateUniquePlayers: function() {
        if (!this.initialized || !this.db) return;
        
        try {
            // Check if this session has already been counted
            this.db.ref('stats/sessions').child(this.statsData.lastSessionId).once('value')
                .then(snapshot => {
                    if (!snapshot.exists()) {
                        // This is a new session, record it
                        this.db.ref('stats/sessions').child(this.statsData.lastSessionId).set({
                            startTime: this.statsData.sessionStartTime,
                            lastActive: firebase.database.ServerValue.TIMESTAMP
                        }).catch(error => {
                            // Handle permission errors gracefully
                            if (error && error.message && (error.message.includes('permission_denied') || error.message.includes('PERMISSION_DENIED'))) {
                                console.log('Permission denied when recording session. Check Firebase rules or authentication.');
                            } else {
                                console.error('Error recording session:', error);
                            }
                        });
                        
                        // Increment unique players counter
                        this.db.ref('stats/totals/uniquePlayers').transaction(current => {
                            return (current || 0) + 1;
                        }).catch(error => {
                            // Handle permission errors gracefully
                            if (error && error.message && (error.message.includes('permission_denied') || error.message.includes('PERMISSION_DENIED'))) {
                                console.log('Permission denied when updating unique players count. Check Firebase rules or authentication.');
                            } else {
                                console.error('Error updating unique players count:', error);
                            }
                        });
                    } else {
                        // Session exists, just update last active time
                        this.db.ref('stats/sessions').child(this.statsData.lastSessionId).update({
                            lastActive: firebase.database.ServerValue.TIMESTAMP
                        }).catch(error => {
                            // Handle permission errors gracefully
                            if (error && error.message && (error.message.includes('permission_denied') || error.message.includes('PERMISSION_DENIED'))) {
                                console.log('Permission denied when updating session. Check Firebase rules or authentication.');
                            } else {
                                console.error('Error updating session:', error);
                            }
                        });
                    }
                })
                .catch(error => {
                    // Handle permission errors gracefully
                    if (error && error.message && (error.message.includes('permission_denied') || error.message.includes('PERMISSION_DENIED'))) {
                        console.log('Permission denied when checking session. Check Firebase rules or authentication.');
                    } else {
                        console.error('Error checking session:', error);
                    }
                });
        } catch (error) {
            console.error('Error in updateUniquePlayers:', error);
        }
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
        const modal = document.getElementById('stats-modal');
        modal.style.display = 'flex'; // Use flex for better centering
        
        // Apply mobile-specific adjustments if Game object is available
        if (typeof Game !== 'undefined' && Game.isMobileDevice) {
            const statsContainer = document.querySelector('.stats-container');
            if (statsContainer) {
                // Reset any previous styles first
                statsContainer.removeAttribute('style');
                
                // Apply enhanced mobile styles
                statsContainer.setAttribute('style', `
                    max-height: calc(var(--vh, 1vh) * 45) !important;
                    padding-bottom: var(--url-bar-offset, 0px) !important;
                    overflow-y: scroll !important;
                    -webkit-overflow-scrolling: touch !important;
                    transform: translateZ(0) !important;
                    will-change: transform, scroll-position !important;
                    touch-action: pan-y !important;
                `);
                
                // Add enhanced touch handling for smooth scrolling
                if (this._touchScrollHandler) {
                    statsContainer.removeEventListener('touchstart', this._touchScrollHandler);
                    statsContainer.removeEventListener('touchmove', this._touchScrollHandler);
                    statsContainer.removeEventListener('touchend', this._touchScrollHandler);
                }
                
                this._touchScrollHandler = function(e) {
                    e.stopPropagation(); // Prevent parent elements from capturing events
                };
                
                // Apply touch events with passive option for smooth scrolling
                statsContainer.addEventListener('touchstart', this._touchScrollHandler, { passive: true });
                statsContainer.addEventListener('touchmove', this._touchScrollHandler, { passive: true });
                statsContainer.addEventListener('touchend', this._touchScrollHandler, { passive: true });
                
                // Small delay to ensure container is ready for scrolling
                setTimeout(() => {
                    // Force layout recalculation
                    void statsContainer.offsetHeight;
                    
                    // Small scroll to "wake up" the scrolling
                    statsContainer.scrollTop = 1;
                    setTimeout(() => statsContainer.scrollTop = 0, 50);
                }, 200);
            }
            
            // Adjust modal position to account for URL bar on mobile
            //const modalContent = modal.querySelector('.modal-content');
            //if (modalContent) {
              //  modalContent.style.marginBottom = 'var(--url-bar-offset, 0px)';
            //}
        }
        
        // Check for authentication status
        const isAuthenticated = typeof HighScores !== 'undefined' && HighScores.authenticated;
        
        // If not authenticated and Firebase is available, check if we can authenticate
        if (!isAuthenticated && this.initialized && this.db) {
            // Try to authenticate using HighScores module
            if (typeof HighScores !== 'undefined' && typeof HighScores.initAuth === 'function') {
                HighScores.initAuth();
                
                // Show "authenticating" status
                globalGamesCount.textContent = "Authenticating...";
                uniquePlayers.textContent = "Authenticating...";
                averageScore.textContent = "Authenticating...";
                
                // Check authentication status after a short delay
                setTimeout(() => {
                    if (HighScores.authenticated) {
                        // Now we're authenticated, fetch the stats
                        this.fetchAndDisplayStats(globalGamesCount, uniquePlayers, averageScore);
                    } else {
                        // Still not authenticated
                        globalGamesCount.textContent = "Authentication Failed";
                        uniquePlayers.textContent = "Authentication Failed";
                        averageScore.textContent = "Authentication Failed";
                    }
                }, 2000);
                
                return;
            }
        }
        
        // Fetch global stats if Firebase is available and authenticated
        if (this.initialized && this.db && isAuthenticated) {
            this.fetchAndDisplayStats(globalGamesCount, uniquePlayers, averageScore);
        } else {
            // Set fallback values if Firebase isn't available or not authenticated
            globalGamesCount.textContent = "N/A";
            uniquePlayers.textContent = "N/A";
            averageScore.textContent = "N/A";
        }
        
        // Set up close handler if not already done
        const closeButton = document.getElementById('close-stats-modal');
        if (closeButton) {
            closeButton.onclick = () => {
                modal.style.display = 'none';
                
                // Clean up event listeners
                if (Game && Game.isMobileDevice) {
                    const statsContainer = document.querySelector('.stats-container');
                    if (statsContainer && this._touchScrollHandler) {
                        statsContainer.removeEventListener('touchstart', this._touchScrollHandler);
                        statsContainer.removeEventListener('touchmove', this._touchScrollHandler);
                        statsContainer.removeEventListener('touchend', this._touchScrollHandler);
                        this._touchScrollHandler = null;
                    }
                }
            };
        }
    },
    
    /**
     * Fetch and display game statistics from Firebase
     */
    fetchAndDisplayStats: function(globalGamesCount, uniquePlayers, averageScore) {
        this.db.ref('stats/totals').once('value')
            .then(snapshot => {
                const stats = snapshot.val() || { gamesPlayed: 0, uniquePlayers: 0 };
                
                // Update displayed stats
                globalGamesCount.textContent = stats.gamesPlayed ? stats.gamesPlayed.toString() : "0";
                uniquePlayers.textContent = stats.uniquePlayers ? stats.uniquePlayers.toString() : "0";
                
                // Calculate average score from the games collection
                this.db.ref('stats/games').once('value')
                    .then(gamesSnapshot => {
                        let totalScore = 0;
                        let count = 0;
                        
                        gamesSnapshot.forEach(gameSnapshot => {
                            const gameData = gameSnapshot.val();
                            if (gameData && typeof gameData.score === 'number') {
                                totalScore += gameData.score;
                                count++;
                            }
                        });
                        
                        const avg = count > 0 ? Math.round(totalScore / count) : 0;
                        averageScore.textContent = avg.toString();
                    })
                    .catch(error => {
                        console.error('Error calculating average score:', error);
                        averageScore.textContent = "Error";
                    });
            })
            .catch(error => {
                console.error('Error fetching game stats:', error);
                if (window.GameLogger) {
                    GameLogger.error('Error fetching game stats', error);
                }
                
                // Handle error in UI
                globalGamesCount.textContent = "Error";
                uniquePlayers.textContent = "Error";
                averageScore.textContent = "Error";
            });
    }
};

// Initialize when document is ready
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        GameStats.init();
    }, 1000); // Initialize after a delay to ensure Firebase is ready
}); 