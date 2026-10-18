/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Player, Piece, BoardState, Position, Move, Difficulty } from '../types';

/**
 * Initializes an 8x8 checkers board state.
 * Blacks/Light pieces (Bot) start in the top-left area.
 * Reds/Dark pieces (User) start in the bottom-right area.
 * The 3 most corner squares for both corners are empty, and all other squares (both black and white) are filled.
 */
export function initBoard(): BoardState {
  const board: BoardState = Array(8)
    .fill(null)
    .map(() => Array(8).fill(null));

  let idCounter = 1;

  const botColors: ('yellow' | 'green')[] = [
    'yellow', 'yellow', 'yellow', 'yellow', 'yellow', 'yellow',
    'green', 'green', 'green', 'green', 'green', 'green'
  ];
  const userColors: ('yellow' | 'green')[] = [
    'yellow', 'yellow', 'yellow', 'yellow', 'yellow', 'yellow',
    'green', 'green', 'green', 'green', 'green', 'green'
  ];

  // Fisher-Yates shuffle
  for (let i = botColors.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = botColors[i];
    botColors[i] = botColors[j];
    botColors[j] = temp;
  }
  for (let i = userColors.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = userColors[i];
    userColors[i] = userColors[j];
    userColors[j] = temp;
  }

  let botColorIdx = 0;
  let userColorIdx = 0;

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const sum = r + c;
      let player: Player | null = null;

      if (sum >= 2 && sum <= 4) {
        player = 'bot';
      } else if (sum >= 10 && sum <= 12) {
        player = 'user';
      }

      if (player) {
        const colorMark = player === 'bot' ? botColors[botColorIdx++] : userColors[userColorIdx++];
        board[r][c] = {
          id: `piece-${player}-${idCounter++}`,
          player,
          isKing: false,
          row: r,
          col: c,
          colorMark,
        };
      }
    }
  }

  return board;
}

/**
 * Clone board safely helper
 */
export function cloneBoard(board: BoardState): BoardState {
  return board.map((row) =>
    row.map((piece) => (piece ? { ...piece } : null))
  );
}

/**
 * Get all possible piece jumps starting from a specific position on the board
 */
function getJumpsForPiece(
  board: BoardState,
  piece: Piece,
  ignoredCoords: { row: number; col: number }[] = []
): Move[] {
  const jumps: Move[] = [];
  const directions = [
    { dr: -1, dc: 0 }, // Up
    { dr: 1, dc: 0 },  // Down
    { dr: 0, dc: -1 }, // Left
    { dr: 0, dc: 1 },  // Right
  ];

  const { row, col, player, isKing } = piece;

  const validDirs = directions.filter((dir) => {
    if (isKing) return true;
    if (player === 'user') {
      return dir.dr < 0 || dir.dc < 0; // User moves toward row 0 (up) or col 0 (left)
    } else {
      return dir.dr > 0 || dir.dc > 0; // Bot moves toward row 7 (down) or col 7 (right)
    }
  });

  for (const { dr, dc } of validDirs) {
    if (isKing) {
      // King distance is unlimited:
      // Loop to find the first obstacle (which could be the opponent piece to jump)
      let step = 1;
      let opponentPiece: Piece | null = null;
      let opponentPos: Position | null = null;
      
      while (true) {
        const nextR = row + dr * step;
        const nextC = col + dc * step;
        if (nextR < 0 || nextR >= 8 || nextC < 0 || nextC >= 8) {
          break;
        }
        const p = board[nextR][nextC];
        if (p) {
          if (p.player === player) {
            // Friendly piece is an absolute block, stop scanning this direction
            break;
          } else {
            // Opponent piece! This is our candidate to jump over
            opponentPiece = p;
            opponentPos = { row: nextR, col: nextC };
            break; 
          }
        }
        step++;
      }

      // If we found an opponent piece, check landing square immediately behind it
      if (opponentPiece && opponentPos) {
        // If this opponent piece was already jumped in a previous step, we can't jump it again
        const isAlreadyJumped = ignoredCoords.some(
          (coord) => coord.row === opponentPos!.row && coord.col === opponentPos!.col
        );
        if (!isAlreadyJumped) {
          const destR = opponentPos.row + dr;
          const destC = opponentPos.col + dc;
          if (destR >= 0 && destR < 8 && destC >= 0 && destC < 8) {
            const destPiece = board[destR][destC];
            if (!destPiece) {
              // Valid landing square!
              const isEaten = opponentPiece.colorMark === piece.colorMark;
              jumps.push({
                from: { row, col },
                to: { row: destR, col: destC },
                captures: isEaten ? [opponentPos] : [],
                isJump: true,
                jumpedPieces: [opponentPos],
              });
            }
          }
        }
      }
    } else {
      // Normal piece jump (fixed distance: adjacent opponent, land exactly 1 step behind)
      const midR = row + dr;
      const midC = col + dc;
      const targetR = row + dr * 2;
      const targetC = col + dc * 2;

      if (targetR >= 0 && targetR < 8 && targetC >= 0 && targetC < 8) {
        const midPiece = board[midR][midC];
        const targetPiece = board[targetR][targetC];

        if (
          midPiece &&
          midPiece.player !== player &&
          !targetPiece &&
          !ignoredCoords.some((coord) => coord.row === midR && coord.col === midC)
        ) {
          const isEaten = midPiece.colorMark === piece.colorMark;
          jumps.push({
            from: { row, col },
            to: { row: targetR, col: targetC },
            captures: isEaten ? [{ row: midR, col: midC }] : [],
            isJump: true,
            jumpedPieces: [{ row: midR, col: midC }],
          });
        }
      }
    }
  }

  return jumps;
}

