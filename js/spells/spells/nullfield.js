/**
 * Nullfield Spell
 * Creates a null field that prevents any player from casting spells for the next 2 turns.
 */

const spell = {
  id: "nullfield",
  name: "Nullfield",
  manaCost: 5,
  description:
    "Cancel the effect of any active spell, including summons, glyphs, or altered piece states.",
  cardImage: "Chess_Spells/nullfield.png",

  targetType: "none", // No targeting needed
  targetPhase: "cast",

  cast: function (game) {
    // Implementation will go here when connected to game logic
    console.log("Casting Nullfield");
    return {
      success: true,
      message:
        "Nullfield activated! All active spell effects have been cancelled.",
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
