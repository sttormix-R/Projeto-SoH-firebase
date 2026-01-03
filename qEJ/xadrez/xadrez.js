// xadrez.js - VERSÃO PROFISSIONAL ATUALIZADA
// Melhorias implementadas:
// 1. Avaliação avançada: material + piece-square tables + mobilidade
// 2. Promoção interativa
// 3. Tabela de Transposição completa com Zobrist hashing
// 4. MVV-LVA para ordenação de movimentos
// 5. Estatísticas em tempo real
// 6. Opção de virar tabuleiro

const AUTO_PROMOTE_TO = 'q';
const MAX_TIME_MS_DEFAULT = 1000;

// Piece-square tables for better positional evaluation
const PIECE_SQUARE_TABLES = {
  p: [
    [ 0,  0,  0,  0,  0,  0,  0,  0],
    [50, 50, 50, 50, 50, 50, 50, 50],
    [10, 10, 20, 30, 30, 20, 10, 10],
    [ 5,  5, 10, 25, 25, 10,  5,  5],
    [ 0,  0,  0, 20, 20,  0,  0,  0],
    [ 5, -5,-10,  0,  0,-10, -5,  5],
    [ 5, 10, 10,-20,-20, 10, 10,  5],
    [ 0,  0,  0,  0,  0,  0,  0,  0]
  ],
  n: [
    [-50,-40,-30,-30,-30,-30,-40,-50],
    [-40,-20,  0,  0,  0,  0,-20,-40],
    [-30,  0, 10, 15, 15, 10,  0,-30],
    [-30,  5, 15, 20, 20, 15,  5,-30],
    [-30,  0, 15, 20, 20, 15,  0,-30],
    [-30,  5, 10, 15, 15, 10,  5,-30],
    [-40,-20,  0,  5,  5,  0,-20,-40],
    [-50,-40,-30,-30,-30,-30,-40,-50]
  ],
  b: [
    [-20,-10,-10,-10,-10,-10,-10,-20],
    [-10,  0,  0,  0,  0,  0,  0,-10],
    [-10,  0,  5, 10, 10,  5,  0,-10],
    [-10,  5,  5, 10, 10,  5,  5,-10],
    [-10,  0, 10, 10, 10, 10,  0,-10],
    [-10, 10, 10, 10, 10, 10, 10,-10],
    [-10,  5,  0,  0,  0,  0,  5,-10],
    [-20,-10,-10,-10,-10,-10,-10,-20]
  ],
  r: [
    [ 0,  0,  0,  0,  0,  0,  0,  0],
    [ 5, 10, 10, 10, 10, 10, 10,  5],
    [-5,  0,  0,  0,  0,  0,  0, -5],
    [-5,  0,  0,  0,  0,  0,  0, -5],
    [-5,  0,  0,  0,  0,  0,  0, -5],
    [-5,  0,  0,  0,  0,  0,  0, -5],
    [-5,  0,  0,  0,  0,  0,  0, -5],
    [ 0,  0,  0,  5,  5,  0,  0,  0]
  ],
  q: [
    [-20,-10,-10, -5, -5,-10,-10,-20],
    [-10,  0,  0,  0,  0,  0,  0,-10],
    [-10,  0,  5,  5,  5,  5,  0,-10],
    [ -5,  0,  5,  5,  5,  5,  0, -5],
    [  0,  0,  5,  5,  5,  5,  0, -5],
    [-10,  5,  5,  5,  5,  5,  0,-10],
    [-10,  0,  5,  0,  0,  0,  0,-10],
    [-20,-10,-10, -5, -5,-10,-10,-20]
  ],
  k: [
    [-30,-40,-40,-50,-50,-40,-40,-30],
    [-30,-40,-40,-50,-50,-40,-40,-30],
    [-30,-40,-40,-50,-50,-40,-40,-30],
    [-30,-40,-40,-50,-50,-40,-40,-30],
    [-20,-30,-30,-40,-40,-30,-30,-20],
    [-10,-20,-20,-20,-20,-20,-20,-10],
    [ 20, 20,  0,  0,  0,  0, 20, 20],
    [ 20, 30, 10,  0,  0, 10, 30, 20]
  ],
  k_end: [ // King in endgame
    [-50,-40,-30,-20,-20,-30,-40,-50],
    [-30,-20,-10,  0,  0,-10,-20,-30],
    [-30,-10, 20, 30, 30, 20,-10,-30],
    [-30,-10, 30, 40, 40, 30,-10,-30],
    [-30,-10, 30, 40, 40, 30,-10,-30],
    [-30,-10, 20, 30, 30, 20,-10,-30],
    [-30,-30,  0,  0,  0,  0,-30,-30],
    [-50,-30,-30,-30,-30,-30,-30,-50]
  ]
};

