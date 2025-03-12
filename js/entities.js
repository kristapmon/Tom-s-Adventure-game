/**
 * Game Entities
 * Contains classes for all game entities: Player, Trolls, Clouds, Mountains, Trees, Sun
 */

// Player entity
const Player = {
    element: null,
    jumping: false,
    jumpHeight: 0,
    floatTime: 0,
    isHoldingJump: false,
    legAnimationFrame: 0,
    legAnimationInterval: null,
    isInvincible: false,        // Flag for invincibility power-up
    invincibilityTimeout: null, // Timeout for invincibility
    isDrunk: false,             // Flag for whiskey power-up
    drunkTimeout: null,         // Timeout for drunk effect
    jumpDelayTimeout: null,     // Timeout for jump delay when drunk
    originalSpeed: 0,           // Store original speed for whiskey effect
    maxY: 0,                    // Maximum Y position to prevent jumping out of bounds
    
    /**
     * Initialize the player
     */
    init: function() {
        // Clean up any existing state first
        this.cleanup();
        
        // Reset state variables
        this.jumping = false;
        this.jumpHeight = 0;
        this.floatTime = 0;
        this.isHoldingJump = false;
        this.legAnimationFrame = 0;
        this.legAnimationInterval = null;
        this.isInvincible = false;
        this.invincibilityTimeout = null;
        this.isDrunk = false;
        this.drunkTimeout = null;
        this.jumpDelayTimeout = null;
        this.originalSpeed = 0;
        
        // Get player element
        this.element = document.getElementById('player');
        
        // Set player position
        if (this.element) {
            this.element.style.width = `${CONFIG.PLAYER.WIDTH}px`;
            this.element.style.height = `${CONFIG.PLAYER.HEIGHT}px`;
            this.element.style.bottom = `${CONFIG.PLAYER.BOTTOM}px`;
            this.element.style.left = `${CONFIG.PLAYER.LEFT}px`;
            this.element.style.transform = 'translateZ(10px)';
            
            // Clear any existing content
            this.element.innerHTML = '';
            
            // Create player visual
            this.createVisual();
            
            // Start leg animation
            this.startLegAnimation();
            
            // Calculate max Y position (prevent jumping out of bounds)
            this.calculateMaxY();
        }
    },
    
    /**
     * Calculate maximum Y position to prevent jumping out of bounds
     */
    calculateMaxY: function() {
        // Get game container height
        const gameContainer = document.getElementById('game-container');
        if (gameContainer) {
            const containerHeight = gameContainer.clientHeight;
            // Leave some space at the top (header height + buffer)
            const headerHeight = 50;
            const buffer = 20;
            this.maxY = containerHeight - headerHeight - buffer - CONFIG.PLAYER.HEIGHT;
            
            if (window.GameLogger && Game.debugMode) {
                GameLogger.debug(`Max Y position set to: ${this.maxY}px`);
            }
        }
    },
    
    /**
     * Make the player jump
     */
    jump: function() {
        if (!this.jumping && !Game.gameOver && Game.gameStarted) {
            // If player is drunk, add delay to jump
            if (this.isDrunk) {
                // Clear any existing jump delay timeout
                if (this.jumpDelayTimeout) {
                    clearTimeout(this.jumpDelayTimeout);
                }
                
                // Show a visual cue that jump was registered
                Game.showMessage('*Hiccup*', 300);
                
                // Delay the jump
                this.jumpDelayTimeout = setTimeout(() => {
                    this.executeJump();
                }, CONFIG.POWERUP.TYPES.WHISKEY.JUMP_DELAY);
                
                if (window.GameLogger && Game.debugMode) {
                    GameLogger.debug(`Jump delayed by ${CONFIG.POWERUP.TYPES.WHISKEY.JUMP_DELAY}ms due to drunk effect`);
                }
            } else {
                // Jump immediately if not drunk
                this.executeJump();
            }
        }
    },
    
    /**
     * Execute the actual jump (after delay if drunk)
     */
    executeJump: function() {
        if (!this.jumping && !Game.gameOver && Game.gameStarted) {
            this.jumping = true;
            
            // Apply difficulty settings
            const difficultySettings = getCurrentDifficultySettings();
            this.jumpHeight = CONFIG.JUMP_POWER * difficultySettings.JUMP_POWER_MULTIPLIER;
            
            this.floatTime = 0;
            
            // Play jump sound
            if (typeof AudioManager !== 'undefined') {
                AudioManager.play('jump');
            }
        }
    },
    
    /**
     * Start floating (when holding jump button)
     */
    startFloat: function() {
        this.isHoldingJump = true;
    },
    
    /**
     * Stop floating (when releasing jump button)
     */
    stopFloat: function() {
        this.isHoldingJump = false;
    },
    
    /**
     * Update player position and state
     */
    update: function() {
        if (!this.element || Game.gameOver) return;
        
        // Get current position
        const currentBottom = parseFloat(this.element.style.bottom) || CONFIG.PLAYER.BOTTOM;
        
        // Handle jumping
        if (this.jumping) {
            // Calculate new position based on jump height and gravity
            const difficultySettings = getCurrentDifficultySettings();
            const gravity = CONFIG.GRAVITY * difficultySettings.GRAVITY_MULTIPLIER;
            
            // Apply jump height and gravity
            let newBottom = currentBottom + this.jumpHeight;
            this.jumpHeight -= gravity;
            
            // Check if player has landed
            if (this.jumpHeight <= 0 && newBottom <= CONFIG.PLAYER.BOTTOM) {
                newBottom = CONFIG.PLAYER.BOTTOM;
                this.jumping = false;
                this.jumpHeight = 0;
                
                // Play land sound
                if (typeof AudioManager !== 'undefined') {
                    AudioManager.play('land');
                }
            }
            
            // Check if player is at max height
            if (newBottom > this.maxY) {
                newBottom = this.maxY;
                this.jumpHeight = 0; // Start falling
            }
            
            // Update position
            this.element.style.bottom = `${newBottom}px`;
        } else {
            // Ensure player is at the correct ground height when not jumping
            this.element.style.bottom = `${CONFIG.PLAYER.BOTTOM}px`;
        }
        
        // Handle floating (holding jump button)
        if (this.isHoldingJump && this.jumping && this.jumpHeight < 0) {
            // Slow the fall if player is holding jump
            this.floatTime += 1;
            
            // Apply float effect with diminishing returns
            const floatEffect = Math.max(0, CONFIG.FLOAT_POWER - (this.floatTime * 0.1));
            this.jumpHeight += floatEffect;
            
            // Cap the float effect
            if (this.floatTime > CONFIG.MAX_FLOAT_TIME) {
                this.isHoldingJump = false;
                this.floatTime = 0;
            }
        }
    },
    
    /**
     * Get the current ground height based on screen size
     */
    getGroundHeight: function() {
        // Always return the configured bottom value for consistency
        return CONFIG.PLAYER.BOTTOM;
    },
    
    /**
     * Ensure player is at the correct height
     */
    ensureCorrectHeight: function() {
        if (!this.jumping && this.element) {
            this.element.style.bottom = `${CONFIG.PLAYER.BOTTOM}px`;
        }
    },
    
    /**
     * Clean up player resources
     */
    cleanup: function() {
        // Clear animation interval
        if (this.legAnimationInterval) {
            clearInterval(this.legAnimationInterval);
            this.legAnimationInterval = null;
        }
        
        // Clear power-up timeouts
        if (this.invincibilityTimeout) {
            clearTimeout(this.invincibilityTimeout);
            this.invincibilityTimeout = null;
        }
        
        if (this.drunkTimeout) {
            clearTimeout(this.drunkTimeout);
            this.drunkTimeout = null;
        }
        
        if (this.jumpDelayTimeout) {
            clearTimeout(this.jumpDelayTimeout);
            this.jumpDelayTimeout = null;
        }
        
        // Reset player state
        this.jumping = false;
        this.jumpHeight = 0;
        this.floatTime = 0;
        this.isHoldingJump = false;
        this.legAnimationFrame = 0;
        this.isInvincible = false;
        this.isDrunk = false;
        this.originalSpeed = 0;
        
        // Clear player element
        if (this.element) {
            this.element.innerHTML = '';
            this.element.classList.remove('invincible', 'drunk');
            
            // Reset position and transform
            this.element.style.bottom = `${CONFIG.PLAYER.BOTTOM}px`;
            this.element.style.transform = 'translateZ(10px)';
        }
    },
    
    /**
     * Create the player's visual appearance
     */
    createVisual: function() {
        this.element.innerHTML = `
            <div class="pixel-art" style="position: relative; width: 100%; height: 100%; transform-style: preserve-3d;">
                <!-- Head -->
                <div style="position: absolute; top: 0; left: 10%; width: 80%; height: 40%; background-color: #FFE4C4; border-radius: 5px; box-shadow: inset 2px 2px 5px rgba(255, 255, 255, 0.5), inset -2px -2px 5px rgba(0, 0, 0, 0.2);"></div>
                
                <!-- Hair -->
                <div style="position: absolute; top: -10%; left: 5%; width: 90%; height: 30%; background-color: #FFD700; border-radius: 5px; box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.3);"></div>
                
                <!-- Eyes -->
                <div style="position: absolute; top: 15%; left: 25%; width: 15%; height: 10%; background-color: #8B4513; border-radius: 0;"></div>
                <div style="position: absolute; top: 15%; left: 60%; width: 15%; height: 10%; background-color: #8B4513; border-radius: 0;"></div>
                
                <!-- Eyebrows -->
                <div style="position: absolute; top: 10%; left: 20%; width: 25%; height: 5%; background-color: #8B0000; border-radius: 0;"></div>
                <div style="position: absolute; top: 10%; left: 55%; width: 25%; height: 5%; background-color: #8B0000; border-radius: 0;"></div>
                
                <!-- Mouth -->
                <div style="position: absolute; top: 30%; left: 35%; width: 30%; height: 3%; background-color: #A0522D;"></div>
                
                <!-- Body - Teal shirt with purple vest -->
                <div style="position: absolute; top: 40%; left: 0; width: 100%; height: 60%; background-color: #20B2AA; border-radius: 0;"></div>
                
                <!-- Vest -->
                <div style="position: absolute; top: 40%; left: 20%; width: 60%; height: 60%; background-color: #483D8B; border-radius: 0;"></div>
                
                <!-- Cyborg elements with glow -->
                <div style="position: absolute; top: 50%; left: 10%; width: 15%; height: 15%; background-color: #1E90FF; border-radius: 0; box-shadow: 0 0 10px #00BFFF;"></div>
                <div style="position: absolute; top: 50%; left: 75%; width: 15%; height: 15%; background-color: #1E90FF; border-radius: 0; box-shadow: 0 0 10px #00BFFF;"></div>
                
                <!-- Triangular details on shirt -->
                <div style="position: absolute; top: 55%; left: 30%; width: 0; height: 0; border-left: 10px solid transparent; border-right: 10px solid transparent; border-bottom: 20px solid #20B2AA;"></div>
                <div style="position: absolute; top: 55%; left: 60%; width: 0; height: 0; border-left: 10px solid transparent; border-right: 10px solid transparent; border-bottom: 20px solid #20B2AA;"></div>
                
                <!-- Legs -->
                <div id="left-leg" style="position: absolute; top: 100%; left: 20%; width: 20%; height: 20%; background-color: #483D8B; border-radius: 0; transition: height 0.1s;"></div>
                <div id="right-leg" style="position: absolute; top: 100%; left: 60%; width: 20%; height: 15%; background-color: #483D8B; border-radius: 0; transition: height 0.1s;"></div>
            </div>
        `;
    },
    
    /**
     * Start the leg animation
     */
    startLegAnimation: function() {
        // Clear any existing animation interval
        if (this.legAnimationInterval) {
            clearInterval(this.legAnimationInterval);
            this.legAnimationInterval = null;
        }
        
        this.legAnimationInterval = setInterval(() => {
            if (!Game.gameOver && Game.gameStarted && !this.jumping) {
                const leftLeg = document.getElementById('left-leg');
                const rightLeg = document.getElementById('right-leg');
                
                if (leftLeg && rightLeg) {
                    this.legAnimationFrame = (this.legAnimationFrame + 1) % 4;
                    
                    if (this.legAnimationFrame === 0) {
                        leftLeg.style.height = '20%';
                        rightLeg.style.height = '15%';
                    } else if (this.legAnimationFrame === 1) {
                        leftLeg.style.height = '15%';
                        rightLeg.style.height = '20%';
                    } else if (this.legAnimationFrame === 2) {
                        leftLeg.style.height = '20%';
                        rightLeg.style.height = '15%';
                    } else {
                        leftLeg.style.height = '15%';
                        rightLeg.style.height = '20%';
                    }
                }
            }
        }, 150);
    },
    
    /**
     * Create a dead Tom animation for the death screen
     */
    createDeadTom: function() {
        // Remove any existing dead Tom
        const existingDeadTom = document.getElementById('dead-tom');
        if (existingDeadTom && existingDeadTom.parentNode) {
            existingDeadTom.parentNode.removeChild(existingDeadTom);
        }
        
        // Create dead Tom element
        const deadTomElement = document.createElement('div');
        deadTomElement.id = 'dead-tom';
        deadTomElement.className = 'pixel-art';
        deadTomElement.style.position = 'relative';
        deadTomElement.style.width = `${CONFIG.PLAYER.WIDTH}px`;
        deadTomElement.style.height = `${CONFIG.PLAYER.HEIGHT}px`;
        deadTomElement.style.margin = '20px auto';
        deadTomElement.style.transform = 'rotate(90deg)';
        deadTomElement.style.zIndex = '25';
        
        // Create dead Tom visual (matching the in-game appearance but rotated)
        deadTomElement.innerHTML = `
            <div class="pixel-art" style="position: relative; width: 100%; height: 100%; transform-style: preserve-3d;">
                <!-- Head -->
                <div style="position: absolute; top: 0; left: 10%; width: 80%; height: 40%; background-color: #FFE4C4; border-radius: 5px; box-shadow: inset 2px 2px 5px rgba(255, 255, 255, 0.5), inset -2px -2px 5px rgba(0, 0, 0, 0.2);"></div>
                
                <!-- Hair -->
                <div style="position: absolute; top: -10%; left: 5%; width: 90%; height: 30%; background-color: #FFD700; border-radius: 5px; box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.3);"></div>
                
                <!-- Eyes (X shape for dead) -->
                <div style="position: absolute; top: 15%; left: 25%; width: 15%; height: 2px; background-color: #8B4513; transform: rotate(45deg);"></div>
                <div style="position: absolute; top: 15%; left: 25%; width: 15%; height: 2px; background-color: #8B4513; transform: rotate(-45deg);"></div>
                <div style="position: absolute; top: 15%; left: 60%; width: 15%; height: 2px; background-color: #8B4513; transform: rotate(45deg);"></div>
                <div style="position: absolute; top: 15%; left: 60%; width: 15%; height: 2px; background-color: #8B4513; transform: rotate(-45deg);"></div>
                
                <!-- Mouth (flat line) -->
                <div style="position: absolute; top: 30%; left: 35%; width: 30%; height: 3%; background-color: #A0522D;"></div>
                
                <!-- Body - Teal shirt with purple vest -->
                <div style="position: absolute; top: 40%; left: 0; width: 100%; height: 60%; background-color: #20B2AA; border-radius: 0;"></div>
                
                <!-- Vest -->
                <div style="position: absolute; top: 40%; left: 20%; width: 60%; height: 60%; background-color: #483D8B; border-radius: 0;"></div>
                
                <!-- Cyborg elements with glow -->
                <div style="position: absolute; top: 50%; left: 10%; width: 15%; height: 15%; background-color: #1E90FF; border-radius: 0; box-shadow: 0 0 10px #00BFFF;"></div>
                <div style="position: absolute; top: 50%; left: 75%; width: 15%; height: 15%; background-color: #1E90FF; border-radius: 0; box-shadow: 0 0 10px #00BFFF;"></div>
                
                <!-- Triangular details on shirt -->
                <div style="position: absolute; top: 55%; left: 30%; width: 0; height: 0; border-left: 10px solid transparent; border-right: 10px solid transparent; border-bottom: 20px solid #20B2AA;"></div>
                <div style="position: absolute; top: 55%; left: 60%; width: 0; height: 0; border-left: 10px solid transparent; border-right: 10px solid transparent; border-bottom: 20px solid #20B2AA;"></div>
                
                <!-- Legs -->
                <div style="position: absolute; top: 100%; left: 20%; width: 20%; height: 20%; background-color: #483D8B; border-radius: 0;"></div>
                <div style="position: absolute; top: 100%; left: 60%; width: 20%; height: 15%; background-color: #483D8B; border-radius: 0;"></div>
                
                <!-- Floating stars -->
                <div class="star" style="position: absolute; top: -15%; left: -20%; font-size: 20px; color: yellow; animation: float 2s infinite alternate ease-in-out;">✦</div>
                <div class="star" style="position: absolute; top: -20%; left: 50%; font-size: 24px; color: yellow; animation: float 1.5s infinite alternate-reverse ease-in-out;">✦</div>
                <div class="star" style="position: absolute; top: -15%; left: 100%; font-size: 18px; color: yellow; animation: float 2.5s infinite alternate ease-in-out;">✦</div>
            </div>
        `;
        
        // Add animation
        deadTomElement.style.animation = 'deathBounce 0.5s ease-out, float 3s infinite alternate ease-in-out';
        
        // Add to death animation screen
        const deathScreen = document.getElementById('death-animation');
        const deathMessage = document.getElementById('death-message');
        const deathScore = document.getElementById('death-score');
        
        if (deathScreen && deathMessage && deathScore) {
            // Insert between message and score
            deathScreen.insertBefore(deadTomElement, deathScore);
        }
        
        return deadTomElement;
    }
};

