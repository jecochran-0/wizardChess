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
  };

  // Initialize spell system
  window.game.initSpellSystem();
}
