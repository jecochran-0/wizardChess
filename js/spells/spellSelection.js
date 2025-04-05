/**
 * SpellSelection.js - Handles the spell selection phase
 */
class SpellSelection {
  constructor(game) {
    this.game = game;
    this.playerSpells = [];
    this.opponentSpells = [];
    this.selectionComplete = false;

    // Determine player colors
    this.playerColor = game.playerColor || "w";
  }

  // Initialize spell selection
  init() {
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
      <div class="spell-selection-header">
        <h1>Choose Your Magical Spells</h1>
        <p>Select 5 spells to use during the game</p>
      </div>
      
      <div class="selected-spells">
        <div class="player-selection">
          <h3>Your Spells: <span id="player-spell-count">0</span>/5</h3>
          <div id="player-spell-list" class="spell-selection-list"></div>
        </div>
        
        <div class="opponent-selection">
          <h3>Opponent's Spells</h3>
          <div id="opponent-spell-list" class="spell-selection-list"></div>
        </div>
      </div>
      
      <div class="spell-pool" id="spell-pool">
        <!-- All 15 spells will be added here -->
      </div>
      
      <button id="start-game-button" class="start-game-button" disabled>Start Game</button>
    `;

    // Append to body
    document.body.appendChild(modal);

    // Add event listener to start button
    const startButton = modal.querySelector("#start-game-button");
    startButton.addEventListener("click", () => this.completeSelection());
  }

  // Show the modal and populate it
  showModal() {
    const modal = document.getElementById("spell-selection-modal");
    if (!modal) return;

    modal.style.display = "flex";

    // Populate spell pool with 10 randomly selected spells from the 15 available
    this.populateSpellPool();
  }

  // Populate the spell pool with 10 randomly selected spells from the 15 available
  populateSpellPool() {
    const poolElement = document.getElementById("spell-pool");
    if (!poolElement) return;

    poolElement.innerHTML = "";

    // Select 10 random spells from the library of 15
    const randomSpells = [...SpellLibrary]
      .sort(() => Math.random() - 0.5)
      .slice(0, 10);

    // Display only the 10 randomly selected spells
    randomSpells.forEach((spell, index) => {
      // Create spell card
      const card = document.createElement("div");
      card.className = "spell-card";
      card.dataset.spellId = spell.id;
      card.style.setProperty("--card-index", index);

      // Create front of card
      card.innerHTML = `
        <div class="spell-card-front" style="background-image: url('${
          spell.cardImage || "Chess_Spells/default_card.png"
        }')">
          <div class="spell-selection-marker">✓</div>
          <div class="spell-card-info">
            <div class="spell-name">${spell.name}</div>
            <div class="spell-description">${spell.description}</div>
            <div class="spell-cost">${spell.manaCost} mana</div>
          </div>
        </div>
      `;

      // Add click handler for direct selection
      card.addEventListener("click", () =>
        this.toggleSpellSelection(spell, card)
      );

      poolElement.appendChild(card);
    });

    // Update the header to clarify the selection process
    const header = document.querySelector(".spell-selection-header p");
    if (header) {
      header.textContent = "Select 5 spells from the 10 available";
    }
  }

  // Toggle spell selection (select/deselect)
  toggleSpellSelection(spell, card) {
    // Check if selection is already complete
    if (this.selectionComplete) return;

    const spellIndex = this.playerSpells.findIndex((s) => s.id === spell.id);

    if (spellIndex === -1) {
      // Not selected yet, try to select it
      if (this.playerSpells.length < 5) {
        // Add to selected spells
        this.playerSpells.push(spell);
        card.classList.add("selected");

        // Update display
        this.updateSelectionDisplay();

        // Enable start button if we have 5 spells
        if (this.playerSpells.length === 5) {
          const startButton = document.getElementById("start-game-button");
          if (startButton) startButton.disabled = false;
        }
      }
    } else {
      // Already selected, deselect it
      this.playerSpells.splice(spellIndex, 1);
      card.classList.remove("selected");

      // Update display
      this.updateSelectionDisplay();

      // Disable start button if we have fewer than 5 spells
      const startButton = document.getElementById("start-game-button");
      if (startButton) startButton.disabled = true;
    }
  }

  // Update the selection display
  updateSelectionDisplay() {
    const listElement = document.getElementById("player-spell-list");
    const countElement = document.getElementById("player-spell-count");

    if (!listElement || !countElement) return;

    // Update count
    countElement.textContent = this.playerSpells.length;

    // Update list
    listElement.innerHTML = "";

    this.playerSpells.forEach((spell) => {
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

  // Select opponent spells automatically
  selectOpponentSpells() {
    // Select balanced set of spells based on difficulty
    const difficulty = parseInt(
      document.getElementById("difficulty")?.value || "2"
    );

    // Clear current selection
    this.opponentSpells = [];

    // Select spells based on difficulty
    switch (difficulty) {
      case 4: // Archmage - optimized counters
        this.selectOptimizedSpells();
        break;
      case 3: // Master - strategic counters
        this.selectCounterSpells();
        break;
      case 2: // Adept - balanced approach
        this.selectBalancedSpells();
        break;
      default: // Apprentice - random selection
        this.selectRandomSpells();
    }

    // Display opponent's spells
    this.displayOpponentSpells();
  }

  // Display opponent's selected spells
  displayOpponentSpells() {
    const opponentList = document.getElementById("opponent-spell-list");
    if (!opponentList) return;

    // Show thinking animation
    opponentList.innerHTML =
      '<div class="opponent-thinking">Opponent choosing spells...</div>';

    // After a delay, show the selected spells
    setTimeout(() => {
      opponentList.innerHTML = "";

      this.opponentSpells.forEach((spell) => {
        const spellItem = document.createElement("div");
        spellItem.className = "selected-spell-card";
        spellItem.style.backgroundImage = `url('${
          spell.cardImage || "Chess_Spells/default_card.png"
        }')`;

