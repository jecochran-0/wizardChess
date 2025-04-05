/**
 * SpellManager.js - Enhanced with better UI integration
 */
class SpellManager {
  constructor(game) {
    this.game = game;
    this.playerMana = 15;
    this.opponentMana = 15;
    this.playerSpells = [];
    this.opponentSpells = [];
    this.activeEffects = [];
    this.lastTurnManaGenerated = 0;
    this.spellDashboard = null;
    this.effectsDisplay = null;
    this.spellTargetingMode = false;
    this.selectedSpell = null;
    this.spellTargets = [];

    // For UI animations
    this.manaRegenInterval = null;
  }

  // Initialize with the selected spells
  initWithSpells(playerSpells, opponentSpells) {
    this.playerSpells = playerSpells;
    this.opponentSpells = opponentSpells;

    // Create the UI elements
    this.createSpellDashboard();
    this.createEffectsDisplay();

    console.log(
      "Spell Manager initialized with spells:",
      playerSpells,
      opponentSpells
    );

    // Start mana regen animation interval
    this.startManaRegenAnimation();
  }

  // Start interval for mana regeneration animation
  startManaRegenAnimation() {
    // Clear existing interval if any
    if (this.manaRegenInterval) {
      clearInterval(this.manaRegenInterval);
    }

    // Check every second for mana regen
    this.manaRegenInterval = setInterval(() => {
      const turn = this.game.board.moveHistory.length;
      if (Math.floor(turn / 2) > this.lastTurnManaGenerated) {
        this.showManaRegenAnimation();
      }
    }, 1000);
  }

  // Show mana regeneration animation
  showManaRegenAnimation() {
    const manaDisplay = document.querySelector(".mana-display");
    if (!manaDisplay) return;

    const animation = document.createElement("div");
    animation.className = "mana-regen-animation";
    animation.textContent = "+1";

    manaDisplay.appendChild(animation);

    // Remove after animation completes
    setTimeout(() => {
      if (animation.parentNode === manaDisplay) {
        manaDisplay.removeChild(animation);
      }
    }, 1500);
  }

  // Create the spell dashboard UI
  createSpellDashboard() {
    // Create dashboard if it doesn't exist
    if (!document.getElementById("spell-dashboard")) {
      const dashboard = document.createElement("div");
      dashboard.id = "spell-dashboard";
      dashboard.className = "spell-dashboard";

      dashboard.innerHTML = `
        <div class="spell-cards-container">
          <h3 class="spell-dashboard-title">Magical Spells</h3>
          <div id="spell-hand" class="spell-hand"></div>
        </div>
        <div class="mana-bar-vertical">
          <div class="mana-icon">🔮</div>
          <div class="mana-bar-container">
            <div class="mana-bar-fill" style="height: ${
              (this.playerMana / 30) * 100
            }%"></div>
          </div>
          <div class="mana-value">${this.playerMana}</div>
        </div>
      `;

      document.body.appendChild(dashboard);
      this.spellDashboard = dashboard;
    }

    // Update spell hand display
    this.updateSpellDisplay();
  }

  // Create the active effects display
  createEffectsDisplay() {
    if (!document.getElementById("active-effects")) {
      const effectsDisplay = document.createElement("div");
      effectsDisplay.id = "active-effects";
      effectsDisplay.className = "active-effects";

      effectsDisplay.innerHTML = `
        <div class="active-effects-header">Active Effects</div>
        <div id="effects-list"></div>
      `;

      // Hide initially if no active effects
      effectsDisplay.style.display = "none";

      document.body.appendChild(effectsDisplay);
      this.effectsDisplay = effectsDisplay;
    }
  }

  // Update the active effects display
  updateEffectsDisplay() {
    const effectsList = document.getElementById("effects-list");
    if (!effectsList) return;

    // Show/hide the container based on whether there are active effects
    const container = document.getElementById("active-effects");
    if (container) {
      container.style.display =
        this.activeEffects.length > 0 ? "block" : "none";
    }

    // Clear current list
    effectsList.innerHTML = "";

    // Add each effect
    this.activeEffects.forEach((effect) => {
      const effectItem = document.createElement("div");
      effectItem.className = "effect-item";

      effectItem.innerHTML = `
        <div class="effect-icon">${effect.icon || "✨"}</div>
        <div class="effect-details">
          <div class="effect-name">${effect.name}</div>
          <div class="effect-description">${effect.description}</div>
        </div>
        <div class="effect-turns">${effect.remainingTurns} turns</div>
      `;

      effectsList.appendChild(effectItem);
    });
  }

