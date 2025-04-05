/**
 * Ember Crown Spell
 * Select a pawn. It becomes a Queen for 3 turns, then dies permanently.
 */

const spell = {
  id: "ember_crown",
  name: "Ember Crown",
  manaCost: 6,
  description:
    "Select a pawn. It becomes a Queen for 3 turns, then dies permanently.",
  cardImage: "Chess_Spells/ember_crown.png",

  targetType: "single",
  targetPhase: "select",

  cast: function (game, targets) {
    // Implementation will go here when connected to game logic
    console.log("Casting Ember Crown");
    return {
      success: true,
      message: "Pawn crowned with fire! It becomes a Queen for 3 turns.",
    };
  },

  onTargetingStart: function (game) {
    return this.getValidTargets(game);
  },

  onTargetSelection: function (game, row, col) {
    // Targeting logic will go here
    console.log(`Selected ${row}, ${col} for Ember Crown`);
    return { continueTargeting: false };
  },

  getValidTargets: function (game) {
    // Will return an array of valid targets (pawns)
    return [];
  },

  animate: function (game, targets) {
    return new Promise((resolve) => {
      // Animation logic will go here
      setTimeout(resolve, 1000);
    });
  },
};

export default spell;