        opponentList.appendChild(spellItem);
      });
    }, 1000);
  }

  // Select random spells for the opponent
  selectRandomSpells() {
    const availableSpells = [...SpellLibrary];
    const shuffled = availableSpells.sort(() => 0.5 - Math.random());
    this.opponentSpells = shuffled.slice(0, 5);
  }

  // Select balanced spells for the opponent
  selectBalancedSpells() {
    // Define categories of spells
    const offensiveOptions = SpellLibrary.filter((spell) =>
      [
        "ember_crown",
        "mistform_knight",
        "cursed_glyph",
        "second_wind",
        "raise_bonewalker",
      ].includes(spell.id)
    );

    const defensiveOptions = SpellLibrary.filter((spell) =>
      [
        "arcane_anchor",
        "spirit_link",
        "pressure_field",
        "nullfield",
        "veil_of_shadows",
      ].includes(spell.id)
    );

    const utilityOptions = SpellLibrary.filter((spell) =>
      [
        "astral_swap",
        "phantom_step",
        "chrono_recall",
        "kings_gambit",
        "dark_conversion",
      ].includes(spell.id)
    );

    // Shuffle each category
    const shuffledOffensive = [...offensiveOptions].sort(
      () => Math.random() - 0.5
    );
    const shuffledDefensive = [...defensiveOptions].sort(
      () => Math.random() - 0.5
    );
    const shuffledUtility = [...utilityOptions].sort(() => Math.random() - 0.5);

    // Take 2 offensive, 2 defensive, 1 utility
    this.opponentSpells = [
      ...shuffledOffensive.slice(0, 2),
      ...shuffledDefensive.slice(0, 2),
      ...shuffledUtility.slice(0, 1),
    ];
  }

  // Select counter spells based on player's selection
  selectCounterSpells() {
    // Analyze player's spell choices and select appropriate counters
    const hasPlayerOffensive = this.playerSpells.some((spell) =>
      [
        "ember_crown",
        "mistform_knight",
        "cursed_glyph",
        "second_wind",
        "raise_bonewalker",
      ].includes(spell.id)
    );

    const hasPlayerDefensive = this.playerSpells.some((spell) =>
      [
        "arcane_anchor",
        "spirit_link",
        "pressure_field",
        "nullfield",
        "veil_of_shadows",
      ].includes(spell.id)
    );

    // Initialize opponent spells array
    this.opponentSpells = [];

    // If player has offensive spells, add more defensive spells
    if (hasPlayerOffensive) {
      const defensiveOptions = SpellLibrary.filter((spell) =>
        [
          "arcane_anchor",
          "spirit_link",
          "pressure_field",
          "nullfield",
          "veil_of_shadows",
        ].includes(spell.id)
      );

      const shuffled = [...defensiveOptions].sort(() => Math.random() - 0.5);
      this.opponentSpells.push(...shuffled.slice(0, 3));
    } else {
      const offensiveOptions = SpellLibrary.filter((spell) =>
        [
          "ember_crown",
          "mistform_knight",
          "cursed_glyph",
          "second_wind",
          "raise_bonewalker",
        ].includes(spell.id)
      );

      const shuffled = [...offensiveOptions].sort(() => Math.random() - 0.5);
      this.opponentSpells.push(...shuffled.slice(0, 3));
    }

    // If player has defensive spells, add spells that counter defense
    if (hasPlayerDefensive) {
      const counterDefense = SpellLibrary.filter((spell) =>
        [
          "phantom_step",
          "nullfield",
          "second_wind",
          "veil_of_shadows",
        ].includes(spell.id)
      );

      const shuffled = [...counterDefense].sort(() => Math.random() - 0.5);
      this.opponentSpells.push(...shuffled.slice(0, 2));
    } else {
      const utilityOptions = SpellLibrary.filter((spell) =>
        [
          "astral_swap",
          "kings_gambit",
          "chrono_recall",
          "dark_conversion",
        ].includes(spell.id)
      );

      const shuffled = [...utilityOptions].sort(() => Math.random() - 0.5);
      this.opponentSpells.push(...shuffled.slice(0, 2));
    }

    // Ensure we have exactly 5 spells
    if (this.opponentSpells.length > 5) {
      this.opponentSpells = this.opponentSpells.slice(0, 5);
    } else if (this.opponentSpells.length < 5) {
      // Fill with random spells
      const remainingSpells = SpellLibrary.filter(
        (spell) => !this.opponentSpells.includes(spell)
      );

      const shuffled = [...remainingSpells].sort(() => Math.random() - 0.5);

      while (this.opponentSpells.length < 5) {
        this.opponentSpells.push(shuffled.pop());
      }
    }
  }

  // Select optimized spell set for hardest difficulty
  selectOptimizedSpells() {
    // Strong spell combinations that work well together
    const strongSets = [
      // Aggressive set
      SpellLibrary.filter((spell) =>
        [
          "ember_crown",
          "second_wind",
          "cursed_glyph",
          "mistform_knight",
          "phantom_step",
        ].includes(spell.id)
      ),

      // Defensive set
      SpellLibrary.filter((spell) =>
        [
          "arcane_anchor",
          "nullfield",
          "pressure_field",
          "veil_of_shadows",
          "spirit_link",
        ].includes(spell.id)
      ),

      // Balanced set
      SpellLibrary.filter((spell) =>
        [
          "astral_swap",
          "ember_crown",
          "nullfield",
          "arcane_anchor",
          "raise_bonewalker",
        ].includes(spell.id)
      ),
    ];

    // Pick one of the strong sets randomly
    const selectedSet =
      strongSets[Math.floor(Math.random() * strongSets.length)];
    this.opponentSpells = selectedSet;
  }

  // Complete the selection phase
  completeSelection() {
    this.selectionComplete = true;

    // Select opponent spells
    this.selectOpponentSpells();

    // After showing opponent spells, close the modal and start the game
    setTimeout(() => {
      // Hide the modal with a transition
      const modal = document.getElementById("spell-selection-modal");
      if (modal) {
        modal.style.opacity = 0;
        setTimeout(() => {
          modal.style.display = "none";
          modal.style.opacity = 1;

          // Show the game container
          const gameContainer = document.getElementById("game-container");
          if (gameContainer) {
            gameContainer.style.display = "block";
          }
        }, 1000);
      }

      // Store the selected spells and initialize spell manager
      if (this.game.setSelectedSpells) {
        this.game.setSelectedSpells(this.playerSpells, this.opponentSpells);
      } else {
        console.warn("Game object doesn't have setSelectedSpells method");
      }

      console.log("Spell selection complete. Starting game...");
    }, 1500);
  }
}