const pieceSymbols = {
  'w': {p:'♙', r:'♖', n:'♘', b:'♗', q:'♕', k:'♔'},
  'b': {p:'♟', r:'♜', n:'♞', b:'♝', q:'♛', k:'♚'}
};

let board = [];
let turn = 'w';
let enPassantTarget = null;
let castling = {wK:true, wQ:true, bK:true, bQ:true};
let history = [];
let selected = null;
let legalMoves = [];
let moveList = [];
let worker = null;
let boardFlipped = false;
let pendingPromotion = null;

// UI elements
const boardEl = document.getElementById('board');
const statusEl = document.getElementById('status');
const newGameBtn = document.getElementById('newGame');
const undoBtn = document.getElementById('undo');
const moveListEl = document.getElementById('moveList');
const depthInput = document.getElementById('depth');
const depthVal = document.getElementById('depthVal');
const timeLimitInput = document.getElementById('timeLimit');
const autoPlayCheckbox = document.getElementById('autoPlay');
const flipBoardBtn = document.getElementById('flipBoard');
const promotionDialog = document.getElementById('promotionDialog');
const thinkTimeEl = document.getElementById('thinkTime');
const nodesEvaluatedEl = document.getElementById('nodesEvaluated');

depthVal.textContent = depthInput.value;
depthInput.oninput = () => depthVal.textContent = depthInput.value;

// Event listeners
newGameBtn.addEventListener('click', startNewGame);
undoBtn.addEventListener('click', undo);
flipBoardBtn.addEventListener('click', flipBoard);
boardEl.addEventListener('dragstart', e => e.preventDefault());

// Promotion buttons
promotionDialog.querySelectorAll('button').forEach(btn => {
  btn.addEventListener('click', (e) => {
    const piece = e.target.dataset.piece;
    completePromotion(piece);
  });
});

startNewGame();

// ==================== FUNÇÕES PRINCIPAIS ====================

function startNewGame(){
  initBoard();
  history = [];
  moveList = [];
  boardFlipped = false;
  render();
  stopWorker();
  createWorker();
  updateStatus();
}

function initBoard(){
  board = Array.from({length:8}, ()=>Array(8).fill(null));
  const back = ['r','n','b','q','k','b','n','r'];
  for(let c=0;c<8;c++){
    board[0][c] = {type:back[c], color:'b', hasMoved:false};
    board[1][c] = {type:'p', color:'b', hasMoved:false};
    board[6][c] = {type:'p', color:'w', hasMoved:false};
    board[7][c] = {type:back[c], color:'w', hasMoved:false};
  }
  turn = 'w';
  enPassantTarget = null;
  castling = {wK:true,wQ:true,bK:true,bQ:true};
  selected = null;
  legalMoves = [];
  moveList = [];
  pendingPromotion = null;
}

function render(){
  boardEl.innerHTML = '';
  const rows = boardFlipped ? [0,1,2,3,4,5,6,7].reverse() : [0,1,2,3,4,5,6,7];
  const cols = boardFlipped ? [0,1,2,3,4,5,6,7].reverse() : [0,1,2,3,4,5,6,7];
  
  for(let ri=0;ri<8;ri++){
    const r = rows[ri];
    for(let ci=0;ci<8;ci++){
      const c = cols[ci];
      const square = document.createElement('div');
      square.className = 'square ' + (((r + c) % 2) ? 'dark' : 'light');
      square.dataset.r = r; 
      square.dataset.c = c;

      const piece = board[r][c];
      if(piece){
        const p = document.createElement('div');
        p.className = 'piece';
        p.textContent = pieceSymbols[piece.color][piece.type];
        p.draggable = true;
        
        p.addEventListener('mousedown', e=> onPieceMouseDown(e, r, c));
        p.addEventListener('touchstart', e=> onPieceMouseDown(e, r, c), {passive:true});
        square.appendChild(p);
      }

      if(selected && selected.r==r && selected.c==c) square.classList.add('selected');
      if(legalMoves.some(m=>m.to.r==r && m.to.c==c)) square.classList.add('highlight');

      square.addEventListener('click', ()=> onSquareClick(r,c));
      square.addEventListener('mouseup', ()=> onDropAt(r,c));
      square.addEventListener('touchend', ()=> onDropAt(r,c));
      boardEl.appendChild(square);
    }
  }
  
  // Show/hide promotion dialog
  if(pendingPromotion){
    promotionDialog.style.display = 'block';
  } else {
    promotionDialog.style.display = 'none';
  }
  
  updateMoveList();
  updateStatus();
}

