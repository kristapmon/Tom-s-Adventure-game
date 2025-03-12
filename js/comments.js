/**
 * Comments Manager
 * Handles all short one-liners for Tom to say during gameplay
 */

const CommentsManager = {
    // Short one-liners about Ireland, countryside, and trolls
    comments: [
        // Ireland-related
        "Top o' the mornin'!",
        "Is that a leprechaun?",
        "Lucky charms!",
        "For the Emerald Isle!",
        "Green as Irish hills!",
        "Dublin or nothin'!",
        "Irish I could stop!",
        "Celtic crossing ahead!",
        "Sláinte!",
        "Another Irish mile!",
        
        // Countryside-related
        "Fresh country air!",
        "Mind the sheep!",
        "Scenic route, eh?",
        "Countryside charm!",
        "Rolling hills ahead!",
        "Watch for cattle!",
        "Nice day for a run!",
        "Lovely weather!",
        "Smell that fresh-cut grass!",
        "Country roads take me home!",
        
        // Troll-related
        "Troll ahead!",
        "They're gaining on me!",
        "Bridge trolls? Classic!",
        "No time for tolls!",
        "Under the bridge gang!",
        "Ugly bunch, aren't they?",
        "Trolls hate sunlight!",
        "They look hungry!",
        "Not today, troll!",
        "Faster than trolls!",
        
        // Mixed & humorous
        "Irish trolls are the worst!",
        "Potato-loving trolls!",
        "Countryside troll patrol!",
        "Hurling by trolls!",
        "Troll crossing!",
        "Rural troll uprising!",
        "Irish trolls can't jig!",
        "Trolls in the heather!",
        "Mind the troll holes!",
        "Trolls hate shamrocks!"
    ],
    
    // Comment bubble elements
    commentBubble: null,
    commentBubbleContainer: null,
    bubblePointer: null,
    
    // Comment timing variables
    commentInterval: null,
    currentCommentTimeout: null,
    
    /**
     * Initialize the comments system
     */
    init: function() {
        // Clear any existing intervals first
        this.clearIntervals();
        
        // Clear any existing comment bubble
        if (this.commentBubble) {
            if (this.commentBubble.parentNode) {
                this.commentBubble.parentNode.removeChild(this.commentBubble);
            }
            this.commentBubble = null;
        }
        
        // Get or create comment bubble container
        this.commentBubbleContainer = document.getElementById('comment-bubble-container');
        if (this.commentBubbleContainer) {
            this.commentBubbleContainer.innerHTML = '';
        }
        
        // Create comment bubble
        this.commentBubble = document.createElement('div');
        this.commentBubble.id = 'comment-bubble';
        this.commentBubble.className = 'pixel-art';
        
        // Create bubble pointer
        this.bubblePointer = document.createElement('div');
        this.bubblePointer.className = 'bubble-pointer pixel-art';
        this.commentBubble.appendChild(this.bubblePointer);
        
        // Add comment bubble to container
        this.commentBubbleContainer.appendChild(this.commentBubble);
        
        // Reset state
        this.commentInterval = null;
        this.currentCommentTimeout = null;
    },
    
    /**
     * Start showing random comments
     */
    startComments: function() {
        // Clear any existing intervals
        this.clearIntervals();
        
        // Show first comment after 2 seconds
        setTimeout(() => this.showRandomComment(), 2000);
        
        // Show a random comment every 6-12 seconds
        this.commentInterval = setInterval(() => {
            if (!Game.gameOver && Game.gameStarted) {
                this.showRandomComment();
            }
        }, Math.random() * 6000 + 6000);
    },
    
    /**
     * Show a random comment
     */
    showRandomComment: function() {
        // Get a random comment
        const randomComment = this.comments[Math.floor(Math.random() * this.comments.length)];
        
        // Set comment text
        this.commentBubble.textContent = randomComment;
        
        // Re-add the pointer after setting text content
        this.commentBubble.appendChild(this.bubblePointer);
        
        // Show the comment bubble
        this.commentBubble.style.display = 'block';
        
        // Play comment sound
        AudioManager.play('joke');
        
        // Update bubble position
        this.updateBubblePosition();
        
        // Hide the comment after the display time (shorter duration for brief comments)
        if (this.currentCommentTimeout) {
            clearTimeout(this.currentCommentTimeout);
        }
        
        this.currentCommentTimeout = setTimeout(() => {
            this.commentBubble.style.display = 'none';
        }, CONFIG.JOKE_DISPLAY_TIME / 2); // Half the usual display time for quicker reading
    },
    
    /**
     * Update the position of the comment bubble to stay above the player
     */
    updateBubblePosition: function() {
        const player = document.getElementById('player');
        if (player && this.commentBubble) {
            const playerRect = player.getBoundingClientRect();
            
            // Calculate the center position of the player
            const playerCenterX = playerRect.left + (playerRect.width / 2);
            
            // Position the bubble centered above the player with fixed offset
            const bubbleWidth = this.commentBubble.offsetWidth || 200; // Use default if not yet rendered
            this.commentBubble.style.left = `${playerCenterX - (bubbleWidth / 2)}px`;
            this.commentBubble.style.top = `${playerRect.top - 120}px`;
            
            // Ensure the bubble stays within the screen bounds
            const bubbleRect = this.commentBubble.getBoundingClientRect();
            if (bubbleRect.left < 10) {
                this.commentBubble.style.left = '10px';
            } else if (bubbleRect.right > window.innerWidth - 10) {
                this.commentBubble.style.left = `${window.innerWidth - bubbleWidth - 10}px`;
            }
            
            // Ensure bubble doesn't go above the screen
            if (bubbleRect.top < 10) {
                this.commentBubble.style.top = '10px';
            }
        }
    },
    
    /**
     * Clear all comment intervals and timeouts
     */
    clearIntervals: function() {
        if (this.commentInterval) {
            clearInterval(this.commentInterval);
            this.commentInterval = null;
        }
        
        if (this.currentCommentTimeout) {
            clearTimeout(this.currentCommentTimeout);
            this.currentCommentTimeout = null;
        }
        
        // Hide comment bubble
        if (this.commentBubble) {
            this.commentBubble.style.display = 'none';
            this.commentBubble.textContent = '';
        }
        
        // Clear comment bubble container
        if (this.commentBubbleContainer) {
            // Keep the container but remove all children except the comment bubble
            const children = Array.from(this.commentBubbleContainer.children);
            for (const child of children) {
                if (child !== this.commentBubble) {
                    this.commentBubbleContainer.removeChild(child);
                }
            }
        }
    }
}; 