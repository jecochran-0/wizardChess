/**
 * Spirit Link Spell
 * Link one major piece to equal value worth of pieces. If the linked piece is captured,
 * the linked pieces die instead, and the original teleports to one of their squares.
 */

const spell = {
  id: "spirit_link",
  name: "Spirit Link",
  manaCost: 5,
  description:
    "Link one major piece to equal value worth of pieces. If the linked piece is captured within 3 turns, the linked pieces die instead.",
  cardImage: "Chess_Spells/spirit_link.png",

  targetType: "single",
  targetPhase: "select",

  targetingState: {
    mainPiece: null,
    linkedPieces: [],
  },

  cast: function (game, targets) {
    // Implementation will go here when connected to game logic
    console.log("Casting Spirit Link");
    return {
      success: true,
      message:
        "Spirit Link created! Main piece will be saved if captured within 3 turns.",
    };
  },

  onTargetingStart: function (game) {
    this.targetingState = { mainPiece: null, linkedPieces: [] };
    return this.getValidTargets(game);
  },

  onTargetSelection: function (game, row, col) {
    // Targeting logic will go here
    console.log(`Selected ${row}, ${col} for Spirit Link`);
    return { continueTargeting: false };
  },

  getValidTargets: function (game) {
    // Will return an array of valid targets (major pieces first, then valid pieces to link)
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
