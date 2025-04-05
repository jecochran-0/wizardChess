/**
 * SpellSelection.js - Handles the spell selection phase
 */
class SpellSelection {
  constructor(game) {
    this.game = game;
    this.spellPool = [];
    this.playerSpells = [];
    this.opponentSpells = [];
    this.currentSelector = "w"; // White selects first
    this.selectionComplete = false;

    // Determine player colors
    this.playerColor = game.playerColor || "w";
  }

  // Initialize spell selection
  init() {
    // Generate random spell pool (10 spells)
    this.generateSpellPool();

    // Create modal if it doesn't exist
    this.createModal();

    // Show the modal
    this.showModal();

    // Add medieval font for headers
    this.addFontLink();
  }

  // Add the medieval font
  addFontLink() {
    if (!document.getElementById("medieval-font")) {
      const link = document.createElement("link");
      link.id = "medieval-font";
      link.rel = "stylesheet";
      link.href =
        "https://fonts.googleapis.com/css2?family=MedievalSharp&display=swap";
      document.head.appendChild(link);
    }
  }

  // Generate random spell pool
  generateSpellPool() {
    // Shuffle the spell library and take 10 random spells
    this.spellPool = [...SpellLibrary]
      .sort(() => 0.5 - Math.random())
      .slice(0, 10);
  }

  // Create the spell selection modal if it doesn't exist
  createModal() {
    if (document.getElementById("spell-selection-modal")) {
      return;
    }

    // Create modal container
    const modal = document.createElement("div");
    modal.id = "spell-selection-modal";
    modal.className = "spell-selection-modal";

    // Create modal content with new layout
    modal.innerHTML = `
      <div class="turn-indicator">
        Current Selector: 
        <span id="current-selector" class="selector-white">White</span>
      </div>
      
      <div class="spell-selection-header">
        <h1>Choose Your Magical Spells</h1>
        <p>Each player selects 5 spells to use during the game</p>
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
      
      <div class="spell-pool" id="spell-pool">
        <!-- Spells will be added here -->
      </div>
    `;

    // Append to body
    document.body.appendChild(modal);
  }

  // Show the modal and populate it
  showModal() {
    const modal = document.getElementById("spell-selection-modal");
    if (!modal) return;

    modal.style.display = "flex";

    // Populate spell pool
    this.populateSpellPool();

    // Check if computer should select first
    this.checkComputerTurn();
  }

  // Populate the spell pool with cards
  populateSpellPool() {
    const poolElement = document.getElementById("spell-pool");
    if (!poolElement) return;

    poolElement.innerHTML = "";

    this.spellPool.forEach((spell, index) => {
      // Create spell card
      const card = document.createElement("div");
      card.className = "spell-card";
      card.dataset.spellId = spell.id;
      card.style.setProperty("--card-index", index);

      // Create front and back of card
      card.innerHTML = `
        <div class="spell-card-front" style="background-image: url('${
          spell.cardImage || "Chess_Spells/default_card.png"
        }')">
          <div class="spell-card-info">
            <div class="spell-name">${spell.name}</div>
            <div class="spell-description">${spell.description}</div>
            <div class="spell-cost">${spell.manaCost} mana</div>
          </div>
        </div>
        <div class="spell-card-back"></div>
      `;

      // Add click handler
      card.addEventListener("click", () => this.selectSpell(spell));

      poolElement.appendChild(card);
    });
  }

