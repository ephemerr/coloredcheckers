/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
import { Sparkles, Trophy, RotateCcw, HelpCircle, Diamond, Volume2, VolumeX, BarChart3, ChevronRight, GraduationCap } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Models, Logic, Components
import { BoardState, Piece, Player, Difficulty, BoardTheme, GameStats, MatchHistoryEntry, HistoryState, Move, Language } from './types';
import { initBoard, performMove, checkGameEnd, getBotMove, getValidMoves, cloneBoard } from './utils/checkersLogic';
import { sounds } from './utils/audio';
import { translations, translateReason } from './utils/translations';

import Board from './components/Board';
import ControlPanel from './components/ControlPanel';
import StatsPanel from './components/StatsPanel';
import HelpModal from './components/HelpModal';
import Confetti from './components/Confetti';

export default function App() {
  // Game Setup States
  const [board, setBoard] = useState<BoardState>(() => initBoard());
  const [lastBotMove, setLastBotMove] = useState<Move | null>(null);
  const [turn, setTurn] = useState<Player>('user');
  const [selectedPiece, setSelectedPiece] = useState<Piece | null>(null);
  
  // Customization Toggles
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [theme, setTheme] = useState<BoardTheme>('classic-wood');
  const [forceJumps, setForceJumps] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isRotated, setIsRotated] = useState<boolean>(true);
  
  // Interface Language State
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('checkers_language');
    if (saved === 'en' || saved === 'ru') return saved;
    return 'en';
  });

  const t = (key: keyof typeof translations['en']): string => {
    return translations[language][key] || translations['en'][key];
  };

  const handleLanguageToggle = () => {
    const nextLang: Language = language === 'en' ? 'ru' : 'en';
    setLanguage(nextLang);
    localStorage.setItem('checkers_language', nextLang);
    sounds.playSelect();
  };
  
  // Running Status
  const [isBotThinking, setIsBotThinking] = useState<boolean>(false);
  const [mustContinueJumpingWith, setMustContinueJumpingWith] = useState<string | null>(null);
  const [jumpedCoords, setJumpedCoords] = useState<{ row: number; col: number }[]>([]);
  const [gameStatus, setGameStatus] = useState<'playing' | 'won_user' | 'won_bot' | 'draw'>('playing');
  const [winnerReason, setWinnerReason] = useState<string>('');
  
  // Undo & History States
  const [history, setHistory] = useState<HistoryState[]>([]);
  
  // Modals & Celebrations
  const [isHelpOpen, setIsHelpOpen] = useState<boolean>(false);
  const [showVictoryConfetti, setShowVictoryConfetti] = useState<boolean>(false);
  const [drawDeclinedMessage, setDrawDeclinedMessage] = useState<boolean>(false);
  
  // Session Stats & Match Logs
  const [stats, setStats] = useState<GameStats>({
    userWins: 0,
    botWins: 0,
    draws: 0,
    matchesPlayed: 0,
    streak: 0,
  });
  const [matchHistory, setMatchHistory] = useState<MatchHistoryEntry[]>([]);

  // Keep audio sfx class in sync with isMuted state
  useEffect(() => {
    sounds.setMuted(isMuted);
  }, [isMuted]);

  // Load stats from localStorage on start
  useEffect(() => {
    const savedStats = localStorage.getItem('checkers_retro_stats');
    const savedLogs = localStorage.getItem('checkers_retro_history');
    if (savedStats) {
      try {
        setStats(JSON.parse(savedStats));
      } catch (e) {
        console.error(e);
      }
    }
    if (savedLogs) {
      try {
        setMatchHistory(JSON.parse(savedLogs));
      } catch (e) {
        console.error(e);
      }
    }

    // Open instructions modal for first-time players to guide them!
    const hasPlayedBefore = localStorage.getItem('checkers_has_played');
    if (!hasPlayedBefore) {
      setIsHelpOpen(true);
      localStorage.setItem('checkers_has_played', 'true');
    }
  }, []);

  // Sync state changes to storage
  const saveStatsToStorage = (updatedStats: GameStats, updatedLogs: MatchHistoryEntry[]) => {
    localStorage.setItem('checkers_retro_stats', JSON.stringify(updatedStats));
    localStorage.setItem('checkers_retro_history', JSON.stringify(updatedLogs));
  };

  /**
   * Resets the entire board for a new game
   */
  const handleResetGame = () => {
    setBoard(initBoard());
    setLastBotMove(null);
    setTurn('user');
    setSelectedPiece(null);
    setMustContinueJumpingWith(null);
    setGameStatus('playing');
    setWinnerReason('');
    setShowVictoryConfetti(false);
    setIsBotThinking(false);
    setHistory([]);
    sounds.playClack();
  };

  /**
   * Erases match log and session streak
   */
  const handleClearHistory = () => {
    const freshStats = {
      userWins: 0,
      botWins: 0,
      draws: 0,
      matchesPlayed: 0,
      streak: 0,
    };
    setStats(freshStats);
    setMatchHistory([]);
    localStorage.removeItem('checkers_retro_stats');
    localStorage.removeItem('checkers_retro_history');
  };

  /**
   * Save a point-of-return checkpoint in history
   */
  const saveUndoCheckpoint = (currentBoard: BoardState) => {
    const checkpoint: HistoryState = {
      board: cloneBoard(currentBoard),
      turn: 'user', // Always checkpoint right as user is about to make their choice
      capturedUser: getCapturedCount(currentBoard, 'user'),
      capturedBot: getCapturedCount(currentBoard, 'bot'),
      activePiece: selectedPiece,
      mustContinueJumpingWith: mustContinueJumpingWith,
      lastBotMove: lastBotMove,
    };
    setHistory((prev) => [...prev, checkpoint]);
  };

  /**
   * Execute undo
   */
  const handleUndo = () => {
    if (history.length === 0 || isBotThinking) return;

    sounds.playSelect();
    const prevHistory = [...history];
    const previousState = prevHistory.pop();

    if (previousState) {
      setBoard(previousState.board);
      setTurn(previousState.turn);
      setSelectedPiece(previousState.activePiece);
      setMustContinueJumpingWith(previousState.mustContinueJumpingWith);
      setLastBotMove(previousState.lastBotMove || null);
      setGameStatus('playing');
      setWinnerReason('');
      setShowVictoryConfetti(false);
      setHistory(prevHistory);
    }
  };

  /**
   * Count how many pieces are captured for a given player
   * Initial count is 12 total. Capture total = 12 - existing.
   */
  const getCapturedCount = (currBoard: BoardState, player: Player): number => {
    let count = 0;
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = currBoard[r][c];
        if (piece && piece.player === player) {
          count++;
        }
      }
    }
    return 12 - count;
  };

  const capturedBotPieces = getCapturedCount(board, 'bot'); // pieces bot lost
  const capturedUserPieces = getCapturedCount(board, 'user'); // pieces user lost

  /**
   * Checks for game over conditions, updates stats and logs histories
   */
  const handleGameOverEvaluation = (nextBoard: BoardState, currentTurn: Player) => {
    const endCheck = checkGameEnd(nextBoard, currentTurn, forceJumps);
    if (endCheck.ended && endCheck.winner) {
      const winner = endCheck.winner;
      
      if (winner === 'draw') {
        setGameStatus('draw');
        setWinnerReason(endCheck.reason || 'reason_mutual_draw');

        const updatedStats = { ...stats };
        updatedStats.matchesPlayed += 1;
        updatedStats.draws += 1;
        updatedStats.streak = 0; // reset streak

        const matchEntry: MatchHistoryEntry = {
          id: `match-${Date.now()}`,
          date: new Date().toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          }),
          winner: 'draw',
          status: endCheck.reason || 'reason_mutual_draw',
          durationSeconds: Math.floor(Math.random() * 120 + 90),
          difficulty: difficulty,
        };

        const freshLogs = [matchEntry, ...matchHistory];
        setStats(updatedStats);
        setMatchHistory(freshLogs);
        saveStatsToStorage(updatedStats, freshLogs);
        return true;
      }

      setGameStatus(winner === 'user' ? 'won_user' : 'won_bot');
      setWinnerReason(endCheck.reason || 'All opponent materials captured.');

      // Update streaks and match counts
      const updatedStats = { ...stats };
      updatedStats.matchesPlayed += 1;

      if (winner === 'user') {
        updatedStats.userWins += 1;
        updatedStats.streak = updatedStats.streak > 0 ? updatedStats.streak + 1 : 1;
        setShowVictoryConfetti(true);
        sounds.playWin();
      } else {
        updatedStats.botWins += 1;
        updatedStats.streak = updatedStats.streak < 0 ? updatedStats.streak - 1 : -1;
        sounds.playLose();
      }

      const matchEntry: MatchHistoryEntry = {
        id: `match-${Date.now()}`,
        date: new Date().toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
        winner: winner,
        status: endCheck.reason || 'Total board clearance.',
        durationSeconds: Math.floor(Math.random() * 120 + 90), // Mock game length for fun
        difficulty: difficulty,
      };

      const freshLogs = [matchEntry, ...matchHistory];
      setStats(updatedStats);
      setMatchHistory(freshLogs);
      saveStatsToStorage(updatedStats, freshLogs);
      return true;
    }
    return false;
  };

  /**
   * Forfeits the game and awards win to Bot
   */
  const handleSurrender = () => {
    if (gameStatus !== 'playing') return;

    sounds.playLose();
    setGameStatus('won_bot');
    setWinnerReason('reason_user_surrendered');

    // Update stats and histories
    const updatedStats = { ...stats };
    updatedStats.matchesPlayed += 1;
    updatedStats.botWins += 1;
    updatedStats.streak = updatedStats.streak < 0 ? updatedStats.streak - 1 : -1;

    const matchEntry: MatchHistoryEntry = {
      id: `match-${Date.now()}`,
      date: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      winner: 'bot',
      status: 'reason_user_surrendered',
      durationSeconds: Math.floor(Math.random() * 60 + 30),
      difficulty: difficulty,
    };

    const freshLogs = [matchEntry, ...matchHistory];
    setStats(updatedStats);
    setMatchHistory(freshLogs);
    saveStatsToStorage(updatedStats, freshLogs);
  };

  /**
   * Propose a draw to the bot.
   */
  const handleProposeDraw = () => {
    if (gameStatus !== 'playing') return;

    // Evaluate bot material vs user material
    const userPieces = 12 - getCapturedCount(board, 'user');
    const botPieces = 12 - getCapturedCount(board, 'bot');

    // Decision logic
    let accepts = false;
    if (botPieces - userPieces >= 2) {
      // Bot is significantly winning and declines
      accepts = false;
    } else if (difficulty === 'easy') {
      accepts = Math.random() < 0.85 || botPieces <= userPieces;
    } else if (difficulty === 'medium') {
      accepts = Math.random() < 0.50 || botPieces < userPieces;
    } else {
      // Hard mode: only accepts draw if balanced and few pieces remain
      accepts = (botPieces < userPieces) && (botPieces <= 4);
    }

    if (accepts) {
      sounds.playSelect();
      setGameStatus('draw');
      setWinnerReason('reason_mutual_draw');

      const updatedStats = { ...stats };
      updatedStats.matchesPlayed += 1;
      updatedStats.draws += 1;
      updatedStats.streak = 0; // reset streak

      const matchEntry: MatchHistoryEntry = {
        id: `match-${Date.now()}`,
        date: new Date().toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
        winner: 'draw',
        status: 'reason_mutual_draw',
        durationSeconds: Math.floor(Math.random() * 120 + 90),
        difficulty: difficulty,
      };

      const freshLogs = [matchEntry, ...matchHistory];
      setStats(updatedStats);
      setMatchHistory(freshLogs);
      saveStatsToStorage(updatedStats, freshLogs);
    } else {
      // Declined draw
      sounds.playLose();
      setDrawDeclinedMessage(true);
      setTimeout(() => {
        setDrawDeclinedMessage(false);
      }, 5000);
    }
  };

  /**
   * Action when the user executes their move
   */
  const handleUserMove = (move: Move) => {
    if (turn !== 'user' || isBotThinking) return;

    // Save history right before applying user changes
    saveUndoCheckpoint(board);

    // Perform move
    const { newBoard, didCrown } = performMove(board, move);

    // Audio SFX
    if (didCrown) {
      sounds.playCrown();
    } else {
      sounds.playClack(move.isJump);
    }

    // Handle double jump requirements: if user made a jump, does that landing piece have more jumps?
    if (move.isJump) {
      const landingR = move.to.row;
      const landingC = move.to.col;
      const landingPiece = newBoard[landingR][landingC];
      
      if (landingPiece) {
        const firstJumped = move.jumpedPieces && move.jumpedPieces.length > 0
          ? move.jumpedPieces
          : [{ row: (move.from.row + move.to.row) / 2, col: (move.from.col + move.to.col) / 2 }];
        const updatedCoords = [...jumpedCoords, ...firstJumped];

        // Evaluate jump moves strictly starting from this landing piece, avoiding already jumped pieces
        const nextJumps = getValidMoves(newBoard, 'user', true, landingPiece.id, updatedCoords);
        const hasContinuingJumps = nextJumps.length > 0 && nextJumps[0].isJump;

        if (hasContinuingJumps) {
          // Keep user turn active, restrict selection to this specific piece
          setBoard(newBoard);
          setMustContinueJumpingWith(landingPiece.id);
          setSelectedPiece(landingPiece);
          setJumpedCoords(updatedCoords);
          
          // Verify end status
          handleGameOverEvaluation(newBoard, 'user');
          return;
        }
      }
    }

    // Standard turn handover to Bot
    setMustContinueJumpingWith(null);
    setJumpedCoords([]);
    setBoard(newBoard);

    // Check game over
    const ended = handleGameOverEvaluation(newBoard, 'bot');
    if (!ended) {
      setTurn('bot');
    }
  };

  // Bot Turn Effect Hook
  useEffect(() => {
    if (turn !== 'bot' || gameStatus !== 'playing') return;

    setIsBotThinking(true);

    // Introduce natural delay (800ms) for planning indicator
    const timer = setTimeout(() => {
      let currentBoard = cloneBoard(board);
      let activeBotMoves = getValidMoves(currentBoard, 'bot', forceJumps);

      if (activeBotMoves.length === 0) {
        setIsBotThinking(false);
        handleGameOverEvaluation(currentBoard, 'bot');
        return;
      }

      // Compute optimal move
      const botMove = getBotMove(currentBoard, forceJumps, difficulty);
      if (!botMove) {
        setIsBotThinking(false);
        setTurn('user');
        return;
      }

      // Execute Bot move
      const { newBoard, didCrown } = performMove(currentBoard, botMove);
      
      if (didCrown) {
        sounds.playCrown();
      } else {
        sounds.playClack(botMove.isJump);
      }

      // Handle continuous multi-jump logic if the bot landed in custom double jumps
      let finalBoard = newBoard;
      let nextLandingR = botMove.to.row;
      let nextLandingC = botMove.to.col;
      let landedPiece = finalBoard[nextLandingR][nextLandingC];

      if (botMove.isJump && landedPiece) {
        const firstJumped = botMove.jumpedPieces && botMove.jumpedPieces.length > 0
          ? botMove.jumpedPieces
          : [{ row: (botMove.from.row + botMove.to.row) / 2, col: (botMove.from.col + botMove.to.col) / 2 }];
        const localJumped = [...firstJumped];
        let subsequentJumps = getValidMoves(finalBoard, 'bot', true, landedPiece.id, localJumped);
        
        // Stagger bot double-jumps if there are chains!
        if (subsequentJumps.length > 0 && subsequentJumps[0].isJump) {
          // Simple greedy select for secondary jumps
          const subJump = subsequentJumps[0];
          const executeSub = () => {
            const subRes = performMove(finalBoard, subJump);
            finalBoard = subRes.newBoard;
            if (subRes.didCrown) {
              sounds.playCrown();
            } else {
              sounds.playClack(true);
            }
            
            const subMid = subJump.jumpedPieces && subJump.jumpedPieces.length > 0
              ? subJump.jumpedPieces[0]
              : { row: (subJump.from.row + subJump.to.row) / 2, col: (subJump.from.col + subJump.to.col) / 2 };
            localJumped.push(subMid);

            // Re-evaluate if any triple jumps exists
            const tripleCheckPiece = finalBoard[subJump.to.row][subJump.to.col];
            let finalLandingPos = subJump.to;
            if (tripleCheckPiece) {
              const tripleJumps = getValidMoves(finalBoard, 'bot', true, tripleCheckPiece.id, localJumped);
              if (tripleJumps.length > 0 && tripleJumps[0].isJump) {
                const trRes = performMove(finalBoard, tripleJumps[0]);
                finalBoard = trRes.newBoard;
                sounds.playClack(true);
                finalLandingPos = tripleJumps[0].to;
              }
            }

            setLastBotMove({
              from: botMove.from,
              to: finalLandingPos,
              captures: [],
              isJump: true
            });
            setBoard(finalBoard);
            setIsBotThinking(false);
            const gameOver = handleGameOverEvaluation(finalBoard, 'user');
            if (!gameOver) setTurn('user');
          };
          
          // Execute staggered transition for visual clarity
          setTimeout(executeSub, 400);
          return;
        }
      }

      // Direct end of Bot Turn
      setLastBotMove(botMove);
      setBoard(finalBoard);
      setIsBotThinking(false);
      const gameOver = handleGameOverEvaluation(finalBoard, 'user');
      if (!gameOver) {
        setTurn('user');
      }
    }, 800);

    return () => clearTimeout(timer);
  }, [turn, gameStatus, board, difficulty, forceJumps]);

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 text-neutral-800 dark:text-neutral-100 transition-colors duration-300 flex flex-col justify-between">
      
      {/* Victory Celebration particle canvas */}
      {showVictoryConfetti && <Confetti />}

      {/* Top Navigation Bar / Brand & Language */}
      <header className="w-full bg-white dark:bg-neutral-900 border-b border-neutral-100 dark:border-neutral-800 p-4 transition-colors duration-300">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-rose-500 rounded-lg text-white">
              <Diamond className="w-4 h-4 fill-current" />
            </div>
            <div>
              <p className="text-xs font-bold leading-none font-sans">{t('checkersTraditional')}</p>
              <p className="text-[9px] text-neutral-400 font-medium mt-0.5">{t('linearMovements')}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Simple Mute Indicator */}
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="p-1.5 rounded-xl border border-neutral-150 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-neutral-500 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-all active:scale-95 shadow-sm cursor-pointer"
              title={isMuted ? t('unmuteTitle') : t('muteTitle')}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-neutral-400" /> : <Volume2 className="w-4 h-4 text-emerald-500" />}
            </button>

            <button
              onClick={handleLanguageToggle}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-extrabold rounded-xl border border-neutral-150 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-neutral-600 dark:text-neutral-300 hover:border-neutral-300 dark:hover:border-neutral-700 transition-all active:scale-95 shadow-sm cursor-pointer"
            >
              <span className="text-sm shrink-0">🌐</span>
              <span>{language === 'en' ? 'English' : 'Русский'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Primary Board, stats, and controls panel arrangement */}
      <main className="max-w-7xl mx-auto px-4 py-8 flex-1 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left / Middle: Board column */}
          <section className="lg:col-span-7 flex flex-col items-center gap-6">
            
            {/* Game Over Modal Overlays or custom statuses inline */}
            <AnimatePresence>
              {gameStatus !== 'playing' && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={`w-full max-w-[500px] p-5 rounded-2xl border text-center relative overflow-hidden flex flex-col items-center justify-center space-y-3 ${
                    gameStatus === 'won_user'
                      ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-800 dark:text-emerald-400'
                      : gameStatus === 'draw'
                      ? 'bg-amber-500/10 border-amber-500/20 text-amber-800 dark:text-amber-400'
                      : 'bg-rose-500/10 border-rose-500/20 text-rose-800 dark:text-rose-400'
                  }`}
                >
                  <Trophy className={`w-8 h-8 ${gameStatus === 'won_user' ? 'text-emerald-500 animate-bounce' : gameStatus === 'draw' ? 'text-amber-500 animate-pulse' : 'text-rose-500'}`} />
                  <div>
                    <h3 className="font-bold text-base">
                      {gameStatus === 'won_user' ? t('victoryRoyale') : gameStatus === 'draw' ? t('drawProposed') : t('matchFinished')}
                    </h3>
                    <p className="text-xs opacity-90 mt-1 max-w-sm">{translateReason(winnerReason, language)}</p>
                  </div>
                  <button
                    onClick={handleResetGame}
                    className="flex items-center gap-1.5 px-4 py-2 mt-2 font-bold text-xs text-white bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100 rounded-xl transition-all shadow active:scale-95"
                  >
                    {t('playAgain')}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Draw Declined Toast Notification */}
            <AnimatePresence>
              {drawDeclinedMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  className="w-full max-w-[500px] p-4 rounded-xl border bg-amber-500/10 border-amber-500/20 text-center text-amber-800 dark:text-amber-400 font-sans shadow-sm"
                >
                  <p className="text-xs font-bold">{t('drawDeclined')}</p>
                </motion.div>
              )}
            </AnimatePresence>

            <Board
              board={board}
              theme={theme}
              currentTurn={turn}
              forceJumps={forceJumps}
              selectedPiece={selectedPiece}
              setSelectedPiece={setSelectedPiece}
              onMakeMove={handleUserMove}
              mustContinueJumpingWith={mustContinueJumpingWith}
              isRotated={isRotated}
              jumpedCoords={jumpedCoords}
              lastBotMove={lastBotMove}
            />

            {/* In-game action controls: Undo / Reset / Help + Surrender / Offer Draw */}
            <div className="w-full max-w-[500px] bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 p-4 rounded-2xl shadow-sm space-y-3">
              {/* Offer Draw and Surrender buttons when playing */}
              {gameStatus === 'playing' && (
                <div className="grid grid-cols-2 gap-2 pb-2.5 border-b border-neutral-100 dark:border-neutral-800">
                  {/* Offer Draw Button */}
                  <button
                    onClick={handleProposeDraw}
                    className="flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-bold rounded-xl border bg-amber-500/10 border-amber-500/25 text-amber-700 dark:text-amber-400 hover:bg-amber-500/15 active:scale-95 transition-all cursor-pointer"
                    title={t('proposeDrawTitle')}
                  >
                    <HelpCircle className="w-4 h-4 text-amber-500" />
                    <span>{t('proposeDraw')}</span>
                  </button>
                  {/* Surrender Button */}
                  <button
                    onClick={handleSurrender}
                    className="flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-bold rounded-xl border bg-rose-500/10 border-rose-500/25 text-rose-700 dark:text-rose-400 hover:bg-rose-500/15 active:scale-95 transition-all cursor-pointer"
                    title={t('surrenderTitle')}
                  >
                    <Trophy className="w-3.5 h-3.5 text-rose-500" />
                    <span>{t('surrender')}</span>
                  </button>
                </div>
              )}

              {/* Undo / Rules grid */}
              <div className="grid grid-cols-2 gap-2">
                {/* Undo Button */}
                <button
                  onClick={handleUndo}
                  disabled={!(history.length > 0 && !isBotThinking)}
                  className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all cursor-pointer ${
                    history.length > 0 && !isBotThinking
                      ? 'bg-neutral-50 border-neutral-200 dark:bg-neutral-800 dark:border-neutral-700 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-750 active:scale-95'
                      : 'bg-neutral-50/50 border-neutral-100 dark:bg-neutral-900/40 dark:border-neutral-800/60 text-neutral-300 dark:text-neutral-600 cursor-not-allowed'
                  }`}
                  title={t('undoTitle')}
                >
                  <RotateCcw className="w-4 h-4 mb-1" />
                  <span className="text-[10px] font-bold">{t('undo')}</span>
                </button>

                {/* Explain Rulebook / Help */}
                <button
                  onClick={() => setIsHelpOpen(true)}
                  className="flex flex-col items-center justify-center p-2 rounded-xl bg-neutral-50 border border-neutral-200 dark:bg-neutral-800 dark:border-neutral-700 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-750 active:scale-95 transition-all cursor-pointer"
                  title={t('rulesTitle')}
                >
                  <HelpCircle className="w-4 h-4 mb-1 text-amber-500" />
                  <span className="text-[10px] font-bold">{t('rules')}</span>
                </button>
              </div>
            </div>

            {/* Quick interactive stats dashboard */}
            <StatsPanel
              stats={stats}
              currentTurn={turn}
              isBotThinking={isBotThinking}
              difficulty={difficulty}
              capturedBotPieces={capturedBotPieces}
              capturedUserPieces={capturedUserPieces}
              forceJumps={forceJumps}
              onOpenHelp={() => setIsHelpOpen(true)}
              language={language}
            />
          </section>

          {/* Right Column: Settings + Control panel */}
          <section className="lg:col-span-5 space-y-6">
            
            {/* Controller interface */}
            <ControlPanel
              difficulty={difficulty}
              setDifficulty={setDifficulty}
              theme={theme}
              setTheme={setTheme}
              forceJumps={forceJumps}
              setForceJumps={setForceJumps}
              isRotated={isRotated}
              setIsRotated={setIsRotated}
              language={language}
            />



          </section>

        </div>
      </main>

      {/* RULES / INSTRUCTIONS DIALOG MODAL */}
      <HelpModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
        language={language}
        onLanguageToggle={handleLanguageToggle}
      />

    </div>
  );
}
