/**
 * Board.js - Handles the chessboard rendering and interaction
 */
class ChessBoard {
  constructor(containerElement, game) {
    this.containerElement = containerElement;
    this.game = game;
    this.selectedSquare = null;
    this.possibleMoves = [];
    this.flipped = false;
    this.pieceImages = {
      wP: "w_pawn.png",
      wR: "w_rook.png",
      wN: "w_knight.png",
      wB: "w_bishop.png",
      wQ: "w_queen.png",
      wK: "w_king.png",
      bP: "b_pawn.png",
      bR: "b_rook.png",
      bN: "b_knight.png",
      bB: "b_bishop.png",
      bQ: "b_queen.png",
      bK: "b_king.png",
    };
    this.capturedPieces = { w: [], b: [] };
  }

  // Initialize the board
  init() {
    try {
      console.log("Initializing board");
      this.createBoard();
      this.setupEventListeners();

      // Make sure promotion selection is hidden
      const promotionSelection = document.getElementById("promotion-selection");
      if (promotionSelection) {
        promotionSelection.classList.add("hidden");
      }

      // Hide any UI elements that might be in the board area
      const gameOverModal = document.getElementById("game-over-modal");
      if (gameOverModal) {
        gameOverModal.classList.add("hidden");
      }

      this.render();
      console.log("Board initialized successfully");

      // Add MutationObserver to remove any highlights that might be added
      this.setupHighlightBlocker();
    } catch (error) {
      console.error("Error initializing board:", error);
    }
  }

