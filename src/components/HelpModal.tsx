/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { X, BookOpen, Crown, ArrowRightLeft, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Language } from '../types';
import { translations } from '../utils/translations';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  onLanguageToggle?: () => void;
}

export default function HelpModal({ isOpen, onClose, language, onLanguageToggle }: HelpModalProps) {
  const t = (key: keyof typeof translations['en']): string => {
    return translations[language][key] || translations['en'][key];
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div id="help-modal-overlay" className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-neutral-900/60 backdrop-blur-sm"
          />

          {/* Dialog Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', duration: 0.4 }}
            className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 text-neutral-800 dark:text-neutral-100 z-10"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 px-6 py-4">
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-amber-500" />
                <h3 className="text-lg font-bold font-sans tracking-tight">{t('howToPlay')}</h3>
              </div>
              
              <div className="flex items-center gap-2">
                {onLanguageToggle && (
                  <button
                    onClick={onLanguageToggle}
                    className="flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-extrabold rounded-lg border border-neutral-150 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-neutral-600 dark:text-neutral-300 hover:border-neutral-300 dark:hover:border-neutral-700 transition-all active:scale-95 shadow-sm"
                    title={language === 'en' ? 'Switch to Russian' : 'Переключить на английский'}
                  >
                    <span className="text-xs shrink-0">🌐</span>
                    <span>{language === 'en' ? 'EN' : 'RU'}</span>
                  </button>
                )}
                
                <button
                  onClick={onClose}
                  className="rounded-lg p-1.5 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                  aria-label="Close rules"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Content body */}
            <div className="max-h-[70vh] overflow-y-auto p-6 space-y-5">
              
              {/* Objective */}
              <div className="space-y-1">
                <h4 className="font-semibold text-sm text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">{t('goalTitle')}</h4>
                <p className="text-sm leading-relaxed">
                  {t('goalText')}
                </p>
              </div>

              {/* Basic Movement */}
              <div className="flex gap-3 items-start">
                <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-500 mt-0.5">
                  <ArrowRightLeft className="w-4 h-4" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-sm">{t('linearSlidesTitle')}</h4>
                  <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed">
                    {t('linearSlidesText')}
                  </p>
                </div>
              </div>

              {/* Jumps and Captures */}
              <div className="flex gap-3 items-start">
                <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 mt-0.5">
                  <ShieldAlert className="w-4 h-4" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-sm">{t('linearJumpingTitle')}</h4>
                  <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed">
                    {t('linearJumpingText')}
                  </p>
                  <div className="text-xs text-emerald-600 dark:text-emerald-450 font-extrabold flex flex-col gap-1 py-1 bg-emerald-50/50 dark:bg-emerald-950/20 px-2 rounded-lg border border-emerald-100 dark:border-emerald-900/40">
                    <span className="flex items-center gap-1">{t('specialRuleTitle')}</span>
                    <span className="font-normal">{t('specialRuleText1')}</span>
                    <span className="font-normal">{t('specialRuleText2')}</span>
                    <span className="font-normal">{t('specialRuleText3')}</span>
                  </div>
                  <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                    {t('mandatoryAlert')}
                  </p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    {t('multiJumps')}
                  </p>
                </div>
              </div>

              {/* Kings crowning */}
              <div className="flex gap-3 items-start">
                <div className="p-2 rounded-lg bg-yellow-50 dark:bg-yellow-950/40 text-yellow-600 mt-0.5">
                  <Crown className="w-4 h-4" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-sm">{t('crowningTitle')}</h4>
                  <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed">
                    {t('crowningText')}
                  </p>
                </div>
              </div>

              {/* Double check tips */}
              <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-100 dark:border-neutral-800 text-xs text-neutral-500 dark:text-neutral-400 space-y-1.5">
                <p className="font-semibold text-neutral-700 dark:text-neutral-300">{t('quickInteractionsTitle')}</p>
                <li>{t('quickInteractionsTip1')}</li>
                <li>{t('quickInteractionsTip2')}</li>
                <li>{t('quickInteractionsTip3')}</li>
              </div>

            </div>

            {/* Footer */}
            <div className="bg-neutral-50 dark:bg-neutral-800/40 border-t border-neutral-100 dark:border-neutral-800 px-6 py-4 flex justify-end">
              <button
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-white bg-amber-500 hover:bg-amber-600 dark:bg-amber-600 dark:hover:bg-amber-500 rounded-xl transition-all shadow-md active:scale-95"
              >
                {t('letsPlay')}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
