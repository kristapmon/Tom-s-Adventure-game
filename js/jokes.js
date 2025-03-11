/**
 * Jokes Manager
 * Handles all dad jokes for Tom to say during gameplay
 */

const JokesManager = {
    // Dad jokes array
    jokes: [
        "I'm afraid for the calendar. Its days are numbered.",
        "My wife said I should do lunges to stay in shape. That would be a big step forward.",
        "Why do fathers take an extra pair of socks when they go golfing? In case they get a hole in one!",
        "Singing in the shower is fun until you get soap in your mouth. Then it's a soap opera.",
        "What do you call a factory that makes okay products? A satisfactory.",
        "What did the ocean say to the beach? Nothing, it just waved.",
        "Why do seagulls fly over the ocean? Because if they flew over the bay, we'd call them bagels.",
        "I only know 25 letters of the alphabet. I don't know y.",
        "How does a taco say grace? Lettuce pray.",
        "What does a lemon say when it answers the phone? Yellow!",
        "This graveyard looks overcrowded. People must be dying to get in.",
        "What do you call a fake noodle? An impasta.",
        "What do you call a belt made out of watches? A waist of time.",
        "What happens when a strawberry gets run over crossing the street? Traffic jam.",
        "Why don't eggs tell jokes? They'd crack each other up.",
        "I don't trust stairs. They're always up to something.",
        "What do you call someone with no body and no nose? Nobody knows.",
        "Did you hear the rumor about butter? Well, I'm not going to spread it!",
        "Why couldn't the bicycle stand up by itself? It was two tired.",
        "What did one hat say to the other? Stay here! I'm going on ahead.",
        "Why did Billy get fired from the banana factory? He kept throwing away the bent ones.",
        "Dad, did you get a haircut? No, I got them all cut!",
        "What do you call a fish wearing a bowtie? Sofishticated.",
        "How do you get a squirrel to like you? Act like a nut!",
        "Why don't skeletons ever go trick or treating? Because they have no body to go with.",
        "What do you call cheese that isn't yours? Nacho cheese.",
        "My wife is really mad at the fact that I have no sense of direction. So I packed up my stuff and right!",
        "How do you tell the difference between a crocodile and an alligator? You will see one later and one in a while.",
        "What did the janitor say when he jumped out of the closet? Supplies!",
        "What did the buffalo say when his son left for college? Bison!",
        "What do you call a careful wolf? Aware wolf.",
        "What did the late tomato say to the early tomato? I'll ketch up.",
        "I used to be addicted to soap, but I'm clean now.",
        "What's brown and sticky? A stick.",
        "I ordered a chicken and an egg online. I'll let you know...",
        "What do you call a cow with no legs? Ground beef.",
        "What's the best thing about Switzerland? I don't know, but the flag is a big plus.",
        "Did you hear about the guy who invented the knock-knock joke? He won the 'no-bell' prize.",
        "I'm on a seafood diet. I see food and I eat it.",
        "Why did the scarecrow win an award? Because he was outstanding in his field!",
        "I made a pencil with two erasers. It was pointless.",
        "How do you make a tissue dance? Put a little boogie in it!",
        "What do you call a pony with a sore throat? A little horse.",
        "What did the grape say when it got stepped on? Nothing, it just let out a little wine.",
        "I'm reading a book about anti-gravity. It's impossible to put down!",
        "Did you hear about the guy who invented Lifesavers? They say he made a mint.",
        "I used to hate facial hair, but then it grew on me.",
        "What's the difference between a poorly dressed man on a trampoline and a well-dressed man on a trampoline? Attire.",
        "I'm so good at sleeping, I can do it with my eyes closed!",
        "Why don't scientists trust atoms? Because they make up everything!",
        "I was going to tell a time traveling joke, but you didn't like it."
    ],
    
    // Joke bubble elements
    jokeBubble: null,
    jokeBubbleContainer: null,
    bubblePointer: null,
    
    // Joke timing variables
    jokeInterval: null,
    currentJokeTimeout: null,
    
    /**
     * Initialize the jokes system
     */
    init: function() {
        // Clear any existing intervals first
        this.clearIntervals();
        
        // Clear any existing joke bubble
        if (this.jokeBubble) {
            if (this.jokeBubble.parentNode) {
                this.jokeBubble.parentNode.removeChild(this.jokeBubble);
            }
            this.jokeBubble = null;
        }
        
        // Get or create joke bubble container
        this.jokeBubbleContainer = document.getElementById('joke-bubble-container');
        if (this.jokeBubbleContainer) {
            this.jokeBubbleContainer.innerHTML = '';
        }
        
        // Create joke bubble
        this.jokeBubble = document.createElement('div');
        this.jokeBubble.id = 'joke-bubble';
        this.jokeBubble.className = 'pixel-art';
        
        // Create bubble pointer
        this.bubblePointer = document.createElement('div');
        this.bubblePointer.className = 'bubble-pointer pixel-art';
        this.jokeBubble.appendChild(this.bubblePointer);
        
        // Add joke bubble to container
        this.jokeBubbleContainer.appendChild(this.jokeBubble);
        
        // Reset state
        this.jokeInterval = null;
        this.currentJokeTimeout = null;
    },
    
    /**
     * Start showing random jokes
     */
    startJokes: function() {
        // Clear any existing intervals
        this.clearIntervals();
        
        // Show first joke after 3 seconds
        setTimeout(() => this.showRandomJoke(), 3000);
        
        // Show a random joke every 8-15 seconds
        this.jokeInterval = setInterval(() => {
            if (!Game.gameOver && Game.gameStarted) {
                this.showRandomJoke();
            }
        }, Math.random() * 7000 + 8000);
    },
    
    /**
     * Show a random joke
     */
    showRandomJoke: function() {
        // Get a random joke
        const randomJoke = this.jokes[Math.floor(Math.random() * this.jokes.length)];
        
        // Set joke text
        this.jokeBubble.textContent = randomJoke;
        
        // Re-add the pointer after setting text content
        this.jokeBubble.appendChild(this.bubblePointer);
        
        // Show the joke bubble
        this.jokeBubble.style.display = 'block';
        
        // Play joke sound
        AudioManager.play('joke');
        
        // Update bubble position
        this.updateBubblePosition();
        
        // Hide the joke after the display time
        if (this.currentJokeTimeout) {
            clearTimeout(this.currentJokeTimeout);
        }
        
        this.currentJokeTimeout = setTimeout(() => {
            this.jokeBubble.style.display = 'none';
        }, CONFIG.JOKE_DISPLAY_TIME);
    },
    
    /**
     * Update the position of the joke bubble to stay above the player
     */
    updateBubblePosition: function() {
        const player = document.getElementById('player');
        if (player && this.jokeBubble) {
            const playerRect = player.getBoundingClientRect();
            
            // Calculate the center position of the player
            const playerCenterX = playerRect.left + (playerRect.width / 2);
            
            // Position the bubble centered above the player with fixed offset
            // Increased vertical offset to position bubble higher
            const bubbleWidth = this.jokeBubble.offsetWidth || 250; // Use default if not yet rendered
            this.jokeBubble.style.left = `${playerCenterX - (bubbleWidth / 2)}px`;
            this.jokeBubble.style.top = `${playerRect.top - 150}px`; // Increased from 100px to 150px
            
            // Ensure the bubble stays within the screen bounds
            const bubbleRect = this.jokeBubble.getBoundingClientRect();
            if (bubbleRect.left < 10) {
                this.jokeBubble.style.left = '10px';
            } else if (bubbleRect.right > window.innerWidth - 10) {
                this.jokeBubble.style.left = `${window.innerWidth - bubbleWidth - 10}px`;
            }
            
            // Ensure bubble doesn't go above the screen
            if (bubbleRect.top < 10) {
                this.jokeBubble.style.top = '10px';
            }
        }
    },
    
    /**
     * Clear all joke intervals and timeouts
     */
    clearIntervals: function() {
        if (this.jokeInterval) {
            clearInterval(this.jokeInterval);
            this.jokeInterval = null;
        }
        
        if (this.currentJokeTimeout) {
            clearTimeout(this.currentJokeTimeout);
            this.currentJokeTimeout = null;
        }
        
        // Hide joke bubble
        if (this.jokeBubble) {
            this.jokeBubble.style.display = 'none';
            this.jokeBubble.textContent = '';
        }
        
        // Clear joke bubble container
        if (this.jokeBubbleContainer) {
            // Keep the container but remove all children except the joke bubble
            const children = Array.from(this.jokeBubbleContainer.children);
            for (const child of children) {
                if (child !== this.jokeBubble) {
                    this.jokeBubbleContainer.removeChild(child);
                }
            }
        }
    }
}; 