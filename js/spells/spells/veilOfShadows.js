/**
 * Veil of Shadows Spell
 * Your half of the board becomes hidden from your opponent for 3 turns. They see only empty tiles.
 */

const spell = {
  id: "veil_of_shadows",
  name: "Veil of Shadows",
  manaCost: 4,
  description:
    "Your half of the board becomes hidden from your opponent for 3 turns. They see only empty tiles.",
  cardImage: "Chess_Spells/veil_of_shadows.png",

  targetType: "none", // No targeting needed
  targetPhase: "cast",

  cast: function (game) {
    // Implementation will go here when connected to game logic
    console.log("Casting Veil of Shadows");
    return {
      success: true,
      message:
        "Veil of Shadows cast! Your half of the board is hidden from your opponent.",
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
