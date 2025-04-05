# Wizard Chess - Spell Implementation Plan

## Overview

This document outlines the implementation plan for adding a spell system to the existing chess game. The implementation will respect these key principles:

- Don't modify existing functional code
- Don't break current chess functionality
- Use simple implementations that leverage existing game logic
- Create a clear separation between spell logic and chess logic

## Core Game Mechanics

### Player Resources

- **Spells Per Game**: 5 spells maximum per player
- **Starting Mana**: 15 mana points per player
- **Mana Regeneration**: +1 mana every other turn
- **Cooldown**: A player cannot use a spell two turns in a row

### Spell Selection Phase

Before the game begins, players go through a Spell Selection Phase:

1. **Random Pool Generation**: 10 spells are randomly selected from the complete spell library
2. **Player Selection**: Each player chooses 5 spells from this common pool
3. **Duplicate Allowed**: Players can select the same spells as each other
4. **Selection Order**: Players take turns selecting spells one at a time
5. **Computer Selection**: When playing against the computer, the AI automatically selects its spells

The selection process is handled through a modal interface that displays:

- The available spell pool
- Currently selected spells for each player
- Turn indicator showing which player is selecting

Once both players have selected their 5 spells, the Spell Selection Phase ends and the chess game begins with each player having access to their chosen spells.

## File Structure

### New Files

```
├── css/
│   └── spells.css                 # Styling for spell UI components
├── js/
│   ├── spells/
│   │   ├── spellbook.js           # Contains all spell definitions
│   │   ├── spellEffects.js        # Implementations of spell effects
│   │   ├── spellManager.js        # Core spell system logic
│   │   └── spellSelection.js      # Handles spell selection UI
```

### Modified Files

```
├── index.html                     # Add spell UI and script references
├── js/
│   ├── wizardChess.js             # Add spell system integration
│   └── board.js                   # Add spell targeting integration
```

## Implementation Details

### 1. Spell Data Structure

Each spell will be represented as an object with properties:

```javascript
{
  id: "astral_swap",          // Unique identifier
  name: "Astral Swap",        // Display name
  description: "Swap two friendly pieces", // Description
  manaCost: 4,                // Mana cost to cast
  icon: "🔁",                 // Emoji icon for display
  targetType: "friendly-pair", // Type of targeting required
  validTargets: function(game, position) {
    // Returns whether a position is a valid target
  },
  effect: function(game, ...targets) {
    // Implements the spell effect
  }
}
```

### 2. Game State Extension

The `WizardChess` class will be extended with:

```javascript
// New properties
this.spellManager = new SpellManager(this);
this.playerMana = 15;
this.computerMana = 15;
this.playerSpellsRemaining = 5;
this.computerSpellsRemaining = 5;
this.lastTurnSpellCast = false; // For cooldown tracking
this.turnCounter = 0;
this.spellMode = false; // Whether we're in spell selection mode

// New methods
castSpell(spellId, ...targets) { }
enterSpellMode(spellId) { }
exitSpellMode() { }
isSpellTargetValid(spellId, target) { }
```

### 3. UI Components

#### Spell Dashboard

A floating panel showing:

- Current mana (with icon)
- Spells remaining counter
- Available spell cards

#### Spell Selection Modal

A modal dialog for choosing spells at game start:

- Available spell pool (randomized subset of all spells)
- Selected spell display for player and opponent
- Turn indicator for selection phase

#### In-Game Targeting UI

- Highlight valid spell targets when a spell is selected
- Special cursor or indicator for spell targeting mode
- Visual effects for spell casting and results

### 4. Execution Flow

#### Game Initialization

1. Create a new `WizardChess` instance
2. Initialize the spell selection phase
3. Players choose their spells
4. Start the game with the selected spells

#### Spell Selection Process

1. Generate a random pool of 10 spells from the SpellLibrary
2. Display the Spell Selection Modal showing the random pool
3. Set the first player as the active selector
4. When a player selects a spell:
   - Add it to their selected spells list
   - Update the UI to show the selection
   - Switch to the other player
5. Continue until both players have selected 5 spells
6. Close the modal and begin the game

#### Spell Casting

1. Player clicks a spell card in the dashboard
2. Game enters spell mode with the selected spell
3. Valid targets are highlighted on the board
4. Player clicks on target(s) based on spell requirements
5. Spell effect is applied to the game state
6. Mana is deducted, cooldown applied
7. Board is updated to reflect the new state
8. Player makes their normal chess move (if desired)

#### Turn Management

1. At the end of each turn, process any active effects
2. Decrement turn counters on persistent effects
3. Remove expired effects
4. Apply mana regeneration on appropriate turns
5. Update the spell dashboard

### 5. Spell Manager Class

The `SpellManager` will handle:

- Tracking available spells for each player
- Validating spell targets
- Applying spell effects to the game state
- Managing mana and cooldowns
- Tracking persistent effects

