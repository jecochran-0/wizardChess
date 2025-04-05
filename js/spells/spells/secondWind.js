/**
 * Second Wind Spell
 * Move 2 of your pieces this turn. Neither may capture or check the King.
 */

const spell = {
  id: "second_wind",
  name: "Second Wind",
  manaCost: 8,
  description:
    "Move 2 of your pieces this turn. Neither may capture or check the King.",
  cardImage: "Chess_Spells/second_wind.png",

  targetType: "none", // No targeting needed initially
  targetPhase: "cast",

  cast: function (game) {
    // Implementation will go here when connected to game logic
    console.log("Casting Second Wind");
    return {
      success: true,
      message:
        "Second Wind active! You can move 2 additional pieces this turn (no captures).",
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
