/**
 * Spellbook.js - Contains spell definitions
 */
const SpellLibrary = [
  {
    id: "astral_swap",
    name: "Astral Swap",
    description: "Swap the positions of any two of your own pieces.",
    manaCost: 4,
    icon: "🔁",
    cardImage: "Chess_Spells/astral_swap.png",
  },
  {
    id: "phantom_step",
    name: "Phantom Step",
    description:
      "Move one of your pieces as normal, but it may pass through enemy pieces (no capture).",
    manaCost: 2,
    icon: "🌫️",
    cardImage: "Chess_Spells/phantom_step.png",
  },
  {
    id: "arcane_anchor",
    name: "Arcane Anchor",
    description:
      "Make one piece immune to capture for 1 turn, but it may not move during that turn.",
    manaCost: 3,
    icon: "🛡️",
    cardImage: "Chess_Spells/arcane_anchor.png",
  },
  {
    id: "kings_gambit",
    name: "King's Gambit",
    description:
      "Your King may move twice this turn (one square each, not into check).",
    manaCost: 2,
    icon: "👑",
    cardImage: "Chess_Spells/kings_gambit.png",
  },
  {
    id: "ember_crown",
    name: "Ember Crown",
    description:
      "Select a pawn. It becomes a Queen for 3 turns, then dies permanently.",
    manaCost: 6,
    icon: "👑",
    cardImage: "Chess_Spells/ember_crown.png",
  },
  {
    id: "mistform_knight",
    name: "Mistform Knight",
    description:
      "Move a Knight. Then summon a Mist Knight clone on the same square for 1 turn.",
    manaCost: 4,
    icon: "♞",
    cardImage: "Chess_Spells/mistform_knight.png",
  },
  {
    id: "chrono_recall",
    name: "Chrono Recall",
    description:
      "Rewind one of your own pieces to the square it occupied exactly 2 turns ago.",
    manaCost: 3,
    icon: "⏳",
    cardImage: "Chess_Spells/chrono_recall.png",
  },
  {
    id: "cursed_glyph",
    name: "Cursed Glyph",
    description:
      "Place a glyph on any empty square. Any piece that lands on it becomes a pawn 1 turn later.",
    manaCost: 5,
    icon: "🕳️",
    cardImage: "Chess_Spells/cursed_glyph.png",
  },
  {
    id: "dark_conversion",
    name: "Dark Conversion",
    description:
      "Sacrifice 3 pawns to summon a Knight or Bishop in any of your back two ranks.",
    manaCost: 5,
    icon: "♟️",
    cardImage: "Chess_Spells/dark_conversion.png",
  },
  {
    id: "second_wind",
    name: "Second Wind",
    description:
      "Move 2 of your pieces this turn. Neither may capture or check the King.",
    manaCost: 8,
    icon: "💨",
    cardImage: "Chess_Spells/second_wind.png",
  },
  {
    id: "spirit_link",
    name: "Spirit Link",
    description:
      "Link one major piece to equal value worth of pieces. If the linked piece is captured within 3 turns, the linked pieces die instead.",
    manaCost: 5,
    icon: "🔗",
    cardImage: "Chess_Spells/Spirit_Link.png",
  },
  {
    id: "pressure_field",
    name: "Pressure Field",
    description:
      "For 2 turns, enemy pieces cannot end their move on any square adjacent to your Rooks.",
    manaCost: 3,
    icon: "🔲",
    cardImage: "Chess_Spells/pressure_field.png",
  },
  {
    id: "nullfield",
    name: "Nullfield",
    description:
      "Cancel the effect of any active spell, including summons, glyphs, or altered piece states.",
    manaCost: 5,
    icon: "🚫",
    cardImage: "Chess_Spells/nullfield.png",
  },
  {
    id: "veil_of_shadows",
    name: "Veil of Shadows",
    description:
      "Your half of the board becomes hidden from your opponent for 3 turns. They see only empty tiles.",
    manaCost: 4,
    icon: "🌫️",
    cardImage: "Chess_Spells/veil_of_shadows.png",
  },
  {
    id: "raise_bonewalker",
    name: "Raise the Bonewalker",
    description:
      "Summon a Skeleton Pawn onto your back rank. If not captured within 6 turns, it automatically promotes to a Rook.",
    manaCost: 6,
    icon: "☠️",
    cardImage: "Chess_Spells/raise_the_bonewalker.png",
  },
];
