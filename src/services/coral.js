import { answerLocally } from './coralFallback.js';

const ENDPOINT = '/api/ask';
const REQUEST_TIMEOUT_MS = 20000;

export const CORAL_GREETING =
  "Hey! I'm Coral 🪸 Pranati's AI guide from these digital depths. Ask me anything about her — projects, skills, quirks, you name it!";

export const SUGGESTED_QUESTIONS = [
  'What has Pranati built?',
  'Where does she work right now?',
  "What's her biggest weakness?",
  // A deliberately unserious one, so visitors discover Coral will play along.
  'Beach or mountains?',
];

/**
 * Ask Coral a question.
 *
 * Talks to the Vercel serverless function at /api/ask, which holds the Gemini
 * key server-side. If that route isn't there (plain `vite dev`, no key set) or
 * the call fails, we quietly fall back to the local answer bank rather than
 * showing the visitor an error — a portfolio should never look broken.
 *
 * Returns { text, source: 'gemini' | 'offline' }.
 */
export async function askCoral(question, history = []) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: question,
        // Only the last few turns — enough for follow-ups, cheap on tokens.
        history: history.slice(-6).map(({ role, text }) => ({ role, text })),
      }),
      signal: controller.signal,
    });

    if (!response.ok) throw new Error(`Coral endpoint returned ${response.status}`);

    const data = await response.json();
    if (!data?.reply) throw new Error('Coral endpoint returned no reply');

    return { text: data.reply, source: 'gemini' };
  } catch (error) {
    if (import.meta.env.DEV) {
      console.info('[coral] falling back to offline answers:', error.message);
    }
    return { text: answerLocally(question), source: 'offline' };
  } finally {
    clearTimeout(timeout);
  }
}

export default askCoral;
