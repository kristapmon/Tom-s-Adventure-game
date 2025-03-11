# Tom's Adventure - Changelog

This file documents all notable changes to Tom's Adventure game.

## [Unreleased]

## [1.6.1] - 2023-11-14

### Added
- High score buttons on main menu and death screen
- Improved high score table with larger size and better scrolling
- Local storage fallback for high scores when Firebase is unavailable

### Changed
- Removed timestamp from high score display, keeping only the date
- Allowed spaces in player names while maintaining security
- Changed "Submit Score" button text to just "Submit"
- Improved styling of high score table and modals
- Made high score table larger and more readable

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