/**
 * Get all possible single-step diagonal moves for a specific piece
 */
function getSlidesForPiece(board: BoardState, piece: Piece): Move[] {
  const slides: Move[] = [];
  const directions = [
    { dr: -1, dc: 0 }, // Up
    { dr: 1, dc: 0 },  // Down
    { dr: 0, dc: -1 }, // Left
    { dr: 0, dc: 1 },  // Right
  ];

  const { row, col, player, isKing } = piece;

  const validDirs = directions.filter((dir) => {
    if (isKing) return true;
    if (player === 'user') {
      return dir.dr < 0 || dir.dc < 0; // User moves toward row 0 (up) or col 0 (left)
    } else {
      return dir.dr > 0 || dir.dc > 0; // Bot moves toward row 7 (down) or col 7 (right)
    }
  });

  for (const { dr, dc } of validDirs) {
    if (isKing) {
      // King distance is unlimited: slide along empty squares
      let step = 1;
      while (true) {
        const targetR = row + dr * step;
        const targetC = col + dc * step;
        if (targetR < 0 || targetR >= 8 || targetC < 0 || targetC >= 8) {
          break;
        }
        const targetPiece = board[targetR][targetC];
        if (targetPiece) {
          break; // Obstacle, stop sliding in this direction
        }
        slides.push({
          from: { row, col },
          to: { row: targetR, col: targetC },
          captures: [],
          isJump: false,
          jumpedPieces: [],
        });
        step++;
      }
    } else {
      // Normal 1-step slide
      const targetR = row + dr;
      const targetC = col + dc;
      if (targetR >= 0 && targetR < 8 && targetC >= 0 && targetC < 8) {
        const targetPiece = board[targetR][targetC];
        if (!targetPiece) {
          slides.push({
            from: { row, col },
            to: { row: targetR, col: targetC },
            captures: [],
            isJump: false,
            jumpedPieces: [],
          });
        }
      }
    }
  }

  return slides;
}

/**
 * Retrieves all moves for a standard turn based on whether forceJumps is enabled.
 * If specificPieceId is set, returns only choices for that piece (for continuous double-jumps).
 */
