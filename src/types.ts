/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Player = 'user' | 'bot';

export interface Piece {
  id: string;
  player: Player;
  isKing: boolean;
  row: number;
  col: number;
  colorMark: 'yellow' | 'green';
}

export type BoardState = (Piece | null)[][];

export interface Position {
  row: number;
  col: number;
}

export interface Move {
  from: Position;
  to: Position;
  captures: Position[]; // List of pieces captured during this jump seq
  isJump: boolean;
  afterState?: BoardState; // Temporary state after move
  jumpedPieces?: Position[]; // List of all opponent pieces jumped over (eaten or not)
}

export type Difficulty = 'easy' | 'medium' | 'hard';

export type GameStatus = 'playing' | 'won_user' | 'won_bot' | 'draw';

export type BoardTheme = 'classic-wood' | 'minimal-slate' | 'emerald-forest' | 'retro-neon' | 'royal-gold';

export interface GameStats {
  userWins: number;
  botWins: number;
  draws: number;
  matchesPlayed: number;
  streak: number; // Positive for user win streak, negative for bot win streak
}

export interface MatchHistoryEntry {
  id: string;
  date: string;
  winner: 'user' | 'bot' | 'draw';
  status: string; // "Captured all pieces", "No moves left" etc.
  durationSeconds: number;
  difficulty: Difficulty;
}

export interface HistoryState {
  board: BoardState;
  turn: Player;
  capturedUser: number;
  capturedBot: number;
  activePiece: Piece | null;
  mustContinueJumpingWith: string | null;
  lastBotMove?: Move | null;
}

export type Language = 'en' | 'ru';

