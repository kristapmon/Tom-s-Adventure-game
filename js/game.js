/**
 * Main Game Module
 * Handles game initialization, game loop, and event listeners
 */

const Game = {
    // Game state
    gameStarted: false,
    gameOver: false,
    score: 0,
    highScore: 0,
    speed: CONFIG.BASE_SPEED,
    animationId: null,
    scoreInterval: null,
    debugMode: false, // Default to false, will be set from settings
    version: '1.6.1', // Updated version with improved high score system
    messageTimeout: null,
    isMobileDevice: false, // Flag for mobile device detection
    screenWidth: window.innerWidth,
    screenHeight: window.innerHeight,
    isLandscape: window.innerWidth > window.innerHeight,
    
    /**
     * Initialize the game
     */
    init: function() {
        // Detect mobile device
        this.detectMobileDevice();
        
        // Get screen dimensions and orientation
        this.updateScreenDimensions();
        
        // Check orientation and show/hide landscape message
        this.checkOrientation();
        
        // Log game initialization
        if (window.GameLogger) {
            GameLogger.info(`Initializing Tom's Adventure v${this.version}`);
            if (this.isMobileDevice) {
                GameLogger.info(`Mobile device detected: ${this.screenWidth}x${this.screenHeight}, orientation: ${this.isLandscape ? 'landscape' : 'portrait'}`);
            }
        }
        
        // Load high score from local storage
        this.loadHighScore();
        
        // Load debug mode setting
        this.loadDebugSetting();
        
        // Initialize entities
        Player.init();
        TrollManager.init();
        CloudManager.init();
        MountainManager.init();
        TreeManager.init();
        SunManager.init();
        PowerUpManager.init(); // Initialize power-ups
        
        // Initialize jokes system
        JokesManager.init();
        
        // Initialize audio
        if (typeof AudioManager !== 'undefined') {
            AudioManager.init();
        }
        
        // Initialize high score system
        if (typeof HighScores !== 'undefined') {
            HighScores.init();
        }
        
        // Create power-up countdown elements
        this.createPowerUpCountdowns();
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Show start screen
        this.showStartScreen();
        
        if (this.debugMode) {
            console.log('Game initialized');
            if (window.GameLogger) {
                GameLogger.debug('Game initialized in debug mode');
            }
        }
    },
    
    /**
     * Check device orientation and show/hide landscape message
     */
    checkOrientation: function() {
        this.isLandscape = window.innerWidth > window.innerHeight;
        const landscapeMessage = document.getElementById('landscape-message');
        const gameContainer = document.getElementById('game-container');
        
        if (landscapeMessage && gameContainer) {
            if (this.isMobileDevice && !this.isLandscape) {
                // Show landscape message and hide/pause game in portrait mode
                landscapeMessage.style.display = 'flex';
                
                // If the game is running, pause it
                if (this.gameStarted && !this.gameOver) {
                    this.pauseGame();
                }
                
                if (window.GameLogger && this.debugMode) {
                    GameLogger.debug('Portrait mode detected: prompting to rotate device');
                }
            } else {
                // Hide landscape message and show game in landscape mode
                landscapeMessage.style.display = 'none';
                gameContainer.style.visibility = 'visible';
                
                // If we were previously in portrait mode and game was paused, resume it
                if (this.gameStarted && !this.gameOver && document.hidden === false) {
                    this.resumeGame();
                }
            }
        }
        
        if (window.GameLogger && this.debugMode) {
            GameLogger.debug(`Orientation check: ${this.isLandscape ? 'landscape' : 'portrait'}`);
        }
    },
    
    /**
     * Update screen dimensions
     */
    updateScreenDimensions: function() {
        this.screenWidth = window.innerWidth;
        this.screenHeight = window.innerHeight;
        this.isLandscape = window.innerWidth > window.innerHeight;
        
        // Apply dynamic adjustments based on screen size
        this.applyDynamicAdjustments();
        
        if (this.debugMode && window.GameLogger) {
            GameLogger.debug(`Screen dimensions updated: ${this.screenWidth}x${this.screenHeight}`);
        }
    },
    
    /**
     * Apply dynamic adjustments based on screen size
     */
    applyDynamicAdjustments: function() {
        // Get game container and ground elements
        const gameContainer = document.getElementById('game-container');
        const ground = document.getElementById('ground');
        
        if (!gameContainer || !ground) return;
        
        // Use consistent ground height for all elements
        const groundHeight = CONFIG.PLAYER.BOTTOM;
        
        // Apply calculated ground height
        if (this.isMobileDevice) {
            // Use vh units on mobile for better responsiveness
            const groundHeightVh = (groundHeight / this.screenHeight) * 100;
            ground.style.height = `${groundHeightVh}vh`;
            
            // Adjust player position
            if (Player.element) {
                Player.element.style.bottom = `${groundHeightVh}vh`;
            }
            
            // Adjust trolls position
            TrollManager.trolls.forEach(troll => {
                if (troll.element) {
                    troll.element.style.bottom = `${groundHeightVh}vh`;
                }
            });
            
            // Adjust mountains position
            const mountains = document.getElementById('mountains');
            if (mountains) {
                mountains.style.bottom = `${groundHeightVh}vh`;
            }
            
            // Adjust trees position
            const trees = document.querySelectorAll('.tree');
            trees.forEach(tree => {
                tree.style.bottom = `${groundHeightVh}vh`;
            });
        } else {
            // Use pixels on desktop for precise positioning
            ground.style.height = `${groundHeight}px`;
            
            // Adjust player position
            if (Player.element) {
                Player.element.style.bottom = `${groundHeight}px`;
            }
            
            // Adjust trolls position
            TrollManager.trolls.forEach(troll => {
                if (troll.element) {
                    troll.element.style.bottom = `${groundHeight}px`;
                }
            });
            
            // Adjust mountains position
            const mountains = document.getElementById('mountains');
            if (mountains) {
                mountains.style.bottom = `${groundHeight}px`;
            }
            
            // Adjust trees position
            const trees = document.querySelectorAll('.tree');
            trees.forEach(tree => {
                tree.style.bottom = `${groundHeight}px`;
            });
        }
        
        // Adjust player scale based on screen size
        if (Player.element) {
            let scale = 1;
            
            if (this.screenWidth < 360) {
                scale = 0.8;
            } else if (this.screenWidth < 480) {
                scale = 1.2;
            } else if (this.screenWidth < 768) {
                scale = 1.1;
            }
            
            Player.element.style.transform = `scale(${scale}) translateZ(10px)`;
        }
        
        // Ensure player is at the correct height after adjustments
        if (Player && typeof Player.ensureCorrectHeight === 'function') {
            Player.ensureCorrectHeight();
        }
    },
    
    /**
     * Detect if the user is on a mobile device
     */
    detectMobileDevice: function() {
        // Check if device has touch capability
        this.isMobileDevice = ('ontouchstart' in window) || 
                             (navigator.maxTouchPoints > 0) || 
                             (navigator.msMaxTouchPoints > 0);
        
        // Also check user agent as a fallback
        if (!this.isMobileDevice) {
            const userAgent = navigator.userAgent.toLowerCase();
            this.isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
        }
        
        // Show/hide mobile controls based on detection
        if (this.isMobileDevice) {
            document.getElementById('mobile-controls').classList.remove('hidden');
        }
    },
    
    /**
     * Set up event listeners
     */
    setupEventListeners: function() {
        // Keyboard event listeners
        document.addEventListener('keydown', (event) => {
            if ((event.code === 'Space' || event.code === 'ArrowUp') && !event.repeat) {
                event.preventDefault();
                if (this.gameStarted && !this.gameOver) {
                    Player.jump();
                    Player.startFloat();
                }
            }
        });
        
        document.addEventListener('keyup', (event) => {
            if (event.code === 'Space' || event.code === 'ArrowUp') {
                event.preventDefault();
                Player.stopFloat();
            }
        });
        
        // Mobile touch event listeners
        const jumpArea = document.getElementById('jump-area');
        if (jumpArea) {
            // Touch start - jump and start floating
            jumpArea.addEventListener('touchstart', (event) => {
                event.preventDefault();
                if (this.gameStarted && !this.gameOver) {
                    Player.jump();
                    Player.startFloat();
                }
            });
            
            // Touch end - stop floating
            jumpArea.addEventListener('touchend', (event) => {
                event.preventDefault();
                Player.stopFloat();
            });
            
            // Touch cancel - stop floating
            jumpArea.addEventListener('touchcancel', (event) => {
                event.preventDefault();
                Player.stopFloat();
            });
        }
        
        // Start button
        document.getElementById('start-btn').addEventListener('click', () => {
            this.startGame();
        });
        
        // High scores button on start screen
        document.getElementById('high-scores-btn').addEventListener('click', () => {
            this.showHighScoreTable();
        });
        
        // Settings button
        document.getElementById('settings-btn').addEventListener('click', () => {
            document.getElementById('start-screen').classList.add('hidden');
            document.getElementById('settings-screen').classList.remove('hidden');
        });
        
        // Back button
        document.getElementById('back-btn').addEventListener('click', () => {
            document.getElementById('settings-screen').classList.add('hidden');
            document.getElementById('start-screen').classList.remove('hidden');
            saveSettings();
        });
        
        // Restart button (game over screen)
        document.getElementById('restart-btn').addEventListener('click', () => {
            this.startGame();
        });
        
        // Menu button (game over screen)
        document.getElementById('menu-btn').addEventListener('click', () => {
            document.getElementById('game-over').classList.add('hidden');
            this.showStartScreen();
        });
        
        // Death screen restart button
        document.getElementById('death-restart').addEventListener('click', () => {
            this.startGame();
        });
        
        // Death screen menu button
        document.getElementById('death-menu').addEventListener('click', () => {
            document.getElementById('death-animation').classList.add('hidden');
            this.showStartScreen();
        });
        
        // High scores button on death screen
        document.getElementById('death-high-scores').addEventListener('click', () => {
            this.showHighScoreTable();
        });
        
        // Close high score table button
        document.getElementById('close-high-score-table').addEventListener('click', () => {
            document.getElementById('high-score-table-modal').style.display = 'none';
        });
        
        // Add event listener for debug toggle
        const debugToggle = document.getElementById('debug-toggle');
        if (debugToggle) {
            debugToggle.addEventListener('change', () => {
                this.debugMode = debugToggle.checked;
                
                // Save setting
                this.saveDebugSetting();
                
                if (window.GameLogger) {
                    GameLogger.info(`Debug mode ${this.debugMode ? 'enabled' : 'disabled'}`);
                }
            });
        }
        
        // Add event listener for export logs button
        const exportLogsBtn = document.getElementById('export-logs');
        if (exportLogsBtn && window.GameLogger) {
            exportLogsBtn.addEventListener('click', () => {
                GameLogger.exportLogs();
            });
        }
        
        // Handle window resize
        window.addEventListener('resize', () => {
            this.handleResize();
        });
        
        // Handle orientation change
        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                this.handleResize();
            }, 200); // Small delay to ensure dimensions are updated
        });
        
        // Handle visibility change (pause game when tab is not visible)
        document.addEventListener('visibilitychange', () => {
            if (document.hidden && this.gameStarted && !this.gameOver) {
                this.pauseGame();
            } else if (!document.hidden && this.gameStarted && !this.gameOver) {
                this.resumeGame();
            }
        });
        
        // Prevent scrolling on mobile
        document.addEventListener('touchmove', (event) => {
            if (this.gameStarted) {
                event.preventDefault();
            }
        }, { passive: false });
    },
    
    /**
     * Handle window resize
     */
    handleResize: function() {
        // Update screen dimensions
        this.updateScreenDimensions();
        
        // Check orientation and show/hide landscape message
        this.checkOrientation();
        
        // Recalculate positions if needed
        if (this.gameStarted) {
            // Ensure player is at the correct height after resize
            if (Player && typeof Player.ensureCorrectHeight === 'function') {
                Player.ensureCorrectHeight();
            }
            
            if (window.GameLogger && this.debugMode) {
                GameLogger.debug('Window resized, adjusting game elements');
            }
        }
    },
    
    /**
     * Pause the game
     */
    pauseGame: function() {
        if (!this.gameStarted || this.gameOver) return;
        
        // Cancel animation frame
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        
        // Show pause message
        this.showMessage('Game Paused', 0);
        
        if (window.GameLogger) {
            GameLogger.info('Game paused');
        }
    },
    
    /**
     * Resume the game
     */
    resumeGame: function() {
        if (!this.gameStarted || this.gameOver) return;
        
        // Remove pause message
        const messageDisplay = document.getElementById('message-display');
        if (messageDisplay && messageDisplay.parentNode) {
            messageDisplay.parentNode.removeChild(messageDisplay);
        }
        
        // Restart game loop
        this.startGameLoop();
        
        if (window.GameLogger) {
            GameLogger.info('Game resumed');
        }
    },
    
    /**
     * Load debug setting from local storage
     */
    loadDebugSetting: function() {
        try {
            const savedSettings = localStorage.getItem(CONFIG.STORAGE_KEYS.SETTINGS);
            if (savedSettings) {
                const settings = JSON.parse(savedSettings);
                if (settings.debugMode !== undefined) {
                    this.debugMode = settings.debugMode;
                    // Update checkbox in settings
                    const debugToggle = document.getElementById('debug-toggle');
                    if (debugToggle) {
                        debugToggle.checked = this.debugMode;
                    }
                }
            }
        } catch (e) {
            console.error('Error loading debug setting:', e);
            if (window.GameLogger) {
                GameLogger.error('Error loading debug setting', e);
            }
        }
    },
    
    /**
     * Start the game
     */
    startGame: function() {
        // Log game start
        if (window.GameLogger) {
            GameLogger.info('Game started');
        }
        
        // First, ensure complete cleanup of previous game elements
        this.cleanup();
        
        // Hide all screens
        document.getElementById('start-screen').classList.add('hidden');
        document.getElementById('settings-screen').classList.add('hidden');
        document.getElementById('game-over').classList.add('hidden');
        document.getElementById('death-animation').classList.add('hidden');
        
        // Reset game state
        this.gameStarted = true;
        this.gameOver = false;
        this.score = 0;
        this.speed = CONFIG.BASE_SPEED;
        
        // Update score display
        document.getElementById('score').textContent = `Score: 0`;
        
        // Initialize game entities
        Player.init();
        TrollManager.init();
        CloudManager.init();
        MountainManager.init();
        TreeManager.init();
        SunManager.init();
        PowerUpManager.init(); // Initialize power-ups
        
        // Ensure player is at the correct height
        Player.ensureCorrectHeight();
        
        // Start jokes
        JokesManager.init();
        JokesManager.startJokes();
        
        // Start game loop
        this.startGameLoop();
        
        // Start score counter
        this.startScoreCounter();
        
        if (this.debugMode) {
            console.log("Game started successfully");
            if (window.GameLogger) {
                GameLogger.debug('Game started successfully in debug mode');
            }
        }
    },
    
    /**
     * Start the game loop
     */
    startGameLoop: function() {
        // Cancel any existing animation frame
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        
        // Ensure player is at the correct height before starting
        if (Player && typeof Player.ensureCorrectHeight === 'function') {
            Player.ensureCorrectHeight();
        }
        
        // Define the game loop
        const gameLoop = (timestamp) => {
            if (!this.gameStarted) {
                return;
            }
            
            // Update game state
            this.update();
            
            // Continue the loop only if game is not over
            if (!this.gameOver) {
                this.animationId = requestAnimationFrame(gameLoop);
            }
        };
        
        // Start the game loop
        this.animationId = requestAnimationFrame(gameLoop);
    },
    
    /**
     * Update game state
     */
    update: function() {
        if (!this.gameStarted || this.gameOver) return;
        
        // Update player
        Player.update();
        
        // Update trolls
        TrollManager.trolls.forEach(troll => {
            // Move troll
            troll.x -= this.speed;
            troll.element.style.left = `${troll.x}px`;
            
            // Check collision with player
            if (Collision.check(Player.element, troll.element)) {
                // Only end game if player is not invincible
                if (!Player.isInvincible) {
                    this.endGame();
                } else {
                    // If invincible, remove the troll instead
                    troll.element.style.animation = 'collect 0.5s forwards';
                    setTimeout(() => {
                        if (troll.element && troll.element.parentNode) {
                            troll.element.parentNode.removeChild(troll.element);
                        }
                        TrollManager.trolls = TrollManager.trolls.filter(t => t.id !== troll.id);
                    }, 500);
                    
                    // Add bonus points for smashing a troll while invincible
                    this.score += 25;
                    this.updateScoreDisplay();
                    
                    if (window.GameLogger) {
                        GameLogger.info('Smashed troll while invincible (+25 points)');
                    }
                }
            }
            
            // Remove troll if it's off-screen
            if (troll.x < -100) {
                troll.element.remove();
                TrollManager.trolls = TrollManager.trolls.filter(t => t.id !== troll.id);
            }
        });
        
        // Check if new troll should spawn
        TrollManager.checkSpawn();
        
        // Update clouds
        CloudManager.update();
        CloudManager.checkSpawn();
        
        // Update mountains
        MountainManager.update();
        
        // Update trees
        TreeManager.update();
        
        // Update power-ups
        PowerUpManager.update();
        PowerUpManager.checkSpawn();
        
        // Update joke bubble position
        JokesManager.updateBubblePosition();
        
        // Increase speed based on score
        if (this.score > 0 && this.score % CONFIG.SPEED_INCREMENT_SCORE === 0) {
            this.speed += CONFIG.SPEED_INCREMENT;
            
            if (this.debugMode) {
                console.log(`Speed increased to ${this.speed}`);
            }
        }
        
        // Apply drunk effect if active
        if (Player.isDrunk) {
            // Apply drunk visual effect
            const wobbleAmount = Math.sin(Date.now() / 100) * 3;
            Player.element.style.transform = `translateZ(10px) rotate(${wobbleAmount}deg)`;
        }
    },
    
    /**
     * Start the score counter
     */
    startScoreCounter: function() {
        // Clear any existing interval
        if (this.scoreInterval) {
            clearInterval(this.scoreInterval);
            this.scoreInterval = null;
        }
        
        // Start new interval
        this.scoreInterval = setInterval(() => {
            // Skip if game is over
            if (this.gameOver) {
                clearInterval(this.scoreInterval);
                this.scoreInterval = null;
                return;
            }
            
            // Update score
            if (this.gameStarted) {
                this.score++;
                document.getElementById('score').textContent = `Score: ${this.score}`;
                
                // Debug log every 10 points
                if (this.debugMode && this.score % 10 === 0) {
                    console.log("Current score:", this.score);
                }
                
                // Play point sound every 100 points
                if (this.score % 100 === 0) {
                    // Use a try-catch to handle missing audio files
                    try {
                        AudioManager.play('point');
                    } catch (e) {
                        console.warn('Could not play point sound:', e);
                    }
                }
                
                // Increase speed every 500 points
                if (this.score % CONFIG.SPEED_INCREMENT_SCORE === 0) {
                    this.speed += CONFIG.SPEED_INCREMENT;
                    if (this.debugMode) {
                        console.log("Speed increased to:", this.speed);
                    }
                }
            }
        }, 100);
    },
    
    /**
     * End the game
     */
    endGame: function() {
        if (this.gameOver) return; // Prevent multiple calls
        
        this.gameOver = true;
        
        // Log game over
        if (window.GameLogger) {
            GameLogger.info(`Game over with score: ${this.score}`);
        }
        
        // Stop score counter
        if (this.scoreInterval) {
            clearInterval(this.scoreInterval);
            this.scoreInterval = null;
        }
        
        // Check for high score
        const isNewHighScore = this.score > this.highScore;
        if (isNewHighScore) {
            this.highScore = this.score;
            this.saveHighScore();
            
            if (window.GameLogger) {
                GameLogger.info(`New high score: ${this.highScore}`);
            }
        }
        
        // Update high score display
        document.getElementById('high-score').textContent = `High Score: ${this.highScore}`;
        
        // Show death animation
        this.showDeathAnimation(isNewHighScore);
        
        // Play death sound
        if (typeof AudioManager !== 'undefined') {
            AudioManager.play('death');
        }
        
        // Check if score qualifies for high score table
        if (typeof HighScores !== 'undefined') {
            HighScores.checkHighScore(this.score, (qualifies) => {
                if (qualifies) {
                    this.showHighScorePrompt();
                }
            });
        }
    },
    
    /**
     * Show the start screen
     */
    showStartScreen: function() {
        // Hide all other screens
        document.getElementById('settings-screen').classList.add('hidden');
        document.getElementById('game-over').classList.add('hidden');
        document.getElementById('death-animation').classList.add('hidden');
        
        // Show start screen
        document.getElementById('start-screen').classList.remove('hidden');
        
        // Reset game state
        this.gameStarted = false;
        this.gameOver = false;
        
        // Clean up game entities
        this.cleanup();
    },
    
    /**
     * Show the settings screen
     */
    showSettingsScreen: function() {
        // Hide all other screens
        document.getElementById('start-screen').classList.add('hidden');
        document.getElementById('game-over').classList.add('hidden');
        document.getElementById('death-animation').classList.add('hidden');
        
        // Show settings screen
        document.getElementById('settings-screen').classList.remove('hidden');
    },
    
    /**
     * Load high score from local storage
     */
    loadHighScore: function() {
        const savedHighScore = localStorage.getItem(CONFIG.STORAGE_KEYS.HIGH_SCORE);
        if (savedHighScore) {
            this.highScore = parseInt(savedHighScore);
            document.getElementById('high-score').textContent = `High Score: ${this.highScore}`;
        }
    },
    
    /**
     * Save high score to local storage
     */
    saveHighScore: function() {
        localStorage.setItem(CONFIG.STORAGE_KEYS.HIGH_SCORE, this.highScore.toString());
    },
    
    /**
     * Clean up game resources
     */
    cleanup: function() {
        // Cancel animation frame
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        
        // Clear score interval
        if (this.scoreInterval) {
            clearInterval(this.scoreInterval);
            this.scoreInterval = null;
        }
        
        // Clear message timeout
        if (this.messageTimeout) {
            clearTimeout(this.messageTimeout);
            this.messageTimeout = null;
        }
        
        // Clean up entities
        Player.cleanup();
        TrollManager.cleanup();
        CloudManager.cleanup();
        MountainManager.cleanup();
        TreeManager.cleanup();
        SunManager.cleanup();
        PowerUpManager.cleanup(); // Clean up power-ups
        JokesManager.clearIntervals();
        
        // Reset player state
        Player.isInvincible = false;
        Player.isDrunk = false;
        
        // Clear timeouts
        if (Player.invincibilityTimeout) {
            clearTimeout(Player.invincibilityTimeout);
            Player.invincibilityTimeout = null;
        }
        
        if (Player.drunkTimeout) {
            clearTimeout(Player.drunkTimeout);
            Player.drunkTimeout = null;
        }
        
        if (Player.jumpDelayTimeout) {
            clearTimeout(Player.jumpDelayTimeout);
            Player.jumpDelayTimeout = null;
        }
        
        // Reset joke bubble
        const jokeBubble = document.getElementById('joke-bubble');
        if (jokeBubble) {
            jokeBubble.style.display = 'none';
        }
        
        // Reset joke bubble container
        const jokeBubbleContainer = document.getElementById('joke-bubble-container');
        if (jokeBubbleContainer) {
            jokeBubbleContainer.innerHTML = '';
        }
        
        // Remove message display if it exists
        const messageDisplay = document.getElementById('message-display');
        if (messageDisplay && messageDisplay.parentNode) {
            messageDisplay.parentNode.removeChild(messageDisplay);
        }
        
        // Reset game state
        this.gameStarted = false;
        this.gameOver = false;
        this.score = 0;
        this.speed = CONFIG.BASE_SPEED;
        
        // Update score display
        this.updateScoreDisplay();
        
        if (this.debugMode) {
            console.log('Game cleaned up');
        }
    },
    
    /**
     * Force a complete reset of the game state
     * This is a more aggressive reset than cleanup()
     */
    forceReset: function() {
        // Stop all ongoing processes
        if (this.scoreInterval) {
            clearInterval(this.scoreInterval);
            this.scoreInterval = null;
        }
        
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        
        // Reset all game state variables
        this.gameStarted = false;
        this.gameOver = false;
        this.score = 0;
        this.speed = CONFIG.BASE_SPEED;
        
        // Reset player state
        Player.jumping = false;
        Player.jumpHeight = 0;
        Player.floatTime = 0;
        Player.isHoldingJump = false;
        
        // Clear all game elements from the DOM
        this.removeAllGameElements();
        
        // Reset all entity arrays
        TrollManager.trolls = [];
        TrollManager.nextId = 0;
        CloudManager.clouds = [];
        CloudManager.nextId = 0;
        MountainManager.mountains = [];
        MountainManager.nextId = 0;
        
        // Clear all intervals in other modules
        if (Player.legAnimationInterval) {
            clearInterval(Player.legAnimationInterval);
            Player.legAnimationInterval = null;
        }
        
        JokesManager.clearIntervals();
        
        if (this.debugMode) {
            console.log("Game state forcefully reset");
        }
    },
    
    /**
     * Remove all game elements from the DOM
     */
    removeAllGameElements: function() {
        // Get the game container
        const gameContainer = document.getElementById('game-container');
        
        // Remove all trolls
        const trolls = document.querySelectorAll('.troll');
        trolls.forEach(troll => {
            if (troll.parentNode) {
                troll.parentNode.removeChild(troll);
            }
        });
        
        // Remove all clouds
        const clouds = document.querySelectorAll('.cloud');
        clouds.forEach(cloud => {
            if (cloud.parentNode) {
                cloud.parentNode.removeChild(cloud);
            }
        });
        
        // Clear mountains container
        const mountainsContainer = document.getElementById('mountains');
        if (mountainsContainer) {
            mountainsContainer.innerHTML = '';
        }
        
        // Reset player element
        const player = document.getElementById('player');
        if (player) {
            player.innerHTML = '';
            player.style.bottom = `${CONFIG.PLAYER.BOTTOM}px`;
            player.style.transform = 'translateZ(10px)';
        }
        
        // Clear joke bubble container
        const jokeBubbleContainer = document.getElementById('joke-bubble-container');
        if (jokeBubbleContainer) {
            jokeBubbleContainer.innerHTML = '';
        }
        
        // Remove any other game elements that might be lingering
        const gameElements = document.querySelectorAll('.game-element');
        gameElements.forEach(element => {
            if (element.parentNode) {
                element.parentNode.removeChild(element);
            }
        });
    },
    
    /**
     * Update score display
     */
    updateScoreDisplay: function() {
        document.getElementById('score').textContent = `Score: ${this.score}`;
    },
    
    /**
     * Handle errors during game execution
     * @param {Error} error - The error that occurred
     * @param {string} context - Context where the error occurred
     */
    handleError: function(error, context) {
        console.error(`Error in ${context}:`, error);
        
        if (window.GameLogger) {
            GameLogger.error(`Error in ${context}`, error);
        }
        
        // Display error to user in debug mode
        if (this.debugMode) {
            alert(`Game Error: ${error.message}\nContext: ${context}\n\nCheck console for details.`);
        }
    },
    
    /**
     * Save debug setting to local storage
     */
    saveDebugSetting: function() {
        try {
            const savedSettings = localStorage.getItem(CONFIG.STORAGE_KEYS.SETTINGS);
            let settings = {};
            
            if (savedSettings) {
                settings = JSON.parse(savedSettings);
            }
            
            settings.debugMode = this.debugMode;
            localStorage.setItem(CONFIG.STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
        } catch (e) {
            console.error('Error saving debug setting:', e);
            if (window.GameLogger) {
                GameLogger.error('Error saving debug setting', e);
            }
        }
    },
    
    /**
     * Show death animation
     * @param {boolean} isNewHighScore - Whether this is a new high score
     */
    showDeathAnimation: function(isNewHighScore) {
        // Update death screen score
        document.getElementById('death-score').textContent = `Score: ${this.score}`;
        
        // Remove any existing high score message to prevent duplicates
        const existingHighScore = document.getElementById('death-high-score');
        if (existingHighScore && existingHighScore.parentNode) {
            existingHighScore.parentNode.removeChild(existingHighScore);
        }
        
        if (isNewHighScore) {
            // Add high score message to death screen
            const deathScreen = document.getElementById('death-animation');
            const highScoreMsg = document.createElement('div');
            highScoreMsg.id = 'death-high-score';
            highScoreMsg.textContent = 'New High Score!';
            
            // Insert it after the death score
            const deathScore = document.getElementById('death-score');
            if (deathScore && deathScore.parentNode) {
                deathScore.parentNode.insertBefore(highScoreMsg, deathScore.nextSibling);
            } else {
                deathScreen.appendChild(highScoreMsg);
            }
            
            // Log high score achievement
            if (window.GameLogger) {
                GameLogger.info(`New high score animation shown: ${this.score}`);
            }
        }
        
        // Show death animation
        document.getElementById('death-animation').classList.remove('hidden');
        
        // Create dead Tom animation
        if (Player && typeof Player.createDeadTom === 'function') {
            Player.createDeadTom();
        }
        
        // Log death animation shown
        if (window.GameLogger && this.debugMode) {
            GameLogger.debug('Death animation shown');
        }
    },
    
    /**
     * Show a temporary message during gameplay
     * @param {string} message - The message to display
     * @param {number} duration - How long to show the message (ms)
     */
    showMessage: function(message, duration = 2000) {
        // Remove any existing message
        let messageDisplay = document.getElementById('message-display');
        if (messageDisplay) {
            messageDisplay.parentNode.removeChild(messageDisplay);
        }
        
        // Create message element
        messageDisplay = document.createElement('div');
        messageDisplay.id = 'message-display';
        messageDisplay.textContent = message;
        messageDisplay.style.position = 'absolute';
        messageDisplay.style.top = '30%';
        messageDisplay.style.left = '50%';
        messageDisplay.style.transform = 'translate(-50%, -50%)';
        messageDisplay.style.color = '#FFFFFF';
        messageDisplay.style.fontSize = '24px';
        messageDisplay.style.fontFamily = "'Press Start 2P', cursive";
        messageDisplay.style.textShadow = '2px 2px 0 #000, -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000';
        messageDisplay.style.zIndex = '100';
        messageDisplay.style.textAlign = 'center';
        messageDisplay.style.animation = 'fadeInOut 2s forwards';
        
        // Add to game container
        document.getElementById('game-container').appendChild(messageDisplay);
        
        // Clear any existing timeout
        if (this.messageTimeout) {
            clearTimeout(this.messageTimeout);
        }
        
        // Set timeout to remove message
        this.messageTimeout = setTimeout(() => {
            if (messageDisplay && messageDisplay.parentNode) {
                messageDisplay.parentNode.removeChild(messageDisplay);
            }
        }, duration);
    },
    
    // Add method to create power-up countdown elements
    createPowerUpCountdowns: function() {
        // Create clover countdown
        const cloverCountdown = document.createElement('div');
        cloverCountdown.id = 'clover-countdown';
        cloverCountdown.className = 'power-up-countdown clover-countdown';
        document.body.appendChild(cloverCountdown);
        
        // Create whiskey countdown
        const whiskeyCountdown = document.createElement('div');
        whiskeyCountdown.id = 'whiskey-countdown';
        whiskeyCountdown.className = 'power-up-countdown whiskey-countdown';
        document.body.appendChild(whiskeyCountdown);
    },
    
    // Add method to show high score prompt
    showHighScorePrompt: function() {
        const modal = document.getElementById('high-score-modal');
        const scoreSpan = document.getElementById('new-high-score');
        const nameInput = document.getElementById('player-name');
        const submitButton = document.getElementById('submit-score');
        
        // Set the score
        scoreSpan.textContent = this.score;
        
        // Reset the name input and button state
        nameInput.value = '';
        submitButton.disabled = false;
        submitButton.textContent = 'Submit';
        
        // Show the modal
        modal.style.display = 'flex';
        
        // Focus the input
        nameInput.focus();
        
        // Remove any existing event listeners to prevent duplicates
        nameInput.onkeypress = null;
        nameInput.onkeydown = null;
        nameInput.oninput = null;
        
        // Handle space key separately to ensure it works with a single press
        nameInput.addEventListener('keydown', function(event) {
            // Special handling for space key
            if (event.key === ' ' || event.keyCode === 32) {
                event.stopPropagation(); // Stop space from triggering other events
                
                // Don't add extra handling beyond this as the browser will handle the input
            }
            
            // Handle Enter key for submission
            if (event.key === 'Enter') {
                submitButton.click();
            }
        });
        
        // Filter input to only allow alphanumeric characters and spaces in real-time
        nameInput.addEventListener('input', function() {
            // Preserve cursor position
            const cursorPos = this.selectionStart;
            
            // Replace any non-alphanumeric characters and spaces with empty string
            const filteredValue = this.value.replace(/[^\w\s]/gi, '');
            
            // Only update if the value actually changed (to avoid unnecessary updates)
            if (this.value !== filteredValue) {
                this.value = filteredValue;
                // Restore cursor position (adjusted if characters were removed)
                this.setSelectionRange(cursorPos, cursorPos);
            }
        });
        
        // Handle submit button click
        submitButton.onclick = () => {
            // Disable the button to prevent multiple submissions
            submitButton.disabled = true;
            submitButton.textContent = 'Submitting...';
            
            const playerName = nameInput.value.trim() || 'Anonymous';
            
            // Submit the score
            HighScores.submitScore(playerName, this.score)
                .then(success => {
                    if (success) {
                        // Hide the modal
                        modal.style.display = 'none';
                        
                        // Show the high score table
                        this.showHighScoreTable();
                    } else {
                        // Re-enable the button if there was an error
                        submitButton.disabled = false;
                        submitButton.textContent = 'Submit';
                        alert('There was an error submitting your score. Please try again.');
                    }
                })
                .catch(error => {
                    console.error("Error in score submission:", error);
                    submitButton.disabled = false;
                    submitButton.textContent = 'Submit';
                    alert('There was an error submitting your score. Please try again.');
                });
        };
    },
    
    // Add method to show high score table
    showHighScoreTable: function() {
        const modal = document.getElementById('high-score-table-modal');
        const tableBody = document.getElementById('high-score-table-body');
        const closeButton = document.getElementById('close-high-score-table');
        
        // Clear existing rows
        tableBody.innerHTML = '';
        
        // Show loading indicator
        tableBody.innerHTML = '<tr><td colspan="4" style="text-align: center;">Loading high scores...</td></tr>';
        
        // Show the modal
        modal.style.display = 'flex';
        
        // Get high scores
        HighScores.getTopScores()
            .then(scores => {
                // Clear loading indicator
                tableBody.innerHTML = '';
                
                // Add rows for each score
                scores.forEach((score, index) => {
                    const row = document.createElement('tr');
                    
                    // Highlight the current player's score
                    if (score.score === this.score) {
                        row.style.backgroundColor = 'rgba(255, 215, 0, 0.3)';
                        row.style.fontWeight = 'bold';
                    }
                    
                    // Format date (just show the date, not time)
                    const formattedDate = score.date;
                    
                    // Add cells
                    row.innerHTML = `
                        <td>${index + 1}</td>
                        <td>${score.name}</td>
                        <td>${score.score}</td>
                        <td>${formattedDate}</td>
                    `;
                    
                    tableBody.appendChild(row);
                });
                
                // If no scores, show message
                if (scores.length === 0) {
                    tableBody.innerHTML = '<tr><td colspan="4" style="text-align: center;">No high scores yet!</td></tr>';
                }
            })
            .catch(error => {
                tableBody.innerHTML = '<tr><td colspan="4" style="text-align: center;">Error loading high scores. Please try again later.</td></tr>';
                console.error("Error showing high score table:", error);
            });
        
        // Handle close button click
        closeButton.onclick = () => {
            modal.style.display = 'none';
        };
    },
    
    // Update the reset method to clear countdowns
    reset: function() {
        // ... existing code ...
        
        // Clear power-up countdowns
        if (PowerUps && typeof PowerUps.clearAllCountdowns === 'function') {
            PowerUps.clearAllCountdowns();
        }
        
        // ... existing code ...
    },
    
    // Add event listeners
    addEventListeners: function() {
        // Start button
        document.getElementById('start-button').addEventListener('click', () => {
            this.hideMainMenu();
            this.startGame();
        });
        
        // Settings button
        document.getElementById('settings-button').addEventListener('click', () => {
            this.showSettings();
        });
        
        // High scores button on main menu
        document.getElementById('high-scores-button').addEventListener('click', () => {
            this.showHighScoreTable();
        });
        
        // Death screen buttons
        document.getElementById('death-restart').addEventListener('click', () => {
            document.getElementById('death-animation').style.display = 'none';
            this.reset();
            this.startGame();
        });
        
        document.getElementById('death-menu').addEventListener('click', () => {
            document.getElementById('death-animation').style.display = 'none';
            this.showMainMenu();
        });
        
        // High scores button on death screen
        document.getElementById('death-high-scores').addEventListener('click', () => {
            this.showHighScoreTable();
        });
        
        // Close high score table button
        document.getElementById('close-high-score-table').addEventListener('click', () => {
            document.getElementById('high-score-table-modal').style.display = 'none';
        });
        
        // Jump controls
        document.addEventListener('keydown', (e) => {
            if ((e.code === 'Space' || e.code === 'ArrowUp') && !this.isJumping && this.isPlaying) {
                this.jumpStart = Date.now();
                this.isJumpKeyDown = true;
                
                // If drunk, add delay to jump
                if (this.isDrunk) {
                    setTimeout(() => {
                        if (this.isJumpKeyDown) { // Only jump if key is still down after delay
                            Player.jump();
                            this.isJumping = true;
                        }
                    }, CONFIG.POWER_UPS.EFFECTS.WHISKEY.JUMP_DELAY);
                } else {
                    Player.jump();
                    this.isJumping = true;
                }
            }
        });
        
        document.addEventListener('keyup', (e) => {
            if (e.code === 'Space' || e.code === 'ArrowUp') {
                this.isJumpKeyDown = false;
                Player.stopFloat();
            }
        });
        
        // Mobile touch controls
        const gameContainer = document.getElementById('game-container');
        
        gameContainer.addEventListener('touchstart', (e) => {
            e.preventDefault(); // Prevent default behavior
            
            if (!this.isJumping && this.isPlaying) {
                this.jumpStart = Date.now();
                this.isTouchDown = true;
                
                // If drunk, add delay to jump
                if (this.isDrunk) {
                    setTimeout(() => {
                        if (this.isTouchDown) { // Only jump if touch is still down after delay
                            Player.jump();
                            this.isJumping = true;
                        }
                    }, CONFIG.POWER_UPS.EFFECTS.WHISKEY.JUMP_DELAY);
                } else {
                    Player.jump();
                    this.isJumping = true;
                }
            }
        });
        
        gameContainer.addEventListener('touchend', (e) => {
            e.preventDefault(); // Prevent default behavior
            this.isTouchDown = false;
            Player.stopFloat();
        });
        
        // Visibility change (pause when tab is not active)
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                if (this.isPlaying) {
                    this.pauseGame();
                    this.wasPlayingBeforeHidden = true;
                }
            } else {
                if (this.wasPlayingBeforeHidden) {
                    this.resumeGame();
                    this.wasPlayingBeforeHidden = false;
                }
            }
        });
        
        // Window resize
        window.addEventListener('resize', () => {
            this.handleResize();
        });
        
        // Orientation change
        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                this.handleResize();
            }, 200); // Small delay to ensure dimensions are updated
        });
    }
};

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', function() {
    Game.init();
    
    // Add event listeners for restart buttons
    const restartButtons = [
        document.getElementById('restart-btn'),
        document.getElementById('death-restart')
    ];
    
    restartButtons.forEach(button => {
        if (button) {
            button.addEventListener('click', function() {
                // Save high score
                if (Game.score > Game.highScore) {
                    Game.highScore = Game.score;
                    Game.saveHighScore();
                }
                
                // Hide game over and death screens
                document.getElementById('game-over').classList.add('hidden');
                document.getElementById('death-animation').classList.add('hidden');
                
                // Start a new game immediately
                Game.startGame();
            });
        }
    });
    
    // Add event listener for main menu buttons
    const menuButtons = [
        document.getElementById('menu-btn'),
        document.getElementById('death-menu')
    ];
    
    menuButtons.forEach(button => {
        if (button) {
            button.addEventListener('click', function() {
                // Save high score
                if (Game.score > Game.highScore) {
                    Game.highScore = Game.score;
                    Game.saveHighScore();
                }
                
                // Go to main menu
                Game.showStartScreen();
            });
        }
    });
}); 