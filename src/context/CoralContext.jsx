import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';

const CoralContext = createContext(null);

/**
 * Lets anything on the page open Coral — and optionally hand her a question to
 * ask on the visitor's behalf, which is how the hero's "Ask Coral" shortcuts
 * and the project cards' "why I built this" prompts work.
 */
export function CoralProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const [queuedQuestion, setQueuedQuestion] = useState(null);
  const [unread, setUnread] = useState(false);
  const questionId = useRef(0);

  const open = useCallback(() => {
    setIsOpen(true);
    setUnread(false);
  }, []);

  const close = useCallback(() => setIsOpen(false), []);

  const toggle = useCallback(() => {
    setIsOpen((prev) => {
      if (!prev) setUnread(false);
      return !prev;
    });
  }, []);

  const ask = useCallback((question) => {
    // The id makes an identical repeat question still register as new.
    questionId.current += 1;
    setQueuedQuestion({ id: questionId.current, text: question });
    setIsOpen(true);
    setUnread(false);
  }, []);

  const consumeQueuedQuestion = useCallback(() => setQueuedQuestion(null), []);

  const value = useMemo(
    () => ({ isOpen, open, close, toggle, ask, queuedQuestion, consumeQueuedQuestion, unread, setUnread }),
    [isOpen, open, close, toggle, ask, queuedQuestion, consumeQueuedQuestion, unread]
  );

  return <CoralContext.Provider value={value}>{children}</CoralContext.Provider>;
}

CoralProvider.propTypes = {
  children: PropTypes.node,
};

export function useCoral() {
  const ctx = useContext(CoralContext);
  if (!ctx) throw new Error('useCoral must be used inside <CoralProvider>');
  return ctx;
}

export default CoralContext;
