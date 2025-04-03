/**
 * Game.js - Main game logic for Wizard Chess
 */
class WizardChess {
  constructor() {
    try {
      // Make sure Chess is defined before using it
      if (typeof Chess === "undefined") {
        throw new Error("Chess.js library not loaded");
      }

      // Force hide game over modal IMMEDIATELY
      const gameOverModal = document.getElementById("game-over-modal");
      if (gameOverModal) {
        gameOverModal.classList.add("hidden");
        gameOverModal.style.display = "none"; // Forcibly hide with inline styles
      }

      // Initialize the chess.js instance for game logic
      this.chess = new Chess();

      // Create the board and engine only after chess is initialized
      this.board = new ChessBoard(document.getElementById("board"), this);
      this.engine = new ChessEngine(this);

      // Set player color (white by default)
      this.playerColor = "w";

      // Initialize the game
      this.init();

      console.log("Game initialized successfully");

      // FORCE a full render after initialization
      setTimeout(() => {
        this.board.render();
        console.log("Forced board render after initialization");
      }, 100);
    } catch (error) {
      console.error("Error initializing game:", error);
      this.displayError(
        "Failed to initialize the game. Please check if Chess.js is properly loaded."
      );
    }
  }

  // Display error message to user
  displayError(message) {
    const gameContainer = document.querySelector(".game-container");
    if (gameContainer) {
      const errorDiv = document.createElement("div");
      errorDiv.className = "error-message";
      errorDiv.textContent = message;
      errorDiv.style.color = "red";
      errorDiv.style.padding = "20px";
      errorDiv.style.textAlign = "center";
      gameContainer.prepend(errorDiv);
    } else {
      alert(message);
    }
  }

  // Initialize the game
  init() {
    this.board.init();
    this.setupEventListeners();

    // If player is black, make the first move for the bot
    if (this.playerColor === "b") {
      setTimeout(() => this.makeBotMove(), 500);
    }
  }

  // Set up event listeners
  setupEventListeners() {
    // New game button
    const newGameBtn = document.getElementById("new-game");
    if (newGameBtn) {
      // Clear existing event listeners by cloning the button
      const newGameBtnClone = newGameBtn.cloneNode(true);
      newGameBtn.parentNode.replaceChild(newGameBtnClone, newGameBtn);

      // Add fresh event listener
      newGameBtnClone.addEventListener("click", () => {
        console.log("New game button clicked - starting new game");
        this.newGame();
      });
      console.log("New game button event listener set up (fresh)");
    } else {
      console.warn("New game button not found");
    }

    // New game button in the game over modal
    const newGameModalBtn = document.getElementById("new-game-modal");
    if (newGameModalBtn) {
      // Clear existing event listeners by cloning the button
      const newGameModalBtnClone = newGameModalBtn.cloneNode(true);
      newGameModalBtn.parentNode.replaceChild(
        newGameModalBtnClone,
        newGameModalBtn
      );

      // Add fresh event listener
      newGameModalBtnClone.addEventListener("click", () => {
        console.log("Modal new game button clicked - starting new game");
        const modal = document.getElementById("game-over-modal");
        if (modal) {
          modal.classList.add("hidden");
        }
        this.newGame();
      });
      console.log("Modal new game button event listener set up (fresh)");
    } else {
      console.warn("Modal new game button not found");
    }

    // Undo move button
    const undoBtn = document.getElementById("undo-move");
    if (undoBtn) {
      undoBtn.addEventListener("click", () => {
        this.undoPlayerMove();
      });
    }

    // Hint button
    const hintBtn = document.getElementById("hint");
    if (hintBtn) {
      hintBtn.addEventListener("click", () => {
        this.showHint();
      });
    }

    // Difficulty selector
    const difficultySelect = document.getElementById("difficulty");
    if (difficultySelect) {
      difficultySelect.addEventListener("change", (e) => {
        this.engine.setDifficulty(e.target.value);
      });

      // Set initial difficulty
      this.engine.setDifficulty(difficultySelect.value);
    }
  }

