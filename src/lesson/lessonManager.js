import { LESSON_CHAPTERS, LESSON_STEPS } from './lessonCurriculum.js';
import {
  ANATOMY_DATA,
  expandStructureGroupIds,
  resolvePrimaryStructureId
} from '../data/anatomyData.js';

export class GuidedLessonManager {
  constructor(callbacks = {}) {
    this.callbacks = callbacks;
    this.active = false;
    this.stepIndex = 0;
    this.completedSteps = new Set();

    // Per-checkpoint transient state
    this.checkpointSolved = false;
    this.checkpointHintShown = false;
    this.checkpointBeaconShown = false;
    this.lastAttemptFeedback = null; // { correct: bool, message: string }

    this._audioCtx = null;
  }

  _playChime(ok) {
    try {
      if (!this._audioCtx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx) return;
        this._audioCtx = new AudioCtx();
      }
      if (this._audioCtx.state === 'suspended') this._audioCtx.resume();
      const now = this._audioCtx.currentTime;

      if (ok) {
        [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
          const osc = this._audioCtx.createOscillator();
          const gain = this._audioCtx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + idx * 0.05);
          gain.gain.setValueAtTime(0.001, now + idx * 0.05);
          gain.gain.exponentialRampToValueAtTime(0.09, now + idx * 0.05 + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.05 + 0.3);
          osc.connect(gain);
          gain.connect(this._audioCtx.destination);
          osc.start(now + idx * 0.05);
          osc.stop(now + idx * 0.05 + 0.32);
        });
      } else {
        const osc = this._audioCtx.createOscillator();
        const gain = this._audioCtx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.linearRampToValueAtTime(165, now + 0.14);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.16);
        osc.connect(gain);
        gain.connect(this._audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.18);
      }
    } catch {
      // Ignore blocked audio
    }
  }

  start(index = this.stepIndex) {
    this.active = true;
    this.goToStep(index);
  }

  stop() {
    this.active = false;
    if (this.callbacks.onStateChange) {
      this.callbacks.onStateChange(this.getState());
    }
  }

  get currentStep() {
    return LESSON_STEPS[this.stepIndex] || LESSON_STEPS[0];
  }

  goToStep(index) {
    const clamped = Math.max(0, Math.min(LESSON_STEPS.length - 1, index));
    // Mark previous teach step completed automatically when advancing past it
    if (this.active && this.currentStep && this.currentStep.type === 'teach' && clamped > this.stepIndex) {
      this.completedSteps.add(this.currentStep.id);
    }

    this.stepIndex = clamped;
    const step = this.currentStep;

    if (step.type === 'teach') {
      this.checkpointSolved = true;
      this.completedSteps.add(step.id);
    } else {
      this.checkpointSolved = this.completedSteps.has(step.id);
    }

    this.checkpointHintShown = false;
    this.checkpointBeaconShown = false;
    this.lastAttemptFeedback = this.checkpointSolved && step.type === 'checkpoint'
      ? { correct: true, message: step.successNote }
      : null;

    if (this.callbacks.onStepLoaded) {
      this.callbacks.onStepLoaded(step, this.getState());
    }
    if (this.callbacks.onStateChange) {
      this.callbacks.onStateChange(this.getState());
    }
  }

  goToChapter(chapterId) {
    const idx = LESSON_STEPS.findIndex((s) => s.chapterId === chapterId);
    if (idx !== -1) {
      this.goToStep(idx);
    }
  }

  nextStep() {
    if (!this.active) return;
    if (this.stepIndex < LESSON_STEPS.length - 1) {
      this.goToStep(this.stepIndex + 1);
    }
  }

  prevStep() {
    if (!this.active) return;
    if (this.stepIndex > 0) {
      this.goToStep(this.stepIndex - 1);
    }
  }

  recenter() {
    if (!this.active) return;
    if (this.callbacks.onStepLoaded) {
      this.callbacks.onStepLoaded(this.currentStep, this.getState());
    }
  }

  showCheckpointHint() {
    const step = this.currentStep;
    if (!this.active || step.type !== 'checkpoint') return;
    this.checkpointHintShown = true;
    if (this.callbacks.onStateChange) {
      this.callbacks.onStateChange(this.getState());
    }
  }

  showCheckpointBeacon() {
    const step = this.currentStep;
    if (!this.active || step.type !== 'checkpoint') return;
    this.checkpointBeaconShown = true;
    if (this.callbacks.onBeaconRequested) {
      this.callbacks.onBeaconRequested(resolvePrimaryStructureId(step.targetId));
    }
    if (this.callbacks.onStateChange) {
      this.callbacks.onStateChange(this.getState());
    }
  }

  submitCheckpointPick(pickedStructure) {
    const step = this.currentStep;
    if (!this.active || step.type !== 'checkpoint' || !pickedStructure) return null;

    if (
      pickedStructure.id === step.targetId ||
      (pickedStructure.parentGroup && pickedStructure.parentGroup === step.targetId)
    ) {
      this.checkpointSolved = true;
      this.completedSteps.add(step.id);
      this.lastAttemptFeedback = {
        correct: true,
        message: step.successNote
      };
      this._playChime(true);
      if (this.callbacks.onCheckpointResult) {
        this.callbacks.onCheckpointResult({ correct: true, targetId: step.targetId, picked: pickedStructure });
      }
      if (this.callbacks.onStateChange) {
        this.callbacks.onStateChange(this.getState());
      }
      return true;
    } else {
      const targetData = ANATOMY_DATA[step.targetId];
      this.lastAttemptFeedback = {
        correct: false,
        message: `You clicked ${pickedStructure.shortName} (${pickedStructure.wall}). Try aiming for another structure${
          targetData ? ` — press [H] for a spatial hint!` : '!'
        }`
      };
      this._playChime(false);
      if (this.callbacks.onCheckpointResult) {
        this.callbacks.onCheckpointResult({ correct: false, targetId: step.targetId, picked: pickedStructure });
      }
      if (this.callbacks.onStateChange) {
        this.callbacks.onStateChange(this.getState());
      }
      return false;
    }
  }

  getFocusStructureIds() {
    if (!this.active) return [];
    const step = this.currentStep;
    if (step.type === 'teach') {
      return expandStructureGroupIds(step.focusIds || []);
    }
    // On checkpoint: only spotlight target AFTER it is solved!
    return this.checkpointSolved ? expandStructureGroupIds([step.targetId]) : [];
  }

  getState() {
    const step = this.currentStep;
    const chapter = LESSON_CHAPTERS.find((c) => c.id === step.chapterId) || LESSON_CHAPTERS[0];
    return {
      active: this.active,
      step,
      chapter,
      stepIndex: this.stepIndex,
      totalSteps: LESSON_STEPS.length,
      isFirst: this.stepIndex === 0,
      isLast: this.stepIndex === LESSON_STEPS.length - 1,
      checkpointSolved: this.checkpointSolved,
      checkpointHintShown: this.checkpointHintShown,
      checkpointBeaconShown: this.checkpointBeaconShown,
      lastAttemptFeedback: this.lastAttemptFeedback,
      completedSteps: this.completedSteps,
      chapters: LESSON_CHAPTERS.map((ch) => {
        const chSteps = LESSON_STEPS.filter((s) => s.chapterId === ch.id);
        const doneCount = chSteps.filter((s) => this.completedSteps.has(s.id)).length;
        return {
          ...ch,
          isCurrent: ch.id === chapter.id,
          isComplete: doneCount === chSteps.length
        };
      })
    };
  }
}
