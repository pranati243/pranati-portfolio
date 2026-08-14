/**
 * Rolling-buffer key sequence detector.
 * Ignores typing inside inputs/textareas/contenteditable so chatting with
 * Coral never trips an easter egg. Buffer resets after 3s of silence.
 */
export class KeySequenceDetector {
  constructor({ resetAfterMs = 3000 } = {}) {
    this.sequences = [];
    this.buffer = '';
    this.resetAfterMs = resetAfterMs;
    this.timer = null;
    this.cursor = { x: 0, y: 0 };
    this.handleKey = this.handleKey.bind(this);
    this.trackCursor = this.trackCursor.bind(this);
  }

  register(sequence, callback) {
    this.sequences.push({ sequence: sequence.toLowerCase(), callback });
    return this;
  }

  trackCursor(event) {
    this.cursor = { x: event.clientX, y: event.clientY };
  }

  handleKey(event) {
    const target = event.target;
    if (
      target instanceof HTMLElement &&
      (target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable)
    ) {
      return;
    }

    if (event.key.length !== 1) return;

    this.buffer = (this.buffer + event.key.toLowerCase()).slice(-24);

    clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      this.buffer = '';
    }, this.resetAfterMs);

    for (const { sequence, callback } of this.sequences) {
      if (this.buffer.endsWith(sequence)) {
        this.buffer = '';
        callback(this.cursor);
      }
    }
  }

  start() {
    window.addEventListener('keydown', this.handleKey);
    window.addEventListener('mousemove', this.trackCursor, { passive: true });
    return this;
  }

  stop() {
    clearTimeout(this.timer);
    window.removeEventListener('keydown', this.handleKey);
    window.removeEventListener('mousemove', this.trackCursor);
  }
}

export const FIRST_VISIT_KEY = 'pa-portfolio-visited';

export function isFirstVisit() {
  try {
    return !localStorage.getItem(FIRST_VISIT_KEY);
  } catch {
    return false;
  }
}

export function markVisited() {
  try {
    localStorage.setItem(FIRST_VISIT_KEY, String(Date.now()));
  } catch {
    /* private mode — nothing to persist to, not worth surfacing */
  }
}
