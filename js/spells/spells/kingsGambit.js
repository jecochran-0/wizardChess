/**
 * King's Gambit Spell
 * Your King may move twice this turn (one square each, not into check).
 */

const spell = {
  id: "kings_gambit",
  name: "King's Gambit",
  manaCost: 2,
  description:
    "Your King may move twice this turn (one square each, not into check).",
  cardImage: "Chess_Spells/kings_gambit.png",

  targetType: "none", // No target needed initially
  targetPhase: "cast",

  cast: function (game) {
    // Implementation will go here when connected to game logic
    console.log("Casting King's Gambit");
    return {
      success: true,
      message: "King's Gambit active! Your King can move twice this turn.",
    };
  },

  animate: function (game) {
    return new Promise((resolve) => {
      // Animation logic will go here
      setTimeout(resolve, 1000);
    });
  },
};

export default spell;
