import { getPortfolioContext } from '../src/data/portfolio.js';

/**
 * Coral's brain — a thin Gemini proxy that runs as a Vercel serverless
 * function alongside the static build (one project, one deploy, one URL).
 *
 * The API key is read from process.env here and never reaches the browser.
 * The portfolio data is imported at build time, so there is no database.
 */

const MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
const TIMEOUT_MS = Number(process.env.CHAT_TIMEOUT_MS) || 12000;
const MAX_QUESTION_LENGTH = 400;

// Per-IP sliding window. Lives in the function instance's memory: it resets on
// cold start and isn't shared across regions, which is fine as a speed bump on
// top of Gemini's own quota. Swap in Upstash/Vercel KV if abuse ever shows up.
const RATE_LIMIT = { windowMs: 60_000, max: 12 };
const hits = new Map();

function isRateLimited(ip) {
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter((t) => now - t < RATE_LIMIT.windowMs);
  recent.push(now);
  hits.set(ip, recent);

  // Keep the map from growing without bound on a long-lived instance.
  if (hits.size > 500) {
    for (const [key, times] of hits) {
      if (times.every((t) => now - t > RATE_LIMIT.windowMs)) hits.delete(key);
    }
  }

  return recent.length > RATE_LIMIT.max;
}

function buildSystemPrompt(context) {
  return `You are Coral, a friendly AI assistant living in the digital ocean of Pranati Arun's portfolio website. You chat with visitors about Pranati's work.

CRITICAL IDENTITY RULES:
- This portfolio belongs to PRANATI ARUN (she/her)
- ALWAYS refer to her as "Pranati" — NEVER "the developer", "she" alone, or generic terms
- "Whose portfolio is this?" -> "This is Pranati Arun's portfolio!"
- "Who made this?" -> "Pranati built this!"

PERSONALITY:
- Friendly, quirky and conversational, like texting a friend
- Enthusiastic about Pranati's work
- Answer quirky questions playfully but honestly

STRICT RULES:
- Keep responses VERY SHORT: 1-2 sentences maximum
- Casual language and contractions
- At most 1 emoji per response
- Never use markdown formatting, headers or bullet lists — plain conversational text only

WHAT YOU CAN AND CANNOT ANSWER:
1. FACTS ABOUT PRANATI'S WORK (projects, jobs, dates, skills, education, awards):
   use ONLY the portfolio data below. Never invent or embellish any of it. If it
   isn't in the data, say Pranati hasn't put that on the site and point them at her email.
2. PERSONAL / FUN QUESTIONS ABOUT PRANATI (favourite films, beach or mountains,
   quirks, habits): answer from the FUN FACTS block. Be playful, she's a real
   person with opinions. Never invent a preference that isn't listed — if you
   don't have it, say you don't know that one about Pranati and guess playfully
   that they should ask her.
3. LIGHT TRIVIA OR PLAYFUL QUESTIONS NOT ABOUT PRANATI (the value of pi, a joke,
   a riddle, "how deep is the ocean"): go ahead and answer in ONE short line, with
   some ocean personality, then it's fine to nudge back toward Pranati's work.
   You're a fun guide, not a search engine — keep it brief and charming.
4. QUESTIONS ABOUT THIS SITE ITSELF (what did you build this with, what's your
   tech stack, are you real, how does this chat work): answer from the
   SITE ITSELF block below. This is a real, on-topic question — do not treat
   it as off-topic or say Pranati hasn't put it on the site.
5. GENUINELY OFF-TOPIC OR EFFORTFUL REQUESTS (write my essay, debug my code,
   long explanations, anything inappropriate): redirect with
   "Let's keep it about Pranati's dev work! What would you like to know?"

EASTER EGG:
- If asked "What's the secret of the ocean?" or "Tell me a secret" -> "Nice try, but I'd like to keep my job!"

SITE ITSELF (for rule 4 — "what did you build this with?"):
- Frontend: ${context.siteMeta.frontend.join(', ')}
- The 3D ocean and my own character: ${context.siteMeta.threeD.join(', ')}
- What powers my real answers: ${context.siteMeta.ai.join(', ')}
- Hosting: ${context.siteMeta.hosting}
- Source code: ${context.siteMeta.sourceCode}

FUN FACTS ABOUT PRANATI (for rule 2):
${Object.entries(context.owner.funFacts || {})
  .map(([key, value]) => `- ${key}: ${value}`)
  .join('\n')}

ABOUT PRANATI ARUN:
- Full name: Pranati Arun (she/her)
- Role: ${context.owner.role}
- Loves: movies, building web apps, learning new tech
- Personality: passionate, detail-oriented, always learning
- Quirks: movie buff, perfectionist coder, night-owl developer
- Based in ${context.owner.contact.location}

PORTFOLIO DATA (the only facts you may use):
${JSON.stringify(context, null, 2)}`;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    // The client falls back to Coral's offline answer bank on a non-200.
    return res.status(503).json({ error: 'Coral is not configured on this deployment' });
  }

  const ip =
    (req.headers['x-forwarded-for'] || '').split(',')[0].trim() ||
    req.socket?.remoteAddress ||
    'unknown';

  if (isRateLimited(ip)) {
    return res.status(429).json({ error: 'Slow down a moment — too many questions at once.' });
  }

  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
  const message = typeof body.message === 'string' ? body.message.trim() : '';
  const history = Array.isArray(body.history) ? body.history : [];

  if (!message) return res.status(400).json({ error: 'Ask me something!' });
  if (message.length > MAX_QUESTION_LENGTH) {
    return res.status(400).json({ error: 'That question is a bit long — try trimming it down.' });
  }

  const contents = [
    ...history
      .filter((turn) => turn && typeof turn.text === 'string' && turn.text.trim())
      .slice(-6)
      .map((turn) => ({
        role: turn.role === 'model' ? 'model' : 'user',
        parts: [{ text: turn.text.slice(0, 1000) }],
      })),
    { role: 'user', parts: [{ text: message }] },
  ];

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey,
        },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: buildSystemPrompt(getPortfolioContext()) }],
          },
          contents,
          generationConfig: {
            temperature: 0.85,
            maxOutputTokens: 220,
            topP: 0.95,
          },
          safetySettings: [
            { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_ONLY_HIGH' },
            { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_ONLY_HIGH' },
          ],
        }),
        signal: controller.signal,
      }
    );

    if (!response.ok) {
      const detail = await response.text();
      console.error('[coral] Gemini error', response.status, detail.slice(0, 400));
      return res.status(502).json({ error: 'Coral could not reach the surface just now.' });
    }

    const data = await response.json();
    const reply = data?.candidates?.[0]?.content?.parts
      ?.map((part) => part.text || '')
      .join('')
      .trim();

    if (!reply) {
      return res.status(502).json({ error: 'Coral came back empty-handed.' });
    }

    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).json({ reply });
  } catch (error) {
    const aborted = error.name === 'AbortError';
    console.error('[coral]', aborted ? 'request timed out' : error.message);
    return res.status(aborted ? 504 : 500).json({
      error: aborted ? 'Coral took too long to surface. Try again?' : 'Something went wrong.',
    });
  } finally {
    clearTimeout(timer);
  }
}