```javascript
class SpellManager {
  constructor(game) {
    this.game = game;
    this.playerSpells = [];
    this.computerSpells = [];
    this.selectedSpell = null;
    this.effectQueue = [];
  }

  // Methods
  setPlayerSpells(spells) {}
  setComputerSpells(spells) {}
  canCastSpell(spellId, player) {}
  castSpell(spellId, ...targets) {}
  getValidTargets(spellId) {}
  processTurnEffects() {}

  // Spell selection methods
  getRandomSpellPool(count = 10) {}
  selectSpell(spellId, player) {}
  isSelectionComplete() {}
}
```

### 6. Board Integration

Extend the `ChessBoard` class with:

```javascript
// New methods
enterSpellTargetingMode(spellId) { }
exitSpellTargetingMode() { }
handleSpellTargetClick(row, col) { }
highlightValidSpellTargets(spellId) { }
applyVisualEffects(effectType, position) { }
```

## Spell Implementation Strategy

### Categories of Spell Effects

1. **Board State Modification**

   - Directly manipulate the FEN position
   - Validate resulting position for legality
   - Example: Teleport, Swap

2. **Persistent Effects**

   - Store in effect queue with turn counters
   - Process at beginning/end of turns
   - Example: Shield, Freeze

3. **One-time Effects**
   - Apply immediately with no persistence
   - Example: Fireball, Extra Move

### Implementing Specific Spells

#### 1. Astral Swap (4 Mana)

```javascript
effect: function(game, square1, square2) {
  // Get pieces at both squares
  const piece1 = game.chess.get(square1);
  const piece2 = game.chess.get(square2);

  // Remove both pieces
  game.chess.remove(square1);
  game.chess.remove(square2);

  // Place them in swapped positions
  game.chess.put(piece1, square2);
  game.chess.put(piece2, square1);

  // Update the board
  game.board.updateBoard();
}
```

#### 2. Phantom Step (2 Mana)

```javascript
effect: function(game, fromSquare, toSquare) {
  // Get the piece to move
  const piece = game.chess.get(fromSquare);

  // Remove piece from source
  game.chess.remove(fromSquare);

  // Place at destination
  game.chess.put(piece, toSquare);

  // Update the board
  game.board.updateBoard();
}
```

## UI Implementation

### 1. Spell Dashboard HTML

```html
<div id="spell-dashboard" class="spell-dashboard">
  <div class="mana-display">
    <div class="mana-icon">🔮</div>
    <div class="mana-value">15</div>
  </div>
  <div class="spells-remaining"><span>5</span> spells remaining</div>
  <div id="spell-hand" class="spell-hand">
    <!-- Player's spell cards will go here -->
  </div>
</div>
```

### 2. Spell Selection Modal HTML

```html
<div id="spell-selection-modal" class="spell-selection-modal">
  <div class="modal-content">
    <h2>Choose Your Magical Spells</h2>
    <p>Each player selects 5 spells to use during the game.</p>
    <div class="turn-indicator">
      Current selector:
      <span id="current-selector" class="selector-white">White</span>
    </div>

    <div class="spell-pool" id="spell-pool">
      <!-- Available spells will be displayed here -->
    </div>

    <div class="selected-spells">
      <div class="player-selection">
        <h3>Your Spells: <span id="player-spell-count">0</span>/5</h3>
        <div id="player-spell-list" class="spell-selection-list"></div>
      </div>
      <div class="opponent-selection">
        <h3>Opponent's Spells: <span id="opponent-spell-count">0</span>/5</h3>
        <div id="opponent-spell-list" class="spell-selection-list"></div>
      </div>
    </div>
  </div>
</div>
```

### 3. CSS Requirements

Key styling components:

- Spell card design with hover effects
- Mana display with magical styling
- Modal overlay for spell selection
- Targeting highlights for valid spell targets
- Visual effects for spell casting
- Persistent effect indicators on affected pieces

## Implementation Phases

### Phase 1: Core Framework

1. Create basic spell data structure
2. Implement spell dashboard UI
3. Add spell manager with mana tracking
4. Integrate with game flow

### Phase 2: Spell Targeting & Effects

1. Implement spell targeting system
2. Create effect queue for persistent effects
3. Implement first set of spell effects
4. Add visual indicators for spell effects

### Phase 3: Spell Selection & AI

1. Implement spell selection interface
2. Add random spell pool generation
3. Add AI spell decision making
4. Balance and test spell interactions

## Testing Strategy

1. Unit test each spell effect individually
2. Test interactions between spells and chess rules
3. Verify proper cleanup of persistent effects
4. Check edge cases (castling, en passant, check/checkmate)
5. Test AI spell usage in different scenarios

## Technical Considerations

1. Use event delegation for spell card clicks
2. Implement proper state management for targeting flow
3. Ensure clean separation between chess and spell logic
4. Use CSS transitions for smooth visual effects
5. Ensure spell effects don't break chess rule validation
