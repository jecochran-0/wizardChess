/**
 * Engine.js - Chess engine for the AI opponent
 */
class ChessEngine {
  constructor(game) {
    this.game = game;
    this.depth = 2; // Default depth
  }

  // Set the difficulty level (1-4)
  setDifficulty(level) {
    switch (parseInt(level)) {
      case 1: // Apprentice
        this.depth = 1;
        break;
      case 2: // Adept
        this.depth = 2;
        break;
      case 3: // Master
        this.depth = 3;
        break;
      case 4: // Archmage
        this.depth = 4;
        break;
      default:
        this.depth = 2;
    }
  }

  // Get the best move for the current position
  getBestMove() {
    const startTime = Date.now();
    const bestMove = this.minimaxRoot(this.depth, true);
    const endTime = Date.now();
    console.log(`Engine calculated move in ${endTime - startTime}ms`);
    return bestMove;
  }

  // Minimax algorithm with alpha-beta pruning - root function
  minimaxRoot(depth, isMaximizing) {
    const moves = this.game.getLegalMoves();
    let bestMove = null;
    let bestValue = isMaximizing ? -Infinity : Infinity;
    const color = this.game.turn();

    for (const move of moves) {
      this.game.makeMove(move);
      const value = this.minimax(depth - 1, -Infinity, Infinity, !isMaximizing);
      this.game.undoMove();

      if (isMaximizing && value > bestValue) {
        bestValue = value;
        bestMove = move;
      } else if (!isMaximizing && value < bestValue) {
        bestValue = value;
        bestMove = move;
      }
    }

    return bestMove;
  }

  // Minimax algorithm with alpha-beta pruning
  minimax(depth, alpha, beta, isMaximizing) {
    if (depth === 0) {
      return this.evaluateBoard();
    }

    const moves = this.game.getLegalMoves();

    // Check for checkmate or stalemate
    if (moves.length === 0) {
      if (this.game.inCheck()) {
        return isMaximizing ? -9999 : 9999; // Checkmate
      }
      return 0; // Stalemate
    }

    if (isMaximizing) {
      let bestValue = -Infinity;
      for (const move of moves) {
        this.game.makeMove(move);
        bestValue = Math.max(
          bestValue,
          this.minimax(depth - 1, alpha, beta, false)
        );
        this.game.undoMove();
        alpha = Math.max(alpha, bestValue);
        if (beta <= alpha) {
          break; // Beta cutoff
        }
      }
      return bestValue;
    } else {
      let bestValue = Infinity;
      for (const move of moves) {
        this.game.makeMove(move);
        bestValue = Math.min(
          bestValue,
          this.minimax(depth - 1, alpha, beta, true)
        );
        this.game.undoMove();
        beta = Math.min(beta, bestValue);
        if (beta <= alpha) {
          break; // Alpha cutoff
        }
      }
      return bestValue;
    }
  }

  // Evaluate the current board position
  evaluateBoard() {
    let totalEvaluation = 0;

    // Get all pieces on the board
    const position = this.game.getPosition();

    for (const square in position) {
      const piece = position[square];
      if (!piece) continue;

      // Base piece values
      totalEvaluation += this.getPieceValue(piece, square);
    }

    return totalEvaluation;
  }