export function getValidMoves(
  board: BoardState,
  player: Player,
  forceJumps: boolean,
  specificPieceId: string | null = null,
  ignoredCoords: { row: number; col: number }[] = []
): Move[] {
  const allPieces: Piece[] = [];

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (piece && piece.player === player) {
        if (!specificPieceId || piece.id === specificPieceId) {
          allPieces.push(piece);
        }
      }
    }
  }

  // Find all jumps first
  const allJumps: Move[] = [];
  for (const piece of allPieces) {
    allJumps.push(...getJumpsForPiece(board, piece, ignoredCoords));
  }

  // A jump is obligatory if it is NOT a King jump over a different color marker (non-capturing jump)
  const isObligatoryJump = (m: Move): boolean => {
    const piece = board[m.from.row][m.from.col];
    if (!piece) return false;
    // If it's a King, and captures is empty, it's jumping over a different colored opponent (does not capture)
    if (piece.isKing && m.captures.length === 0) {
      return false; // Not obliged to jump!
    }
    return true;
  };

  const obligatoryJumps = allJumps.filter(isObligatoryJump);

  // If there are obligatory jumps available and forceJumps is enabled, then ONLY jumps are valid
  if (obligatoryJumps.length > 0 && forceJumps) {
    return allJumps;
  }

  // Otherwise, if specificPieceId is set but can't jump anymore, it evaluates to empty
  // (which means user's forced jump sequence has completed)
  if (specificPieceId) {
    return allJumps; // No normal slides allowed in a continuous jump chain!
  }

  // Standard moves (slides and jumps, if any jumps present but forceJumps is false)
  const allSlides: Move[] = [];
  for (const piece of allPieces) {
    allSlides.push(...getSlidesForPiece(board, piece));
  }

  return [...allJumps, ...allSlides];
}

/**
 * Executes a move on the board, returning the new board, crowned state, and mid position.
 */
export function performMove(
  board: BoardState,
  move: Move
): {
  newBoard: BoardState;
  didCrown: boolean;
} {
  const newBoard = cloneBoard(board);
  const { from, to, captures } = move;

  const originalPiece = newBoard[from.row][from.col];
  if (!originalPiece) {
    return { newBoard, didCrown: false };
  }

  // Remove original piece positioning
  newBoard[from.row][from.col] = null;

  // Verify and apply king status
  let willBeKing = originalPiece.isKing;
  let didCrown = false;

  if (!willBeKing) {
    if (originalPiece.player === 'user' && to.row === 0 && to.col === 0) {
      willBeKing = true;
      didCrown = true;
    } else if (originalPiece.player === 'bot' && to.row === 7 && to.col === 7) {
      willBeKing = true;
      didCrown = true;
    }
  }

  // Create piece at the target location
  const updatedPiece: Piece = {
    ...originalPiece,
    row: to.row,
    col: to.col,
    isKing: willBeKing,
  };

  newBoard[to.row][to.col] = updatedPiece;

  // Clear captured pieces
  for (const cap of captures) {
    newBoard[cap.row][cap.col] = null;
  }

  return { newBoard, didCrown };
}

/**
 * Checks if the game has ended and returns the status
 */
export function checkGameEnd(board: BoardState, currentTurn: Player, forceJumps: boolean): { ended: boolean; winner?: Player | 'draw'; reason?: string } {
  let userCount = 0;
  let botCount = 0;
  const userColors = new Set<'yellow' | 'green'>();
  const botColors = new Set<'yellow' | 'green'>();

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (piece) {
        if (piece.player === 'user') {
          userCount++;
          userColors.add(piece.colorMark);
        } else {
          botCount++;
          botColors.add(piece.colorMark);
        }
      }
    }
  }

  if (userCount === 0) {
    return { ended: true, winner: 'bot', reason: 'The bot captured all your pieces.' };
  }
  if (botCount === 0) {
    return { ended: true, winner: 'user', reason: 'You captured all of the bot\'s pieces!' };
  }

  // Draw condition: "If one player doesn't have any pieces of color of another player then game ends as a draw."
  // Which means: they don't share any color mark, so no captures are possible anymore.
  let hasOverlap = false;
  for (const c of userColors) {
    if (botColors.has(c)) {
      hasOverlap = true;
      break;
    }
  }

  if (!hasOverlap) {
    return {
      ended: true,
      winner: 'draw',
      reason: 'reason_draw_no_shared_colors'
    };
  }

  // Check if player has active legal moves
  const legalMoves = getValidMoves(board, currentTurn, forceJumps);
  if (legalMoves.length === 0) {
    const winner: Player = currentTurn === 'user' ? 'bot' : 'user';
    const reason =
      currentTurn === 'user'
        ? 'You have run out of legal moves.'
        : 'The bot has run out of legal moves!';
    return { ended: true, winner, reason };
  }

  return { ended: false };
}