  // Start a new game
  newGame() {
    this.resetGame();

    // If player is black, make the first move for the bot
    if (this.playerColor === "b") {
      setTimeout(() => this.makeBotMove(), 500);
    }
  }

  // Make a move
  move(moveObj) {
    const result = this.chess.move(moveObj);
    return result;
  }

  // Get a piece at a specific position
  getPiece(position) {
    return this.chess.get(position);
  }

  // Get current turn color
  turn() {
    return this.chess.turn();
  }

  // Check if it's the player's turn
  isPlayerTurn() {
    return this.chess.turn() === this.playerColor;
  }

  // Get legal moves for a piece
  getLegalMoves(position) {
    if (position) {
      // Get moves for a specific piece
      return this.chess.moves({ square: position, verbose: true });
    } else {
      // Get all legal moves
      return this.chess.moves({ verbose: true });
    }
  }

  // Make a move for the AI bot
  makeBotMove() {
    if (this.isGameOver()) return;

    // Get the best move from the engine
    const move = this.engine.getBestMove();

    if (move) {
      // Highlight the move
      this.highlightBotMove(move);

      // Make the move on the chess.js board
      this.move({
        from: move.from,
        to: move.to,
        promotion: move.promotion,
      });

      // Update the board display
      setTimeout(() => {
        this.board.render();
        this.board.updateCapturedPieces();
        this.board.updateMoveHistory();

        // Check game state
        if (this.isGameOver()) {
          this.board.showGameOverMessage();
        }
      }, 500);
    }
  }

  // Highlight the bot's move
  highlightBotMove(move) {
    // First, select the source square
    const [fromRow, fromCol] = this.board.positionToRowCol(move.from);
    const fromSquare = this.board.getSquareElement(fromRow, fromCol);
    fromSquare.classList.add("selected");

    // Then, highlight the destination square
    const [toRow, toCol] = this.board.positionToRowCol(move.to);
    const toSquare = this.board.getSquareElement(toRow, toCol);
    toSquare.classList.add("possible-move");

    // If it's a capture, use the capture highlight
    if (this.getPiece(move.to)) {
      toSquare.classList.remove("possible-move");
      toSquare.classList.add("possible-capture");
    }
  }

  // Undo the player's last move
  undoPlayerMove() {
    if (this.isGameOver()) return;

    // Undo the bot's move and the player's move
    this.chess.undo(); // Undo bot's move
    this.chess.undo(); // Undo player's move

    // Update the board
    this.board.render();
    this.board.updateCapturedPieces();
    this.board.updateMoveHistory();
  }

  // Show a hint for the player
  showHint() {
    if (!this.isPlayerTurn() || this.isGameOver()) return;

    // Get a hint move from the engine (set depth to 1 for quick calculation)
    const originalDepth = this.engine.depth;
    this.engine.depth = 1;
    const hintMove = this.engine.getBestMove();
    this.engine.depth = originalDepth;

    if (hintMove) {
      // Select the piece
      this.board.selectSquare(hintMove.from);
    }
  }

  // Check if the game is over
  isGameOver() {
    try {
      // Make sure we have a valid chess instance
      if (!this.chess || typeof this.chess.game_over !== "function") {
        console.error("Invalid chess instance when checking game over");
        return false;
      }

      // Force return false for initial game state
      const fen = this.chess.fen();
      if (fen === "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1") {
        console.log("Initial game state detected, not game over");
        return false;
      }

      const result = this.chess.game_over();
      console.log("Game over check result:", result);
      return result;
    } catch (error) {
      console.error("Error checking game over:", error);
      return false;
    }
  }

  // Check if the king is in check
  inCheck() {
    return this.chess.in_check();
  }

  // Check if the king is in checkmate
  inCheckmate() {
    return this.chess.in_checkmate();
  }

  // Check if the game is a draw
  inDraw() {
    return this.chess.in_draw();
  }

  // Check if the game is a stalemate
  inStalemate() {
    return this.chess.in_stalemate();
  }

  // Check if there's insufficient material
  insufficientMaterial() {
    return this.chess.insufficient_material();
  }

  // Check if position was repeated three times
  inThreefoldRepetition() {
    return this.chess.in_threefold_repetition();
  }