  // Update the spell display in the dashboard
  updateSpellDisplay() {
    const spellHand = document.getElementById("spell-hand");
    if (!spellHand) return;

    spellHand.innerHTML = "";

    // Add player spells to the hand
    this.playerSpells.forEach((spell) => {
      const spellCard = document.createElement("div");
      spellCard.className = "spell-card-mini";
      spellCard.dataset.spellId = spell.id;

      // Use the cardImage property for the background
      spellCard.style.backgroundImage = `url("${
        spell.cardImage || "Chess_Spells/default_card.png"
      }")`;

      // Determine if spell is castable (enough mana)
      const isCastable = spell.manaCost <= this.playerMana;

      // Add cost badge
      const costBadge = document.createElement("div");
      costBadge.className = "spell-cost-badge";
      costBadge.textContent = spell.manaCost;
      spellCard.appendChild(costBadge);

      // Add name overlay
      const nameOverlay = document.createElement("div");
      nameOverlay.className = "spell-name-overlay";
      nameOverlay.textContent = spell.name;
      spellCard.appendChild(nameOverlay);

      // Add castable class if applicable
      if (!isCastable) {
        spellCard.classList.add("spell-card-disabled");
      }

      // Add click handler to cast spell
      spellCard.addEventListener("click", () => {
        if (isCastable) {
          this.startSpellCasting(spell);
        } else {
          this.showNotification("Not enough mana!");
        }
      });

      spellHand.appendChild(spellCard);
    });

    // Update vertical mana bar
    const manaBarFill = document.querySelector(".mana-bar-fill");
    const manaValue = document.querySelector(".mana-value");

    if (manaBarFill) {
      manaBarFill.style.height = `${(this.playerMana / 30) * 100}%`;
    }

    if (manaValue) {
      manaValue.textContent = this.playerMana;
    }
  }

  // Start the spell casting process
  startSpellCasting(spell) {
    if (this.spellTargetingMode) {
      this.exitTargetingMode();
      return;
    }

    // Check if we have enough mana
    if (spell.manaCost > this.playerMana) {
      this.showNotification("Not enough mana!");
      return;
    }

    console.log(`Starting to cast ${spell.name}`);

    // Enter targeting mode
    this.spellTargetingMode = true;
    this.selectedSpell = spell;
    this.spellTargets = [];

    // For now, just indicate we're in targeting mode
    this.game.board.element.classList.add("targeting-mode");

    // Create targeting overlay
    this.createTargetingOverlay(spell.name);
  }

  // Create targeting overlay
  createTargetingOverlay(spellName) {
    // Remove any existing overlay
    this.removeTargetingOverlay();

    // Add targeting instruction
    const instruction = document.createElement("div");
    instruction.className = "targeting-instruction";
    instruction.textContent = `Select target for ${spellName}`;
    document.body.appendChild(instruction);

    // Add overlay
    const overlay = document.createElement("div");
    overlay.className = "board-overlay";
    this.game.board.element.appendChild(overlay);

    // Highlight valid targets
    this.highlightValidTargets();
  }

  // Remove targeting overlay
  removeTargetingOverlay() {
    const instruction = document.querySelector(".targeting-instruction");
    if (instruction && instruction.parentNode) {
      instruction.parentNode.removeChild(instruction);
    }

    const overlay = document.querySelector(".board-overlay");
    if (overlay && overlay.parentNode) {
      overlay.parentNode.removeChild(overlay);
    }
  }

  // Highlight valid targets for the current spell
  highlightValidTargets() {
    if (!this.selectedSpell) return;

    // Get all squares
    const squares = document.querySelectorAll(".square");

    // For now, a simple implementation - all squares are valid targets
    // In a real implementation, you would check which targets are valid for the spell
    squares.forEach((square) => {
      square.classList.add("valid-target");
    });
  }

  // Handle target selection
  handleTargetSelection(square) {
    if (!this.spellTargetingMode || !this.selectedSpell) return;

    console.log(`Target selected: ${square}`);

    // Add target to the list
    this.spellTargets.push(square);

    // For now, just cast the spell after selecting one target
    // In a real implementation, you might need multiple targets for some spells
    this.castSpell();
  }

  // Cast the selected spell with the selected targets
  castSpell() {
    const spell = this.selectedSpell;

    // Deduct mana
    this.playerMana -= spell.manaCost;

    // Perform spell effect based on the spell ID
    this.performSpellEffect(spell, this.spellTargets);

    // Show a visual effect
    this.showSpellEffect(spell, this.spellTargets);

    // Clean up targeting mode
    this.exitTargetingMode();

    // Update the display
    this.updateSpellDisplay();
  }