// Troll entity manager
const TrollManager = {
    trolls: [],
    nextId: 0,
    lastTrollTime: 0,
    minTrollSpacing: 250, // Increased from 300 to ensure jumpable gaps
    
    /**
     * Initialize the troll manager
     */
    init: function() {
        this.trolls = [];
        this.nextId = 0;
        this.lastTrollTime = Date.now();
    },
    
    /**
     * Create a new troll
     * @param {number} xPos - Optional x position
     */
    createTroll: function(xPos) {
        const trollId = this.nextId++;
        
        // Create troll object
        const troll = {
            id: trollId,
            x: xPos || (Game.getSpawnPosition ? Game.getSpawnPosition() : window.innerWidth) + Math.random() * 200,
            element: null
        };
        
        // Create troll element
        const trollElement = document.createElement('div');
        trollElement.className = 'troll';
        trollElement.id = `troll-${trollId}`;
        trollElement.style.left = `${troll.x}px`;
        trollElement.style.bottom = `${CONFIG.TROLL.BOTTOM}px`;
        trollElement.style.width = `${CONFIG.TROLL.WIDTH}px`;
        trollElement.style.height = `${CONFIG.TROLL.HEIGHT}px`;
        
        // Add orc-like troll visual with weapon
        trollElement.innerHTML = `
            <div class="pixel-art" style="position: relative; width: 100%; height: 100%; transform-style: preserve-3d;">
                <!-- Orc Body -->
                <div style="position: absolute; top: 20%; left: 0; width: 100%; height: 80%; background-color: #4A6741; border-radius: 0;"></div>
                
                <!-- Orc Head -->
                <div style="position: absolute; top: 0; left: 15%; width: 70%; height: 30%; background-color: #5D8A57; border-radius: 0;"></div>
                
                <!-- Orc Face -->
                <div style="position: absolute; top: 5%; left: 25%; width: 50%; height: 20%; background-color: #4A6741; border-radius: 0;"></div>
                
                <!-- Orc Eyes -->
                <div style="position: absolute; top: 10%; left: 30%; width: 10%; height: 10%; background-color: #FF4500; border-radius: 50%; box-shadow: 0 0 5px #FF4500;"></div>
                <div style="position: absolute; top: 10%; left: 60%; width: 10%; height: 10%; background-color: #FF4500; border-radius: 50%; box-shadow: 0 0 5px #FF4500;"></div>
                
                <!-- Orc Eyebrows -->
                <div style="position: absolute; top: 5%; left: 25%; width: 20%; height: 5%; background-color: #2E3B28; border-radius: 0; transform: rotate(-10deg);"></div>
                <div style="position: absolute; top: 5%; left: 55%; width: 20%; height: 5%; background-color: #2E3B28; border-radius: 0; transform: rotate(10deg);"></div>
                
                <!-- Orc Mouth with Tusks -->
                <div style="position: absolute; top: 22%; left: 35%; width: 30%; height: 5%; background-color: #2E3B28; border-radius: 0 0 5px 5px;"></div>
                <div style="position: absolute; top: 18%; left: 32%; width: 8%; height: 10%; background-color: #F5F5DC; border-radius: 0; transform: rotate(-10deg);"></div>
                <div style="position: absolute; top: 18%; left: 60%; width: 8%; height: 10%; background-color: #F5F5DC; border-radius: 0; transform: rotate(10deg);"></div>
                
                <!-- Orc Ears (Pointed) -->
                <div style="position: absolute; top: 5%; left: 5%; width: 15%; height: 15%; background-color: #5D8A57; border-radius: 0; clip-path: polygon(0% 50%, 100% 0%, 100% 100%);"></div>
                <div style="position: absolute; top: 5%; left: 80%; width: 15%; height: 15%; background-color: #5D8A57; border-radius: 0; clip-path: polygon(0% 0%, 100% 50%, 0% 100%);"></div>
                
                <!-- Armor/Shoulder Pads -->
                <div style="position: absolute; top: 30%; left: 0; width: 30%; height: 20%; background-color: #8B4513; border-radius: 5px;"></div>
                <div style="position: absolute; top: 30%; left: 70%; width: 30%; height: 20%; background-color: #8B4513; border-radius: 5px;"></div>
                
                <!-- Belt -->
                <div style="position: absolute; top: 60%; left: 0; width: 100%; height: 10%; background-color: #8B4513; border-radius: 0;"></div>
                
                <!-- Weapon (Axe) -->
                <div style="position: absolute; top: 30%; left: -40%; width: 50%; height: 8%; background-color: #8B4513; border-radius: 0; transform: rotate(-45deg);"></div>
                <div style="position: absolute; top: 20%; left: -50%; width: 25%; height: 25%; background-color: #A9A9A9; border-radius: 0; clip-path: polygon(0% 50%, 50% 0%, 100% 50%, 50% 100%);"></div>
            </div>
        `;
        
        // Add to game container
        document.getElementById('game-container').appendChild(trollElement);
        
        // Store element reference
        troll.element = trollElement;
        
        // Add to trolls array
        this.trolls.push(troll);
        
        // Update last troll time
        this.lastTrollTime = Date.now();
    },
    
    /**
     * Check if a new troll should spawn
     */
    checkSpawn: function() {
        // Get current difficulty settings
        const difficultySettings = getCurrentDifficultySettings();
        
        // Calculate spawn probability based on difficulty
        const spawnProbability = difficultySettings.TROLL_SPAWN_RATE;
        
        // Check if enough time has passed since the last troll (minimum spacing)
        const currentTime = Date.now();
        const timeSinceLastTroll = currentTime - this.lastTrollTime;
        const minTimeBetweenTrolls = this.minTrollSpacing / Game.speed; // Convert pixels to time
        
        // Get appropriate spawn position based on device
        const rightEdge = Game.getSpawnPosition ? Game.getSpawnPosition() : window.innerWidth;
        
        // Check if any trolls are too close to the right edge
        let trollTooClose = false;
        for (let i = 0; i < this.trolls.length; i++) {
            const troll = this.trolls[i];
            if (troll.x > rightEdge - this.minTrollSpacing) {
                trollTooClose = true;
                break;
            }
        }
        
        // Only spawn if:
        // 1. Random chance based on difficulty (higher spawn rate)
        // 2. Enough time has passed since last troll
        // 3. No trolls are too close to the right edge (enforced minimum distance)
        if (Math.random() < spawnProbability && 
            timeSinceLastTroll > minTimeBetweenTrolls && 
            !trollTooClose) {
            this.createTroll();
        }
    },
    
    /**
     * Clean up all trolls
     */
    cleanup: function() {
        // Remove all troll elements from the DOM
        this.trolls.forEach(troll => {
            if (troll.element && troll.element.parentNode) {
                troll.element.parentNode.removeChild(troll.element);
            }
        });
        
        // Reset trolls array
        this.trolls = [];
        this.nextId = 0;
    }
};