  // Handle spell selection
  selectSpell(spell) {
    // Check if selection is already complete
    if (this.selectionComplete) return;

    // Get the current player
    const isPlayerSelector = this.currentSelector === this.playerColor;

    // Remove spell from the pool visually
    const spellCards = document.querySelectorAll(".spell-card");
    spellCards.forEach((card) => {
      if (card.dataset.spellId === spell.id) {
        card.style.opacity = "0.3";
        card.style.pointerEvents = "none";
      }
    });

    // Add the spell to the appropriate list
    if (isPlayerSelector) {
      // Player is selecting
      if (this.playerSpells.length >= 5) return; // Already selected 5 spells

      this.playerSpells.push(spell);
      this.updateSelectionDisplay("player", this.playerSpells);
    } else {
      // Opponent is selecting
      if (this.opponentSpells.length >= 5) return; // Already selected 5 spells

      this.opponentSpells.push(spell);
      this.updateSelectionDisplay("opponent", this.opponentSpells);
    }

    // Switch the selector
    this.switchSelector();

    // Check if selection is complete
    if (this.playerSpells.length >= 5 && this.opponentSpells.length >= 5) {
      this.completeSelection();
    }

    // No need to add auto-select here - the switchSelector method will handle it
  }

  // Switch the current selector
  switchSelector() {
    this.currentSelector = this.currentSelector === "w" ? "b" : "w";

    // Update the UI
    const selectorElement = document.getElementById("current-selector");
    if (selectorElement) {
      if (this.currentSelector === "w") {
        selectorElement.textContent = "White";
        selectorElement.className = "selector-white";
      } else {
        selectorElement.textContent = "Black";
        selectorElement.className = "selector-black";
      }
    }

    // Check if it's computer's turn now
    this.checkComputerTurn();
  }

  // Update the selection display
  updateSelectionDisplay(player, spells) {
    const listElement = document.getElementById(`${player}-spell-list`);
    const countElement = document.getElementById(`${player}-spell-count`);

    if (!listElement || !countElement) return;

    // Update count
    countElement.textContent = spells.length;

    // Update list
    listElement.innerHTML = "";

    spells.forEach((spell) => {
      const spellItem = document.createElement("div");
      spellItem.className = "selected-spell-card";
      spellItem.style.backgroundImage = `url('${
        spell.cardImage || "Chess_Spells/default_card.png"
      }')`;

      // Add tooltip
      spellItem.title = `${spell.name} (${spell.manaCost} mana)`;

      listElement.appendChild(spellItem);
    });
  }

  // Auto-select a spell for the computer
  autoSelectComputerSpell() {
    if (this.opponentSpells.length >= 5) return;

    console.log("Computer selecting a spell...");

    // Select a random spell from the pool that's not already selected
    const availableSpells = this.spellPool.filter(
      (spell) =>
        !this.playerSpells.includes(spell) &&
        !this.opponentSpells.includes(spell)
    );

    if (availableSpells.length > 0) {
      const randomIndex = Math.floor(Math.random() * availableSpells.length);
      const randomSpell = availableSpells[randomIndex];

      // Short delay to make it feel like the computer is "thinking"
      setTimeout(() => {
        this.selectSpell(randomSpell);
      }, 800);
    }
  }

  // Complete the selection phase
  completeSelection() {
    this.selectionComplete = true;

    // Hide the modal with a transition
    const modal = document.getElementById("spell-selection-modal");
    if (modal) {
      modal.style.opacity = 0;
      setTimeout(() => {
        modal.style.display = "none";
        modal.style.opacity = 1;
      }, 1000);
    }

    // Store the selected spells in the game object for later use
    if (this.game.setSelectedSpells) {
      this.game.setSelectedSpells(this.playerSpells, this.opponentSpells);
    } else {
      console.warn("Game object doesn't have setSelectedSpells method");
    }

    // Trigger game start
    console.log("Spell selection complete. Starting game...");
  }

  // Add a new method to check if it's computer's turn
  checkComputerTurn() {
    // Only auto-select if it's computer mode and it's the computer's turn
    if (this.game.gameMode === "computer") {
      // In computer mode, check whose turn it is based on colors
      const isPlayerTurn = this.currentSelector === this.playerColor;

      if (!isPlayerTurn) {
        console.log("Computer's turn to select a spell");
        this.autoSelectComputerSpell();
      } else {
        console.log("Player's turn to select a spell");
      }
    }
  }
}
