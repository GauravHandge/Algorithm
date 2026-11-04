/* Global State & Step Execution Player Engine */
export class AlgorithmStatePlayer {
  constructor() {
    this.algorithmId = null;
    this.steps = [];
    this.currentIndex = 0;
    this.isPlaying = false;
    this.speed = 1.0; // 0.5x, 1x, 1.5x, 2x
    this.timer = null;
    this.listeners = [];
  }

  loadExecution(algorithmId, steps) {
    this.pause();
    this.algorithmId = algorithmId;
    this.steps = steps || [];
    this.currentIndex = 0;
    this.notify();
  }

  loadSteps(steps, algorithmId = null) {
    this.pause();
    if (algorithmId) this.algorithmId = algorithmId;
    this.steps = steps || [];
    this.currentIndex = 0;
    this.notify();
  }

  subscribe(callback) {
    this.listeners.push(callback);
  }

  notify() {
    const currentState = this.getCurrentState();
    this.listeners.forEach(fn => fn(currentState, this.currentIndex, this.steps.length, this.isPlaying));
  }

  getCurrentState() {
    if (!this.steps || this.steps.length === 0) return null;
    return this.steps[this.currentIndex];
  }

  next() {
    if (this.currentIndex < this.steps.length - 1) {
      this.currentIndex++;
      this.notify();
    } else {
      this.pause();
    }
  }

  previous() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      this.notify();
    }
  }

  reset() {
    this.pause();
    this.currentIndex = 0;
    this.notify();
  }

  play() {
    if (this.isPlaying) return;
    if (this.currentIndex >= this.steps.length - 1) {
      this.currentIndex = 0;
    }
    this.isPlaying = true;
    this.notify();
    this._scheduleNext();
  }

  pause() {
    this.isPlaying = false;
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    this.notify();
  }

  togglePlay() {
    if (this.isPlaying) this.pause();
    else this.play();
  }

  setSpeed(newSpeed) {
    this.speed = parseFloat(newSpeed);
  }

  _scheduleNext() {
    if (!this.isPlaying) return;
    const delay = 1000 / this.speed;
    this.timer = setTimeout(() => {
      if (this.currentIndex < this.steps.length - 1) {
        this.currentIndex++;
        this.notify();
        this._scheduleNext();
      } else {
        this.pause();
      }
    }, delay);
  }
}

export const globalPlayer = new AlgorithmStatePlayer();