// Tree entity manager
const TreeManager = {
    trees: [],
    nextId: 0,
    treeTypes: [
        {
            name: 'pine',
            color: '#006400',
            trunkColor: '#8B4513',
            shape: 'triangle'
        },
        {
            name: 'oak',
            color: '#228B22',
            trunkColor: '#A0522D',
            shape: 'round'
        },
        {
            name: 'maple',
            color: '#32CD32',
            trunkColor: '#8B4513',
            shape: 'oval'
        },
        {
            name: 'birch',
            color: '#90EE90',
            trunkColor: '#F5F5DC',
            shape: 'slim'
        },
        {
            name: 'willow',
            color: '#6B8E23',
            trunkColor: '#A0522D',
            shape: 'weeping'
        }
    ],
    
    /**
     * Initialize the tree manager
     */
    init: function() {
        this.trees = [];
        this.nextId = 0;
        
        // Create initial trees across the screen
        const screenWidth = Game.getSpawnPosition ? Game.getSpawnPosition() : window.innerWidth;
        const numInitialTrees = 15; // More trees for better distribution
        
        for (let i = 0; i < numInitialTrees; i++) {
            // Distribute trees evenly across the screen and beyond
            const xPos = (i * (screenWidth + 500) / numInitialTrees) + (Math.random() * 100 - 50);
            this.createTree(xPos);
        }
    },
    
    /**
     * Create a new tree
     * @param {number} xPos - Optional x position
     */
    createTree: function(xPos) {
        const treeId = this.nextId++;
        
        // Randomly select a tree type
        const treeTypeIndex = Math.floor(Math.random() * this.treeTypes.length);
        const treeType = this.treeTypes[treeTypeIndex];
        
        // Create tree object
        const tree = {
            id: treeId,
            x: xPos || (Game.getSpawnPosition ? Game.getSpawnPosition() : window.innerWidth) + Math.random() * 200,
            type: treeType,
            size: 50 + Math.random() * 50, // Random size between 50-100px
            depth: Math.random() * 100 - 200, // Random depth for parallax effect
            element: null
        };
        
        // Create tree element
        const treeElement = document.createElement('div');
        treeElement.className = 'tree pixel-art';
        treeElement.id = `tree-${treeId}`;
        treeElement.style.position = 'absolute';
        treeElement.style.left = `${tree.x}px`;
        treeElement.style.bottom = `${CONFIG.PLAYER.BOTTOM}px`; // Match player bottom
        treeElement.style.width = `${tree.size}px`;
        treeElement.style.height = `${tree.size * 2}px`;
        treeElement.style.transform = `translateZ(${tree.depth}px)`;
        // Ensure trees are always in front of mountains regardless of depth
        treeElement.style.zIndex = Math.max(11, Math.floor(tree.depth) + 20);
        
        // Create tree HTML based on type
        let treeHTML = '';
        
        switch(treeType.shape) {
            case 'triangle': // Pine tree
                treeHTML = `
                    <div style="position: absolute; bottom: 0; left: 25%; width: 50%; height: 30%; background-color: ${treeType.trunkColor};"></div>
                    <div style="position: absolute; bottom: 30%; left: 0; width: 0; height: 0; 
                        border-left: ${tree.size/2}px solid transparent; 
                        border-right: ${tree.size/2}px solid transparent; 
                        border-bottom: ${tree.size}px solid ${treeType.color};"></div>
                    <div style="position: absolute; bottom: 50%; left: 10%; width: 0; height: 0; 
                        border-left: ${tree.size*0.4}px solid transparent; 
                        border-right: ${tree.size*0.4}px solid transparent; 
                        border-bottom: ${tree.size*0.8}px solid ${treeType.color};"></div>
                    <div style="position: absolute; bottom: 70%; left: 20%; width: 0; height: 0; 
                        border-left: ${tree.size*0.3}px solid transparent; 
                        border-right: ${tree.size*0.3}px solid transparent; 
                        border-bottom: ${tree.size*0.6}px solid ${treeType.color};"></div>
                `;
                break;
                
            case 'round': // Oak tree
                treeHTML = `
                    <div style="position: absolute; bottom: 0; left: 40%; width: 20%; height: 40%; background-color: ${treeType.trunkColor};"></div>
                    <div style="position: absolute; bottom: 35%; left: 10%; width: 80%; height: 70%; background-color: ${treeType.color}; border-radius: 50%;"></div>
                `;
                break;
                
            case 'oval': // Maple tree
                treeHTML = `
                    <div style="position: absolute; bottom: 0; left: 40%; width: 20%; height: 50%; background-color: ${treeType.trunkColor};"></div>
                    <div style="position: absolute; bottom: 45%; left: 5%; width: 90%; height: 60%; background-color: ${treeType.color}; border-radius: 40% 40% 60% 60%;"></div>
                `;
                break;
                
            case 'slim': // Birch tree
                treeHTML = `
                    <div style="position: absolute; bottom: 0; left: 45%; width: 10%; height: 80%; background-color: ${treeType.trunkColor};"></div>
                    <div style="position: absolute; bottom: 60%; left: 20%; width: 60%; height: 50%; background-color: ${treeType.color}; border-radius: 40%;"></div>
                `;
                break;
                
            case 'weeping': // Willow tree
                treeHTML = `
                    <div style="position: absolute; bottom: 0; left: 45%; width: 10%; height: 60%; background-color: ${treeType.trunkColor};"></div>
                    <div style="position: absolute; bottom: 50%; left: 10%; width: 80%; height: 60%; background-color: ${treeType.color}; border-radius: 50% 50% 0 0;"></div>
                    <div style="position: absolute; bottom: 30%; left: 0; width: 100%; height: 30%; 
                        background: linear-gradient(to bottom, ${treeType.color}, transparent); 
                        border-radius: 0 0 40% 40%;"></div>
                `;
                break;
        }
        
        treeElement.innerHTML = treeHTML;
        
        // Add to game container
        document.getElementById('game-container').appendChild(treeElement);
        
        // Store element reference
        tree.element = treeElement;
        
        // Add to trees array
        this.trees.push(tree);
    },
    
    /**
     * Update all trees
     */
    update: function() {
        // Update each tree
        for (let i = this.trees.length - 1; i >= 0; i--) {
            const tree = this.trees[i];
            
            // Calculate parallax factor based on depth
            // Trees further back (negative depth) move slower
            const parallaxFactor = Math.max(0.3, Math.min(0.7, (300 + tree.depth) / 500));
            
            // Move tree based on game speed and parallax factor
            tree.x -= Game.speed * parallaxFactor;
            tree.element.style.left = `${tree.x}px`;
            
            // Remove tree if it's off-screen
            if (tree.x < -tree.size * 2) {
                if (tree.element && tree.element.parentNode) {
                    tree.element.parentNode.removeChild(tree.element);
                }
                this.trees.splice(i, 1);
                
                // Get appropriate spawn position based on device
                const rightEdge = Game.getSpawnPosition ? Game.getSpawnPosition() : window.innerWidth;
                
                // Create a new tree
                this.createTree(rightEdge + Math.random() * 200);
            }
        }
        
        // Check if we need more trees
        if (this.trees.length < 15) {
            // Get appropriate spawn position based on device
            const rightEdge = Game.getSpawnPosition ? Game.getSpawnPosition() : window.innerWidth;
            
            this.createTree(rightEdge + Math.random() * 200);
        }
    },
    
    /**
     * Clean up all trees
     */
    cleanup: function() {
        // Remove all tree elements from the DOM
        this.trees.forEach(tree => {
            if (tree.element && tree.element.parentNode) {
                tree.element.parentNode.removeChild(tree.element);
            }
        });
        
        // Reset trees array
        this.trees = [];
        this.nextId = 0;
    }
};

