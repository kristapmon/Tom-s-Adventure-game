# Tom's Adventure - Changelog

This file documents all notable changes to Tom's Adventure game.

## [Unreleased]

### Added
- Added functional sound effects for all game actions (jumping, dying, collecting points, etc.)
- Game statistics tracking for both local and global play
- New STATS button in Settings to view game statistics
- Display of total games played, unique players count, and average score
- Firebase integration for global statistics tracking
- Gradual speed transition system with a custom easing function for smoother gameplay
- Visual notifications when speed increases occur
- Enhanced whiskey power-up with smoother speed transition
- Replaced dad jokes with short Irish, countryside, and troll-themed comments
- More dramatic and noticeable speed increases with visual effects
- Gradual speed transition system that smoothly accelerates game speed over 3 seconds
- Speed increase visual notification with "Speed increasing!" message
- Enhanced whiskey power-up with smooth speed transitions when activated and deactivated
- Increased spawn rates for power-ups across all difficulty levels for more frequent collection opportunities
- Doubled troll spawn rates with proper spacing maintained for optimal gameplay balance
- Reduced minimum distance between power-ups from 500px to 300px
- Improved trolls minimum spacing to ensure proper jump distances between them
- Visual layering fixes to ensure trees appear in front of mountains
- Fixed mountain triangle shapes on mobile devices
- Shortened comment display time for better gameplay flow
- Increased speed increment from 0.5 to 0.8 for more dramatic progression
- Speed increase notifications are more prominent with pulsing red/yellow text
- Whiskey power-up now increases speed more smoothly
- Adjusted power-up spawn rates to improve gameplay variety
- Reduced minimum distance between power-ups from 400px to 300px
- Sound generation tools to create custom game audio effects
- Sound resource page with links to free sound effects for the game
- Improved audio initialization to ensure sounds play on first interaction
- Multiple audio initialization points to guarantee sound playback across browsers
- Mobile-specific adjustments for high score and stats modals
- Improved mobile viewport handling for all game elements
- Better handling of virtual keyboard behavior on mobile devices
- Firebase security rules to restrict database write access
- Anonymous authentication for secure data submission
- Enhanced security for high scores and game statistics
- Improved error handling for Firebase operations
- Cache-busting mechanism that automatically updates file URLs when game version changes, preventing users from seeing outdated cached files

### Changed
- Increased base game speed from 5 to 8 for a more exciting gameplay experience
- Increased speed increment amount from 0.5 to 0.8 for more challenging gameplay
- Added dramatic speed increase curve with rapid acceleration, plateau, and final burst
- Enhanced speed increase notifications with pulsing red/yellow text and larger font
- Increased spawn rates for power-ups across all difficulty levels for more frequent collection opportunities
- Doubled troll spawn rates with proper spacing maintained for optimal gameplay balance
- Reduced minimum distance between power-ups from 500px to 300px
- Improved trolls minimum spacing to ensure proper jump distances between them
- Visual layering fixes to ensure trees appear in front of mountains
- Fixed mountain triangle shapes on mobile devices
- Shortened comment display time for better gameplay flow
- Increased speed increment from 0.5 to 0.8 for more dramatic progression
- Speed increase notifications are more prominent with pulsing red/yellow text
- Whiskey power-up now increases speed more smoothly
- Adjusted power-up spawn rates to improve gameplay variety
- Reduced minimum distance between power-ups from 400px to 300px
- Enhanced audio system with improved initialization on user interaction
- Audio elements now preload when user first interacts with the game
- Sound toggle in settings now properly initializes and controls all game sounds
- Changed default difficulty from medium to hard for a more challenging gameplay experience
- Refactored difficulty selection to use a configurable setting (DEFAULT_DIFFICULTY) in CONFIG object

### Fixed
- Fixed bug with power-up spawning where only the first power-up would appear
- "Play Again" button now properly disabled until high score check is complete
- Mountains now maintain their triangular shape on mobile devices
- Fixed z-index issues where mountains were appearing in front of trees
- Fixed power-up spawning issue that prevented multiple power-ups from appearing
- Fixed bug where speed increases wouldn't occur while a power-up was active
- Fixed incorrect points (500 instead of 10) when hitting trolls with the clover power-up
- Fixed visual layering issues with the comment bubble
- Fixed audio not playing on game start by adding multiple initialization points
- Fixed browser autoplay policy issues with sound by initializing audio on user interaction
- Fixed missing sound effects for land and powerup actions
- Fixed mobile jump glitch where Tom would land lower and then jump back to running position when tapping
- Fixed high score table display on mobile browsers to account for URL bar area
- Fixed stats popup display on mobile devices to ensure proper sizing and positioning
- Fixed form input handling in high score submission for mobile devices
- Improved mobile modal positioning to avoid being pushed off screen by virtual keyboards
- Enhanced mobile touchscreen interactions with better tap response
- Fixed unit inconsistency between jumping and landing in mobile view
- Ensured consistent positioning of all UI elements across mobile and desktop views
- Fixed bug in config.js where `loadSavedSettings` function was trying to access a non-existent 'difficulty' element
- Fixed bug in config.js where `saveSettings` function was referencing a removed 'difficulty' element
- Removed Phaser.js toggle from settings screen as it's no longer used
- Fixed issue where multiple points were awarded when colliding with trolls while invincible
- Fixed gold power-up score discrepancy by ensuring all references use the same score value (150 points)

