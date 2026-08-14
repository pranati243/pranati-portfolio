import { useCallback, useEffect, useRef, useState } from 'react';
import CoralAvatar3D from './CoralAvatar3D.jsx';
import CoralOrb from './CoralOrb.jsx';
import CoralNudge from './CoralNudge.jsx';
import { useCoral } from '../../context/CoralContext.jsx';
import { usePrefersReducedMotion } from '../../hooks/useMediaQuery.js';
import { askCoral, CORAL_GREETING, SUGGESTED_QUESTIONS } from '../../services/coral.js';
import './coral.css';

const TYPE_INTERVAL_MS = 18;
const SEND_COOLDOWN_MS = 1200;

let messageId = 0;
const nextId = () => {
  messageId += 1;
  return messageId;
};

export default function CoralChat() {
  const { isOpen, close, queuedQuestion, consumeQueuedQuestion, setUnread } = useCoral();
  const reducedMotion = usePrefersReducedMotion();

  const [messages, setMessages] = useState([
    { id: nextId(), role: 'coral', text: CORAL_GREETING, done: true },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [cooldown, setCooldown] = useState(false);
  const [offline, setOffline] = useState(false);

  const inputRef = useRef(null);
  const logRef = useRef(null);
  const typingTimerRef = useRef(null);

  /** Reveal a reply one character at a time. */
  const typeOut = useCallback(
    (id, fullText) => {
      if (reducedMotion) {
        setMessages((prev) =>
          prev.map((m) => (m.id === id ? { ...m, text: fullText, done: true } : m))
        );
        return;
      }

      let index = 0;
      clearInterval(typingTimerRef.current);
      typingTimerRef.current = setInterval(() => {
        index += 1;
        const slice = fullText.slice(0, index);
        const finished = index >= fullText.length;

        setMessages((prev) =>
          prev.map((m) => (m.id === id ? { ...m, text: slice, done: finished } : m))
        );

        if (finished) clearInterval(typingTimerRef.current);
      }, TYPE_INTERVAL_MS);
    },
    [reducedMotion]
  );

  useEffect(() => () => clearInterval(typingTimerRef.current), []);

  const send = useCallback(
    async (rawQuestion) => {
      const question = rawQuestion.trim();
      if (!question || isLoading) return;

      setInput('');
      setIsLoading(true);
      setCooldown(true);
      setTimeout(() => setCooldown(false), SEND_COOLDOWN_MS);

      const history = messages
        .filter((m) => m.done)
        .map((m) => ({ role: m.role === 'coral' ? 'model' : 'user', text: m.text }));

      setMessages((prev) => [...prev, { id: nextId(), role: 'user', text: question, done: true }]);

      const { text, source } = await askCoral(question, history);
      setOffline(source === 'offline');

      const replyId = nextId();
      setMessages((prev) => [...prev, { id: replyId, role: 'coral', text: '', done: false }]);
      setIsLoading(false);
      typeOut(replyId, text);
    },
    [isLoading, messages, typeOut]
  );

  // A question handed over from elsewhere on the page (hero, project cards).
  useEffect(() => {
    if (!queuedQuestion) return;
    send(queuedQuestion.text);
    consumeQueuedQuestion();
  }, [queuedQuestion, send, consumeQueuedQuestion]);

  // Keep the newest message in view as it types.
  useEffect(() => {
    const log = logRef.current;
    if (log) log.scrollTop = log.scrollHeight;
  }, [messages, isLoading]);

  useEffect(() => {
    if (isOpen) {
      setUnread(false);
      // Wait for the open transition before stealing focus.
      const timer = setTimeout(() => inputRef.current?.focus(), 220);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [isOpen, setUnread]);

  useEffect(() => {
    if (!isOpen) return undefined;
    const onKeyDown = (event) => {
      if (event.key === 'Escape') close();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isOpen, close]);

  const isSpeaking = messages.some((m) => !m.done);
  const isThinking = isLoading || isSpeaking;
  const showSuggestions = messages.length <= 1 && !isLoading;

  // What the character is doing right now: waiting on Gemini, delivering a
  // line, or just floating there.
  const mood = isLoading ? 'thinking' : isSpeaking ? 'speaking' : 'idle';

  return (
    <>
      <CoralOrb isThinking={isThinking} />
      <CoralNudge />

      <section
        id="coral-chat-panel"
        className={`coral-panel glass${isOpen ? ' is-open' : ''}`}
        role="dialog"
        aria-modal="false"
        aria-label="Chat with Coral"
        aria-hidden={!isOpen}
        inert={!isOpen ? '' : undefined}
      >
        <header className="coral-panel__header">
          <div className="coral-panel__identity">
            <h2 className="coral-panel__name">Coral</h2>
            <p className="coral-panel__status">
              <span className={`coral-panel__dot${isThinking ? ' is-busy' : ''}`} />
              {isLoading
                ? 'thinking…'
                : isSpeaking
                  ? 'speaking'
                  : offline
                    ? 'offline answers'
                    : "Pranati's AI guide"}
            </p>
          </div>
          <button
            type="button"
            className="coral-panel__close"
            onClick={close}
            aria-label="Close chat"
          >
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </header>

        <CoralAvatar3D mood={mood} active={isOpen} />

        <div className="coral-panel__log" ref={logRef} role="log" aria-live="polite">
          {messages.map((message) => (
            <article
              key={message.id}
              className={`coral-msg coral-msg--${message.role === 'coral' ? 'coral' : 'user'}`}
            >
              <p className="coral-msg__bubble">
                {message.text}
                {!message.done && <span className="coral-msg__caret" aria-hidden="true" />}
              </p>
            </article>
          ))}

          {isLoading && (
            <article className="coral-msg coral-msg--coral">
              <p className="coral-msg__bubble coral-msg__bubble--dots" aria-label="Coral is typing">
                <span />
                <span />
                <span />
              </p>
            </article>
          )}
        </div>

        {showSuggestions && (
          <ul className="coral-panel__suggestions" role="list">
            {SUGGESTED_QUESTIONS.map((question) => (
              <li key={question}>
                <button type="button" className="coral-suggestion" onClick={() => send(question)}>
                  {question}
                </button>
              </li>
            ))}
          </ul>
        )}

        <form
          className="coral-panel__form"
          onSubmit={(event) => {
            event.preventDefault();
            send(input);
          }}
        >
          <label className="visually-hidden" htmlFor="coral-input">
            Ask Coral a question
          </label>
          <input
            id="coral-input"
            ref={inputRef}
            className="coral-panel__input"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Ask Coral anything…"
            autoComplete="off"
            maxLength={400}
          />
          <button
            type="submit"
            className="coral-panel__send"
            disabled={!input.trim() || isLoading || cooldown}
            aria-label="Send message"
          >
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
              <path
                d="M4 12h15M13 6l6 6-6 6"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </form>
      </section>
    </>
  );
}