// Sun entity
const SunManager = {
    sun: null,
    
    /**
     * Initialize the sun
     */
    init: function() {
        // Create sun element
        const sunElement = document.createElement('div');
        sunElement.id = 'sun';
        sunElement.style.position = 'absolute';
        sunElement.style.top = '50px';
        sunElement.style.right = '100px';
        sunElement.style.width = '80px';
        sunElement.style.height = '80px';
        sunElement.style.borderRadius = '50%';
        sunElement.style.background = 'radial-gradient(circle, #FFFF00 60%, #FFA500)';
        sunElement.style.boxShadow = '0 0 30px #FFFF00';
        sunElement.style.zIndex = '-5';
        
        // Add rays
        const raysHTML = `
            <div style="position: absolute; top: -20px; left: 35px; width: 10px; height: 20px; background-color: #FFFF00;"></div>
            <div style="position: absolute; top: 80px; left: 35px; width: 10px; height: 20px; background-color: #FFFF00;"></div>
            <div style="position: absolute; top: 35px; left: -20px; width: 20px; height: 10px; background-color: #FFFF00;"></div>
            <div style="position: absolute; top: 35px; left: 80px; width: 20px; height: 10px; background-color: #FFFF00;"></div>
            <div style="position: absolute; top: 10px; left: 10px; width: 10px; height: 10px; background-color: #FFFF00; transform: rotate(45deg);"></div>
            <div style="position: absolute; top: 60px; left: 60px; width: 10px; height: 10px; background-color: #FFFF00; transform: rotate(45deg);"></div>
            <div style="position: absolute; top: 10px; left: 60px; width: 10px; height: 10px; background-color: #FFFF00; transform: rotate(45deg);"></div>
            <div style="position: absolute; top: 60px; left: 10px; width: 10px; height: 10px; background-color: #FFFF00; transform: rotate(45deg);"></div>
        `;
        
        sunElement.innerHTML = raysHTML;
        
        // Add to game container
        document.getElementById('game-container').appendChild(sunElement);
        
        // Store element reference
        this.sun = sunElement;
        
        // Add subtle animation
        this.animate();
    },
    
    /**
     * Animate the sun
     */
    animate: function() {
        if (!this.sun) return;
        
        // Add subtle pulsing animation
        this.sun.style.animation = 'sunPulse 5s infinite alternate';
    },
    
    /**
     * Clean up sun
     */
    cleanup: function() {
        if (this.sun && this.sun.parentNode) {
            this.sun.parentNode.removeChild(this.sun);
        }
        this.sun = null;
    }
};

