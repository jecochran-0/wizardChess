/**
 * Spell Registry - Central registry for all spells in the game
 * Loads and manages individual spell modules
 */
class SpellRegistry {
  constructor() {
    this.spells = {};
    this.initialized = false;
  }

  /**
   * Initialize the spell registry by loading all spells
   */
  async initialize() {
    if (this.initialized) return;

    try {
      // Load all spells
      await this.loadSpells();
      this.initialized = true;
      console.log(
        "Spell Registry initialized with",
        Object.keys(this.spells).length,
        "spells"
      );
    } catch (error) {
      console.error("Failed to initialize Spell Registry:", error);
    }
  }

  /**
   * Load all spell modules
   */
  async loadSpells() {
    // This is where we'll register all spells
    this.registerSpell(await import("./spells/astralSwap.js"));
    this.registerSpell(await import("./spells/phantomStep.js"));
    this.registerSpell(await import("./spells/emberCrown.js"));
    this.registerSpell(await import("./spells/arcaneAnchor.js"));
    this.registerSpell(await import("./spells/mistformKnight.js"));
    this.registerSpell(await import("./spells/chronoRecall.js"));
    this.registerSpell(await import("./spells/cursedGlyph.js"));
    this.registerSpell(await import("./spells/kingsGambit.js"));
    this.registerSpell(await import("./spells/darkConversion.js"));
    this.registerSpell(await import("./spells/spiritLink.js"));
    this.registerSpell(await import("./spells/secondWind.js"));
    this.registerSpell(await import("./spells/pressureField.js"));
    this.registerSpell(await import("./spells/nullfield.js"));
    this.registerSpell(await import("./spells/veilOfShadows.js"));
    this.registerSpell(await import("./spells/raiseTheBonewalker.js"));
  }

  /**
   * Register a spell in the registry
   * @param {Object} module - The imported spell module
   */
  registerSpell(module) {
    const spell = module.default;
    if (!spell || !spell.id) {
      console.error("Invalid spell module:", module);
      return;
    }

    this.spells[spell.id] = spell;
  }

  /**
   * Get a spell by ID
   * @param {string} id - The spell's unique identifier
   * @returns {Object} The spell object
   */
  getSpell(id) {
    return this.spells[id];
  }

  /**
   * Get all spells in the registry
   * @returns {Object[]} Array of all spell objects
   */
  getAllSpells() {
    return Object.values(this.spells);
  }
}

// Create a singleton instance
const spellRegistry = new SpellRegistry();
export default spellRegistry;