  // Get the value of a piece at a specific position
  getPieceValue(piece, square) {
    const x = square.charCodeAt(0) - "a".charCodeAt(0);
    const y = 8 - parseInt(square.charAt(1));

    // Piece values
    const pieceValues = {
      p: 10,
      n: 30,
      b: 30,
      r: 50,
      q: 90,
      k: 900,
    };

    // Position bonuses (simplified)
    const pawnBonus = [
      [0, 0, 0, 0, 0, 0, 0, 0],
      [50, 50, 50, 50, 50, 50, 50, 50],
      [10, 10, 20, 30, 30, 20, 10, 10],
      [5, 5, 10, 25, 25, 10, 5, 5],
      [0, 0, 0, 20, 20, 0, 0, 0],
      [5, -5, -10, 0, 0, -10, -5, 5],
      [5, 10, 10, -20, -20, 10, 10, 5],
      [0, 0, 0, 0, 0, 0, 0, 0],
    ];

    const knightBonus = [
      [-50, -40, -30, -30, -30, -30, -40, -50],
      [-40, -20, 0, 0, 0, 0, -20, -40],
      [-30, 0, 10, 15, 15, 10, 0, -30],
      [-30, 5, 15, 20, 20, 15, 5, -30],
      [-30, 0, 15, 20, 20, 15, 0, -30],
      [-30, 5, 10, 15, 15, 10, 5, -30],
      [-40, -20, 0, 5, 5, 0, -20, -40],
      [-50, -40, -30, -30, -30, -30, -40, -50],
    ];

    const bishopBonus = [
      [-20, -10, -10, -10, -10, -10, -10, -20],
      [-10, 0, 0, 0, 0, 0, 0, -10],
      [-10, 0, 10, 10, 10, 10, 0, -10],
      [-10, 5, 5, 10, 10, 5, 5, -10],
      [-10, 0, 5, 10, 10, 5, 0, -10],
      [-10, 5, 5, 5, 5, 5, 5, -10],
      [-10, 0, 5, 0, 0, 5, 0, -10],
      [-20, -10, -10, -10, -10, -10, -10, -20],
    ];

    const rookBonus = [
      [0, 0, 0, 0, 0, 0, 0, 0],
      [5, 10, 10, 10, 10, 10, 10, 5],
      [-5, 0, 0, 0, 0, 0, 0, -5],
      [-5, 0, 0, 0, 0, 0, 0, -5],
      [-5, 0, 0, 0, 0, 0, 0, -5],
      [-5, 0, 0, 0, 0, 0, 0, -5],
      [-5, 0, 0, 0, 0, 0, 0, -5],
      [0, 0, 0, 5, 5, 0, 0, 0],
    ];

    const queenBonus = [
      [-20, -10, -10, -5, -5, -10, -10, -20],
      [-10, 0, 0, 0, 0, 0, 0, -10],
      [-10, 0, 5, 5, 5, 5, 0, -10],
      [-5, 0, 5, 5, 5, 5, 0, -5],
      [0, 0, 5, 5, 5, 5, 0, -5],
      [-10, 5, 5, 5, 5, 5, 0, -10],
      [-10, 0, 5, 0, 0, 0, 0, -10],
      [-20, -10, -10, -5, -5, -10, -10, -20],
    ];

    const kingMiddleBonus = [
      [-30, -40, -40, -50, -50, -40, -40, -30],
      [-30, -40, -40, -50, -50, -40, -40, -30],
      [-30, -40, -40, -50, -50, -40, -40, -30],
      [-30, -40, -40, -50, -50, -40, -40, -30],
      [-20, -30, -30, -40, -40, -30, -30, -20],
      [-10, -20, -20, -20, -20, -20, -20, -10],
      [20, 20, 0, 0, 0, 0, 20, 20],
      [20, 30, 10, 0, 0, 10, 30, 20],
    ];

    const kingEndBonus = [
      [-50, -40, -30, -20, -20, -30, -40, -50],
      [-30, -20, -10, 0, 0, -10, -20, -30],
      [-30, -10, 20, 30, 30, 20, -10, -30],
      [-30, -10, 30, 40, 40, 30, -10, -30],
      [-30, -10, 30, 40, 40, 30, -10, -30],
      [-30, -10, 20, 30, 30, 20, -10, -30],
      [-30, -30, 0, 0, 0, 0, -30, -30],
      [-50, -30, -30, -30, -30, -30, -30, -50],
    ];

    // Calculate base piece value
    let value = 0;
    if (piece.color === "w") {
      value = pieceValues[piece.type];
    } else {
      value = -pieceValues[piece.type];
    }

    // Add position bonus
    let bonus = 0;

    switch (piece.type) {
      case "p":
        bonus = pawnBonus[y][x];
        break;
      case "n":
        bonus = knightBonus[y][x];
        break;
      case "b":
        bonus = bishopBonus[y][x];
        break;
      case "r":
        bonus = rookBonus[y][x];
        break;
      case "q":
        bonus = queenBonus[y][x];
        break;
      case "k":
        // Use different tables for middle and endgame
        const isEndgame = this.isEndgame();
        bonus = isEndgame ? kingEndBonus[y][x] : kingMiddleBonus[y][x];
        break;
    }

    if (piece.color === "w") {
      value += bonus;
    } else {
      value -= bonus;
    }

    return value;
  }

  // Check if the game is in endgame
  isEndgame() {
    // Count material to determine if we're in an endgame
    const position = this.game.getPosition();
    let material = 0;

    for (const square in position) {
      const piece = position[square];
      if (!piece || piece.type === "k" || piece.type === "p") continue;

      switch (piece.type) {
        case "q":
          material += 9;
          break;
        case "r":
          material += 5;
          break;
        case "b":
        case "n":
          material += 3;
          break;
      }
    }

    // If we have less than 22 points of material, consider it an endgame
    return material < 22;
  }

  // Add randomness to make lower difficulty levels play less optimally
  applyDifficultyRandomness(moves) {
    if (this.depth >= 3) {
      // At higher difficulties, always choose the best move
      return moves[0];
    }

    // For lower difficulties, sometimes choose a suboptimal move
    const randomFactor = 5 - this.depth; // 4 for apprentice, 3 for adept
    const randomValue = Math.random() * 10;

    if (randomValue < randomFactor && moves.length > 1) {
      // Choose a random move from the top N moves
      const randomIndex = Math.floor(Math.random() * Math.min(3, moves.length));
      return moves[randomIndex];
    }

    // Otherwise choose the best move
    return moves[0];
  }
}