// Cloud entity manager
const CloudManager = {
    clouds: [],
    nextId: 0,
    
    /**
     * Initialize the cloud manager
     */
    init: function() {
        this.clouds = [];
        this.nextId = 0;
        
        // Create initial clouds distributed across the screen
        const screenWidth = Game.getSpawnPosition ? Game.getSpawnPosition() : window.innerWidth;
        const numInitialClouds = 10; // Increased from 5 to 10
        
        for (let i = 0; i < numInitialClouds; i++) {
            // Distribute clouds evenly across the screen
            const xPos = (i * screenWidth / numInitialClouds) + (Math.random() * 100 - 50);
            const yPos = 50 + Math.random() * 150;
            this.createCloud(xPos, yPos);
        }
    },
    
    /**
     * Create a new cloud
     * @param {number} xPos - Optional x position
     * @param {number} yPos - Optional y position
     */
    createCloud: function(xPos, yPos) {
        const cloudId = this.nextId++;
        
        // Create cloud object
        const cloud = {
            id: cloudId,
            x: xPos !== undefined ? xPos : (Game.getSpawnPosition ? Game.getSpawnPosition() : window.innerWidth) + Math.random() * 200,
            y: yPos !== undefined ? yPos : 50 + Math.random() * 150,
            size: CONFIG.CLOUD.MIN_SIZE + Math.random() * (CONFIG.CLOUD.MAX_SIZE - CONFIG.CLOUD.MIN_SIZE),
            speed: CONFIG.CLOUD.MIN_SPEED + Math.random() * (CONFIG.CLOUD.MAX_SPEED - CONFIG.CLOUD.MIN_SPEED),
            depth: Math.random() * 200 - 100,
            element: null
        };
        
        // Create cloud element
        const cloudElement = document.createElement('div');
        cloudElement.className = 'cloud pixel-art';
        cloudElement.id = `cloud-${cloudId}`;
        cloudElement.style.left = `${cloud.x}px`;
        cloudElement.style.top = `${cloud.y}px`;
        cloudElement.style.width = `${cloud.size}px`;
        cloudElement.style.height = `${cloud.size / 2}px`;
        cloudElement.style.transform = `translateZ(${cloud.depth}px)`;
        cloudElement.style.opacity = (200 - Math.abs(cloud.depth)) / 200 * 0.8;
        
        // Add to game container
        document.getElementById('game-container').appendChild(cloudElement);
        
        // Store element reference
        cloud.element = cloudElement;
        
        // Add to clouds array
        this.clouds.push(cloud);
    },
    
    /**
     * Update all clouds
     */
    update: function() {
        // Update each cloud
        for (let i = this.clouds.length - 1; i >= 0; i--) {
            const cloud = this.clouds[i];
            
            // Move cloud
            cloud.x -= cloud.speed;
            cloud.element.style.left = `${cloud.x}px`;
            
            // Remove cloud if it's off-screen
            if (cloud.x < -200) {
                cloud.element.remove();
                this.clouds.splice(i, 1);
                
                // Create a new cloud
                this.createCloud();
            }
        }
    },
    
    /**
     * Check if a new cloud should spawn
     */
    checkSpawn: function() {
        if (Math.random() < CONFIG.CLOUD.SPAWN_RATE * 1.5) { // Increased spawn rate by 50%
            this.createCloud();
        }
    },
    
    /**
     * Clean up all clouds
     */
    cleanup: function() {
        // Remove all cloud elements from the DOM
        this.clouds.forEach(cloud => {
            if (cloud.element && cloud.element.parentNode) {
                cloud.element.parentNode.removeChild(cloud.element);
            }
        });
        
        // Reset clouds array
        this.clouds = [];
        this.nextId = 0;
    }
};

