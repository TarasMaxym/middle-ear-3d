import { CATEGORIES, STRUCTURE_LIST } from '../data/anatomyData.js';

export const QUIZ_DECKS = {
  all: {
    label: `All Structures & Sub-Parts (${STRUCTURE_LIST.length})`,
    filter: () => true
  },
  core: {
    label: `Core Landmarks (${STRUCTURE_LIST.filter((s) => s.tier <= 2).length})`,
    filter: (s) => s.tier <= 2
  },
  detailed: {
    label: `Specific Bone Parts, Tendons & Micro-Regions (${STRUCTURE_LIST.filter((s) => s.tier === 3).length})`,
    filter: (s) => s.tier === 3
  },
  ossicles_muscles: {
    label: 'Ossicle Sub-Parts, Joints, Muscles & Tendons',
    filter: (s) =>
      s.category === CATEGORIES.OSSICLES ||
      s.parentGroup === 'tensor_tympani' ||
      s.parentGroup === 'stapedius_muscle'
  },
  walls_drum_windows: {
    label: '6 Walls, Eardrum Regions & Wall Landmarks',
    filter: (s) =>
      s.category === CATEGORIES.WALLS ||
      s.category === CATEGORIES.MEDIAL ||
      s.category === CATEGORIES.OPENINGS
  },
  nerves_neighbors: {
    label: 'Cranial Nerves, Inner/Outer Ear & Vessels',
    filter: (s) =>
      s.category === CATEGORIES.NEIGHBORS ||
      (s.category === CATEGORIES.NEUROMUSCULAR &&
        s.parentGroup !== 'tensor_tympani' &&
        s.parentGroup !== 'stapedius_muscle')
  }
};

export class SpatialQuizManager {
  constructor(callbacks = {}) {
    this.callbacks = callbacks;
    this.active = false;
    this.deckKey = 'all';
    this.promptStyle = 'mixed'; // 'name' | 'clue' | 'mixed'
    this.soundEnabled = true;

    this.queue = [];
    this.currentIndex = 0;
    this.currentTarget = null;
    this.currentPromptMode = 'name';
    this.attemptsOnCurrent = 0;
    this.answeredCurrent = false;
    this.hintShown = false;
    this.beaconShown = false;

    this.score = 0;
    this.totalCompleted = 0;
    this.streak = 0;
    this.bestStreak = 0;
    this.missedIds = new Set();

    this._audioCtx = null;
    this._autoNextTimer = null;
  }