  // Perform the actual spell effect
  performSpellEffect(spell, targets) {
    console.log(`Casting ${spell.name} with targets:`, targets);

    // Simple implementation of a few spells
    switch (spell.id) {
      case "astral_swap":
        // For astral swap, we need two targets
        if (targets.length >= 2) {
          console.log(`Would swap pieces at ${targets[0]} and ${targets[1]}`);
        }

        // Add visual indication
        this.showNotification(
          `Swapped pieces at ${targets[0]} and ${targets[1]}`
        );
        break;

      case "ember_crown":
        console.log(
          `Would transform pawn at ${targets[0]} to Queen temporarily`
        );
        // Add visual indication and effect
        this.addActiveEffect({
          name: "Ember Crown",
          description: `Pawn at ${targets[0]} is temporarily a Queen`,
          icon: "👑",
          remainingTurns: 3,
          onRemove: () =>
            console.log(`Pawn at ${targets[0]} would revert and be removed`),
        });
        this.showNotification(
          `Pawn at ${targets[0]} transformed to Queen for 3 turns`
        );
        break;

      default:
        console.log(`No implementation for ${spell.name} yet`);
        this.showNotification(`${spell.name} effect would happen here`);
    }
  }

  // Show a visual effect for the spell
  showSpellEffect(spell, targets) {
    // More elaborate effect based on the spell
    targets.forEach((target) => {
      const targetEl = document.querySelector(
        `.square[data-position="${target}"]`
      );
      if (targetEl) {
        const effect = document.createElement("div");
        effect.className = "spell-effect";
        effect.textContent = spell.icon;

        targetEl.appendChild(effect);

        // Remove after animation
        setTimeout(() => {
          if (effect.parentNode === targetEl) {
            targetEl.removeChild(effect);
          }
        }, 1500);
      }
    });
  }

  // Exit targeting mode
  exitTargetingMode() {
    this.spellTargetingMode = false;
    this.selectedSpell = null;
    this.spellTargets = [];

    // Remove targeting indicators
    this.game.board.element.classList.remove("targeting-mode");

    // Remove highlighting
    document.querySelectorAll(".square").forEach((square) => {
      square.classList.remove("valid-target");
    });

    // Remove targeting overlay
    this.removeTargetingOverlay();
  }

  // Generate mana (called every other turn)
  generateMana(turn) {
    // Only generate mana every other turn
    if (Math.floor(turn / 2) > this.lastTurnManaGenerated) {
      this.playerMana += 1;
      this.opponentMana += 1;
      this.lastTurnManaGenerated = Math.floor(turn / 2);

      // Show animation
      this.showManaRegenAnimation();

      // Update display
      this.updateSpellDisplay();
      console.log(
        "Mana generated. Player: " +
          this.playerMana +
          ", Opponent: " +
          this.opponentMana
      );
    }
  }

  // Process any active effects (called each turn)
  processActiveEffects() {
    // Remove expired effects
    this.activeEffects = this.activeEffects.filter((effect) => {
      effect.remainingTurns--;

      if (effect.remainingTurns <= 0) {
        // Effect has expired, trigger removal callback
        if (effect.onRemove) {
          effect.onRemove(this.game);
        }
        return false;
      }

      return true;
    });

    // Update the effects display
    this.updateEffectsDisplay();
  }

  // Clean up when game ends
  cleanup() {
    // Clear mana regen interval
    if (this.manaRegenInterval) {
      clearInterval(this.manaRegenInterval);
    }

    // Remove UI elements
    if (this.spellDashboard && this.spellDashboard.parentNode) {
      this.spellDashboard.parentNode.removeChild(this.spellDashboard);
    }

    if (this.effectsDisplay && this.effectsDisplay.parentNode) {
      this.effectsDisplay.parentNode.removeChild(this.effectsDisplay);
    }

    // Remove any targeting elements
    this.exitTargetingMode();
  }

  // Add an active effect
  addActiveEffect(effect) {
    this.activeEffects.push(effect);
    this.updateEffectsDisplay();
  }

  // Show notification message
  showNotification(message) {
    // Create notification if it doesn't exist
    if (!document.getElementById("spell-notification")) {
      const notification = document.createElement("div");
      notification.id = "spell-notification";
      notification.style.position = "fixed";
      notification.style.top = "20px";
      notification.style.left = "50%";
      notification.style.transform = "translateX(-50%)";
      notification.style.backgroundColor = "rgba(44, 22, 84, 0.9)";
      notification.style.color = "white";
      notification.style.padding = "10px 20px";
      notification.style.borderRadius = "5px";
      notification.style.zIndex = "1000";
      notification.style.fontFamily = '"MedievalSharp", cursive, serif';
      notification.style.boxShadow = "0 0 10px rgba(0, 0, 0, 0.5)";
      notification.style.border = "1px solid #ffa726";

      document.body.appendChild(notification);
    }

    const notification = document.getElementById("spell-notification");
    notification.textContent = message;
    notification.style.opacity = "1";

    // Hide after a delay
    setTimeout(() => {
      notification.style.opacity = "0";
    }, 3000);
  }
}
