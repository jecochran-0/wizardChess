/**
 * WizardChess - Integrates spell system with existing game
 */

// Initialize spell system when game is ready
document.addEventListener("DOMContentLoaded", function () {
  // Wait for game to be initialized
  const checkGameReady = setInterval(function () {
    if (window.game && window.game.chess) {
      clearInterval(checkGameReady);
      extendGameWithSpells();
    }
  }, 100);
});

// Extend the existing game object with spell functionality
function extendGameWithSpells() {
  console.log("Extending game with spell functionality");

  // Add spell properties to the game object
  window.game.spellMode = false;
  window.game.spellManager = null;
  window.game.spellTargets = [];
  window.game.playerSpells = [];
  window.game.opponentSpells = [];

  // Add utility methods
  window.game.isPlayerTurn = function () {
    return this.chess.turn() === this.playerColor;
  };

  // Add spell system methods
  window.game.initSpellSystem = function () {
    console.log("Spell system initialized");
  };

  // Add method to store selected spells
  window.game.setSelectedSpells = function (playerSpells, opponentSpells) {
    this.playerSpells = playerSpells;
    this.opponentSpells = opponentSpells;
    console.log("Spells set:", playerSpells, opponentSpells);

    // Initialize the spell manager with the selected spells
    this.initSpellManager();
  };

  // Add method to initialize spell manager with selected spells
  window.game.initSpellManager = function () {
    // Create spell manager if needed
    if (!this.spellManager) {
      this.spellManager = new SpellManager(this);
    }

    // Initialize with the selected spells
    this.spellManager.initWithSpells(this.playerSpells, this.opponentSpells);

    // Connect the spell manager to the board for targeting
    this.connectSpellManagerToBoard();
  };

  // Add method to connect spell manager to board
  window.game.connectSpellManagerToBoard = function () {
    if (!this.board || !this.spellManager) return;

    // Add click handler for spell targeting
    const squares = this.board.element.querySelectorAll(".square");
    squares.forEach((square) => {
      square.addEventListener("click", (e) => {
        // Only process if we're in targeting mode
        if (this.spellManager.spellTargetingMode) {
          const position = square.dataset.position;
          if (position) {
            this.spellManager.handleTargetSelection(position);
            e.stopPropagation(); // Prevent normal move
          }
        }
      });
    });
  };

  // Hook into game's move processing
  const originalHandleMove = window.game.board.handleMove;
  window.game.board.handleMove = function (from, to) {
    // Call original move handler
    const result = originalHandleMove.call(this, from, to);

    // If move was successful and we have a spell manager
    if (result && window.game.spellManager) {
      // Generate mana based on turn
      const turn = this.moveHistory.length;
      window.game.spellManager.generateMana(turn);

      // Process active effects
      window.game.spellManager.processActiveEffects();
    }

    return result;
  };

  // Add method to clean up spell manager on game reset
  const originalResetGame = window.game.resetGame;
  window.game.resetGame = function () {
    // Clean up spell manager
    if (this.spellManager) {
      this.spellManager.cleanup();
    }

    // Call original reset
    originalResetGame.call(this);

    // Reinitialize spell manager if we have spells
    if (this.playerSpells && this.playerSpells.length > 0) {
      this.initSpellManager();
    }
  };

  // Initialize spell system
  window.game.initSpellSystem();
}