function flipBoard(){
  boardFlipped = !boardFlipped;
  render();
}

// ==================== INTERAÇÃO DO USUÁRIO ====================

function onSquareClick(r,c){
  if(pendingPromotion) return;
  
  const p = board[r][c];
  if(selected){
    const mv = legalMoves.find(m => m.to.r==r && m.to.c==c);
    if(mv){ 
      if(mv.type === 'promote'){
        showPromotionDialog({r,c}, mv);
      } else {
        applyMove(selected, mv); 
        render(); 
        maybeBotMove(); 
      }
      return; 
    }
    if(p && p.color===turn){ 
      selected={r,c}; 
      legalMoves = generateLegalMoves(r,c); 
      render(); 
      return; 
    }
    selected = null; legalMoves = []; render();
  } else {
    if(p && p.color===turn){ 
      selected={r,c}; 
      legalMoves = generateLegalMoves(r,c); 
      render(); 
    }
  }
}

let dragOrigin = null;
function onPieceMouseDown(e, r, c){
  if(pendingPromotion) return;
  dragOrigin = {r,c};
  selected = {r,c};
  legalMoves = generateLegalMoves(r,c);
  render();
}

function onDropAt(r,c){
  if(!dragOrigin || pendingPromotion) return;
  const mv = legalMoves.find(m=>m.to.r==r && m.to.c==c);
  if(mv){ 
    if(mv.type === 'promote'){
      showPromotionDialog(dragOrigin, mv);
    } else {
      applyMove(dragOrigin, mv); 
      render(); 
      maybeBotMove(); 
    }
  }
  dragOrigin = null;
  selected = null; legalMoves = [];
}

function showPromotionDialog(from, mv){
  pendingPromotion = {from, mv};
  render();
}

function completePromotion(pieceType){
  if(!pendingPromotion) return;
  
  const {from, mv} = pendingPromotion;
  mv.promoteTo = pieceType;
  applyMove(from, mv);
  pendingPromotion = null;
  render();
  maybeBotMove();
}

// ==================== LÓGICA DO JOGO ====================

function cloneBoard(bd){
  return bd.map(row => row.map(cell => cell ? {...cell} : null));
}

function pushHistory(){
  history.push({
    board: cloneBoard(board),
    turn, 
    enPassantTarget: enPassantTarget ? {...enPassantTarget} : null,
    castling: {...castling},
    moveList: [...moveList]
  });
}

function undo(){
  if(history.length===0 || pendingPromotion) return;
  const last = history.pop();
  board = cloneBoard(last.board);
  turn = last.turn;
  enPassantTarget = last.enPassantTarget;
  castling = {...last.castling};
  moveList = [...last.moveList];
  selected = null; legalMoves = [];
  pendingPromotion = null;
  render();
}

// ==================== GERAÇÃO DE MOVIMENTOS ====================

function inBounds(r,c){ return r>=0 && r<8 && c>=0 && c<8; }

function generateLegalMoves(r,c){
  const piece = board[r][c];
  if(!piece) return [];
  const pseudo = generatePseudoMoves(r,c);
  const legal = [];
  for(const mv of pseudo){
    const bCopy = cloneBoard(board);
    applyMoveOnBoard(bCopy, {r,c}, mv);
    if(!isKingInCheck(bCopy, piece.color)){
      legal.push(mv);
    }
  }
  return legal;
}