  // Get the current position
  getPosition() {
    const position = {};
    const board = this.chess.board();

    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = board[row][col];
        if (piece) {
          const file = String.fromCharCode("a".charCodeAt(0) + col);
          const rank = 8 - row;
          position[`${file}${rank}`] = piece;
        }
      }
    }

    return position;
  }

  // Make a move (used in Board.js)
  makeMove(move) {
    return this.move(move);
  }

  // Undo a move (used in Engine.js)
  undoMove() {
    return this.chess.undo();
  }

  // Get move history
  history(options) {
    return this.chess.history(options);
  }

  // Add a complete reset method
  resetGame() {
    console.log("COMPLETE GAME RESET");
    try {
      // Create new chess instance
      this.chess = new Chess();

      // Force hide game over modal with multiple approaches
      const gameOverModal = document.getElementById("game-over-modal");
      if (gameOverModal) {
        gameOverModal.classList.add("hidden");
        gameOverModal.style.display = "none"; // Force hide with inline style
      }

      // Reset board
      this.board.clearSelection();
      this.board.createBoard(); // Recreate the board elements
      this.board.setupEventListeners(); // Reinitialize event listeners
      this.board.render();
      this.board.updateCapturedPieces();
      this.board.updateMoveHistory();

      // Run the conflict check to make sure we're in a clean state
      this.checkForGameStateConflicts();

      console.log("Game fully reset, current FEN:", this.chess.fen());
    } catch (error) {
      console.error("Reset game error:", error);
    }
  }

  // Add this function to the WizardChess class
  checkForGameStateConflicts() {
    console.log("Checking for game state conflicts");

    // Get the FEN string to check the game state
    const fen = this.chess.fen();
    const initialFen =
      "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

    // If we're in the initial position, the game can't be over
    if (fen === initialFen) {
      console.log("Game is in initial position - cannot be game over");

      // Force hide any game over modal
      const gameOverModal = document.getElementById("game-over-modal");
      if (gameOverModal && !gameOverModal.classList.contains("hidden")) {
        console.log("Found visible game over modal - hiding it");
        gameOverModal.classList.add("hidden");
      }

      // Also check if we're incorrectly marking the game as over
      if (this.chess.game_over()) {
        console.warn(
          "CONFLICT: Chess.js thinks game is over but we're in initial position"
        );
        // In this case we might need to reset the chess instance
        this.chess = new Chess();
      }
    }
  }
}

// Initialize the game when the DOM is loaded and Chess.js is available
document.addEventListener("DOMContentLoaded", () => {
  // Function to check if Chess.js is loaded
  const checkChessJsLoaded = () => {
    if (typeof Chess !== "undefined") {
      console.log("Chess.js loaded successfully");
      // Create assets folders if they don't exist already
      createAssetsStructure();

      // Initialize the game
      window.game = new WizardChess();
    } else {
      console.warn("Chess.js not loaded yet, retrying in 100ms");
      setTimeout(checkChessJsLoaded, 100);
    }
  };

  // Start checking if Chess.js is loaded
  checkChessJsLoaded();
});

// Create the assets folder structure
function createAssetsStructure() {
  // This is just for information - in a real app, you would need
  // to upload the actual image files to these folders
  console.log(`
    Images needed for the game:
    
    /assets/images/backgrounds/wizard-bg.jpg - Main background
    /assets/images/backgrounds/board.jpg - Chess board texture
    
    /assets/images/pieces/w_pawn.png - White pawn
    /assets/images/pieces/w_knight.png - White knight
    /assets/images/pieces/w_bishop.png - White bishop
    /assets/images/pieces/w_rook.png - White rook
    /assets/images/pieces/w_queen.png - White queen
    /assets/images/pieces/w_king.png - White king
    
    /assets/images/pieces/b_pawn.png - Black pawn
    /assets/images/pieces/b_knight.png - Black knight
    /assets/images/pieces/b_bishop.png - Black bishop
    /assets/images/pieces/b_rook.png - Black rook
    /assets/images/pieces/b_queen.png - Black queen
    /assets/images/pieces/b_king.png - Black king
  `);
}