  _playTone(type) {
    if (!this.soundEnabled) return;
    try {
      if (!this._audioCtx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx) return;
        this._audioCtx = new AudioCtx();
      }
      if (this._audioCtx.state === 'suspended') {
        this._audioCtx.resume();
      }
      const now = this._audioCtx.currentTime;

      if (type === 'correct') {
        // Crisp major triad chime (C5 -> E5 -> G5)
        [523.25, 659.25, 783.99].forEach((freq, idx) => {
          const osc = this._audioCtx.createOscillator();
          const gain = this._audioCtx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + idx * 0.055);
          gain.gain.setValueAtTime(0.001, now + idx * 0.055);
          gain.gain.exponentialRampToValueAtTime(0.11, now + idx * 0.055 + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.055 + 0.28);
          osc.connect(gain);
          gain.connect(this._audioCtx.destination);
          osc.start(now + idx * 0.055);
          osc.stop(now + idx * 0.055 + 0.3);
        });
      } else if (type === 'wrong') {
        const osc = this._audioCtx.createOscillator();
        const gain = this._audioCtx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(210, now);
        osc.frequency.linearRampToValueAtTime(155, now + 0.16);
        gain.gain.setValueAtTime(0.09, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);
        osc.connect(gain);
        gain.connect(this._audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.2);
      }
    } catch {
      // Ignore audio errors if blocked
    }
  }

  start({ deckKey = this.deckKey, promptStyle = this.promptStyle } = {}) {
    this.clearAutoTimer();
    this.active = true;
    this.deckKey = deckKey;
    this.promptStyle = promptStyle;

    const deck = QUIZ_DECKS[this.deckKey] || QUIZ_DECKS.all;
    const pool = STRUCTURE_LIST.filter(deck.filter);

    // Fisher-Yates shuffle
    this.queue = [...pool];
    for (let i = this.queue.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.queue[i], this.queue[j]] = [this.queue[j], this.queue[i]];
    }

    this.currentIndex = 0;
    this.score = 0;
    this.totalCompleted = 0;
    this.streak = 0;
    this.missedIds.clear();

    this._loadCurrentQuestion();
  }

  stop() {
    this.clearAutoTimer();
    this.active = false;
    this.currentTarget = null;
    this.beaconShown = false;
    if (this.callbacks.onStateChange) {
      this.callbacks.onStateChange(this.getState());
    }
  }

  clearAutoTimer() {
    if (this._autoNextTimer) {
      clearTimeout(this._autoNextTimer);
      this._autoNextTimer = null;
    }
  }

  _loadCurrentQuestion() {
    this.clearAutoTimer();
    if (this.currentIndex >= this.queue.length) {
      this.currentTarget = null;
      this.answeredCurrent = true;
      if (this.callbacks.onRoundComplete) {
        this.callbacks.onRoundComplete(this.getState());
      }
      if (this.callbacks.onStateChange) {
        this.callbacks.onStateChange(this.getState());
      }
      return;
    }

    this.currentTarget = this.queue[this.currentIndex];
    this.attemptsOnCurrent = 0;
    this.answeredCurrent = false;
    this.hintShown = false;
    this.beaconShown = false;

    if (this.promptStyle === 'name') {
      this.currentPromptMode = 'name';
    } else if (this.promptStyle === 'clue') {
      this.currentPromptMode = 'clue';
    } else {
      this.currentPromptMode = this.currentIndex % 2 === 0 ? 'name' : 'clue';
    }

    if (this.callbacks.onQuestionLoaded) {
      this.callbacks.onQuestionLoaded(this.currentTarget, this.getState());
    }
    if (this.callbacks.onStateChange) {
      this.callbacks.onStateChange(this.getState());
    }
  }

  submitPick(pickedStructure) {
    if (!this.active || !this.currentTarget || this.answeredCurrent || !pickedStructure) {
      return null;
    }

    this.attemptsOnCurrent += 1;

    if (pickedStructure.id === this.currentTarget.id) {
      this.answeredCurrent = true;
      this.totalCompleted += 1;
      const firstTry = this.attemptsOnCurrent === 1 && !this.beaconShown;
      if (firstTry) {
        this.score += 1;
        this.streak += 1;
        this.bestStreak = Math.max(this.bestStreak, this.streak);
      } else {
        this.streak = 0;
      }

      this._playTone('correct');

      const result = {
        correct: true,
        firstTry,
        target: this.currentTarget,
        picked: pickedStructure
      };

      if (this.callbacks.onPickResult) {
        this.callbacks.onPickResult(result, this.getState());
      }
      if (this.callbacks.onStateChange) {
        this.callbacks.onStateChange(this.getState());
      }

      // Gentle auto-advance after 3.4s so player can stay in Creative flight without touching UI!
      this._autoNextTimer = setTimeout(() => {
        if (this.active && this.answeredCurrent) {
          this.nextQuestion();
        }
      }, 3400);

      return result;
    } else {
      this.streak = 0;
      this.missedIds.add(this.currentTarget.id);
      this._playTone('wrong');

      const result = {
        correct: false,
        attempts: this.attemptsOnCurrent,
        target: this.currentTarget,
        picked: pickedStructure
      };

      if (this.callbacks.onPickResult) {
        this.callbacks.onPickResult(result, this.getState());
      }
      if (this.callbacks.onStateChange) {
        this.callbacks.onStateChange(this.getState());
      }
      return result;
    }
  }

  requestHint() {
    if (!this.active || !this.currentTarget) return;
    this.hintShown = true;
    if (this.callbacks.onStateChange) {
      this.callbacks.onStateChange(this.getState());
    }
  }

  requestBeacon() {
    if (!this.active || !this.currentTarget) return;
    this.beaconShown = true;
    this.missedIds.add(this.currentTarget.id);
    this.streak = 0;
    if (this.callbacks.onBeaconRequested) {
      this.callbacks.onBeaconRequested(this.currentTarget);
    }
    if (this.callbacks.onStateChange) {
      this.callbacks.onStateChange(this.getState());
    }
  }

  nextQuestion() {
    if (!this.active) return;
    this.clearAutoTimer();
    this.currentIndex += 1;
    this._loadCurrentQuestion();
  }

  getState() {
    const isFinished = this.active && this.currentIndex >= this.queue.length;
    return {
      active: this.active,
      isFinished,
      deckKey: this.deckKey,
      promptStyle: this.promptStyle,
      promptMode: this.currentPromptMode,
      questionNumber: Math.min(this.currentIndex + 1, this.queue.length),
      totalQuestions: this.queue.length,
      target: this.currentTarget,
      answeredCurrent: this.answeredCurrent,
      attemptsOnCurrent: this.attemptsOnCurrent,
      hintShown: this.hintShown,
      beaconShown: this.beaconShown,
      score: this.score,
      totalCompleted: this.totalCompleted,
      streak: this.streak,
      bestStreak: this.bestStreak
    };
  }
}
