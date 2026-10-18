/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Crown, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { BoardState, Piece, Position, Move, BoardTheme, Player } from '../types';
import { getValidMoves } from '../utils/checkersLogic';
import { sounds } from '../utils/audio';

interface BoardProps {
  board: BoardState;
  theme: BoardTheme;
  currentTurn: Player;
  forceJumps: boolean;
  selectedPiece: Piece | null;
  setSelectedPiece: (piece: Piece | null) => void;
  onMakeMove: (move: Move) => void;
  mustContinueJumpingWith: string | null;
  isRotated: boolean;
  jumpedCoords?: { row: number; col: number }[];
  lastBotMove?: Move | null;
}

const THEME_CLASSES = {
  'classic-wood': {
    outerBorder: 'border-8 border-amber-950 bg-amber-900/90 rounded-2xl shadow-xl shadow-amber-950/40 p-2.5',
    darkSquare: 'bg-[#5c3e32] border border-[#4d3228]',
    lightSquare: 'bg-[#dfc4a2] border border-[#d2b38e]',
    userPiece: 'bg-gradient-to-br from-rose-500 via-red-600 to-red-900 border-2 border-red-400 shadow-md shadow-red-950/50',
    userPieceInner: 'border border-rose-400 hover:border-white',
    botPiece: 'bg-gradient-to-br from-neutral-700 via-neutral-800 to-neutral-950 border-2 border-neutral-600 shadow-md shadow-black/60',
    botPieceInner: 'border border-neutral-600 dark:border-neutral-500 hover:border-neutral-400',
    playableOverlay: 'ring-2 ring-emerald-500 ring-offset-1 ring-offset-emerald-100 cursor-pointer',
    jumpOverlay: 'bg-red-500/30 cursor-pointer border-2 border-red-500',
    selectedSquare: 'bg-amber-500/35 border-2 border-amber-500',
    lastMoveFrom: 'bg-amber-600/15 border-2 border-[#eab308]/30 border-dashed',
    lastMoveTo: 'bg-amber-500/15 border-2 border-[#eab308]/55',
  },
  'minimal-slate': {
    outerBorder: 'border-8 border-neutral-800 bg-neutral-700 rounded-2xl shadow-xl shadow-neutral-900/30 p-2.5',
    darkSquare: 'bg-neutral-700 border border-neutral-750',
    lightSquare: 'bg-neutral-150 bg-neutral-100 border border-neutral-200',
    userPiece: 'bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 border-2 border-amber-300 shadow-md shadow-amber-950/30',
    userPieceInner: 'border border-amber-300',
    botPiece: 'bg-gradient-to-br from-neutral-800 via-neutral-900 to-black border-2 border-neutral-750 shadow-md shadow-black/40',
    botPieceInner: 'border border-neutral-700',
    playableOverlay: 'ring-2 ring-emerald-400 ring-offset-1 cursor-pointer',
    jumpOverlay: 'bg-red-500/30 cursor-pointer border-2 border-red-400',
    selectedSquare: 'bg-sky-500/30 border-2 border-sky-400',
    lastMoveFrom: 'bg-neutral-800/15 border-2 border-sky-400/20 border-dashed',
    lastMoveTo: 'bg-sky-500/10 border-2 border-sky-400/40',
  },
  'emerald-forest': {
    outerBorder: 'border-8 border-emerald-950 bg-emerald-900 rounded-2xl shadow-xl shadow-emerald-950/30 p-2.5',
    darkSquare: 'bg-emerald-900 border border-emerald-950',
    lightSquare: 'bg-[#efebe4] border border-[#dfdad0]',
    userPiece: 'bg-gradient-to-br from-red-500 via-rose-600 to-rose-800 border-2 border-rose-400 shadow-md shadow-rose-950/30',
    userPieceInner: 'border border-rose-400',
    botPiece: 'bg-gradient-to-br from-stone-800 via-stone-900 to-black border-2 border-stone-700 shadow-md shadow-black/50',
    botPieceInner: 'border border-stone-650',
    playableOverlay: 'ring-2 ring-teal-500 ring-offset-1 cursor-pointer',
    jumpOverlay: 'bg-rose-500/20 cursor-pointer border-2 border-rose-500',
    selectedSquare: 'bg-emerald-400/25 border-2 border-emerald-400',
    lastMoveFrom: 'bg-emerald-800/15 border-2 border-emerald-400/20 border-dashed',
    lastMoveTo: 'bg-emerald-500/15 border-2 border-emerald-400/45',
  },
  'retro-neon': {
    outerBorder: 'border-8 border-violet-950 bg-indigo-950 rounded-2xl shadow-xl shadow-indigo-950/50 p-2.5 ring-2 ring-indigo-500/30',
    darkSquare: 'bg-indigo-950 border border-indigo-900/60',
    lightSquare: 'bg-neutral-900 border border-neutral-950/50',
    userPiece: 'bg-gradient-to-br from-cyan-400 via-cyan-500 to-teal-700 border-2 border-cyan-300 shadow-lg shadow-cyan-500/30',
    userPieceInner: 'border border-cyan-300 animate-pulse',
    botPiece: 'bg-gradient-to-br from-fuchsia-500 via-pink-600 to-purple-900 border-2 border-fuchsia-400 shadow-lg shadow-pink-500/30',
    botPieceInner: 'border border-fuchsia-300',
    playableOverlay: 'ring-2 ring-green-400 ring-offset-1 ring-offset-zinc-900 cursor-pointer',
    jumpOverlay: 'bg-pink-500/20 cursor-pointer border-2 border-pink-400',
    selectedSquare: 'bg-pink-500/20 border-2 border-pink-400 shadow-lg shadow-pink-500/20',
    lastMoveFrom: 'bg-fuchsia-950/20 border-2 border-yellow-400/20 border-dashed shadow-[inset_0_0_4px_rgba(217,70,239,0.2)]',
    lastMoveTo: 'bg-yellow-500/10 border-2 border-yellow-400/45 shadow-sm shadow-yellow-500/20',
  },
  'royal-gold': {
    outerBorder: 'border-8 border-neutral-900 bg-amber-800/80 rounded-2xl shadow-xl shadow-amber-950/40 p-2.5',
    darkSquare: 'bg-[#4B1A7A] border border-[#3A145E]',
    lightSquare: 'bg-[#faecd5] border border-[#eed09c]',
    userPiece: 'bg-gradient-to-br from-yellow-300 via-amber-400 to-yellow-600 border-2 border-yellow-200 shadow-md shadow-yellow-950/40 text-neutral-900',
    userPieceInner: 'border border-yellow-100',
    botPiece: 'bg-gradient-to-br from-neutral-800 via-neutral-900 to-neutral-950 border-2 border-neutral-700 shadow-md shadow-black/60',
    botPieceInner: 'border border-neutral-650',
    playableOverlay: 'ring-2 ring-emerald-400 ring-offset-1 cursor-pointer',
    jumpOverlay: 'bg-[#9333ea]/35 cursor-pointer border-2 border-[#a855f7]',
    selectedSquare: 'bg-[#a855f7]/25 border-2 border-[#a855f7]',
    lastMoveFrom: 'bg-[#9333ea]/15 border-2 border-[#a855f7]/20 border-dashed',
    lastMoveTo: 'bg-[#a855f7]/15 border-2 border-[#a855f7]/40',
  },
};

