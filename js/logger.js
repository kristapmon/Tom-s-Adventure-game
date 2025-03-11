/**
 * Game Logger Module
 * Handles logging of game events, errors, and debugging information
 */

const Logger = {
    // Log levels
    LEVELS: {
        DEBUG: 0,
        INFO: 1,
        WARN: 2,
        ERROR: 3,
        FATAL: 4
    },
    
    // Current log level
    currentLevel: 1, // Default to INFO
    
    // Log storage
    logs: [],
    maxLogSize: 1000, // Maximum number of log entries to keep in memory
    
    // File path for log storage
    logFilePath: './gamelog.log',
    
    /**
     * Initialize the logger
     * @param {number} level - Initial log level
     */
    init: function(level) {
        if (level !== undefined) {
            this.currentLevel = level;
        }
        
        // Clear logs array
        this.logs = [];
        
        // Log initialization
        this.info('Logger initialized');
        
        // Set up error handling
        this.setupErrorHandling();
        
        return this;
    },
    
    /**
     * Set up global error handling
     */
    setupErrorHandling: function() {
        // Capture uncaught exceptions
        window.onerror = (message, source, lineno, colno, error) => {
            this.error(`Uncaught exception: ${message} at ${source}:${lineno}:${colno}`, error);
            return false; // Let the default handler run as well
        };
        
        // Capture unhandled promise rejections
        window.addEventListener('unhandledrejection', (event) => {
            this.error('Unhandled promise rejection', event.reason);
        });
    },
    
    /**
     * Log a debug message
     * @param {string} message - The message to log
     * @param {*} data - Optional data to include
     */
    debug: function(message, data) {
        this.log(this.LEVELS.DEBUG, 'DEBUG', message, data);
    },
    
    /**
     * Log an info message
     * @param {string} message - The message to log
     * @param {*} data - Optional data to include
     */
    info: function(message, data) {
        this.log(this.LEVELS.INFO, 'INFO', message, data);
    },
    
    /**
     * Log a warning message
     * @param {string} message - The message to log
     * @param {*} data - Optional data to include
     */
    warn: function(message, data) {
        this.log(this.LEVELS.WARN, 'WARN', message, data);
    },
    
    /**
     * Log an error message
     * @param {string} message - The message to log
     * @param {*} error - Optional error object to include
     */
    error: function(message, error) {
        this.log(this.LEVELS.ERROR, 'ERROR', message, error);
    },
    
    /**
     * Log a fatal error message
     * @param {string} message - The message to log
     * @param {*} error - Optional error object to include
     */
    fatal: function(message, error) {
        this.log(this.LEVELS.FATAL, 'FATAL', message, error);
    },
    
    /**
     * Internal logging function
     * @param {number} level - Log level
     * @param {string} levelName - Name of the log level
     * @param {string} message - The message to log
     * @param {*} data - Optional data to include
     */
    log: function(level, levelName, message, data) {
        // Only log if the level is high enough
        if (level < this.currentLevel) {
            return;
        }
        
        // Create timestamp
        const timestamp = new Date().toISOString();
        
        // Format log entry
        const logEntry = {
            timestamp,
            level: levelName,
            message,
            data: data || null
        };
        
        // Add to logs array
        this.logs.push(logEntry);
        
        // Trim logs if they exceed max size
        if (this.logs.length > this.maxLogSize) {
            this.logs = this.logs.slice(-this.maxLogSize);
        }
        
        // Format for console
        const consoleMessage = `[${timestamp}] [${levelName}] ${message}`;
        
        // Output to console based on level
        switch (level) {
            case this.LEVELS.DEBUG:
                console.debug(consoleMessage, data || '');
                break;
            case this.LEVELS.INFO:
                console.info(consoleMessage, data || '');
                break;
            case this.LEVELS.WARN:
                console.warn(consoleMessage, data || '');
                break;
            case this.LEVELS.ERROR:
            case this.LEVELS.FATAL:
                console.error(consoleMessage, data || '');
                break;
        }
        
        // Save to file
        this.saveToFile(logEntry);
    },
    
    /**
     * Save log entry to file
     * @param {Object} logEntry - The log entry to save
     */
    saveToFile: function(logEntry) {
        try {
            // Format log entry for file
            const logLine = `[${logEntry.timestamp}] [${logEntry.level}] ${logEntry.message}${logEntry.data ? ' ' + JSON.stringify(logEntry.data) : ''}\n`;
            
            // In a browser environment, we can't directly write to files
            // So we'll use localStorage as a fallback
            const currentLogs = localStorage.getItem('gameLogs') || '';
            localStorage.setItem('gameLogs', currentLogs + logLine);
            
            // If we're in a development environment with file access,
            // we could use the File System API or other methods
            if (typeof window.electronAPI !== 'undefined') {
                // Example for Electron apps
                window.electronAPI.writeToLogFile(logLine);
            }
        } catch (e) {
            console.error('Failed to save log to file:', e);
        }
    },
    
    /**
     * Export logs to a file for download
     */
    exportLogs: function() {
        try {
            // Format all logs
            const allLogs = this.logs.map(log => 
                `[${log.timestamp}] [${log.level}] ${log.message}${log.data ? ' ' + JSON.stringify(log.data) : ''}`
            ).join('\n');
            
            // Create blob
            const blob = new Blob([allLogs], { type: 'text/plain' });
            
            // Create download link
            const a = document.createElement('a');
            a.download = `gamelog_${new Date().toISOString().replace(/:/g, '-')}.log`;
            a.href = URL.createObjectURL(blob);
            a.style.display = 'none';
            
            // Trigger download
            document.body.appendChild(a);
            a.click();
            
            // Clean up
            document.body.removeChild(a);
            URL.revokeObjectURL(a.href);
            
            this.info('Logs exported successfully');
        } catch (e) {
            console.error('Failed to export logs:', e);
        }
    },
    
    /**
     * Clear all logs
     */
    clearLogs: function() {
        this.logs = [];
        localStorage.removeItem('gameLogs');
        this.info('Logs cleared');
    }
};

// Create a global instance
window.GameLogger = Logger.init(); 