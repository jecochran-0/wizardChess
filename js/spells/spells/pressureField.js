/**
 * Pressure Field Spell
 * For 2 turns, enemy pieces cannot end their move on any square adjacent to your Rooks.
 */

const spell = {
  id: "pressure_field",
  name: "Pressure Field",
  manaCost: 3,
  description:
    "For 2 turns, enemy pieces cannot end their move on any square adjacent to your Rooks.",
  cardImage: "Chess_Spells/pressure_field.png",

  targetType: "none", // No targeting needed
  targetPhase: "cast",

  cast: function (game) {
    // Implementation will go here when connected to game logic
    console.log("Casting Pressure Field");
    return {
      success: true,
      message: "Pressure Fields created around your Rooks!",
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