function generatePseudoMoves(r,c){
  const piece = board[r][c];
  if(!piece) return [];
  const moves = [];
  const dirs = {
    n:[[ -2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]],
    b:[[ -1,-1],[-1,1],[1,-1],[1,1]],
    r:[[ -1,0],[1,0],[0,-1],[0,1]],
    q:[[ -1,0],[1,0],[0,-1],[0,1],[-1,-1],[-1,1],[1,-1],[1,1]],
    k:[[ -1,0],[1,0],[0,-1],[0,1],[-1,-1],[-1,1],[1,-1],[1,1]]
  };

  if(piece.type==='p'){
    const dir = piece.color==='w' ? -1 : 1;
    const startRow = piece.color==='w' ? 6 : 1;
    // single forward
    if(inBounds(r+dir,c) && !board[r+dir][c]){
      if((piece.color==='w' && r+dir===0) || (piece.color==='b' && r+dir===7))
        moves.push({from:{r,c}, to:{r:r+dir,c}, type:'promote'});
      else moves.push({from:{r,c}, to:{r:r+dir,c}});
      // double forward
      if(r===startRow && inBounds(r+2*dir,c) && !board[r+2*dir][c]){
        moves.push({from:{r,c}, to:{r+2*dir,c}, type:'double'});
      }
    }
    // captures
    for(const dc of [-1,1]){
      const nr = r+dir, nc = c+dc;
      if(inBounds(nr,nc)){
        const t = board[nr][nc];
        if(t && t.color !== piece.color){
          if((piece.color==='w' && nr===0) || (piece.color==='b' && nr===7))
            moves.push({from:{r,c}, to:{r:nr,c:nc}, type:'promote'});
          else moves.push({from:{r,c}, to:{r:nr,c:nc}});
        }
      }
    }
    // en passant
    if(enPassantTarget){
      if(Math.abs(enPassantTarget.c - c) === 1 && enPassantTarget.r === r + dir){
        moves.push({from:{r,c}, to:{r:enPassantTarget.r,c:enPassantTarget.c}, type:'enpassant'});
      }
    }
  } else if(piece.type==='n'){
    for(const d of dirs.n){
      const nr=r+d[0], nc=c+d[1];
      if(inBounds(nr,nc)){
        const t = board[nr][nc];
        if(!t || t.color !== piece.color) moves.push({from:{r,c}, to:{r:nr,c:nc}});
      }
    }
  } else if(piece.type==='b' || piece.type==='r' || piece.type==='q'){
    const use = piece.type==='b' ? dirs.b : (piece.type==='r' ? dirs.r : dirs.q);
    for(const d of use){
      let nr=r+d[0], nc=c+d[1];
      while(inBounds(nr,nc)){
        const t = board[nr][nc];
        if(!t) moves.push({from:{r,c}, to:{r:nr,c:nc}});
        else { if(t.color !== piece.color) moves.push({from:{r,c}, to:{r:nr,c:nc}}); break; }
        nr += d[0]; nc += d[1];
      }
    }
  } else if(piece.type==='k'){
    for(const d of dirs.k){
      const nr=r+d[0], nc=c+d[1];
      if(inBounds(nr,nc)){
        const t = board[nr][nc];
        if(!t || t.color !== piece.color) moves.push({from:{r,c}, to:{r:nr,c:nc}});
      }
    }
    // castling
    if(!piece.hasMoved){
      if(piece.color==='w' && r===7 && c===4){
        if(castling.wK && !board[7][5] && !board[7][6] && !isSquareAttacked(board,7,4,'b') && !isSquareAttacked(board,7,5,'b') && !isSquareAttacked(board,7,6,'b'))
          moves.push({from:{r,c}, to:{r:7,c:6}, type:'castleK'});
        if(castling.wQ && !board[7][3] && !board[7][2] && !board[7][1] && !isSquareAttacked(board,7,4,'b') && !isSquareAttacked(board,7,3,'b') && !isSquareAttacked(board,7,2,'b'))
          moves.push({from:{r,c}, to:{r:7,c:2}, type:'castleQ'});
      }
      if(piece.color==='b' && r===0 && c===4){
        if(castling.bK && !board[0][5] && !board[0][6] && !isSquareAttacked(board,0,4,'w') && !isSquareAttacked(board,0,5,'w') && !isSquareAttacked(board,0,6,'w'))
          moves.push({from:{r,c}, to:{r:0,c:6}, type:'castleK'});
        if(castling.bQ && !board[0][3] && !board[0][2] && !board[0][1] && !isSquareAttacked(board,0,4,'w') && !isSquareAttacked(board,0,3,'w') && !isSquareAttacked(board,0,2,'w'))
          moves.push({from:{r,c}, to:{r:0,c:2}, type:'castleQ'});
      }
    }
  }
  return moves;
}

function applyMoveOnBoard(bd, from, mv){
  const piece = bd[from.r][from.c];
  if(!piece) return;
  
  if(mv.type === 'castleK'){
    bd[mv.to.r][mv.to.c] = piece;
    bd[from.r][from.c] = null;
    const rook = bd[mv.to.r][7];
    bd[mv.to.r][7] = null;
    bd[mv.to.r][5] = rook;
  } else if(mv.type === 'castleQ'){
    bd[mv.to.r][mv.to.c] = piece;
    bd[from.r][from.c] = null;
    const rook = bd[mv.to.r][0];
    bd[mv.to.r][0] = null;
    bd[mv.to.r][3] = rook;
  } else if(mv.type === 'enpassant'){
    bd[mv.to.r][mv.to.c] = piece;
    bd[from.r][from.c] = null;
    const capR = from.r;
    const capC = mv.to.c;
    bd[capR][capC] = null;
  } else if(mv.type === 'promote'){
    bd[mv.to.r][mv.to.c] = {type: mv.promoteTo || 'q', color: piece.color, hasMoved:true};
    bd[from.r][from.c] = null;
  } else {
    bd[mv.to.r][mv.to.c] = piece;
    bd[from.r][from.c] = null;
  }
}

