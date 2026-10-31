import { STRUCTURE_LIST } from '../data/anatomyData.js';
import { QUIZ_DECKS } from './quizManager.js';
import { buildMaskedLetterHint, evaluateTypedAnatomyAnswer } from './fuzzyMatcher.js';

/**
 * Harder "Spotlight & Type" Free-Recall 3D Quiz Engine.
 * - Spotlights & glides camera to a mystery 3D structure or specific bone/tendon/membrane sub-part
 * - Hides all 3D labels & hover name tags so nothing leaks the answer
 * - Evaluates typed answers via fuzzy anatomical matching (or optional 4-option Multiple Choice)
 * - Coaches specificity ("Almost! Name the specific part of the Malleus...") without breaking streak
 */
export class RecallQuizManager {
  constructor(callbacks = {}) {
    this.callbacks = callbacks;
    this.active = false;
    this.deckKey = 'all';
    this.answerFormat = 'typed'; // 'typed' (default rigorous recall) | 'mcq'
    this.soundEnabled = true;

    this.queue = [];
    this.currentIndex = 0;
    this.currentTarget = null;
    this.mcqOptions = []; // Array of 4 Structure objects when answerFormat === 'mcq'

    this.attemptsOnCurrent = 0;
    this.parentAlreadyNamed = false;
    this.answeredCurrent = false;
    this.gaveUpCurrent = false;
    this.hintLevel = 0; // 0 = none, 1 = functional/spatial clue, 2 = masked first-letter pattern
    this.lastResult = null;

    this.score = 0;
    this.totalCompleted = 0;
    this.streak = 0;
    this.bestStreak = 0;
    this.missedIds = new Set();

    this._audioCtx = null;
  }

