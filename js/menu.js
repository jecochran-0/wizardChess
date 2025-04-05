// Menu navigation and game initialization
document.addEventListener("DOMContentLoaded", function () {
  // DOM elements
  const mainMenu = document.getElementById("main-menu");
  const gameContainer = document.getElementById("game-container");
  const playComputerBtn = document.getElementById("play-computer");
  const playLocalBtn = document.getElementById("play-local");
  const returnToMenuBtn = document.getElementById("return-to-menu");
  const modalMenuBtn = document.getElementById("modal-menu");
  const menuDifficultySelect = document.getElementById("menu-difficulty");

  // Game mode tracking
  let isComputerOpponent = true;

  // Show menu, hide game
  function showMenu() {
    mainMenu.style.display = "flex";
    gameContainer.style.display = "none";

    // Hide any active modals
    const gameOverModal = document.getElementById("game-over-modal");
    if (gameOverModal) gameOverModal.classList.add("hidden");
  }

  // Hide menu, show game
  function showGame() {
    mainMenu.style.display = "none";
    gameContainer.style.display = "block";
  }

  // Start game against computer
  playComputerBtn.addEventListener("click", function () {
    isComputerOpponent = true;

    // Get selected color
    const playerColor = document.querySelector(
      'input[name="player-color"]:checked'
    ).value;

    // Get selected difficulty
    const difficulty = menuDifficultySelect.value;

    // Show game screen
    showGame();

    // Create a new game instance if needed
    if (!window.game) {
      window.game = new WizardChess();
    }

    // Set game to computer mode
    window.game.setGameMode("computer");

    // Set player color (this will also set board orientation)
    window.game.setOrientation(playerColor);

    // Set difficulty
    window.game.engine.setDifficulty(difficulty);

    // Hide difficulty selector in game UI
    const difficultySelector = document.querySelector(".difficulty-selector");
    if (difficultySelector) {
      difficultySelector.style.display = "none";
    }

    // Reset game to apply all settings
    window.game.resetGame();

    console.log(
      `Game started with player as ${playerColor === "w" ? "White" : "Black"}`
    );

    // Start spell selection after a short delay to ensure game is initialized
    setTimeout(function () {
      const spellSelection = new SpellSelection(window.game);
      spellSelection.init();
    }, 200);
  });

  // Start local game (human vs human)
  playLocalBtn.addEventListener("click", function () {
    isComputerOpponent = false;
    showGame();

    // Reset the game with local play mode
    if (window.game && typeof window.game.resetGame === "function") {
      window.game.setGameMode("local");
      window.game.resetGame();
    }

    // Start spell selection after a short delay
    setTimeout(function () {
      const spellSelection = new SpellSelection(window.game);
      spellSelection.init();
    }, 200);
  });

  // Return to main menu from game
  returnToMenuBtn.addEventListener("click", showMenu);

  // Return to main menu from game over modal
  if (modalMenuBtn) {
    modalMenuBtn.addEventListener("click", showMenu);
  }

  // Start with menu visible
  showMenu();

  // Enhanced sparkle effect function
  function createSparkles() {
    const menu = document.getElementById("main-menu");

    // Remove any existing sparkles
    const existingSparkles = document.querySelectorAll(".sparkle");
    existingSparkles.forEach((sparkle) => sparkle.remove());

    // Create new sparkles - increase count
    const sparkleCount = 50; // More sparkles

    for (let i = 0; i < sparkleCount; i++) {
      const sparkle = document.createElement("div");
      sparkle.classList.add("sparkle");

      // Add large sparkle class to some sparkles for variety
      if (Math.random() > 0.7) {
        sparkle.classList.add("large");
      }

      // Random position
      const posX = Math.random() * 100;
      const posY = Math.random() * 100;
      sparkle.style.left = `${posX}%`;
      sparkle.style.top = `${posY}%`;

      // Random animation duration and delay - shorter for more activity
      const duration = Math.random() * 2 + 1.5; // 1.5-3.5 seconds (faster)
      const delay = Math.random() * 3; // 0-3 seconds delay (shorter)
      sparkle.style.animationDuration = `${duration}s`;
      sparkle.style.animationDelay = `${delay}s`;

      // More vibrant colors
      const colorType = Math.random();
      if (colorType < 0.6) {
        // Gold/Yellow sparkles (common)
        const hue = Math.random() * 40 + 40; // 40-80 (gold/yellow range)
        sparkle.style.backgroundColor = `hsl(${hue}, 100%, 75%)`;
        sparkle.style.boxShadow = `0 0 15px 5px hsla(${hue}, 100%, 75%, 0.9)`;
      } else if (colorType < 0.8) {
        // Purple sparkles (less common)
        const hue = Math.random() * 40 + 260; // 260-300 (purple range)
        sparkle.style.backgroundColor = `hsl(${hue}, 100%, 75%)`;
        sparkle.style.boxShadow = `0 0 15px 5px hsla(${hue}, 100%, 75%, 0.9)`;
      } else {
        // White sparkles (rare)
        sparkle.style.backgroundColor = `rgba(255, 255, 255, 0.95)`;
        sparkle.style.boxShadow = `0 0 15px 6px rgba(255, 255, 255, 0.95)`;
      }

      menu.appendChild(sparkle);
    }
  }

  // Call sparkle function more frequently to keep it fresh
  function refreshSparkles() {
    createSparkles();
    // Refresh sparkles every 5 seconds
    setTimeout(refreshSparkles, 5000);
  }

  // Start the sparkle effect and refresh cycle
  createSparkles();
  setTimeout(refreshSparkles, 5000);
});

// Create a new file menu.js to be included after game.js but before the game is initialized
// This injects the missing methods without modifying the original code

// Wait for the DOM and the game script to load
document.addEventListener("DOMContentLoaded", function () {
  // Check if the game object is being created
  const originalWizardChess = window.WizardChess;

  // Define WizardChess constructor with the missing method
  window.WizardChess = function () {
    // Add the missing createBoard method
    this.createBoard = function () {
      console.log("Creating board");
      if (this.board) {
        this.board.init();
      }
    };

    // Call the original constructor
    return originalWizardChess.apply(this, arguments);
  };

  // Copy prototype methods
  window.WizardChess.prototype = originalWizardChess.prototype;

  console.log("Menu script loaded, added missing methods");
});

// Fix initialization errors by adding the missing methods after game is created
function fixGameInitialization() {
  // Check if game exists
  if (window.game) {
    // Add createBoard method only if it doesn't exist
    if (!window.game.createBoard) {
      window.game.createBoard = function () {
        console.log("Using patched createBoard method");
        // The board is already created in constructor, just initialize it
        if (this.board && typeof this.board.init === "function") {
          this.board.init();
        }
      };
      console.log("Added missing createBoard method to game instance");
    }
    return true; // Indicate success
  }
  return false; // Indicate game not ready yet
}

// Run the fix function when document is loaded
document.addEventListener("DOMContentLoaded", function () {
  // Add a small delay to ensure all scripts are loaded
  setTimeout(function () {
    // Try to fix the game
    const success = fixGameInitialization();

    if (!success) {
      // If not successful on first try, set up an interval to keep trying
      const fixInterval = setInterval(function () {
        if (fixGameInitialization()) {
          clearInterval(fixInterval);
          console.log("Game initialization fixed successfully");
        }
      }, 100); // Try every 100ms
    }
  }, 500); // Initial delay of 500ms to ensure scripts are loaded
});
