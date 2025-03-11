// Update the applyEffect method to show countdown
applyEffect: function(type) {
    const player = document.getElementById('player');
    const effects = CONFIG.POWER_UPS.EFFECTS;
    
    switch(type) {
        case 'clover':
            // Apply clover effect (invincibility)
            player.classList.add('invincible');
            Game.isInvincible = true;
            
            // Show countdown
            this.showCountdown('clover', effects.CLOVER.DURATION);
            
            // Set timeout to remove effect
            setTimeout(() => {
                player.classList.remove('invincible');
                Game.isInvincible = false;
                Game.showMessage('Invincibility ended!');
                
                // Hide countdown
                this.hideCountdown('clover');
            }, effects.CLOVER.DURATION);
            
            Game.showMessage('Invincible for 10 seconds!');
            break;
            
        case 'whiskey':
            // Apply whiskey effect (staggering)
            player.classList.add('drunk');
            Game.isDrunk = true;
            Game.originalSpeed = Game.speed;
            Game.speed *= effects.WHISKEY.SPEED_MULTIPLIER;
            
            // Show countdown
            this.showCountdown('whiskey', effects.WHISKEY.DURATION);
            
            // Set timeout to remove effect
            setTimeout(() => {
                player.classList.remove('drunk');
                Game.isDrunk = false;
                Game.speed = Game.originalSpeed;
                Game.showMessage('Sobriety restored!');
                
                // Hide countdown
                this.hideCountdown('whiskey');
            }, effects.WHISKEY.DURATION);
            
            Game.showMessage('You feel tipsy for 10 seconds!');
            break;
            
        case 'gold':
            // Apply gold effect (bonus points)
            Game.score += effects.GOLD.POINTS;
            Game.updateScore();
            Game.showMessage(`Found gold! +${effects.GOLD.POINTS} points!`);
            break;
    }
},

// Add methods for countdown display
showCountdown: function(type, duration) {
    const countdownElement = document.getElementById(`${type}-countdown`);
    if (!countdownElement) return;
    
    // Show the countdown
    countdownElement.style.display = 'block';
    
    // Set initial time
    const startTime = Date.now();
    const endTime = startTime + duration;
    
    // Update countdown every 100ms
    const updateInterval = setInterval(() => {
        const currentTime = Date.now();
        const remainingTime = Math.max(0, endTime - currentTime);
        
        // Display remaining time in seconds
        const seconds = Math.ceil(remainingTime / 1000);
        countdownElement.textContent = `${type.charAt(0).toUpperCase() + type.slice(1)}: ${seconds}s`;
        
        // If time is up, clear interval
        if (remainingTime <= 0) {
            clearInterval(updateInterval);
            this.hideCountdown(type);
        }
    }, 100);
    
    // Store interval ID for later cleanup
    this.countdownIntervals = this.countdownIntervals || {};
    this.countdownIntervals[type] = updateInterval;
},

hideCountdown: function(type) {
    const countdownElement = document.getElementById(`${type}-countdown`);
    if (!countdownElement) return;
    
    // Hide the countdown
    countdownElement.style.display = 'none';
    
    // Clear interval if exists
    if (this.countdownIntervals && this.countdownIntervals[type]) {
        clearInterval(this.countdownIntervals[type]);
        delete this.countdownIntervals[type];
    }
},

// Add method to clear all countdowns (for game reset)
clearAllCountdowns: function() {
    // Hide all countdown elements
    const countdowns = document.querySelectorAll('.power-up-countdown');
    countdowns.forEach(el => {
        el.style.display = 'none';
    });
    
    // Clear all intervals
    if (this.countdownIntervals) {
        Object.values(this.countdownIntervals).forEach(interval => {
            clearInterval(interval);
        });
        this.countdownIntervals = {};
    }
}, 