function applyMove(from, mv){
  pushHistory();
  recordMoveSAN(from, mv);

  const piece = board[from.r][from.c];
  
  if(mv.type === 'castleK' || mv.type === 'castleQ'){
    applyMoveOnBoard(board, from, mv);
    if(piece.color==='w'){ castling.wK = castling.wQ = false; }
    else { castling.bK = castling.bQ = false; }
    enPassantTarget = null;
  } else if(mv.type === 'enpassant'){
    applyMoveOnBoard(board, from, mv);
    enPassantTarget = null;
  } else {
    board[mv.to.r][mv.to.c] = board[from.r][from.c];
    board[from.r][from.c] = null;
    const moved = board[mv.to.r][mv.to.c];
    
    if(mv.type === 'promote'){
      board[mv.to.r][mv.to.c] = {type: mv.promoteTo || 'q', color: moved.color, hasMoved:true};
    } else {
      if(moved) moved.hasMoved = true;
    }
    
    if(moved && moved.type==='p' && mv.type === 'double'){
      enPassantTarget = {r: (from.r + mv.to.r)/2, c: from.c};
    } else enPassantTarget = null;

    if(moved && moved.type==='k'){
      if(moved.color==='w'){ castling.wK = castling.wQ = false; }
      else { castling.bK = castling.bQ = false; }
    }
    if(moved && moved.type==='r'){
      if(moved.color==='w'){
        if(from.r===7 && from.c===7) castling.wK=false;
        if(from.r===7 && from.c===0) castling.wQ=false;
      } else {
        if(from.r===0 && from.c===7) castling.bK=false;
        if(from.r===0 && from.c===0) castling.bQ=false;
      }
    }
  }

  turn = (turn==='w') ? 'b' : 'w';
}

// ==================== VERIFICAÇÃO DE XEQUE ====================

function findKing(bd, color){
  for(let r=0;r<8;r++) for(let c=0;c<8;c++){
    const p = bd[r][c];
    if(p && p.color===color && p.type==='k') return {r,c};
  }
  return null;
}

function isSquareAttacked(bd, r, c, byColor){
  // pawn attacks
  const pawnDir = byColor==='w' ? -1 : 1;
  for(const dc of [-1,1]){
    const rr = r - pawnDir, cc = c + dc;
    if(inBounds(rr,cc)){
      const p = bd[rr][cc];
      if(p && p.color===byColor && p.type==='p') return true;
    }
  }
  // knights
  const kmoves = [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]];
  for(const d of kmoves){
    const rr=r+d[0], cc=c+d[1];
    if(inBounds(rr,cc)){
      const p = bd[rr][cc];
      if(p && p.color===byColor && p.type==='n') return true;
    }
  }
  // sliders
  const orth = [[-1,0],[1,0],[0,-1],[0,1]];
  for(const d of orth){
    let rr=r+d[0], cc=c+d[1];
    while(inBounds(rr,cc)){
      const p = bd[rr][cc];
      if(p){
        if(p.color===byColor && (p.type==='r' || p.type==='q')) return true;
        break;
      }
      rr+=d[0]; cc+=d[1];
    }
  }
  const diag = [[-1,-1],[-1,1],[1,-1],[1,1]];
  for(const d of diag){
    let rr=r+d[0], cc=c+d[1];
    while(inBounds(rr,cc)){
      const p = bd[rr][cc];
      if(p){
        if(p.color===byColor && (p.type==='b' || p.type==='q')) return true;
        break;
      }
      rr+=d[0]; cc+=d[1];
    }
  }
  // king
  for(const d of [...orth,...diag]){
    const rr=r+d[0], cc=c+d[1];
    if(inBounds(rr,cc)){
      const p = bd[rr][cc];
      if(p && p.color===byColor && p.type==='k') return true;
    }
  }
  return false;
}

function isKingInCheck(bd, color){
  const king = findKing(bd, color);
  if(!king) return true;
  return isSquareAttacked(bd, king.r, king.c, color==='w'?'b':'w');
}

function anyLegalMovesExist(color){
  for(let r=0;r<8;r++){
    for(let c=0;c<8;c++){
      const p = board[r][c];
      if(p && p.color===color){
        const lm = generateLegalMoves(r,c);
        if(lm.length) return true;
      }
    }