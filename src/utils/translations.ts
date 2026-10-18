/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Language } from '../types';

export const translations = {
  en: {
    // App header & Footer
    checkersTraditional: 'Diamond Checkers',
    linearMovements: 'Think out of the box!',
    matchLogs: 'Match Logs',
    unmuteTitle: 'Unmute tactical audio',
    muteTitle: 'Mute tactical audio',
    sessionRecord: 'Session Record',
    autosaved: 'Autosaved to disk',
    yourWins: 'Your Wins',
    botWins: 'Bot Wins',
    clearMatchRecords: 'Clear Match Records',
    matchHistoryLogs: 'Match History Logs',
    noFinishedMatches: 'No finished matches logged yet.',
    completeMatchDesc: 'Complete a match against the AI bot to see detailed parameters here!',
    youWonUpper: 'YOU WON',
    botWonUpper: 'BOT WON',
    difficultyLabel: 'Difficulty: ',
    estLabel: 'Est. ',
    clearAllLogs: 'Clear All Logs',
    matchesTracked: 'Matches tracked: ',
    victoryRoyale: 'Victory Royale! You Won!',
    matchFinished: 'Match Finished',
    playAgain: 'Play Again',
    close: 'Close',

    // Game end reasons & statuses
    reason_bot_all: 'The bot captured all your pieces.',
    reason_user_all: "You captured all of the bot's pieces!",
    reason_user_no_moves: 'You have run out of legal moves.',
    reason_bot_no_moves: 'The bot has run out of legal moves!',
    reason_default_user: 'All opponent materials captured.',
    reason_default_clearance: 'Total board clearance.',
    surrender: 'Surrender',
    surrenderTitle: 'Forfeit the game and concede victory to the Bot',
    proposeDraw: 'Offer Draw',
    proposeDrawTitle: 'Offer a draw to the Bot',
    drawProposed: 'Draw Offer',
    drawAccepted: 'The Bot accepted your draw offer. It\'s a tie!',
    drawDeclined: 'The Bot declined your draw offer! "I am in a much better position to win!", keeps playing.',
    reason_user_surrendered: 'You surrendered the match.',
    reason_mutual_draw: 'Mutual draw agreement.',
    reason_draw_no_shared_colors: 'Neither player has pieces of the color indicator of the other (draw due to impossible capture).',

    // Difficulties
    easy: 'Easy',
    medium: 'Medium',
    hard: 'Hard',

    // ControlPanel
    botLevel: 'Bot Level',
    boardTheme: 'Board Theme',
    forcedJumps: 'Forced Jumps',
    forcedJumpsSub: 'Jumps are mandatory (even if colors differ)',
    tactileAudio: 'Tactile Audio',
    tactileAudioSub: 'Play spatial wood clacks & crowns',
    diamondView: 'Diamond View',
    diamondViewSub: 'Rotate the checkers board 45°',
    undo: 'Undo',
    undoTitle: 'Reverse your last move',
    reset: 'Reset',
    resetTitle: 'Restart a new match from scratch',
    rules: 'Rules',
    rulesTitle: 'Read full instructions',
    strategyTip: 'Strategy Tip:',
    strategyTipSub: 'Keep your back baseline intact early on to prevent the bot from slip-crowning their pieces! Controlling the center squares provides maximum board power.',

    // Themes
    'theme_classic-wood': 'Oak & Mahogany',
    'theme_classic-wood_short': 'Mahogany',
    'theme_minimal-slate': 'Graphite Slate',
    'theme_minimal-slate_short': 'Slate',
    'theme_emerald-forest': 'Club Emerald',
    'theme_emerald-forest_short': 'Emerald',
    'theme_retro-neon': 'Cyber Neon',
    'theme_retro-neon_short': 'Neon',
    'theme_royal-gold': 'Imperial Gold',
    'theme_royal-gold_short': 'Gold',

    // StatsPanel
    currentTurn: 'Current Turn',
    botLevelLabel: 'Bot',
    yourTurn: 'Your Turn',
    yourTurnSub: 'Make a linear slide or capture',
    botThinking: 'Bot is Planning...',
    botTurn: 'Bot Turn',
    botTurnSub: 'Calculating optimal paths',
    boardMaterial: 'Board Material',
    yourPieces: 'Your Pieces:',
    botPieces: 'Bot Pieces:',
    scorecard: 'Scorecard',
    matches: 'Matches',
    streak: 'Streak',
    ruleActive: 'Rule Active:',
    ruleActiveSub: 'Jumps are mandatory! If a jump is possible, you must complete it before executing standard movements.',
    explain: 'Explain',

    // HelpModal
    howToPlay: 'How to Play Checkers',
    goalTitle: 'The Goal',
    goalText: "Capture all of the opponent's pieces or block them so they have no legal moves remaining. You play as the Red (User) pieces at the bottom, and the Black/Teal (Bot) controls the top.",
    linearSlidesTitle: 'Linear Slides',
    linearSlidesText: 'Standard pieces can only move forward linearly (one square right/down for black, or up/left for red) into any adjacent empty squares. They cannot move backwards.',
    linearJumpingTitle: 'Linear Jumping & Capturing',
    linearJumpingText: "If an opponent's piece is linearly adjacent (up, down, left, right) in your moving direction and the square directly behind it is empty, you must jump over it linearly to capture it!",
    specialRuleTitle: '🎨 Jump & Capture Special Rule:',
    specialRuleText1: '• You can jump over ANY opponent piece.',
    specialRuleText2: '• If the jumped piece has the SAME color mark (Yellow on Yellow, Green on Green), it is captured ("eaten").',
    specialRuleText3: '• If the jumped piece has a DIFFERENT color mark, you can still jump over it, but it is not captured ("eating" doesn\'t happen). Note: Kings are not obliged to perform jumps over opponents with different color markers.',
    mandatoryAlert: '⚠️ Official Rules: Jumps are mandatory! If an active jump is available anywhere on the board, you cannot make a standard slide. (This can be toggled off in settings).',
    multiJumps: '💡 Multi-Jumps: If your piece lands in a spot with another jump available, you must continue jumping with that same piece until no more jumps can be made!',
    crowningTitle: 'Crowning Kings',
    crowningText: 'When one of your pieces reaches the exact opposite corner of the board (top-left row 0, col 0 for Red, or bottom-right row 7, col 7 for Black), it is crowned a King! Kings move and jump in all 4 linear directions: they can slide with unlimited distance along empty spaces, and can jump over an opponent piece at any distance, but must land immediately on the square behind it.',
    quickInteractionsTitle: 'Quick Keyboard & Mouse Interactions:',
    quickInteractionsTip1: 'Click a piece to highlight it, and click any green-bounded circle to move.',
    quickInteractionsTip2: 'Made a mistake? Use the Undo button at the bottom navigation panel to reverse turns.',
    quickInteractionsTip3: 'Toggle custom board designs like Emerald, Retro Neon, Classic Wood, or Minimalist Slate to match your mood.',
    letsPlay: "Let's Play!",
  },
  ru: {
    // App header & Footer
    checkersTraditional: 'Шашки Алмаз',
    linearMovements: 'Мыслите нестандартно!',
    matchLogs: 'Журнал матчей',
    unmuteTitle: 'Включить тактические звуки',
    muteTitle: 'Выключить тактические звуки',
    sessionRecord: 'Рекорды сессии',
    autosaved: 'Автосохранение на диск',
    yourWins: 'Ваши победы',
    botWins: 'Победы бота',
    clearMatchRecords: 'Очистить историю матчей',
    matchHistoryLogs: 'История сыгранных матчей',
    noFinishedMatches: 'Завершенных матчей пока нет.',
    completeMatchDesc: 'Завершите матч против ИИ-бота, чтобы увидеть здесь подробную статистику!',
    youWonUpper: 'ВЫ ПОБЕДИЛИ',
    botWonUpper: 'БОТ ПОБЕДИЛ',
    difficultyLabel: 'Сложность: ',
    estLabel: 'Длительность: ',
    clearAllLogs: 'Очистить историю',
    matchesTracked: 'Всего матчей: ',
    victoryRoyale: 'Королевская победа! Вы победили!',
    matchFinished: 'Матч завершен',
    playAgain: 'Играть снова',
    close: 'Закрыть',

    // Game end reasons & statuses
    reason_bot_all: 'Бот побил все ваши фигуры.',
    reason_user_all: 'Вы побили все фигуры бота!',
    reason_user_no_moves: 'У вас закончились доступные ходы.',
    reason_bot_no_moves: 'У бота закончились доступные ходы!',
    reason_default_user: 'Все фигуры противника захвачены.',
    reason_default_clearance: 'Полная очистка доски.',
    surrender: 'Сдаться',
    surrenderTitle: 'Вы сдаетесь в этой партии, присуждая победу боту',
    proposeDraw: 'Предложить ничью',
    proposeDrawTitle: 'Предложить ничью боту',
    drawProposed: 'Предложение ничьей',
    drawAccepted: 'Бот принял ваше предложение ничьей. Ничья!',
    drawDeclined: 'Бот отклонил предложение ничьей! «У меня гораздо лучшая позиция для победы!», продолжаем игру.',
    reason_user_surrendered: 'Вы сдались.',
    reason_mutual_draw: 'Взаимное согласие на ничью.',
    reason_draw_no_shared_colors: 'Ни один игрок не имеет фигур с цветным маркером противника (ничья из-за невозможности взятия).',

    // Difficulties
    easy: 'Легкий',
    medium: 'Средний',
    hard: 'Сложный',

    // ControlPanel
    botLevel: 'Уровень бота',
    boardTheme: 'Тема доски',
    forcedJumps: 'Обязательные побития',
    forcedJumpsSub: 'Побития обязательны (даже если маркеры цвета разные)',
    tactileAudio: 'Тактильные звуки',
    tactileAudioSub: 'Звуки щелчков дерева и корон дамок',
    diamondView: 'Диагональный вид',
    diamondViewSub: 'Повернуть доску на 45°',
    undo: 'Отменить',
    undoTitle: 'Отменить ваш последний ход',
    reset: 'Сброс',
    resetTitle: 'Начать новую партию с начала',
    rules: 'Правила',
    rulesTitle: 'Прочитать полные правила игры',
    strategyTip: 'Стратегический совет:',
    strategyTipSub: 'Держите заднюю базовую линию нетронутой в начале игры, чтобы бот не смог провести свои фигуры в дамки! Контроль центра дает огромное преимущество.',

    // Themes
    'theme_classic-wood': 'Дуб и красное дерево',
    'theme_classic-wood_short': 'Дерево',
    'theme_minimal-slate': 'Аспидный сланец',
    'theme_minimal-slate_short': 'Сланец',
    'theme_emerald-forest': 'Клубный изумруд',
    'theme_emerald-forest_short': 'Изумруд',
    'theme_retro-neon': 'Кибернеон',
    'theme_retro-neon_short': 'Неон',
    'theme_royal-gold': 'Императорское золото',
    'theme_royal-gold_short': 'Золото',

    // StatsPanel
    currentTurn: 'Текущий ход',
    botLevelLabel: 'Бот',
    yourTurn: 'Ваш ход',
    yourTurnSub: 'Сделайте линейный ход или побитие',
    botThinking: 'Бот думает...',
    botTurn: 'Ход бота',
    botTurnSub: 'Вычисление оптимальных путей',
    boardMaterial: 'Фигуры на доске',
    yourPieces: 'Ваши фигуры:',
    botPieces: 'Фигуры бота:',
    scorecard: 'Счет матча',
    matches: 'Матчи',
    streak: 'Серия',
    ruleActive: 'Активное правило:',
    ruleActiveSub: 'Побития обязательны! Если доступно побитие, вы должны его выполнить перед обычным перемещением фигур.',
    explain: 'Пояснение',

    // HelpModal
    howToPlay: 'Как играть в шашки',
    goalTitle: 'Цель игры',
    goalText: 'Забрать все фигуры соперника или заблокировать их так, чтобы у него не осталось доступных ходов. Вы играете за Красные (Ваши) фигуры внизу, а Черные/Бирюзовые (Бот) управляют фигурами сверху.',
    linearSlidesTitle: 'Линейные ходы',
    linearSlidesText: 'Обычные фигуры могут ходить только вперед по прямой линии (на одну клетку вправо/вниз для черных или вверх/влево для красных) на соседние пустые клетки. Ходить назад они не могут.',
    linearJumpingTitle: 'Линейные прыжки и взятие',
    linearJumpingText: 'Если фигура соперника находится на соседней клетке по горизонтали или вертикали (вверх, вниз, влево, вправо) в вашем направлении движения, а клетка сразу за ней пуста, вы обязаны перепрыгнуть через нее по прямой линии, чтобы забрать ее!',
    specialRuleTitle: '🎨 Особое правило прыжков и взятия:',
    specialRuleText1: '• Вы можете прыгать через ЛЮБУЮ фигуру соперника.',
    specialRuleText2: '• Если перепрыгнутая фигура имеет ТАКОЙ ЖЕ цветной маркер (желтый на желтом, зеленый на зеленом), она захватывается («съедается»).',
    specialRuleText3: '• Если перепрыгнутая фигура имеет ДРУГОЙ цветной маркер, вы всё равно можете перепрыгнуть через нее, но она НЕ захватывается (взятия не происходит). Примечание: Дамка не обязана совершать прыжки через соперников с другими цветными маркерами.',
    mandatoryAlert: '⚠️ Официальные правила: Побития обязательны! Если на доске доступно хотя бы одно побитие, вы не можете сделать обычный ход. (Это можно отключить в настройках).',
    multiJumps: '💡 Серии прыжков: Если после взятия фигуры вы приземляетесь на клетку, с которой доступен еще один прыжок через другую фигуру, вы должны продолжить прыжки той же фигурой, пока доступные взятия не закончатся!',
    crowningTitle: 'Превращение в дамки',
    crowningText: 'Когда одна из ваших фигур достигает противоположного угла доски (ряд 0, колонка 0 для красных, или ряд 7, колонка 7 для черных), она коронуется в Дамку! Дамки двигаются и бьют по всем 4 линейным направлениям: они могут ходить на любое расстояние по прямой вдоль свободных клеток и перепрыгивать через соперника на любом расстоянии, приземляясь строго на клетку сразу за ним.',
    quickInteractionsTitle: 'Интерфейс и управление:',
    quickInteractionsTip1: 'Нажмите на фигуру, чтобы выбрать ее, и кликните на обведенный зеленым кружок, чтобы пойти.',
    quickInteractionsTip2: 'Сделали ошибку? Используйте кнопку «Отменить» на панели управления, чтобы вернуть ход.',
    quickInteractionsTip3: 'Выбирайте темы оформления доски: Дерево, Сланец, Изумруд, Неон или Золото под ваше настроение.',
    letsPlay: 'Поехали!',
  },
};

export function translateReason(reason: string, lang: Language): string {
  if (!reason) return '';
  const clean = reason.trim();
  
  const ruDict = translations.ru as Record<string, string>;
  const enDict = translations.en as Record<string, string>;

  if (lang === 'ru' && ruDict[clean]) {
    return ruDict[clean];
  }
  if (lang === 'en' && enDict[clean]) {
    return enDict[clean];
  }

  if (lang === 'en') return reason;

  if (clean === "The bot captured all your pieces.") return translations.ru.reason_bot_all;
  if (clean === "You captured all of the bot's pieces!") return translations.ru.reason_user_all;
  if (clean === "You have run out of legal moves.") return translations.ru.reason_user_no_moves;
  if (clean === "The bot has run out of legal moves!") return translations.ru.reason_bot_no_moves;
  if (clean === "All opponent materials captured.") return translations.ru.reason_default_user;
  if (clean === "Total board clearance.") return translations.ru.reason_default_clearance;

  return reason;
}