## [1.6.1] - 2023-09-15

### Added
- Functional sound effects for all game actions (jumping, dying, collecting points)
- Game statistics tracking for both local and global play
- STATS button in Settings to view game statistics
- Display of total games played, unique players count, and average score
- Firebase integration for global statistics tracking
- Gradual speed transition system with custom easing function for smoother gameplay
- Visual notifications for speed increases with new pulsing animation
- Enhanced whiskey power-up with smoother transitions
- Themed comments replacing dad jokes
- Increased spawn rates for power-ups and adjusted spacing for optimal gameplay

### Fixed
- Fixed mobile viewport issues with URL bar causing content to be cut off
- Fixed incorrect positioning of player character on mobile devices
- Resolved issue where Tom would "land lower and then jump up" when tapping on mobile devices
- Ensured consistent positioning of game elements and UI across different mobile browsers
- Improved popup and notification positioning to match game elements on mobile
- Enhanced player movement handling to prevent inconsistencies between touch and keyboard controls

## [1.6.0] - 2023-11-13

### Added
- Public high score table for top 100 players
- Name entry prompt for qualifying high scores
- Power-up countdown timers in the center of the screen
- Firebase integration for storing high scores

### Changed
- Extended four-leaf clover duration from 3 to 10 seconds
- Reduced points for hitting trolls while invincible from 50 to 10
- Increased whiskey effect duration to 10 seconds
- Reduced whiskey jump delay for better playability

## [1.5.3] - 2023-11-12

### Changed
- Redesigned mountains to be larger and more distinct from trees
- Reduced the number of mountains in the background for better visual balance
- Removed snow caps from mountains for a cleaner look
- Improved troll spawning logic to ensure proper spacing between trolls
- Fixed dead Tom animation positioning between death message and score

## [1.5.2] - 2023-11-11

### Changed
- Redesigned mountains to look more realistic with snow caps and shading
- Fixed inconsistent mountain movement with improved parallax effect
- Removed tree-like appearance from mountains for better visual distinction

## [1.5.1] - 2023-11-10

### Changed
- Restored original death screen layout while keeping the dead Tom animation
- Improved dead Tom animation to match Tom's in-game appearance
- Positioned dead Tom animation between the death message and score

## [1.5.0] - 2023-11-09

### Added
- Added a dead Tom animation to the death screen
- Added floating stars and blood splatter effects to the death animation
- Enhanced death screen with improved visual effects

### Fixed
- Fixed issue with rogue trees moving at inconsistent speeds
- Improved parallax effect for trees to ensure consistent movement
- Removed tree speed randomization that caused some trees to move too fast

## [1.4.9] - 2023-11-08

### Fixed
- Fixed persistent issue where Tom was positioned higher than trolls
- Ensured consistent positioning of player, trolls, and trees at exactly the same height
- Simplified ground height calculation to use a single consistent value
- Updated all dynamic adjustments to maintain proper alignment

## [1.4.8] - 2023-11-07

### Added
- Enhanced orc-like appearance for trolls with tusks, pointed ears, and armor
- Improved power-up visuals with larger size and more detailed appearance
- Added shadows and highlights to power-ups for more realistic 3D effect

### Changed
- Increased power-up size from 60px to 80px for better visibility
- Enhanced whiskey flask, four-leaf clover, and pot of gold with more detailed designs
- Improved tree movement to be consistent with game speed

### Fixed
- Fixed issue where Tom was higher than trolls on desktop
- Fixed triangle trees moving at inconsistent speeds
- Ensured trees and player are at the same height (60px from bottom)
- Improved parallax effect for background elements

## [1.4.7] - 2023-11-06

### Fixed
- Fixed issue where Tom would run above trolls, making them impossible to hit
- Fixed trees appearing behind the ground on desktop
- Ensured consistent player height across all devices and orientations
- Added additional checks to ensure player is at the correct height after screen resizing

## [1.4.6] - 2023-11-05

### Changed
- Reverted to original jump mechanics while keeping boundary detection improvements
- Maintained improved ground height on desktop and portrait mode
- Kept larger death message on mobile devices

### Fixed
- Fixed issue where Tom could jump out of bounds on mobile
- Maintained fixes for ground height issues on desktop and portrait mode
- Kept consistent jump physics between desktop and mobile

## [1.4.5] - 2023-11-04

### Added
- Three-stage jump mechanics based on button press duration:
  - Short press: Small jump (60% of normal height)
  - Medium press: Normal jump
  - Long press: Big jump (120% of normal height)
- Boundary detection to prevent jumping out of the game area
- Dynamic ground height detection for consistent gameplay across devices

