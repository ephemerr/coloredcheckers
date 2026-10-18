/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Trophy, Flame, Swords, ShieldAlert, BadgeInfo } from 'lucide-react';
import { GameStats, Player, Difficulty, Language } from '../types';
import { translations } from '../utils/translations';

interface StatsPanelProps {
  stats: GameStats;
  currentTurn: Player;
  isBotThinking: boolean;
  difficulty: Difficulty;
  capturedBotPieces: number; // User captured of Bot's pieces (0-12)
  capturedUserPieces: number; // Bot captured of User's pieces (0-12)
  forceJumps: boolean;
  onOpenHelp: () => void;
  language: Language;
}

export default function StatsPanel({
  stats,
  currentTurn,
  isBotThinking,
  difficulty,
  capturedBotPieces,
  capturedUserPieces,
  forceJumps,
  onOpenHelp,
  language,
}: StatsPanelProps) {
  // Total pieces initially: 12
  const userPiecesLeft = 12 - capturedUserPieces;
  const botPiecesLeft = 12 - capturedBotPieces;

  const t = (key: keyof typeof translations['en']): string => {
    return translations[language][key] || translations['en'][key];
  };

  const getDifficultyLabel = (diff: Difficulty) => {
    if (language === 'ru') {
      if (diff === 'easy') return 'Легкий';
      if (diff === 'medium') return 'Средний';
      return 'Сложный';
    }
    return diff.charAt(0).toUpperCase() + diff.slice(1);
  };

  return (
    <div id="stats-dashboard" className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
      
      {/* Turn Indicator & Bot status card */}
      <div id="turn-card" className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 p-4 rounded-2xl shadow-sm flex flex-col justify-between relative overflow-hidden group">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">{t('currentTurn')}</span>
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold ${
            difficulty === 'easy' ? 'bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400' :
            difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950/40 dark:text-yellow-400' :
            'bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400'
          }`}>
            {t('botLevelLabel')}: {getDifficultyLabel(difficulty)}
          </span>
        </div>

        <div className="mt-4 flex items-center gap-4">
          {currentTurn === 'user' ? (
            <div className="flex items-center gap-3">
              <div className="relative flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-rose-500"></span>
              </div>
              <div>
                <h4 className="font-bold text-neutral-800 dark:text-neutral-100 leading-none">{t('yourTurn')}</h4>
                <p className="text-xs text-neutral-400 mt-1">{t('yourTurnSub')}</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="relative flex h-4 w-4">
                {isBotThinking && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>}
                <span className={`relative inline-flex rounded-full h-4 w-4 ${isBotThinking ? 'bg-cyan-500 animate-pulse' : 'bg-neutral-400'}`}></span>
              </div>
              <div>
                <h4 className="font-bold text-neutral-800 dark:text-neutral-100 leading-none">
                  {isBotThinking ? t('botThinking') : t('botTurn')}
                </h4>
                <p className="text-xs text-neutral-400 mt-1">{t('botTurnSub')}</p>
              </div>
            </div>
          )}
        </div>

        {/* Decorative corner flash */}
        <div className={`absolute bottom-0 right-0 h-1.5 w-1/3 rounded-tl-full transition-colors ${
          currentTurn === 'user' ? 'bg-rose-500' : 'bg-cyan-500'
        }`} />
      </div>

      {/* Captured / Remaining pieces list */}
      <div id="pieces-card" className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 p-4 rounded-2xl shadow-sm space-y-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400 block mb-1">{t('boardMaterial')}</span>
        
        {/* User pieces remaining */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-rose-500 border border-rose-600 shadow-md flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-rose-400" />
            </div>
            <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300">{t('yourPieces')}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-sm text-neutral-800 dark:text-neutral-100">{userPiecesLeft}</span>
            <div className="flex gap-0.5 max-w-[80px] overflow-hidden">
              {Array.from({ length: Math.min(6, capturedBotPieces) }).map((_, idx) => (
                <div key={idx} className="w-1.5 h-1.5 rounded-full bg-cyan-500/50" />
              ))}
              {capturedBotPieces > 6 && <span className="text-[10px] text-neutral-400 tracking-tighter">+{capturedBotPieces - 6}</span>}
            </div>
          </div>
        </div>

        {/* Bot pieces remaining */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-neutral-800 border border-neutral-700 shadow-md flex items-center justify-center dark:bg-neutral-300 dark:border-white">
              <div className="w-1.5 h-1.5 rounded-full bg-neutral-600 dark:bg-neutral-400" />
            </div>
            <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300">{t('botPieces')}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-sm text-neutral-800 dark:text-neutral-100">{botPiecesLeft}</span>
            <div className="flex gap-0.5 max-w-[80px] overflow-hidden">
              {Array.from({ length: Math.min(6, capturedUserPieces) }).map((_, idx) => (
                <div key={idx} className="w-1.5 h-1.5 rounded-full bg-rose-500/50" />
              ))}
              {capturedUserPieces > 6 && <span className="text-[10px] text-neutral-400 tracking-tighter">+{capturedUserPieces - 6}</span>}
            </div>
          </div>
        </div>
      </div>

      {/* Session Streak and Quick Stats */}
      <div id="streak-card" className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 p-4 rounded-2xl shadow-sm flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-1">
            <Trophy className="w-4 h-4 text-amber-500" />
            <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">{t('scorecard')}</span>
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-lg font-black text-rose-500" title="User wins">{stats.userWins}</span>
            <span className="text-xs text-neutral-400">vs</span>
            <span className="text-lg font-black text-neutral-800 dark:text-neutral-100" title="Bot wins">{stats.botWins}</span>
            {stats.draws > 0 && (
              <span className="text-xs text-neutral-400">({stats.draws} D)</span>
            )}
          </div>
          <span className="text-[10px] text-neutral-400 block font-medium">{t('matches')}: {stats.matchesPlayed}</span>
        </div>

        <div className="flex flex-col items-center p-2 rounded-xl bg-orange-50 dark:bg-neutral-800/80 border border-orange-100/60 dark:border-neutral-700/50 min-w-[70px]">
          <Flame className={`w-4 h-4 ${stats.streak > 0 ? 'text-orange-500 animate-bounce' : 'text-neutral-400'}`} />
          <span className="text-xs font-black text-neutral-800 dark:text-white mt-1">
            {stats.streak > 0 ? `+${stats.streak}` : stats.streak < 0 ? stats.streak : '0'}
          </span>
          <span className="text-[9px] text-neutral-400 uppercase tracking-tighter">{t('streak')}</span>
        </div>
      </div>

      {/* Rule Notification Bar if forced jumps holds true */}
      {forceJumps && (
        <div id="force-jump-indicator" className="md:col-span-3 flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-400">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <span>
              <strong>{t('ruleActive')}</strong> {t('ruleActiveSub')}
            </span>
          </div>
          <button
            onClick={onOpenHelp}
            className="flex items-center gap-1 font-bold text-[10px] text-amber-700 dark:text-amber-400 hover:underline hover:opacity-85"
          >
            <BadgeInfo className="w-3.5 h-3.5" /> {t('explain')}
          </button>
        </div>
      )}

    </div>
  );
}
