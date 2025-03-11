# Tom's Adventure

A fun infinite runner game featuring Tom, a character running through the Irish countryside while avoiding trolls.

## Game Features

- Simple and addictive gameplay
- Character with jumping and floating mechanics
- Randomly generated obstacles (trolls)
- Dad jokes that appear while playing
- Multiple tree types and cloud formations
- Score tracking with high score persistence
- Difficulty settings
- Sound effects (can be toggled)
- Responsive design for different screen sizes

## How to Play

1. Open `index.html` in a web browser
2. Click "Start Game" to begin
3. Press SPACE or UP ARROW to jump
4. Hold SPACE or UP ARROW to float longer
5. Avoid trolls to survive and increase your score
6. Enjoy random dad jokes that appear as you play

## Development

### Project Structure

```
/
├── index.html          # Main HTML file
├── styles.css          # CSS styles
├── CHANGELOG.md        # Version history and changes
├── gamelog.log         # Game error and event logs
├── README.md           # This file
└── js/                 # JavaScript files
    ├── config.js       # Game configuration
    ├── entities.js     # Game entities (player, trolls, etc.)
    ├── game.js         # Main game logic
    ├── jokes.js        # Dad jokes system
    ├── logger.js       # Logging system
    └── audio.js        # Audio management
```

### Changelog

The game's version history and changes are documented in `CHANGELOG.md`. This file follows the [Keep a Changelog](https://keepachangelog.com/) format and includes:

- Version numbers and release dates
- Added features
- Changed functionality
- Fixed bugs
- Removed features

When making changes to the game, please update the changelog accordingly.

### Logging System

Tom's Adventure includes a comprehensive logging system that:

1. Records game events, errors, and debugging information
2. Stores logs in memory and localStorage
3. Allows exporting logs to a file for troubleshooting
4. Captures uncaught exceptions and unhandled promise rejections

#### Log Levels

The logging system supports multiple log levels:

- DEBUG: Detailed information for debugging
- INFO: General information about game operation
- WARN: Warning messages that don't affect gameplay
- ERROR: Error messages that may affect gameplay
- FATAL: Critical errors that prevent the game from functioning

#### Using the Logger

To use the logger in your code:

```javascript
// Log an informational message
GameLogger.info('Game started');

// Log a debug message with data
GameLogger.debug('Player jumped', { height: jumpHeight });

// Log an error
GameLogger.error('Failed to load asset', error);
```

#### Exporting Logs

Users can export logs for troubleshooting by:

1. Going to the Settings screen
2. Clicking the "Export Logs" button

This will download a text file containing all logged events.

## Contributing

Contributions to Tom's Adventure are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Update the changelog
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 