  // Create the chessboard squares
  createBoard() {
    this.containerElement.innerHTML = "";

    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const square = document.createElement("div");
        square.className = `square ${
          (row + col) % 2 === 0 ? "square-light" : "square-dark"
        }`;
        square.dataset.row = this.flipped ? 7 - row : row;
        square.dataset.col = this.flipped ? 7 - col : col;
        this.containerElement.appendChild(square);
      }
    }
  }

  // Setup event listeners for the board
  setupEventListeners() {
    console.log("Setting up board event listeners");

    // Remove any existing listeners by recreating
    this.containerElement.removeEventListener("click", this._handleBoardClick);

    // Create a bound handler function
    this._handleBoardClick = (e) => {
      const square = e.target.closest(".square");
      if (!square) return;

      const row = parseInt(square.dataset.row);
      const col = parseInt(square.dataset.col);
      console.log(`Square clicked: row=${row}, col=${col}`);
      this.handleSquareClick(row, col);
    };

    // Add the listener
    this.containerElement.addEventListener("click", this._handleBoardClick);
    console.log("Board click listeners set up");

    // Promotion piece selection
    document.querySelectorAll(".promotion-piece").forEach((element) => {
      element.addEventListener("click", (e) => {
        const piece = e.target.dataset.piece;
        if (this.pendingPromotion && piece) {
          this.completePromotion(piece);
        }
      });
    });
  }

  // Handle click on a square
  handleSquareClick(row, col) {
    console.log(`Processing click on row=${row}, col=${col}`);
    const position = this.rowColToPosition(row, col);
    console.log(`Position: ${position}`);
    const piece = this.game.getPiece(position);
    console.log(`Piece at position: ${piece ? piece.type : "none"}`);

    // If a piece is already selected
    if (this.selectedSquare) {
      const move = this.possibleMoves.find(
        (m) => m.to === position && m.from === this.selectedSquare
      );

      if (move) {
        // Check if it's a pawn promotion
        if (move.flags.includes("p")) {
          this.showPromotionDialog(move);
        } else {
          this.makeMove(move);
        }
      } else if (piece && piece.color === this.game.turn()) {
        // Select a different piece of the same color
        this.selectSquare(position);
      } else {
        // Deselect
        this.clearSelection();
      }
    } else if (piece && piece.color === this.game.turn()) {
      // Select the piece
      console.log(
        `Selecting piece: ${piece.color}${piece.type} at ${position}`
      );
      this.selectSquare(position);
    }
  }

  // Select a square and show possible moves
  selectSquare(position) {
    this.clearSelection();
    this.selectedSquare = position;
    this.possibleMoves = this.game.getLegalMoves(position);
    this.renderSelection();
  }

  // Clear the current selection
  clearSelection() {
    this.selectedSquare = null;
    this.possibleMoves = [];
    document.querySelectorAll(".square").forEach((square) => {
      square.classList.remove("selected", "possible-move", "possible-capture");
    });
  }

  // Render the current selection and possible moves
  renderSelection() {
    // Do nothing - don't display any move indicators
    return;
  }

  // Make a move on the board
  makeMove(move) {
    // Reset all state
    this.selectedSquare = null;
    this.possibleMoves = [];
    this.clearAllHighlights(); // New method to clear everything

    try {
      const moveResult = this.game.move({
        from: move.from,
        to: move.to,
        promotion: move.promotion,
      });

      if (!moveResult) return false;

      // Update board without ANY highlight effects
      this.render();
      this.updateCapturedPieces();
      this.updateMoveHistory();

      // Remove any highlights that might have been added
      this.clearAllHighlights();

      // Game state checks
      if (this.game.isGameOver()) {
        this.showGameOverMessage();
      } else if (!this.game.isPlayerTurn()) {
        // When AI is about to move, ensure board is clean
        this.clearAllHighlights();
        setTimeout(() => {
          this.game.makeBotMove();
          // Clean up again after AI moves
          this.clearAllHighlights();
        }, 500);
      }

      return true;
    } catch (error) {
      console.error("Move error:", error);
      this.render();
      return true;
    }
  }

  // Show promotion dialog
  showPromotionDialog(move) {
    this.pendingPromotion = move;
    const promotionDialog = document.getElementById("promotion-selection");

    // Set the images for the promotion pieces
    const color = this.game.turn();
    const pieces = ["q", "r", "b", "n"]; // queen, rook, bishop, knight

    document.querySelectorAll(".promotion-piece").forEach((element, index) => {
      const pieceType = pieces[index];
      element.style.backgroundImage = `url('./Chess_Sprites/${color}_${pieceType}.png')`;
      element.dataset.piece = pieceType;
    });

    promotionDialog.classList.remove("hidden");
  }

  // Complete the promotion move
  completePromotion(promotionPiece) {
    if (!this.pendingPromotion) return;

    const move = this.pendingPromotion;
    move.promotion = promotionPiece;

    document.getElementById("promotion-selection").classList.add("hidden");
    this.pendingPromotion = null;

    this.makeMove(move);
  }

  // Simplified animateMove method that doesn't rely on promises
  animateMove(move, piece) {
    try {
      console.log("Animating move:", move);
      // Instead of complex animation, just update the board
      this.render();
      return true;
    } catch (error) {
      console.error("Animation error:", error);
      // In case of error, still update the board
      this.render();
      return false;
    }
  }

  // Update captured pieces display
  updateCapturedPieces() {
    const capturedWhite = document.getElementById("captured-white");
    const capturedBlack = document.getElementById("captured-black");

    // Clear previous captured pieces
    capturedWhite.innerHTML = "";
    capturedBlack.innerHTML = "";

    // Get captured pieces from the game
    const history = this.game.history({ verbose: true });

    history.forEach((move) => {
      if (move.captured) {
        const color = move.color === "w" ? "b" : "w";
        const pieceCode = color + move.captured.toUpperCase();

        const capturedPiece = document.createElement("div");
        capturedPiece.className = "captured-piece";
        capturedPiece.style.backgroundImage = `url('./Chess_Sprites/${this.pieceImages[pieceCode]}')`;

        if (color === "w") {
          capturedWhite.appendChild(capturedPiece);
        } else {
          capturedBlack.appendChild(capturedPiece);
        }
      }
    });
  }

  // Update move history display
  updateMoveHistory() {
    const history = this.game.history();
    const movesContainer = document.getElementById("moves");
    movesContainer.innerHTML = "";

    // Group moves into pairs
    for (let i = 0; i < history.length; i += 2) {
      const moveNumber = Math.floor(i / 2) + 1;
      const whiteMove = history[i];
      const blackMove = i + 1 < history.length ? history[i + 1] : null;

      const movePair = document.createElement("div");
      movePair.className = "move-pair";

      const numberSpan = document.createElement("span");
      numberSpan.className = "move-number";
      numberSpan.textContent = `${moveNumber}.`;

      const whiteMoveSpan = document.createElement("span");
      whiteMoveSpan.className = "move white-move";
      whiteMoveSpan.textContent = whiteMove;

      movePair.appendChild(numberSpan);
      movePair.appendChild(whiteMoveSpan);

      if (blackMove) {
        const blackMoveSpan = document.createElement("span");
        blackMoveSpan.className = "move black-move";
        blackMoveSpan.textContent = blackMove;
        movePair.appendChild(blackMoveSpan);
      }

      movesContainer.appendChild(movePair);
    }

    // Scroll to the bottom
    movesContainer.scrollTop = movesContainer.scrollHeight;
  }

  // Show game over message
  showGameOverMessage() {
    console.log("Showing game over message");
    const gameOverModal = document.getElementById("game-over-modal");
    const gameResult = document.getElementById("game-result");
    const resultMessage = document.getElementById("result-message");

    // Only proceed if we can confirm there's actually a game over
    if (!this.game || !this.game.isGameOver()) {
      console.warn("showGameOverMessage called but game is not over");
      return;
    }

    if (this.game.inCheckmate()) {
      const winner = this.game.turn() === "w" ? "Black" : "White";
      gameResult.textContent = `${winner} Wins!`;
      resultMessage.textContent = `Checkmate! The ${winner.toLowerCase()} wizard has prevailed.`;
    } else if (this.game.inDraw()) {
      gameResult.textContent = "Draw!";
      if (this.game.insufficientMaterial()) {
        resultMessage.textContent =
          "Insufficient material to continue the spell duel.";
      } else if (this.game.inStalemate()) {
        resultMessage.textContent =
          "Stalemate! The magic has reached an impasse.";
      } else if (this.game.inThreefoldRepetition()) {
        resultMessage.textContent =
          "Threefold repetition! The magical patterns have repeated too many times.";
      } else {
        resultMessage.textContent = "The game is a draw.";
      }
    }

    gameOverModal.classList.remove("hidden");
  }

  // Render the current board state
  render() {
    const position = this.game.getPosition();

    // Before updating the board, record the container's dimensions
    const containerHeight = this.containerElement.offsetHeight;
    const containerWidth = this.containerElement.offsetWidth;

    // Update pieces
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const square = this.getSquareElement(row, col);
        square.innerHTML = "";

        const pos = this.rowColToPosition(row, col);
        const piece = position[pos];

        if (piece) {
          const pieceElement = document.createElement("div");
          pieceElement.className = "piece";
          const pieceCode =
            (piece.color === "w" ? "w" : "b") + piece.type.toUpperCase();
          pieceElement.style.backgroundImage = `url('./Chess_Sprites/${this.pieceImages[pieceCode]}')`;
          square.appendChild(pieceElement);
        }
      }
    }

    // After updating, verify dimensions haven't changed
    if (
      this.containerElement.offsetHeight !== containerHeight ||
      this.containerElement.offsetWidth !== containerWidth
    ) {
      console.log("Container dimensions changed, restoring...");
      this.containerElement.style.height = `${containerHeight}px`;
      this.containerElement.style.width = `${containerWidth}px`;
    }

    // Update game status
    const statusElement = document.getElementById("game-status");
    const turn = this.game.turn() === "w" ? "White" : "Black";

    if (this.game.inCheck()) {
      statusElement.textContent = `${turn} is in check!`;
    } else {
      statusElement.textContent = `${turn} to move`;
    }
  }

  // Utility: Get square element from row and column
  getSquareElement(row, col) {
    const index = row * 8 + col;
    return this.containerElement.children[index];
  }

  // Utility: Convert position (e.g., 'e4') to row and column
  positionToRowCol(position) {
    const col = position.charCodeAt(0) - "a".charCodeAt(0);
    const row = 8 - parseInt(position.charAt(1));
    return this.flipped ? [7 - row, 7 - col] : [row, col];
  }

  // Utility: Convert row and column to position
  rowColToPosition(row, col) {
    const actualRow = this.flipped ? 7 - row : row;
    const actualCol = this.flipped ? 7 - col : col;
    const file = String.fromCharCode("a".charCodeAt(0) + actualCol);
    const rank = 8 - actualRow;
    return `${file}${rank}`;
  }

  // Flip the board
  flipBoard() {
    this.flipped = !this.flipped;
    this.createBoard();
    this.render();
  }

  // Add this method to ChessBoard class
  highlightLastMove(from, to) {
    // Do nothing - no move highlighting
    return;
  }

  // Add a more thorough highlight clearing method
  clearAllHighlights() {
    // Get ALL squares
    const allSquares = document.querySelectorAll(".square");

    // Remove every possible class that could cause highlighting
    allSquares.forEach((square) => {
      square.classList.remove(
        "selected",
        "possible-move",
        "possible-capture",
        "last-move-from",
        "last-move-to",
        "check",
        "highlight",
        "active",
        "hover",
        "animated"
      );

      // Also remove any added elements that might be for effects
      Array.from(square.children).forEach((child) => {
        if (child.classList.contains("piece")) return; // Keep pieces
        child.remove();
      });
    });
  }

  // Add new method to set up MutationObserver
  setupHighlightBlocker() {
    // Create an observer to detect and remove highlight classes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        // If classes were added
        if (
          mutation.type === "attributes" &&
          mutation.attributeName === "class"
        ) {
          const element = mutation.target;
          if (element.classList.contains("square")) {
            // Remove highlight classes but keep structural classes
            const classesToKeep = ["square", "square-light", "square-dark"];
            Array.from(element.classList).forEach((cls) => {
              if (!classesToKeep.includes(cls)) {
                element.classList.remove(cls);
              }
            });
          }
        }

        // If elements were added (like effect divs)
        if (mutation.type === "childList") {
          Array.from(mutation.addedNodes).forEach((node) => {
            if (node.nodeType === 1 && !node.classList.contains("piece")) {
              // Remove any non-piece elements
              node.remove();
            }
          });
        }
      });
    });

    // Observe the entire board for class changes and child additions
    observer.observe(this.containerElement, {
      attributes: true,
      attributeFilter: ["class"],
      childList: true,
      subtree: true,
    });
  }
}

// Empty the addMagicalEffect function
function addMagicalEffect(square) {
  // Do nothing - no effects
  return;
}
