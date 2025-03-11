// High Score Management System
const HighScores = {
    db: null,
    initialized: false,
    
    init: function() {
        // Initialize Firebase (you'll need to replace with your own Firebase config)
        const firebaseConfig = {
            apiKey: "AIzaSyCjn7iE7P3_44RVO_XtWrBuhaLAEdXtTaA",
            authDomain: "tom-s-adventure.firebaseapp.com",
            databaseURL: "https://tom-s-adventure-default-rtdb.asia-southeast1.firebasedatabase.app",
            projectId: "tom-s-adventure",
            storageBucket: "tom-s-adventure.firebasestorage.app",
            messagingSenderId: "388506170669",
            appId: "1:388506170669:web:82a73457cae685c859cfa4",
            measurementId: "G-7R1MBYFYLF"
        };
        
        // Initialize Firebase
        if (!firebase.apps.length) {
            firebase.initializeApp(firebaseConfig);
        }
        this.db = firebase.database();
        this.initialized = true;
        
        console.log("High score system initialized");
    },
    
    // Submit a new high score
    submitScore: function(name, score) {
        if (!this.initialized) this.init();
        
        // Sanitize the name (allow letters, numbers, spaces, but no special characters)
        const sanitizedName = name.substring(0, 15).replace(/[^\w\s]/gi, '');
        
        const scoreData = {
            name: sanitizedName,
            score: score,
            date: new Date().toISOString().split('T')[0] // Just keep the date part, not time
        };
        
        // Add to high scores list
        return this.db.ref('highscores').push(scoreData)
            .then(() => {
                console.log("Score submitted successfully");
                return true;
            })
            .catch(error => {
                console.error("Error submitting score:", error);
                
                // If permission denied, try anonymous fallback
                if (error.message && error.message.includes("PERMISSION_DENIED")) {
                    console.log("Using local storage fallback for high scores");
                    this.saveScoreLocally(scoreData);
                    return true; // Return true so the UI continues
                }
                
                return false;
            });
    },
    
    // Fallback: Save score locally if Firebase fails
    saveScoreLocally: function(scoreData) {
        try {
            // Get existing scores
            let localScores = JSON.parse(localStorage.getItem('highScores')) || [];
            
            // Add new score
            localScores.push(scoreData);
            
            // Sort by score (descending)
            localScores.sort((a, b) => b.score - a.score);
            
            // Keep only top 100
            if (localScores.length > 100) {
                localScores = localScores.slice(0, 100);
            }
            
            // Save back to localStorage
            localStorage.setItem('highScores', JSON.stringify(localScores));
            
            console.log("Score saved locally");
        } catch (e) {
            console.error("Error saving score locally:", e);
        }
    },
    
    // Get top 100 high scores
    getTopScores: function(limit = 100) {
        if (!this.initialized) this.init();
        
        return this.db.ref('highscores')
            .orderByChild('score')
            .limitToLast(limit)
            .once('value')
            .then(snapshot => {
                const scores = [];
                snapshot.forEach(childSnapshot => {
                    scores.push({
                        id: childSnapshot.key,
                        ...childSnapshot.val()
                    });
                });
                
                // Sort in descending order
                return scores.sort((a, b) => b.score - a.score);
            })
            .catch(error => {
                console.error("Error getting high scores:", error);
                
                // If permission denied, try local fallback
                if (error.message && error.message.includes("PERMISSION_DENIED")) {
                    console.log("Using local storage fallback for high scores");
                    return this.getLocalScores(limit);
                }
                
                return [];
            });
    },
    
    // Fallback: Get scores from localStorage
    getLocalScores: function(limit = 100) {
        try {
            const localScores = JSON.parse(localStorage.getItem('highScores')) || [];
            return localScores.slice(0, limit);
        } catch (e) {
            console.error("Error getting local scores:", e);
            return [];
        }
    },
    
    // Check if a score qualifies for the high score table
    checkHighScore: function(score, callback) {
        this.getTopScores()
            .then(scores => {
                // If we have fewer than 100 scores, any score qualifies
                if (scores.length < 100) {
                    callback(true);
                    return;
                }
                
                // Otherwise, check if score is higher than the lowest score
                const lowestScore = scores[scores.length - 1].score;
                callback(score > lowestScore);
            })
            .catch(() => {
                // If there's an error, assume it qualifies (we'll validate server-side)
                callback(true);
            });
    },
    
    // Show high score table
    showHighScoreTable: function() {
        Game.showHighScoreTable();
    }
}; 