export default function Board({
  board,
  theme,
  currentTurn,
  forceJumps,
  selectedPiece,
  setSelectedPiece,
  onMakeMove,
  mustContinueJumpingWith,
  isRotated,
  jumpedCoords = [],
  lastBotMove,
}: BoardProps) {
  const selectedTheme = THEME_CLASSES[theme];

  // Retrieve ALL current legal moves for user
  const userMoves = getValidMoves(board, 'user', forceJumps, mustContinueJumpingWith, jumpedCoords);
  const userCanJump = userMoves.some((m) => m.isJump);

  // Identify pieces that can move (or must jump) to highlight them in the UI
  const playablePiecesIds = new Set(
    userMoves.map((m) => {
      const piece = board[m.from.row][m.from.col];
      return piece ? piece.id : '';
    })
  );

  // Filter moves valid for CURRENTLY selected piece
  const selectedPieceMoves = selectedPiece
    ? userMoves.filter((m) => m.from.row === selectedPiece.row && m.from.col === selectedPiece.col)
    : [];

  const handleSquareClick = (r: number, c: number) => {
    // If it is bot turn, do not allow user moves
    if (currentTurn !== 'user') return;

    const clickedPiece = board[r][c];

    // Case 1: Clicked own piece
    if (clickedPiece && clickedPiece.player === 'user') {
      if (mustContinueJumpingWith && clickedPiece.id !== mustContinueJumpingWith) {
        // Enforce the same piece jumping warning
        sounds.playHover(); // tiny indicator
        return;
      }

      if (playablePiecesIds.has(clickedPiece.id)) {
        sounds.playSelect();
        setSelectedPiece(clickedPiece);
      } else {
        // Explain why the piece can't move
        sounds.playHover();
      }
      return;
    }

    // Case 2: Clicked target square after selecting a piece
    if (selectedPiece) {
      const matchingMove = selectedPieceMoves.find((m) => m.to.row === r && m.to.col === c);
      if (matchingMove) {
        onMakeMove(matchingMove);
        setSelectedPiece(null);
      } else {
        // De-select if clicking any other random squares that aren't playable piece selection
        if (!clickedPiece) {
          setSelectedPiece(null);
        }
      }
    }
  };

  return (
    <div
      id="board-container"
      className={`flex flex-col items-center justify-center w-full max-w-[500px] mx-auto transition-all duration-500 ease-out ${
        isRotated ? 'py-10 md:py-14' : 'py-2'
      }`}
    >
      {/* Alert Banner for Double Jump Restriction */}
      {mustContinueJumpingWith && (
        <div className="mb-3 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-[11px] text-rose-500 font-bold animate-pulse">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>Double Jump Active! You must continue jumping with the same piece.</span>
        </div>
      )}

      {/* Actual 8x8 Grid board wrap */}
      <div
        className={`w-full transition-transform duration-500 ease-out origin-center ${selectedTheme.outerBorder}`}
        style={{
          transform: isRotated ? 'rotate(45deg) scale(0.82)' : 'rotate(0deg) scale(1)',
        }}
      >
        <div className="grid grid-cols-8 grid-rows-8 gap-0 aspect-square w-full rounded-lg overflow-hidden relative">
          
          {board.map((rowArr, r) =>
            rowArr.map((piece, c) => {
              const isDarkSquare = (r + c) % 2 === 1;
              const isSelected = selectedPiece && selectedPiece.row === r && selectedPiece.col === c;

              // Check if this coordinate represents a valid target move for selected piece
              const validMove = selectedPieceMoves.find((m) => m.to.row === r && m.to.col === c);
              const isTargetMove = !!validMove;
              const isJumpTarget = validMove?.isJump;

              // Pulse highlight pieces that need to jump / are playable
              const isPlayableOwnPiece =
                currentTurn === 'user' && piece && piece.player === 'user' && playablePiecesIds.has(piece.id);

              // Pulse highlight specifically if we must double jump
              const isForcedJumpPiece = isPlayableOwnPiece && userCanJump && piece?.player === 'user';

              const isLastMoveFrom = !!(lastBotMove && lastBotMove.from.row === r && lastBotMove.from.col === c);
              const isLastMoveTo = !!(lastBotMove && lastBotMove.to.row === r && lastBotMove.to.col === c);

              return (
                <div
                  key={`${r}-${c}`}
                  onClick={() => handleSquareClick(r, c)}
                  className={`relative aspect-square w-full flex items-center justify-center select-none transition-all duration-200 ${
                    isDarkSquare ? selectedTheme.darkSquare : selectedTheme.lightSquare
                  } ${isSelected ? selectedTheme.selectedSquare : ''} ${
                    isLastMoveFrom ? selectedTheme.lastMoveFrom : ''
                  } ${isLastMoveTo ? selectedTheme.lastMoveTo : ''}`}
                >
                  
                  {/* Pieces Layer */}
                  <AnimatePresence mode="popLayout">
                    {piece && (
                      <div
                        className={`w-[85%] h-[85%] rounded-full relative flex items-center justify-center shadow-lg cursor-pointer ${
                          piece.player === 'user' ? selectedTheme.userPiece : selectedTheme.botPiece
                        } ${
                          isForcedJumpPiece
                            ? 'ring-4 ring-amber-400 ring-offset-2 animate-pulse scale-95'
                            : isPlayableOwnPiece
                            ? 'ring-2 ring-emerald-400 hover:scale-105 duration-100'
                            : ''
                        }`}
                        style={{
                          transformStyle: 'preserve-3d',
                        }}
                      >
                        {/* Inner wrapper to handle the rotation safely without overriding framer-motion's layout transform */}
                        <div
                          className="absolute inset-0 flex items-center justify-center w-full h-full"
                          style={{
                            transform: isRotated ? 'rotate(-45deg)' : 'none',
                          }}
                        >
                          {/* 3D Concentric Grooves with Theme and Color Mark styling */}
                          <div
                            className={`absolute inset-1.5 rounded-full flex items-center justify-center ${
                              piece.player === 'user' ? selectedTheme.userPieceInner : selectedTheme.botPieceInner
                            }`}
                          >
                            {/* Color indicator ring around the inner groove area */}
                            <div className={`absolute inset-0 rounded-full border-2 opacity-90 ${
                              piece.colorMark === 'yellow'
                                ? 'border-amber-400/80 shadow-[inset_0_0_4px_rgba(251,191,36,0.5)]'
                                : 'border-emerald-500/80 shadow-[inset_0_0_4px_rgba(16,185,129,0.5)]'
                            }`} />

                            <div className="w-[60%] h-[60%] rounded-full border border-black/10 opacity-60 flex items-center justify-center">
                              <div className="w-[50%] h-[50%] rounded-full border border-black/10 opacity-60 flex items-center justify-center">
                                {/* Small center gem of matching color */}
                                <div className={`w-2 h-2 rounded-full shadow-sm ${
                                  piece.colorMark === 'yellow'
                                    ? 'bg-amber-400 shadow-amber-300/50'
                                    : 'bg-emerald-500 shadow-emerald-400/50'
                                }`} />
                              </div>
                            </div>
                          </div>

                          {/* King Indicator (Crown Icon) with crown color matching the color mark */}
                          {piece.isKing && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="absolute drop-shadow-md z-20 flex items-center justify-center"
                            >
                              <Crown className={`w-4.5 h-4.5 stroke-[1.5] ${
                                piece.colorMark === 'yellow'
                                  ? 'text-amber-200 fill-amber-300'
                                  : 'text-emerald-200 fill-emerald-300'
                              }`} />
                            </motion.div>
                          )}
                        </div>
                      </div>
                    )}
                  </AnimatePresence>

                  {/* Corners / King Crowning Sign watermarks */}
                  {r === 0 && c === 0 && (
                    <div
                      className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0 p-1 opacity-80 dark:opacity-95 transition-transform duration-500"
                      style={{
                        transform: isRotated ? 'rotate(-45deg)' : 'none',
                      }}
                    >
                      <Crown className="w-[60%] h-[60%] text-rose-500/70 fill-rose-500/20 dark:text-rose-400/80 dark:fill-rose-400/30 animate-pulse stroke-[2]" />
                    </div>
                  )}

                  {r === 7 && c === 7 && (
                    <div
                      className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0 p-1 opacity-80 dark:opacity-95 transition-transform duration-500"
                      style={{
                        transform: isRotated ? 'rotate(-45deg)' : 'none',
                      }}
                    >
                      <Crown className="w-[60%] h-[60%] text-amber-500/70 fill-amber-500/20 dark:text-amber-400/80 dark:fill-amber-400/30 animate-pulse stroke-[2]" />
                    </div>
                  )}

                  {/* Highlights Targets Layer */}
                  {isTargetMove && (
                    <div
                      className={`absolute rounded-full flex items-center justify-center ${
                        isJumpTarget ? 'w-[45%] h-[45%] bg-rose-500/20 border-2 border-rose-500' : 'w-[25%] h-[25%] bg-emerald-500/35 border-2 border-emerald-500'
                      } cursor-pointer hover:scale-110 duration-200`}
                    >
                      <div className={`w-2 h-2 rounded-full ${isJumpTarget ? 'bg-rose-600' : 'bg-emerald-600'}`} />
                    </div>
                  )}

                  {/* Coordinates label (A1, B5) (rendered very subtly on first/last rows cols for elegance) */}
                  {r === 7 && (
                    <span
                      className="absolute bottom-0.5 right-1 pointer-events-none text-[8px] font-semibold text-neutral-400/50 uppercase font-mono transition-transform duration-500"
                      style={{
                        transform: isRotated ? 'rotate(-45deg)' : 'none',
                      }}
                    >
                      {String.fromCharCode(97 + c)}
                    </span>
                  )}
                  {c === 0 && (
                    <span
                      className="absolute top-0.5 left-1 pointer-events-none text-[8px] font-semibold text-neutral-400/50 font-mono transition-transform duration-500"
                      style={{
                        transform: isRotated ? 'rotate(-45deg)' : 'none',
                      }}
                    >
                      {8 - r}
                    </span>
                  )}

                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