  _playTone(type) {
    if (!this.soundEnabled) return;
    try {
      if (!this._audioCtx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx) return;
        this._audioCtx = new AudioCtx();
      }
      if (this._audioCtx.state === 'suspended') this._audioCtx.resume();
      const now = this._audioCtx.currentTime;

      if (type === 'correct') {
        [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
          const osc = this._audioCtx.createOscillator();
          const gain = this._audioCtx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + idx * 0.048);
          gain.gain.setValueAtTime(0.001, now + idx * 0.048);
          gain.gain.exponentialRampToValueAtTime(0.1, now + idx * 0.048 + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.048 + 0.28);
          osc.connect(gain);
          gain.connect(this._audioCtx.destination);
          osc.start(now + idx * 0.048);
          osc.stop(now + idx * 0.048 + 0.3);
        });
      } else if (type === 'almost') {
        [440, 554.37].forEach((freq, idx) => {
          const osc = this._audioCtx.createOscillator();
          const gain = this._audioCtx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + idx * 0.06);
          gain.gain.setValueAtTime(0.07, now + idx * 0.06);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.06 + 0.18);
          osc.connect(gain);
          gain.connect(this._audioCtx.destination);
          osc.start(now + idx * 0.06);
          osc.stop(now + idx * 0.06 + 0.2);
        });
      } else {
        const osc = this._audioCtx.createOscillator();
        const gain = this._audioCtx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(215, now);
        osc.frequency.linearRampToValueAtTime(155, now + 0.16);
        gain.gain.setValueAtTime(0.085, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idxOrZero() + 0.18);
        osc.connect(gain);
        gain.connect(this._audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.2);
      }
    } catch {
      // Ignore blocked WebAudio
    }
  }

  start({ deckKey = this.deckKey, answerFormat = this.answerFormat, customPool = null } = {}) {
    this.active = true;
    this.deckKey = deckKey;
    this.answerFormat = answerFormat;

    let pool;
    if (customPool && customPool.length > 0) {
      pool = [...customPool];
    } else if (deckKey === 'missed' && this.missedIds.size > 0) {
      pool = STRUCTURE_LIST.filter((s) => this.missedIds.has(s.id));
    } else {
      const deck = QUIZ_DECKS[this.deckKey] || QUIZ_DECKS.all;
      pool = STRUCTURE_LIST.filter(deck.filter);
    }

    this.queue = [...pool];
    for (let i = this.queue.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.queue[i], this.queue[j]] = [this.queue[j], this.queue[i]];
    }

    this.currentIndex = 0;
    this.score = 0;
    this.totalCompleted = 0;
    this.streak = 0;
    if (deckKey !== 'missed') {
      this.missedIds.clear();
    }

    this._loadCurrentQuestion();
  }

  setAnswerFormat(format) {
    this.answerFormat = format;
    if (this.currentTarget) {
      this.mcqOptions = this._buildSmartMcqOptions(this.currentTarget);
    }
    if (this.callbacks.onStateChange) {
      this.callbacks.onStateChange(this.getState());
    }
  }

  stop() {
    this.active = false;
    this.currentTarget = null;
    if (this.callbacks.onStateChange) {
      this.callbacks.onStateChange(this.getState());
    }
  }

  _buildSmartMcqOptions(target) {
    // Prefer high-plausibility distractors from the SAME parentGroup or SAME category!
    const sameParent = STRUCTURE_LIST.filter(
      (s) => s.id !== target.id && target.parentGroup && s.parentGroup === target.parentGroup
    );
    const sameCategory = STRUCTURE_LIST.filter(
      (s) => s.id !== target.id && s.category === target.category && !sameParent.includes(s)
    );
    const others = STRUCTURE_LIST.filter(
      (s) => s.id !== target.id && !sameParent.includes(s) && !sameCategory.includes(s)
    );

    const shuffle = (arr) => {
      const copy = [...arr];
      for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
      }
      return copy;
    };

    const distractors = [
      ...shuffle(sameParent).slice(0, 2),
      ...shuffle(sameCategory),
      ...shuffle(others)
    ].slice(0, 3);

    return shuffle([target, ...distractors]);
  }

  _loadCurrentQuestion() {
    if (this.currentIndex >= this.queue.length) {
      this.currentTarget = null;
      this.answeredCurrent = true;
      if (this.callbacks.onStateChange) {
        this.callbacks.onStateChange(this.getState());
      }
      return;
    }

    this.currentTarget = this.queue[this.currentIndex];
    this.mcqOptions = this._buildSmartMcqOptions(this.currentTarget);
    this.attemptsOnCurrent = 0;
    this.parentAlreadyNamed = false;
    this.answeredCurrent = false;
    this.gaveUpCurrent = false;
    this.hintLevel = 0;
    this.lastResult = null;

    if (this.callbacks.onQuestionLoaded) {
      this.callbacks.onQuestionLoaded(this.currentTarget, this.getState());
    }
    if (this.callbacks.onStateChange) {
      this.callbacks.onStateChange(this.getState());
    }
  }

  recenterTarget() {
    if (!this.active || !this.currentTarget) return;
    if (this.callbacks.onQuestionLoaded) {
      this.callbacks.onQuestionLoaded(this.currentTarget, this.getState());
    }
  }

  requestHint() {
    if (!this.active || !this.currentTarget || this.answeredCurrent) return;
    this.hintLevel = Math.min(2, this.hintLevel + 1);
    if (this.callbacks.onStateChange) {
      this.callbacks.onStateChange(this.getState());
    }
  }

  submitTypedAnswer(rawText) {
    if (!this.active || !this.currentTarget || this.answeredCurrent) return null;

    const evalRes = evaluateTypedAnatomyAnswer(rawText, this.currentTarget, {
      parentAlreadyNamed: this.parentAlreadyNamed
    });
    if (evalRes.status === 'empty') return null;

    if (evalRes.status === 'almost') {
      // Do NOT penalize attempts or break streak — encourage naming the specific sub-part!
      this.parentAlreadyNamed = true;
      this._playTone('almost');
      this.lastResult = {
        status: 'almost',
        message: evalRes.message
      };
      if (this.callbacks.onAnswerEvaluated) {
        this.callbacks.onAnswerEvaluated(this.lastResult, this.getState());
      }
      if (this.callbacks.onStateChange) {
        this.callbacks.onStateChange(this.getState());
      }
      return this.lastResult;
    }

    this.attemptsOnCurrent += 1;

    if (evalRes.status === 'correct') {
      this.answeredCurrent = true;
      this.totalCompleted += 1;
      const firstTry = this.attemptsOnCurrent === 1 && this.hintLevel < 2;
      if (firstTry) {
        this.score += 1;
        this.streak += 1;
        this.bestStreak = Math.max(this.bestStreak, this.streak);
      } else {
        this.streak = 0;
      }

      this._playTone('correct');
      this.lastResult = {
        status: 'correct',
        exact: evalRes.exact,
        firstTry,
        target: this.currentTarget,
        userText: rawText.trim()
      };

      if (this.callbacks.onAnswerEvaluated) {
        this.callbacks.onAnswerEvaluated(this.lastResult, this.getState());
      }
      if (this.callbacks.onStateChange) {
        this.callbacks.onStateChange(this.getState());
      }
      return this.lastResult;
    }

    // Wrong answer
    this.streak = 0;
    this.missedIds.add(this.currentTarget.id);
    this._playTone('wrong');
    this.lastResult = {
      status: 'wrong',
      attempts: this.attemptsOnCurrent,
      target: this.currentTarget,
      matchedOther: evalRes.matchedOther,
      userText: rawText.trim()
    };

    if (this.callbacks.onAnswerEvaluated) {
      this.callbacks.onAnswerEvaluated(this.lastResult, this.getState());
    }
    if (this.callbacks.onStateChange) {
      this.callbacks.onStateChange(this.getState());
    }
    return this.lastResult;
  }

  submitMcqChoice(chosenId) {
    if (!this.active || !this.currentTarget || this.answeredCurrent) return null;
    this.attemptsOnCurrent += 1;

    if (chosenId === this.currentTarget.id) {
      this.answeredCurrent = true;
      this.totalCompleted += 1;
      const firstTry = this.attemptsOnCurrent === 1;
      if (firstTry) {
        this.score += 1;
        this.streak += 1;
        this.bestStreak = Math.max(this.bestStreak, this.streak);
      } else {
        this.streak = 0;
      }
      this._playTone('correct');
      this.lastResult = {
        status: 'correct',
        exact: true,
        firstTry,
        target: this.currentTarget
      };
    } else {
      this.streak = 0;
      this.missedIds.add(this.currentTarget.id);
      this._playTone('wrong');
      const other = STRUCTURE_LIST.find((s) => s.id === chosenId) || null;
      this.lastResult = {
        status: 'wrong',
        attempts: this.attemptsOnCurrent,
        target: this.currentTarget,
        matchedOther: other
      };
    }

    if (this.callbacks.onAnswerEvaluated) {
      this.callbacks.onAnswerEvaluated(this.lastResult, this.getState());
    }
    if (this.callbacks.onStateChange) {
      this.callbacks.onStateChange(this.getState());
    }
    return this.lastResult;
  }

  revealAnswer() {
    if (!this.active || !this.currentTarget || this.answeredCurrent) return;
    this.answeredCurrent = true;
    this.gaveUpCurrent = true;
    this.totalCompleted += 1;
    this.streak = 0;
    this.missedIds.add(this.currentTarget.id);
    this._playTone('wrong');

    this.lastResult = {
      status: 'revealed',
      target: this.currentTarget
    };
    if (this.callbacks.onAnswerEvaluated) {
      this.callbacks.onAnswerEvaluated(this.lastResult, this.getState());
    }
    if (this.callbacks.onStateChange) {
      this.callbacks.onStateChange(this.getState());
    }
  }

  nextQuestion() {
    if (!this.active) return;
    if (!this.answeredCurrent && this.currentTarget) {
      this.missedIds.add(this.currentTarget.id);
      this.streak = 0;
    }
    this.currentIndex += 1;
    this._loadCurrentQuestion();
  }

  getState() {
    const isFinished = this.active && this.currentIndex >= this.queue.length;
    return {
      active: this.active,
      deckKey: this.deckKey,
      answerFormat: this.answerFormat,
      isFinished,
      questionNumber: Math.min(this.currentIndex + 1, Math.max(1, this.queue.length)),
      totalQuestions: this.queue.length,
      target: this.currentTarget,
      mcqOptions: this.mcqOptions,
      answeredCurrent: this.answeredCurrent,
      gaveUpCurrent: this.gaveUpCurrent,
      hintLevel: this.hintLevel,
      maskedLetters: this.currentTarget ? buildMaskedLetterHint(this.currentTarget) : '',
      lastResult: this.lastResult,
      score: this.score,
      totalCompleted: this.totalCompleted,
      streak: this.streak,
      bestStreak: this.bestStreak,
      missedCount: this.missedIds.size
    };
  }
}

function idxOrZero() {
  return 0;
}