// Mountain entity manager
const MountainManager = {
    mountains: [],
    nextId: 0,
    
    /**
     * Initialize the mountain manager
     */
    init: function() {
        this.mountains = [];
        this.nextId = 0;
        
        // Create initial mountains - fewer mountains, more spread out
        const screenWidth = window.innerWidth;
        const numInitialMountains = 3; // Reduced from 5 to 3
        
        for (let i = 0; i < numInitialMountains; i++) {
            // Distribute mountains evenly across the screen and beyond with more spacing
            const xPos = (i * (screenWidth + 800) / numInitialMountains) + (Math.random() * 300 - 150);
            this.createMountain(xPos);
        }
    },
    
    /**
     * Create a new mountain
     * @param {number} xPos - Optional x position
     */
    createMountain: function(xPos) {
        const mountainId = this.nextId++;
        
        // Check if on mobile
        const isMobile = window.matchMedia("(hover: none) and (pointer: coarse)").matches;
        
        // Create mountain object
        const mountain = {
            id: mountainId,
            x: xPos || (Game.getSpawnPosition ? Game.getSpawnPosition() : window.innerWidth) + Math.random() * 500,
            size: 150 + Math.random() * 100, // Size between 150-250 (larger)
            depth: Math.random() * 100 - 150, // Depth between -150 and -50
            element: null
        };
        
        // Create mountain element
        const mountainElement = document.createElement('div');
        mountainElement.className = 'mountain pixel-art';
        mountainElement.id = `mountain-${mountainId}`;
        mountainElement.style.left = `${mountain.x}px`;
        
        // For mobile, ensure mountains maintain proper triangle shape
        if (isMobile) {
            mountainElement.style.width = '0';
            mountainElement.style.height = '0';
            mountainElement.style.transform = `translateZ(${mountain.depth}px)`;
            
            // Ensure constant triangle sizes on mobile
            mountainElement.style.borderLeft = '150px solid transparent';
            mountainElement.style.borderRight = '150px solid transparent';
            mountainElement.style.borderBottom = '200px solid #6B8E23';
        } else {
            // Scale mountain based on size for desktop
            const scale = mountain.size / 150;
            mountainElement.style.transform = `translateZ(${mountain.depth}px) scale(${scale})`;
            
            // Adjust color based on depth for 3D effect
            const baseColor = 107 + (mountain.depth + 150) / 250 * 30;
            mountainElement.style.borderBottomColor = `rgb(${baseColor - 50}, ${baseColor}, ${baseColor - 70})`;
        }
        
        // Add to mountains container
        document.getElementById('mountains').appendChild(mountainElement);
        
        // Store element reference
        mountain.element = mountainElement;
        
        // Add to mountains array
        this.mountains.push(mountain);
    },
    
    /**
     * Update all mountains
     */
    update: function() {
        // Update each mountain
        for (let i = this.mountains.length - 1; i >= 0; i--) {
            const mountain = this.mountains[i];
            
            // Calculate parallax factor based on depth
            // Mountains further back (negative depth) move slower
            const parallaxFactor = Math.max(0.05, Math.min(0.2, (300 + mountain.depth) / 500));
            
            // Move mountain based on game speed and parallax factor
            mountain.x -= Game.speed * parallaxFactor;
            mountain.element.style.left = `${mountain.x}px`;
            
            // Remove mountain if it's off-screen
            if (mountain.x < -400) {
                if (mountain.element && mountain.element.parentNode) {
                    mountain.element.parentNode.removeChild(mountain.element);
                }
                this.mountains.splice(i, 1);
                
                // Create a new mountain - with more randomness in position
                this.createMountain(window.innerWidth + Math.random() * 800);
            }
        }
        
        // Check if we need more mountains - but keep the count low
        if (this.mountains.length < 3) {
            this.createMountain(window.innerWidth + Math.random() * 500);
        }
    },
    
    /**
     * Clean up all mountains
     */
    cleanup: function() {
        // Remove all mountain elements from the DOM
        this.mountains.forEach(mountain => {
            if (mountain.element && mountain.element.parentNode) {
                mountain.element.parentNode.removeChild(mountain.element);
            }
        });
        
        // Reset mountains array
        this.mountains = [];
        this.nextId = 0;
        
        // Clear mountains container
        const mountainsContainer = document.getElementById('mountains');
        if (mountainsContainer) {
            mountainsContainer.innerHTML = '';
        }
    }
};

