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
    try {
      // Clear the container
      this.containerElement.innerHTML = "";

      console.log(
        `Creating chess board with orientation: ${
          this.flipped ? "Black" : "White"
        }`
      );

      // Create the board with squares in the proper visual order
      for (let visualRow = 0; visualRow < 8; visualRow++) {
        for (let visualCol = 0; visualCol < 8; visualCol++) {
          // Convert visual coordinates to logical coordinates based on orientation
          const row = this.flipped ? 7 - visualRow : visualRow;
          const col = this.flipped ? 7 - visualCol : visualCol;

          const square = document.createElement("div");
          square.className = `square ${
            (visualRow + visualCol) % 2 === 0 ? "square-light" : "square-dark"
          }`;

          // Disable hover and selection effects with inline styles for maximum override
          square.style.transition = "none";
          square.style.pointerEvents = "auto"; // Keep clickable
          square.style.cursor = "pointer"; // Keep pointer cursor

          // Permanently set the background color
          const isLight = (visualRow + visualCol) % 2 === 0;
          square.style.backgroundColor = isLight ? "#f0d9b5" : "#b58863";

          // Prevent highlighting even when hovering
          square.addEventListener("mouseover", (e) => {
            e.currentTarget.style.backgroundColor = isLight
              ? "#f0d9b5"
              : "#b58863";
          });

          // Store the LOGICAL coordinates in data attributes
          square.dataset.row = row;
          square.dataset.col = col;

          // Click handler uses logical coordinates
          square.addEventListener("click", () =>
            this.handleSquareClick(row, col)
          );

          // Append to container
          this.containerElement.appendChild(square);
        }
      }

      console.log("Board created successfully");
    } catch (error) {
      console.error("Error creating board:", error);
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
        console.log("Move found:", move);
        // Log move flags to debug promotion detection
        console.log("Move flags:", move.flags);

        // Check if it's a pawn promotion
        if (move.flags && move.flags.includes("p")) {
          console.log("Promotion move detected!");
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
    // Completely empty - do not show any move indicators
    return;
  }

  // Make a move on the board
  makeMove(move) {
    // Don't visualize any move animations or highlights
    this.clearSelection(); // Clear any highlights first

    // Make the move in the game logic
    const result = this.game.makeMove(move);

    if (result) {
      // Just update the board state - no animations or highlights
      this.render();
      this.updateCapturedPieces();
      this.updateMoveHistory();

      // Check for game over
      if (this.game.isGameOver()) {
        this.showGameOverMessage();
        return;
      }

      // If playing against computer, make the bot move
      if (
        this.game.gameMode === "computer" &&
        this.game.turn() !== this.game.playerColor
      ) {
        setTimeout(() => this.game.makeBotMove(), 300);
      }
    }
  }

  // Updated showPromotionDialog to use correct image paths
  showPromotionDialog(move) {
    console.log("Showing promotion dialog for move:", move);

    this.pendingPromotion = move;

    // Force remove any existing promotion dialog to start fresh
    const existingDialog = document.getElementById("promotion-selection");
    if (existingDialog) {
      existingDialog.remove();
    }

    // Create a completely new dialog element
    const dialogElement = document.createElement("div");
    dialogElement.id = "promotion-selection";
    dialogElement.innerHTML = `
      <h3>Choose a piece:</h3>
      <div class="promotion-options">
        <div class="promotion-piece" data-piece="q"></div>
        <div class="promotion-piece" data-piece="r"></div>
        <div class="promotion-piece" data-piece="b"></div>
        <div class="promotion-piece" data-piece="n"></div>
      </div>
    `;

    // Force additional styles to guarantee visibility
    dialogElement.style.position = "fixed";
    dialogElement.style.top = "50%";
    dialogElement.style.left = "50%";
    dialogElement.style.transform = "translate(-50%, -50%)";
    dialogElement.style.zIndex = "9999";
    dialogElement.style.display = "flex";
    dialogElement.style.flexDirection = "column";
    dialogElement.style.backgroundColor = "rgba(40, 22, 55, 0.95)";
    dialogElement.style.border = "3px solid #ff9800";
    dialogElement.style.boxShadow = "0 0 40px rgba(142, 68, 173, 0.8)";

    // Add the dialog to the body (not the board) for maximum visibility
    document.body.appendChild(dialogElement);

    // Set the images for the promotion pieces - USE CORRECT PATHS
    const color = this.game.turn();
    const pieceTypeMap = {
      q: "queen",
      r: "rook",
      b: "bishop",
      n: "knight",
    };

    const pieces = ["q", "r", "b", "n"]; // queen, rook, bishop, knight

    dialogElement
      .querySelectorAll(".promotion-piece")
      .forEach((element, index) => {
        const pieceType = pieces[index];
        const fullPieceName = pieceTypeMap[pieceType];

        // Use the correct image paths based on the pieceImages mapping
        const imagePath = `./Chess_Sprites/${color}_${fullPieceName}.png`;
        console.log(`Setting promotion image: ${imagePath}`);

        element.style.backgroundImage = `url('${imagePath}')`;
        element.dataset.piece = pieceType;
        element.style.width = "70px";
        element.style.height = "70px";
        element.style.cursor = "pointer";
        element.style.backgroundSize = "contain";
        element.style.backgroundRepeat = "no-repeat";
        element.style.backgroundPosition = "center";

        // Add click listener with extra logging
        element.addEventListener("click", (e) => {
          const selectedPiece = e.currentTarget.dataset.piece;
          console.log(`Promotion piece clicked: ${selectedPiece}`);
          this.completePromotion(selectedPiece);
        });
      });

    console.log("NEW Promotion dialog created and should be visible now");
  }

  // Improved completePromotion method
  completePromotion(promotionPiece) {
    console.log("Completing promotion with piece:", promotionPiece);

    if (!this.pendingPromotion) {
      console.error("No pending promotion!");
      return;
    }

    const move = { ...this.pendingPromotion }; // Create a copy to avoid reference issues
    move.promotion = promotionPiece;

    // Remove the dialog first
    const promotionDialog = document.getElementById("promotion-selection");
    if (promotionDialog) {
      promotionDialog.remove();
    }

    // Clear pending state
    this.pendingPromotion = null;

    // Make the move immediately (no timeout)
    console.log("Executing promotion move:", move);
    this.game.chess.move({
      from: move.from,
      to: move.to,
      promotion: move.promotion,
    });

    // Update the board after the move
    this.render();
    this.updateCapturedPieces();
    this.updateMoveHistory();

    // If it's the computer's turn, let them move
    if (!this.game.isPlayerTurn()) {
      setTimeout(() => {
        this.game.makeBotMove();
      }, 500);
    }
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

  // Updated showGameOverMessage to display in the side panel instead of a modal
  showGameOverMessage() {
    console.log("Showing game over message");

    // Only proceed if we can confirm there's actually a game over
    if (!this.game || !this.game.isGameOver()) {
      console.warn("showGameOverMessage called but game is not over");
      return;
    }

    // Get the game status element in the side panel
    const statusElement = document.getElementById("game-status");
    const capturedPiecesElement = document.getElementById("captured-pieces");

    if (!statusElement || !capturedPiecesElement) {
      console.error("Side panel elements not found");
      return;
    }

    // Create a game over container for the side panel
    const gameOverContainer = document.createElement("div");
    gameOverContainer.id = "game-over-container";
    gameOverContainer.className = "status-board game-over-container";

    // Determine the appropriate message based on the game state
    let title = "",
      message = "";

    if (this.game.inCheckmate()) {
      const winner = this.game.turn() === "w" ? "Black" : "White";
      title = `${winner} Wins by Checkmate!`;
      message = `${winner} has checkmated the opponent.`;
    } else if (this.game.inDraw()) {
      title = "Game Ended in Draw";
      if (this.game.insufficientMaterial()) {
        message = "Insufficient material to checkmate.";
      } else if (this.game.inStalemate()) {
        message = "Stalemate. No legal moves are available.";
      } else if (this.game.inThreefoldRepetition()) {
        message = "Threefold repetition of position.";
      } else {
        message = "The game ended in a draw.";
      }
    }

    // Set the content of the game over container
    gameOverContainer.innerHTML = `
      <h2 class="game-over-title">${title}</h2>
      <p class="game-over-message">${message}</p>
      <div class="game-over-buttons">
        <button id="side-play-again" class="wizard-button">
          <i class="fas fa-redo-alt"></i> Play Again
        </button>
        <button id="side-menu" class="wizard-button">
          <i class="fas fa-home"></i> Main Menu
        </button>
      </div>
    `;

    // Insert the game over container after the status element
    statusElement.parentNode.insertBefore(
      gameOverContainer,
      capturedPiecesElement
    );

    // Update the game status to make it clear the game is over
    statusElement.textContent = "Game Over";
    statusElement.style.color = "#ff9800";

    // Add event listeners to the buttons
    document.getElementById("side-play-again").addEventListener("click", () => {
      // Remove the game over container
      gameOverContainer.remove();
      // Reset the game status style
      statusElement.style.color = "";
      // Reset the game
      this.game.resetGame();
    });

    document.getElementById("side-menu").addEventListener("click", () => {
      // Remove the game over container
      gameOverContainer.remove();
      // Reset the game status style
      statusElement.style.color = "";
      // Return to main menu
      document.getElementById("game-container").style.display = "none";
      document.getElementById("main-menu").style.display = "flex";
    });

    console.log("Game over message displayed in side panel");
  }

  // Render the current board state
  render() {
    try {
      // Check if container element exists
      if (!this.containerElement) {
        console.error("Board container element is missing");
        return;
      }

      // Get position from chess instance
      const position = this.game.getPosition();

      // Update pieces
      for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
          // Calculate the visual coordinates based on orientation
          const visualRow = this.flipped ? 7 - row : row;
          const visualCol = this.flipped ? 7 - col : col;

          // Get the square element using visual coordinates
          const square = this.getSquareElement(row, col);
          if (!square) {
            console.warn(`Square element at row=${row}, col=${col} not found`);
            continue;
          }

          // Clear the square
          square.innerHTML = "";

          // Get position in chess notation
          const pos = this.rowColToPosition(row, col);
          const piece = position[pos];

          // Add piece if there is one
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
    } catch (error) {
      console.error("Error rendering board:", error);
    }
  }

  // Utility: Get square element from row and column
  getSquareElement(row, col) {
    try {
      // Sanity check
      if (row < 0 || row > 7 || col < 0 || col > 7) {
        console.warn(`Invalid square coordinates: row=${row}, col=${col}`);
        return null;
      }

      // Find by data attributes first (most reliable)
      const square = this.containerElement.querySelector(
        `[data-row="${row}"][data-col="${col}"]`
      );
      if (square) return square;

      // Fallback to index-based lookup if needed
      const index = row * 8 + col;
      return this.containerElement.children[index] || null;
    } catch (error) {
      console.error(
        `Error getting square element at row=${row}, col=${col}:`,
        error
      );
      return null;
    }
  }

  // Utility: Convert position (e.g., 'e4') to row and column
  positionToRowCol(position) {
    // Standard algebraic notation to row/col (a8 is 0,0 in the array)
    const col = position.charCodeAt(0) - "a".charCodeAt(0);
    const row = 8 - parseInt(position.charAt(1));
    return [row, col];
  }

  // Utility: Convert row and column to position
  rowColToPosition(row, col) {
    // Standard conversion from row/col to algebraic notation
    const file = String.fromCharCode("a".charCodeAt(0) + col);
    const rank = 8 - row;
    return `${file}${rank}`;
  }

  // Flip the board
  flipBoard() {
    this.flipped = !this.flipped;
    this.createBoard();
    this.render();
  }

  // Make sure this method does nothing
  highlightLastMove(from, to) {
    // Completely empty - do not highlight last move
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

  // Add a method to set board orientation based on player color
  setOrientation(playerColor) {
    // Set orientation state
    this.flipped = playerColor === "b";

    // No CSS transform rotation - we'll handle this with logical board rendering
    this.containerElement.classList.remove("flipped");

    // Re-create the board with the new orientation
    this.createBoard();
    this.render();

    console.log(
      `Board orientation set to ${this.flipped ? "Black" : "White"} perspective`
    );
  }
}

// Empty the addMagicalEffect function
function addMagicalEffect(square) {
  // Do nothing - no effects
  return;
}
