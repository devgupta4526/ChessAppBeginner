const socket = io();
const chess = new Chess();

const boardElement = document.querySelector(".chessboard");

let draggedPieces = null;
let sourceSquare = null;
let playerRole = null;

const renderBoard = () => {
  const board = chess.board();
  boardElement.innerHTML = "";
  board.forEach((row, rowIndex) => {
    row.forEach((square, squareIndex) => {
      const squareElement = document.createElement("div");
      squareElement.classList.add(
        "square",
        (rowIndex + squareIndex) % 2 == 0 ? "light" : "dark"
      );

      squareElement.dataset.row = rowIndex;
      squareElement.dataset.col = squareIndex;

      if (square) {
        const pieceElement = document.createElement("div"); // Changed pieceElements to pieceElement for consistency
        pieceElement.classList.add(
          "piece",
          square.color === "w" ? "white" : "black"
        );
        pieceElement.innerText = getUniquePiceceCode(square);
        pieceElement.draggable = playerRole === square.color;
        pieceElement.addEventListener("dragstart", (e) => { 
          if (pieceElement.draggable) {
            draggedPieces = pieceElement;
            sourceSquare = { row: rowIndex, col: squareIndex };
            e.dataTransfer.setData("text/plain", "");
          }
        });

        pieceElement.addEventListener("dragend", (e) => { 
          draggedPieces = null;
          sourceSquare = null;
        });
        squareElement.appendChild(pieceElement);
      }

      squareElement.addEventListener("dragover", (e) => {
        e.preventDefault();
      });

      squareElement.addEventListener("drop", function (e) {
        e.preventDefault();
        if (draggedPieces) {
          const targetSquare = {
            row: parseInt(squareElement.dataset.row),
            col: parseInt(squareElement.dataset.col),
          };
          handleMove(sourceSquare, targetSquare);
        }
      });
      boardElement.appendChild(squareElement);
    });
  });

  if(playerRole === 'b'){
    boardElement.classList.add("flipped");
  }
  else{
    boardElement.classList.remove("flipped");
  }
};

const handleMove = (source , target) => {
    const move = {
        from : `${String.fromCharCode(97+source.col)}${8-source.row}`,
        to : `${String.fromCharCode(97+target.col)}${8-target.row}` ,
        promotion : 'q',

    }
    socket.emit("move", move);
};

const getUniquePiceceCode = (piece) => {
    const uniquepiececode ={
        p : "♙",
        r : "♖",
        n : "♘",
        b : "♗",
        q : "♕",
        k : "♔",
        P : "♟",
        R : "♜",
        N : "♞",
        B : "♝",
        Q : "♛",
        K : "♚",
    }

    return uniquepiececode[piece.type] || "";
};

socket.on("playerRole", (role) =>{
    playerRole = role;
    renderBoard();
})

socket.on("spectatorRole", (role) =>{
    playerRole = null;
    renderBoard();
})

socket.on("boardState", (fen) =>{
    chess.load(fen);
    renderBoard();
})

socket.on("move", (move) =>{
    chess.move(move);
    renderBoard();
})

renderBoard();