// Collision detection
const Collision = {
    /**
     * Check collision between two elements
     * @param {HTMLElement} element1 - First element
     * @param {HTMLElement} element2 - Second element
     * @returns {boolean} - True if collision detected
     */
    check: function(element1, element2) {
        if (!element1 || !element2) return false;
        
        try {
            const rect1 = element1.getBoundingClientRect();
            const rect2 = element2.getBoundingClientRect();
            
            // Add a small buffer to make collision less sensitive (10px)
            const buffer = 10;
            
            return !(
                rect1.right - buffer < rect2.left + buffer ||
                rect1.left + buffer > rect2.right - buffer ||
                rect1.bottom - buffer < rect2.top + buffer ||
                rect1.top + buffer > rect2.bottom - buffer
            );
        } catch (e) {
            console.warn('Error in collision detection:', e);
            return false;
        }
    }
};

// Power-up entity manager
const PowerUpManager = {
    powerUps: [],
    nextId: 0,
    lastPowerUpX: 0, // Track the x position of the last spawned power-up
    
    /**
     * Initialize the power-up manager
     */
    init: function() {
        this.powerUps = [];
        this.nextId = 0;
        this.lastPowerUpX = 0;
        
        if (window.GameLogger) {
            GameLogger.info('PowerUpManager initialized');
        }
    },
    
    /**
     * Create a new power-up
     */
    createPowerUp: function() {
        // Get appropriate spawn position based on device
        const rightEdge = Game.getSpawnPosition ? Game.getSpawnPosition() : window.innerWidth;
        
        // Check if we should spawn a power-up based on minimum distance
        if (rightEdge - this.lastPowerUpX < CONFIG.POWERUP.MIN_DISTANCE) {
            return; // Don't spawn if too close to the last power-up
        }
        
        const powerUpId = this.nextId++;
        
        // Determine power-up type based on probability
        const typeRandom = Math.random();
        let type;
        let cumulativeProbability = 0;
        
        for (const [key, value] of Object.entries(CONFIG.POWERUP.TYPES)) {
            cumulativeProbability += value.PROBABILITY;
            if (typeRandom <= cumulativeProbability) {
                type = key.toLowerCase();
                break;
            }
        }
        
        // Fallback to gold if no type was selected (shouldn't happen with proper probabilities)
        if (!type) {
            type = 'gold';
        }
        
        // Random height between MIN_BOTTOM and MAX_BOTTOM
        const bottom = CONFIG.POWERUP.MIN_BOTTOM + 
            Math.random() * (CONFIG.POWERUP.MAX_BOTTOM - CONFIG.POWERUP.MIN_BOTTOM);
        
        // Create power-up object
        const powerUp = {
            id: powerUpId,
            type: type,
            x: rightEdge,
            bottom: bottom,
            collected: false,
            createdAt: Date.now(),
            expiresAt: Date.now() + CONFIG.POWERUP.LIFESPAN
        };
        
        // Create power-up element
        const powerUpElement = document.createElement('div');
        powerUpElement.className = `powerup powerup-${type} pixel-art`;
        powerUpElement.id = `powerup-${powerUpId}`;
        powerUpElement.style.left = `${powerUp.x}px`;
        powerUpElement.style.bottom = `${powerUp.bottom}px`;
        powerUpElement.style.width = `${CONFIG.POWERUP.WIDTH}px`;
        powerUpElement.style.height = `${CONFIG.POWERUP.HEIGHT}px`;
        
        // Add to game container
        document.getElementById('game-container').appendChild(powerUpElement);
        
        // Store element reference
        powerUp.element = powerUpElement;
        
        // Add to powerUps array
        this.powerUps.push(powerUp);
        
        // Update last power-up position
        this.lastPowerUpX = powerUp.x;
        
        if (window.GameLogger && Game.debugMode) {
            GameLogger.debug(`Created ${type} power-up at position ${powerUp.x}, ${powerUp.bottom}`);
        }
    },
    
    /**
     * Check if a new power-up should spawn
     */
    checkSpawn: function() {
        const difficultySettings = getCurrentDifficultySettings();
        if (Math.random() < difficultySettings.POWERUP_SPAWN_RATE) {
            this.createPowerUp();
        }
    },
    
    /**
     * Update all power-ups
     */
    update: function() {
        const currentTime = Date.now();
        
        // Update each power-up
        for (let i = this.powerUps.length - 1; i >= 0; i--) {
            const powerUp = this.powerUps[i];
            
            // Skip if already collected
            if (powerUp.collected) continue;
            
            // Move power-up
            powerUp.x -= Game.speed;
            powerUp.element.style.left = `${powerUp.x}px`;
            
            // Check if power-up has expired
            if (currentTime > powerUp.expiresAt) {
                this.removePowerUp(powerUp);
                continue;
            }
            
            // Check if power-up is off-screen
            if (powerUp.x < -CONFIG.POWERUP.WIDTH) {
                this.removePowerUp(powerUp);
                continue;
            }
            
            // Check collision with player
            if (Player.element && !Game.gameOver && Collision.check(Player.element, powerUp.element)) {
                this.collectPowerUp(powerUp);
            }
        }
    },
    
    /**
     * Collect a power-up
     * @param {Object} powerUp - The power-up to collect
     */
    collectPowerUp: function(powerUp) {
        // Mark as collected
        powerUp.collected = true;
        
        // Play collection animation
        powerUp.element.style.animation = 'collect 0.5s forwards';
        
        // Play sound
        if (typeof AudioManager !== 'undefined') {
            AudioManager.play('powerup');
        }
        
        // Apply power-up effect
        switch (powerUp.type) {
            case 'clover':
                this.applyCloverEffect();
                break;
            case 'gold':
                this.applyGoldEffect();
                break;
            case 'whiskey':
                this.applyWhiskeyEffect();
                break;
        }
        
        // Remove power-up after animation
        setTimeout(() => {
            this.removePowerUp(powerUp);
        }, 500);
        
        if (window.GameLogger) {
            GameLogger.info(`Collected ${powerUp.type} power-up`);
        }
    },
    
    /**
     * Apply four-leaf clover effect (invincibility)
     */
    applyCloverEffect: function() {
        // Add invincibility class to player
        Player.element.classList.add('invincible');
        
        // Set invincibility flag
        Player.isInvincible = true;
        
        // Show message
        Game.showMessage('Invincible!', 2000);
        
        // Clear any existing invincibility timeout
        if (Player.invincibilityTimeout) {
            clearTimeout(Player.invincibilityTimeout);
        }
        
        // Set timeout to remove invincibility
        Player.invincibilityTimeout = setTimeout(() => {
            Player.element.classList.remove('invincible');
            Player.isInvincible = false;
            
            if (window.GameLogger && Game.debugMode) {
                GameLogger.debug('Invincibility ended');
            }
        }, CONFIG.POWERUP.TYPES.CLOVER.EFFECT_DURATION);
        
        if (window.GameLogger) {
            GameLogger.info(`Applied clover effect (invincibility) for ${CONFIG.POWERUP.TYPES.CLOVER.EFFECT_DURATION}ms`);
        }
    },
    
    /**
     * Apply pot of gold effect (score bonus)
     */
    applyGoldEffect: function() {
        // Add score bonus
        Game.score += CONFIG.POWERUP.TYPES.GOLD.SCORE_BONUS;
        
        // Update score display
        Game.updateScoreDisplay();
        
        // Show message
        Game.showMessage(`+${CONFIG.POWERUP.TYPES.GOLD.SCORE_BONUS} Points!`, 2000);
        
        if (window.GameLogger) {
            GameLogger.info(`Applied gold effect (score +${CONFIG.POWERUP.TYPES.GOLD.SCORE_BONUS})`);
        }
    },
    
    /**
     * Apply whiskey flask effect (increased speed and jump delay)
     */
    applyWhiskeyEffect: function() {
        // Add drunk class to player
        Player.element.classList.add('drunk');
        
        // Set drunk flag
        Player.isDrunk = true;
        
        // Store original speed
        Player.originalSpeed = Game.speed;
        
        // Calculate target speed for whiskey effect (for gradual increase)
        const targetSpeed = Game.speed * CONFIG.POWERUP.TYPES.WHISKEY.SPEED_MULTIPLIER;
        
        // Set up gradual speed increase
        Game.speedIncreaseInProgress = true;
        Game.speedIncreaseStartTime = Date.now();
        Game.speedIncreaseStartValue = Game.speed;
        Game.targetSpeed = targetSpeed;
        
        // Use a shorter duration for power-up (1 second) for more immediate feedback
        Game.speedIncreaseDuration = 1000;
        
        // Show message
        Game.showMessage('Whoa! Feeling tipsy!', 2000);
        
        // Clear any existing drunk timeout
        if (Player.drunkTimeout) {
            clearTimeout(Player.drunkTimeout);
        }
        
        // Set timeout to remove drunk effect
        Player.drunkTimeout = setTimeout(() => {
            // Start gradual transition back to original speed
            Game.speedIncreaseInProgress = true;
            Game.speedIncreaseStartTime = Date.now();
            Game.speedIncreaseStartValue = Game.speed;
            Game.targetSpeed = Player.originalSpeed;
            Game.speedIncreaseDuration = 1000; // 1 second for power-up deactivation
            
            // Remove visual drunk effects
            Player.element.classList.remove('drunk');
            Player.isDrunk = false;
            
            if (window.GameLogger && Game.debugMode) {
                GameLogger.debug('Drunk effect ending - gradually restoring speed');
            }
        }, CONFIG.POWERUP.TYPES.WHISKEY.EFFECT_DURATION);
        
        if (window.GameLogger) {
            GameLogger.info(`Applied whiskey effect (speed gradually increasing to x${CONFIG.POWERUP.TYPES.WHISKEY.SPEED_MULTIPLIER}) for ${CONFIG.POWERUP.TYPES.WHISKEY.EFFECT_DURATION}ms`);
        }
    },
    
    /**
     * Remove a power-up
     * @param {Object} powerUp - The power-up to remove
     */
    removePowerUp: function(powerUp) {
        // Remove element from DOM
        if (powerUp.element && powerUp.element.parentNode) {
            powerUp.element.parentNode.removeChild(powerUp.element);
        }
        
        // Remove from powerUps array
        this.powerUps = this.powerUps.filter(p => p.id !== powerUp.id);
    },
    
    /**
     * Clean up all power-ups
     */
    cleanup: function() {
        // Remove all power-up elements from the DOM
        this.powerUps.forEach(powerUp => {
            if (powerUp.element && powerUp.element.parentNode) {
                powerUp.element.parentNode.removeChild(powerUp.element);
            }
        });
        
        // Reset powerUps array
        this.powerUps = [];
        this.nextId = 0;
        this.lastPowerUpX = 0;
    }
}; 