/**
 * HEURISTIC EVALUATION FOR BOARD (Positive values support Bot, Negative support User)
 */
function evaluateBoard(board: BoardState, forceJumps: boolean): number {
  let score = 0;

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (!piece) continue;

      const isBot = piece.player === 'bot';
      const sign = isBot ? 1 : -1;

      // Base weight: King = 15, Regular = 10
      let pieceVal = piece.isKing ? 15 : 10;

      // Position bonuses
      // 1. Edge protection: Pieces on edges can't be jumped (+1)
      if (c === 0 || c === 7) {
        pieceVal += 1;
      }

      // 2. Promotion progress for normal pieces: Red/User wants lower rows; Black/Bot wants higher rows
      if (!piece.isKing) {
        if (isBot) {
          pieceVal += r * 0.5; // Incentive for bot to advance
        } else {
          pieceVal += (7 - r) * 0.5; // Incentive for user to advance
        }
      }

      // 3. Center Control: Pieces on inner coordinates (rows 3,4 and cols 2,3,4,5) are stronger for board influence
      if ((r === 3 || r === 4) && (c >= 2 && c <= 5)) {
        pieceVal += 1.5;
      }

      // 4. Back-row protection: discourage baseline piece moving too early
      if (!piece.isKing) {
        if (isBot && r === 0) pieceVal += 2;
        if (!isBot && r === 7) pieceVal += 2;
      }

      score += pieceVal * sign;
    }
  }

  return score;
}

/**
 * Minimax algorithm with Alpha-Beta pruning
 */
