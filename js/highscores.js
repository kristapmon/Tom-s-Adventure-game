// High Score Management System
const HighScores = {
    db: null,
    initialized: false,
    authenticated: false,
    
    init: function() {
        console.log("Initializing HighScores system");
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
        try {
            if (!firebase.apps.length) {
                firebase.initializeApp(firebaseConfig);
            }
            this.db = firebase.database();
            this.initialized = true;
            console.log("High score system initialized with Firebase");
            
            // Initialize anonymous authentication
            this.initAuth();
        } catch (error) {
            console.error("Firebase initialization error:", error);
            // Fall back to local storage mode
            this.initialized = false;
            this.authenticated = false;
            console.log("High score system will use local storage fallback");
        }
    },
    
    // Initialize Firebase Authentication with anonymous sign-in
    initAuth: function() {
        if (!this.initialized) return;
        
        const auth = firebase.auth();
        
        // Check if user is already signed in
        if (auth.currentUser) {
            console.log("User already authenticated");
            this.authenticated = true;
            return;
        }
        
        // Sign in anonymously
        auth.signInAnonymously()
            .then(() => {
                console.log("Anonymous authentication successful");
                this.authenticated = true;
            })
            .catch((error) => {
                console.error("Anonymous authentication failed:", error);
                this.authenticated = false;
                
                // NEW CODE: If we get CONFIGURATION_NOT_FOUND, it means Auth isn't enabled
                if (error.message && error.message.includes("CONFIGURATION_NOT_FOUND")) {
                    console.log("Firebase Authentication not enabled in console - using local storage only");
                    // Keep initialized true but set authenticated to false to use the database without auth
                    this.initialized = true;
                    this.authenticated = false;
                }
            });
        
        // Set up auth state changed listener
        auth.onAuthStateChanged((user) => {
            if (user) {
                console.log("User is signed in with uid:", user.uid);
                this.authenticated = true;
            } else {
                console.log("User is signed out");
                this.authenticated = false;
            }
        });
    },
    
    // Load and populate high scores into the table
    loadHighScores: function() {
        console.log("loadHighScores called");
        // Get the table body element
        const tableBody = document.getElementById('high-score-table-body');
        
        if (!tableBody) {
            console.error("Could not find high score table body element");
            return;
        }
        
        // Clear the table and show loading
        tableBody.innerHTML = '<tr><td colspan="4" style="text-align: center;">Loading high scores...</td></tr>';
        
        // Ensure Firebase is initialized
        if (!this.initialized) {
            console.log("HighScores not initialized, calling init()");
            this.init();
        }
        
        // Get top scores
        console.log("Calling getTopScores");
        this.getTopScores(100)
            .then(scores => {
                console.log(`Received ${scores.length} high scores`);
                // Clear loading indicator
                tableBody.innerHTML = '';
                
                // If no scores, show message
                if (scores.length === 0) {
                    tableBody.innerHTML = '<tr><td colspan="4" style="text-align: center;">No high scores yet!</td></tr>';
                    return;
                }
                
                // Add rows for each score
                scores.forEach((score, index) => {
                    const row = document.createElement('tr');
                    
                    // Highlight current player's score if it matches
                    const isCurrentScore = Game && Game.score === score.score;
                    if (isCurrentScore) {
                        row.style.backgroundColor = 'rgba(255, 215, 0, 0.3)';
                        row.style.fontWeight = 'bold';
                    }
                    
                    // Add cells
                    row.innerHTML = `
                        <td>${index + 1}</td>
                        <td>${score.name || 'Anonymous'}</td>
                        <td>${score.score}</td>
                        <td>${score.date || 'Unknown'}</td>
                    `;
                    
                    tableBody.appendChild(row);
                });
                
                // Add a deliberate delay to ensure the table has time to render
                setTimeout(() => {
                    // Force a reflow of the table container to ensure scroll works
                    const container = document.querySelector('.high-score-table-container');
                    if (container) {
                        void container.offsetHeight;
                        container.scrollTop = 1;
                        setTimeout(() => container.scrollTop = 0, 50);
                    }
                }, 200);
            })
            .catch(error => {
                console.error("Error loading high scores:", error);
                tableBody.innerHTML = '<tr><td colspan="4" style="text-align: center;">Error loading high scores. Please try again later.</td></tr>';
            });
    },
    
    // Submit a new high score
    submitScore: function(name, score) {
        if (!this.initialized) this.init();
        
        // Sanitize the name (allow letters, numbers, spaces, but remove any special characters)
        const sanitizedName = name.substring(0, 15).replace(/[^\w\s]/gi, '');
        
        const scoreData = {
            name: sanitizedName,
            score: score,
            date: new Date().toISOString().split('T')[0] // Just keep the date part, not time
        };
        
        // If not authenticated, try to authenticate before submitting
        if (!this.authenticated && this.initialized) {
            console.log("Not authenticated, attempting to authenticate before submission");
            // NEW CODE: Check if we should try to authenticate or just use local storage
            if (this._authAttempted) {
                // If we've already tried to authenticate and it failed, just use local storage
                console.log("Authentication previously failed, using local storage instead");
                this.saveScoreLocally(scoreData);
                return Promise.resolve(true);
            }
            return this.authenticateAndSubmit(scoreData);
        }
        
        // If Firebase is initialized but not authenticated, store locally
        if (this.initialized && !this.authenticated) {
            console.log("Firebase initialized but not authenticated, using local storage");
            this.saveScoreLocally(scoreData);
            return Promise.resolve(true);
        }
        
        // Add to high scores list
        return this.db.ref('highscores').push(scoreData)
            .then(() => {
                console.log("Score submitted successfully");
                return true;
            })
            .catch(error => {
                console.error("Error submitting score:", error);
                
                // If permission denied, try to authenticate and retry
                if (error.message && error.message.includes("PERMISSION_DENIED")) {
                    console.log("Permission denied, trying to authenticate");
                    return this.authenticateAndSubmit(scoreData);
                }
                
                // Final fallback: save locally
                console.log("Using local storage fallback for high scores");
                this.saveScoreLocally(scoreData);
                return true; // Return true so the UI continues
            });
    },
    
    // Try to authenticate and then submit the score
    authenticateAndSubmit: function(scoreData) {
        return new Promise((resolve) => {
            const auth = firebase.auth();
            
            // Mark that we've attempted authentication
            this._authAttempted = true;
            
            auth.signInAnonymously()
                .then(() => {
                    console.log("Authentication successful, submitting score");
                    this.authenticated = true;
                    
                    // Retry submission after successful authentication
                    return this.db.ref('highscores').push(scoreData);
                })
                .then(() => {
                    console.log("Score submitted after authentication");
                    resolve(true);
                })
                .catch(error => {
                    console.error("Authentication or submission failed:", error);
                    
                    // Fall back to local storage
                    this.saveScoreLocally(scoreData);
                    resolve(true); // Return true so the UI continues
                });
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
        console.log(`getTopScores called with limit=${limit}, initialized=${this.initialized}`);
        if (!this.initialized) {
            console.log("HighScores not initialized in getTopScores, calling init()");
            this.init();
        }
        
        // If Firebase is still not initialized after trying, use local storage
        if (!this.initialized || !this.db) {
            console.log("Using local storage fallback (no Firebase)");
            return Promise.resolve(this.getLocalScores(limit));
        }
        
        // NEW CODE: If Firebase is initialized but not authenticated, use local storage
        if (this.initialized && !this.authenticated) {
            console.log("Firebase initialized but not authenticated, using local storage for scores");
            return Promise.resolve(this.getLocalScores(limit));
        }
        
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
                
                console.log(`Retrieved ${scores.length} scores from Firebase`);
                // Sort in descending order
                return scores.sort((a, b) => b.score - a.score);
            })
            .catch(error => {
                console.error("Error getting high scores:", error);
                
                // If permission denied or any other error, try local fallback
                console.log("Using local storage fallback due to Firebase error");
                return this.getLocalScores(limit);
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