### Changed
- Fixed ground height on desktop and portrait mode
- Made death message bigger on mobile devices
- Improved jump physics consistency between desktop and mobile
- Enhanced collision detection for more accurate gameplay

### Fixed
- Fixed issue where Tom could jump out of bounds on mobile
- Fixed ground height issues on desktop and portrait mode
- Fixed inconsistent jump physics between desktop and mobile

## [1.4.4] - 2023-11-03

### Added
- Landscape mode recommendation message for mobile devices in portrait orientation
- Improved grass visualization with a distinct green layer
- Tree trunks for triangle trees in the background

### Changed
- Enhanced ground appearance with better coloring and gradient
- Improved tree positioning based on screen dimensions
- Better orientation detection and handling

### Fixed
- Fixed missing tree trunks in the background
- Fixed blue grass issue in landscape mode
- Improved visibility of ground elements on all screen sizes

## [1.4.3] - 2023-11-02

### Added
- Dynamic screen size detection and adjustment
- Orientation change handling with automatic layout updates
- Automatic game resumption when tab becomes visible again

### Changed
- Improved ground and character positioning based on screen dimensions
- Enhanced mobile touch controls with better responsiveness
- Optimized layout calculations for different device types

### Fixed
- Fixed blue tap highlight on mobile devices
- Fixed positioning issues on various screen sizes
- Improved element scaling for better visibility

## [1.4.2] - 2023-11-01

### Added
- Mobile responsiveness improvements:
  - Touch controls for jumping and floating
  - Proper scaling for different screen sizes
  - Landscape and portrait orientation support
  - Visibility detection to pause game when tab is not active

### Changed
- Adjusted game elements positioning for mobile screens
- Improved UI scaling for better visibility on small screens
- Enhanced touch interaction with larger hit areas
- Prevented unwanted scrolling and zooming on mobile devices

### Fixed
- Fixed issue where Tom's feet were not visible on mobile screens
- Fixed ground positioning on various screen sizes
- Improved performance on mobile devices

## [1.4.1] - 2023-10-31

### Changed
- Improved power-up behaviors based on feedback:
  - Four-leaf clover: Reduced invincibility duration to 3 seconds
  - Whiskey flask: Now increases game speed and adds a delay to jumping
- Made power-up icons larger and more visible
- Reduced power-up spawn rates to prevent them from appearing too frequently
- Added minimum distance between power-ups to prevent clustering
- Enhanced visual effects for power-ups

## [1.4.0] - 2023-10-30

### Added
- Collectible power-ups with different effects:
  - Four-leaf clover: Grants temporary invincibility
  - Pot o' gold: Increases score
  - Whiskey flask: Makes Tom stagger for a few second1.2s
- In-game message system for power-up notifications
- Bonus points for smashing trolls while invincible

### Changed
- Updated collision detection to handle invincibility
- Improved player animation system for power-up effects

### Fixed
- Various minor bugs and performance improvements

## [1.3.0] - 2023-10-25

### Added
- Five different tree types (pine, oak, maple, birch, willow)
- More clouds distributed across the sky
- Sun with subtle animation
- Better distribution of background elements

### Changed
- Enhanced visual appearance with more detailed environment
- Improved parallax effect for depth perception

### Fixed
- Various minor visual glitches
- Performance optimizations

## [1.2.0] - 2023-10-20

### Added
- Automatic game restart after clicking "Play Again"
- Enhanced death screen with direct controls
- Better positioning of joke bubble

### Changed
- Game over screen now stays on death animation
- Improved visual feedback for high scores

### Fixed
- File path issues when running locally
- Alignment of high score message

## [1.1.0] - 2023-10-15

### Added
- Dad jokes system that displays random jokes while playing
- Improved death animation
- Settings screen with difficulty options
- Sound toggle option

### Changed
- Improved collision detection
- Better visual feedback for game over

### Fixed
- Issue with trolls spawning too close together
- Mobile responsiveness issues

## [1.0.0] - 2023-10-10

### Added
- Initial game release with basic functionality
- Character (Tom) with jumping and floating mechanics
- Trolls as obstacles
- Score tracking and high score persistence
- Game over screen
- Basic responsive design

## [1.7.0] - 2023-07-18

### Fixed
- Fixed issues with mobile touch events and jumping mechanics
- Fixed high score table scrolling on mobile devices 
- Improved mobile scrolling for statistics modal
- Fixed high score loading issues with Firebase integration
- Enhanced player jump mechanics for smoother experience on mobile
- Added better handling of viewport and URL bar for mobile browsers
- Improved touch handling for game elements on mobile devices

### Added
- Enhanced mobile touch support for high score tables and statistics modals
- Improved debugging capabilities for high score system

## How to Update Version

When making changes to the game:

1. Add your changes under the [Unreleased] section
2. When releasing a new version:
   - Move [Unreleased] changes to a new version section
   - Update the version number and date
   - Create a new empty [Unreleased] section

## Version Format

We follow [Semantic Versioning](https://semver.org/):
- MAJOR version for incompatible API changes
- MINOR version for backwards-compatible functionality additions
- PATCH version for backwards-compatible bug fixes 