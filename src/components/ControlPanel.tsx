/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  ShieldCheck,
  ShieldAlert,
  Palette,
  Sparkles,
  Compass,
} from 'lucide-react';
import { Difficulty, BoardTheme, Language } from '../types';
import { sounds } from '../utils/audio';
import { translations } from '../utils/translations';

interface ControlPanelProps {
  difficulty: Difficulty;
  setDifficulty: (diff: Difficulty) => void;
  theme: BoardTheme;
  setTheme: (theme: BoardTheme) => void;
  forceJumps: boolean;
  setForceJumps: (forced: boolean) => void;
  isRotated: boolean;
  setIsRotated: (rotated: boolean) => void;
  language: Language;
}

const THEMES: { id: BoardTheme; previewClass: string }[] = [
  { id: 'classic-wood', previewClass: 'bg-amber-800' },
  { id: 'minimal-slate', previewClass: 'bg-neutral-700' },
  { id: 'emerald-forest', previewClass: 'bg-emerald-800' },
  { id: 'retro-neon', previewClass: 'bg-violet-900 border-indigo-400' },
  { id: 'royal-gold', previewClass: 'bg-amber-600' },
];

export default function ControlPanel({
  difficulty,
  setDifficulty,
  theme,
  setTheme,
  forceJumps,
  setForceJumps,
  isRotated,
  setIsRotated,
  language,
}: ControlPanelProps) {
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

  const getThemeFullName = (themeId: BoardTheme) => {
    const key = `theme_${themeId}` as keyof typeof translations['en'];
    return t(key);
  };

  const getThemeShortName = (themeId: BoardTheme) => {
    const key = `theme_${themeId}_short` as keyof typeof translations['en'];
    return t(key);
  };

  return (
    <div id="game-controls" className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 p-5 rounded-2xl shadow-sm space-y-5 animate-fade-in">
      
      {/* SECTION 1: Difficulty selectors */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider block">
          {t('botLevel')}
        </label>
        <div className="grid grid-cols-3 gap-2">
          {(['easy', 'medium', 'hard'] as Difficulty[]).map((level) => {
            const isActive = difficulty === level;
            return (
              <button
                key={level}
                onClick={() => setDifficulty(level)}
                className={`py-2 px-3 text-xs font-bold rounded-xl transition-all border ${
                  isActive
                    ? 'bg-neutral-900 border-neutral-900 text-white dark:bg-white dark:border-white dark:text-neutral-900 shadow-sm'
                    : 'bg-neutral-50 border-neutral-200/60 text-neutral-600 hover:border-neutral-400 dark:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-300'
                } active:scale-95`}
              >
                {getDifficultyLabel(level)}
              </button>
            );
          })}
        </div>
      </div>

      {/* SECTION 2: Board Theme selection */}
      <div className="space-y-2">
        <div className="flex items-center gap-1.5">
          <Palette className="w-3.5 h-3.5 text-neutral-400" />
          <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider block">
            {t('boardTheme')}
          </label>
        </div>
        <div className="flex flex-wrap gap-2">
          {THEMES.map((tItem) => {
            const isSelected = theme === tItem.id;
            const fullName = getThemeFullName(tItem.id);
            const shortName = getThemeShortName(tItem.id);
            return (
              <button
                key={tItem.id}
                onClick={() => setTheme(tItem.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs rounded-xl border transition-all ${
                  isSelected
                    ? 'border-neutral-800 bg-neutral-50 dark:border-neutral-200 dark:bg-neutral-800 font-semibold text-neutral-900 dark:text-white'
                    : 'border-neutral-100 bg-transparent text-neutral-500 hover:border-neutral-300 dark:border-neutral-800 dark:text-neutral-400'
                }`}
                title={fullName}
              >
                <span className={`w-3 h-3 rounded-full ${tItem.previewClass} border border-black/10 inline-block shrink-0`} />
                <span className="truncate">{shortName}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* SECTION 3: Game Rule Toggles */}
      <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800 space-y-3">
        {/* Toggle Forced Jumps */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5 max-w-[170px]">
            <span className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block">
              {t('forcedJumps')}
            </span>
            <span className="text-[10px] text-neutral-400 block leading-tight">
              {t('forcedJumpsSub')}
            </span>
          </div>

          <button
            onClick={() => setForceJumps(!forceJumps)}
            className={`p-1.5 rounded-xl border transition-colors flex items-center justify-center ${
              forceJumps
                ? 'bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400'
                : 'bg-neutral-50 border-neutral-200 dark:bg-neutral-800 dark:border-neutral-700 text-neutral-400'
            }`}
          >
            {forceJumps ? <ShieldAlert className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
          </button>
        </div>

        {/* Toggle 45 Degrees Board Rotation */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block">
              {t('diamondView')}
            </span>
            <span className="text-[10px] text-neutral-400 block leading-tight">
              {t('diamondViewSub')}
            </span>
          </div>

          <button
            onClick={() => {
              setIsRotated(!isRotated);
              sounds.playSelect();
            }}
            className={`p-1.5 rounded-xl border transition-colors flex items-center justify-center ${
              isRotated
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                : 'bg-neutral-50 border-neutral-200 dark:bg-neutral-800 dark:border-neutral-700 text-neutral-400'
            }`}
            title="Toggle 45 degree diamond view"
          >
            <Compass className={`w-4 h-4 ${isRotated ? 'animate-spin-slow' : ''}`} />
          </button>
        </div>
      </div>

      {/* Small Bot Tip or Hint */}
      <div className="p-3 bg-neutral-50 dark:bg-neutral-800/40 rounded-xl border border-neutral-100 dark:border-neutral-850/60 flex items-start gap-2 text-[10px] text-neutral-500 dark:text-neutral-400">
        <Sparkles className="w-4 h-4 text-amber-500 shrink-0 mt-0.5 animate-pulse" />
        <div>
          <span className="font-bold text-neutral-700 dark:text-neutral-300">{t('strategyTip')}</span>
          <p className="mt-0.5 leading-tight">{t('strategyTipSub')}</p>
        </div>
      </div>

    </div>
  );
}