function minimax(
  board: BoardState,
  depth: number,
  alpha: number,
  beta: number,
  maximizingPlayer: boolean,
  forceJumps: boolean
): { score: number; move: Move | null } {
  // Check leaf node
  const botTurn: Player = 'bot';
  const playerTurn: Player = 'user';
  const turn = maximizingPlayer ? botTurn : playerTurn;

  const gameCheck = checkGameEnd(board, turn, forceJumps);
  if (gameCheck.ended) {
    if (gameCheck.winner === 'bot') return { score: 10000 + depth, move: null }; // favor quicker wins
    if (gameCheck.winner === 'user') return { score: -10000 - depth, move: null }; // favor delaying losses
    return { score: 0, move: null };
  }

  if (depth === 0) {
    return { score: evaluateBoard(board, forceJumps), move: null };
  }

  const validMoves = getValidMoves(board, turn, forceJumps);

  if (maximizingPlayer) {
    let maxScore = -Infinity;
    let bestMove: Move | null = null;

    // Pruning sorting: rank responses targeting captures high to traverse alpha-beta faster
    const sortedMoves = [...validMoves].sort((a, b) => (b.isJump ? 1 : 0) - (a.isJump ? 1 : 0));

    for (const move of sortedMoves) {
      const { newBoard } = performMove(board, move);
      
      // Look out for single piece continous jumps inside minimax!
      let nextBoard = newBoard;
      let finalMove = move;
      
      if (move.isJump) {
        const landingPiece = nextBoard[move.to.row][move.to.col];
        if (landingPiece) {
          const firstJumped = move.jumpedPieces && move.jumpedPieces.length > 0
            ? move.jumpedPieces
            : [{ row: (move.from.row + move.to.row) / 2, col: (move.from.col + move.to.col) / 2 }];
          const jumpedCoords = [...firstJumped];
          let continuingJumps = getJumpsForPiece(nextBoard, landingPiece, jumpedCoords);
          while (continuingJumps.length > 0) {
            // Greedy select inside the simulated minimax branches
            const subJump = continuingJumps[0];
            const result = performMove(nextBoard, subJump);
            nextBoard = result.newBoard;
            finalMove = {
              ...finalMove,
              to: subJump.to,
              captures: [...finalMove.captures, ...subJump.captures],
            };
            const subMid = subJump.jumpedPieces && subJump.jumpedPieces.length > 0
              ? subJump.jumpedPieces[0]
              : { row: (subJump.from.row + subJump.to.row) / 2, col: (subJump.from.col + subJump.to.col) / 2 };
            jumpedCoords.push(subMid);
            const nestedPiece = nextBoard[subJump.to.row][subJump.to.col];
            continuingJumps = nestedPiece ? getJumpsForPiece(nextBoard, nestedPiece, jumpedCoords) : [];
          }
        }
      }

      const evaluation = minimax(nextBoard, depth - 1, alpha, beta, false, forceJumps);

      if (evaluation.score > maxScore) {
        maxScore = evaluation.score;
        bestMove = finalMove;
      }
      alpha = Math.max(alpha, evaluation.score);
      if (beta <= alpha) {
        break; // beta cutoff
      }
    }

    return { score: maxScore, move: bestMove };
  } else {
    let minScore = Infinity;
    let bestMove: Move | null = null;

    const sortedMoves = [...validMoves].sort((a, b) => (b.isJump ? 1 : 0) - (a.isJump ? 1 : 0));

    for (const move of sortedMoves) {
      const { newBoard } = performMove(board, move);
      
      let nextBoard = newBoard;
      let finalMove = move;

      if (move.isJump) {
        const landingPiece = nextBoard[move.to.row][move.to.col];
        if (landingPiece) {
          const firstJumped = move.jumpedPieces && move.jumpedPieces.length > 0
            ? move.jumpedPieces
            : [{ row: (move.from.row + move.to.row) / 2, col: (move.from.col + move.to.col) / 2 }];
          const jumpedCoords = [...firstJumped];
          let continuingJumps = getJumpsForPiece(nextBoard, landingPiece, jumpedCoords);
          while (continuingJumps.length > 0) {
            const subJump = continuingJumps[0];
            const result = performMove(nextBoard, subJump);
            nextBoard = result.newBoard;
            finalMove = {
              ...finalMove,
              to: subJump.to,
              captures: [...finalMove.captures, ...subJump.captures],
            };
            const subMid = subJump.jumpedPieces && subJump.jumpedPieces.length > 0
              ? subJump.jumpedPieces[0]
              : { row: (subJump.from.row + subJump.to.row) / 2, col: (subJump.from.col + subJump.to.col) / 2 };
            jumpedCoords.push(subMid);
            const nestedPiece = nextBoard[subJump.to.row][subJump.to.col];
            continuingJumps = nestedPiece ? getJumpsForPiece(nextBoard, nestedPiece, jumpedCoords) : [];
          }
        }
      }

      const evaluation = minimax(nextBoard, depth - 1, alpha, beta, true, forceJumps);

      if (evaluation.score < minScore) {
        minScore = evaluation.score;
        bestMove = finalMove;
      }
      beta = Math.min(beta, evaluation.score);
      if (beta <= alpha) {
        break; // alpha cutoff
      }
    }

    return { score: minScore, move: bestMove };
  }
}

/**
 * Computes the optimal turn choice for the bot based on difficulty configuration
 */
export function getBotMove(
  board: BoardState,
  forceJumps: boolean,
  currDifficulty: Difficulty
): Move | null {
  const possibleMoves = getValidMoves(board, 'bot', forceJumps);
  if (possibleMoves.length === 0) return null;

  // Let's implement difficulty levels
  if (currDifficulty === 'easy') {
    // Easy: 60% random choice, 40% simple heuristic evaluation
    if (Math.random() < 0.6) {
      const idx = Math.floor(Math.random() * possibleMoves.length);
      return possibleMoves[idx];
    }
    // Simple evaluation (Minimax depth 1)
    const result = minimax(board, 1, -Infinity, Infinity, true, forceJumps);
    return result.move || possibleMoves[0];
  } else if (currDifficulty === 'medium') {
    // Medium: Depth 3 search
    const result = minimax(board, 3, -Infinity, Infinity, true, forceJumps);
    return result.move || possibleMoves[0];
  } else {
    // Hard: Depth 5 Minimax search - highly smart!
    const result = minimax(board, 5, -Infinity, Infinity, true, forceJumps);
    return result.move || possibleMoves[0];
  }
}
