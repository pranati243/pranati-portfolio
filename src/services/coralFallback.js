import { projects } from '../data/projects.js';
import { skills, skillCategories } from '../data/skills.js';
import { about } from '../data/about.js';
import { resume } from '../data/resume.js';

/**
 * Coral's offline brain.
 *
 * Used when /api/ask is unreachable — running plain `vite` with no key, a
 * network blip, or a Gemini outage. Answers are written in Coral's voice
 * (1–2 sentences, casual, "Pranati" by name, at most one emoji) and
 * interpolate the real data, so they stay true even when the copy is canned.
 */

/** Data strings aren't punctuated consistently — normalise before quoting. */
const sentence = (text) => (/[.!?]$/.test(text) ? text : `${text}.`);

const list = (items, max = 3) => {
  const shown = items.slice(0, max);
  if (items.length <= max) {
    return shown.length > 1
      ? `${shown.slice(0, -1).join(', ')} and ${shown[shown.length - 1]}`
      : shown[0];
  }
  return `${shown.join(', ')} and more`;
};

const RULES = [
  {
    test: /(secret of the ocean|tell me a secret|what'?s the secret)/i,
    reply: () => "Nice try, but I'd like to keep my job! 🪸",
  },
  {
    test: /(whose portfolio|who owns|who made this|who built this|who created)/i,
    reply: () => `This is ${about.name}'s portfolio — Pranati built the whole thing herself!`,
  },
  {
    test: /(who are you|what are you|your name|are you (an? )?(ai|bot|real))/i,
    reply: () =>
      "I'm Coral, Pranati's AI guide down here in the deep. Ask me anything about her work!",
  },
  {
    // Both boundaries matter: without the leading \b, "sushi" reads as "hi".
    test: /\b(hi|hey|hello|yo|sup|howdy)\b/i,
    reply: () => "Hey there! I'm Coral 🪸 Ask me anything about Pranati's projects or skills.",
  },
  {
    test: /(lablink|lab link|laboratory)/i,
    reply: () =>
      'LabLink is Pranati\'s Flutter + Firebase app that shows real-time lab component availability — she built it because nobody knew what was in stock until they walked to the lab.',
  },
  {
    test: /(ims|information management)/i,
    reply: () =>
      'The IMS portal is a PHP + SQL system Pranati built for her college so faculty and students manage academic data in one place, approvals included.',
  },
  {
    test: /(options|trading|finance|derivative|backtest)/i,
    reply: () =>
      "Pranati's Options Strategy Engine generates, optimises and backtests options strategies in Python and Flask, with a React dashboard — built at her fintech internship.",
  },
  {
    test: /(ml|machine learning|ai research|computer vision|yolo|tifr|tata institute|research|detection|deep learning)/i,
    reply: () =>
      "Pranati's at TIFR right now building a YOLO-based inspection pipeline that spots wirebond defects automatically — applied computer vision.",
  },
  {
    test: /(eras|event|club|recruit|fest)/i,
    reply: () =>
      "The Event Management & Club Recruitment System was Pranati's first full-stack project — it took 3rd place at TechSparks, a national competition!",
  },
  // Generic project question — must come after the named-project rules above,
  // otherwise "tell me about the IMS app" gets the roll-call answer.
  {
    test: /(project|built|build|portfolio work|made|app|apps)/i,
    reply: () =>
      `Pranati has built ${projects.length} projects — ${list(projects.map((p) => p.name.split(':')[0]))}. Which one do you want to hear about?`,
  },
  {
    test: /(skill|tech stack|technolog|language|framework|know|good at)/i,
    reply: () =>
      `Pranati works across ${skillCategories.join(', ')} — mostly ${list(skills.Languages.items, 3)}, with ${list(skills.Frontend.items, 2)} on the front end.`,
  },
  {
    test: /(award|achievement|won|win|prize|hackathon|competition)/i,
    reply: () =>
      `Pranati took ${resume.achievements[0].title} for her event management system, and did Smart India Hackathon in 2024 and 2025.`,
  },
  {
    test: /(infinitypool|finnotech)/i,
    reply: () => {
      const role = resume.experience.find((r) => /infinitypool/i.test(r.company));
      if (!role) return "Pranati interned at InfinityPool Finnotech, building backtesting and options tooling.";
      const distinction = role.distinction
        ? ` She finished it with distinction, and they offered to extend her — she just didn't take it up.`
        : '';
      return `Pranati was a ${role.title} at ${role.company} (${role.duration}), building backtesting and options tooling.${distinction}`;
    },
  },
  {
    test: /(experience|intern|job|work|company|employ|where does she|how (is|was|did) (she|her) doing)/i,
    reply: () => {
      const now = resume.experience.find((role) => role.current) || resume.experience[0];
      return `Pranati is a ${now.title} at ${now.company} right now, after internships at InfinityPool Finnotech and her college.`;
    },
  },
  {
    test: /(study|college|university|education|degree|cgpa|grade|school)/i,
    reply: () =>
      `Pranati is doing her ${resume.education[0].degree} at Fr. CRIT (${resume.education[0].year}) with a ${resume.education[0].cgpa} CGPA.`,
  },
  {
    test: /(resume|cv|download)/i,
    reply: () =>
      "Her resume is right there in the Resume section — hit 'Download resume' and it's yours.",
  },
  {
    test: /(contact|email|reach|hire|linkedin|github|phone)/i,
    reply: () =>
      `Easiest way to reach Pranati is ${about.contact.email}, or find her on GitHub as pranati243.`,
  },
  {
    test: /(weakness|flaw|bad at|struggle|worst)/i,
    reply: () => `Honestly? ${sentence(about.weaknesses[0])} She'll admit it too.`,
  },
  {
    test: /(strength|best at|good|great at|superpower)/i,
    reply: () => `Pranati's biggest one: ${about.strengths[0].toLowerCase()}.`,
  },
  // --- fun / personal ----------------------------------------------------
  {
    test: /(sci[- ]?fi|science fiction|interstellar|nolan)/i,
    reply: () =>
      "Interstellar, hands down. Pranati knows it's the predictable answer and picks it anyway 🚀",
  },
  {
    test: /(marvel|mcu|iron man|avenger|superhero|dc\b)/i,
    reply: () => 'Big Marvel person, and Iron Man is the favourite. Ask her about the ending.',
  },
  {
    test: /(beach|mountain|trek|hik(e|ing)|travel|vacation|holiday)/i,
    reply: () =>
      'Beach, no hesitation — Pranati genuinely dislikes trekking, so please stop inviting her 🏖️',
  },
  {
    test: /(favou?rite (movie|film)|best movie|what.*watch)/i,
    reply: () =>
      "Interstellar for sci-fi, Iron Man for Marvel — Pranati's a proper movie buff either way.",
  },
  {
    test: /(night owl|early bird|morning person|sleep|when does she code)/i,
    reply: () => 'Night owl, definitely. Pranati says the good commits happen late.',
  },
  {
    test: /(hobby|hobbies|interest|fun|free time|like doing|movie)/i,
    reply: () => `Outside code, Pranati is into ${list(about.interests)} — big movie person too.`,
  },
  // --- light trivia: she plays along rather than stonewalling --------------
  {
    test: /\b(pi|π)\b.*(value|what|how much)|value of (pi|π)|what.*is (pi|π)/i,
    reply: () => "3.14159… and it keeps going, much like this ocean. Anything about Pranati? 🌊",
  },
  {
    test: /(tell me a joke|make me laugh|something funny|joke)/i,
    reply: () =>
      "Why don't oysters share their pearls? They're a little shellfish. Okay, back to Pranati's work!",
  },
  {
    test: /(how deep|deepest|mariana|ocean depth)/i,
    reply: () =>
      "The Mariana Trench bottoms out near 11 km — deeper than I'd like to swim. Ask me about Pranati instead!",
  },
  {
    test: /(what.*time|what day|weather)/i,
    reply: () =>
      "No clocks or windows down here, sorry! But I can tell you all about Pranati's work.",
  },
  {
    test: /(learn|study now|currently|these days)/i,
    reply: () =>
      "Right now Pranati's deep in object detection and model pipelines, while keeping a hand in the full-stack work she came from.",
  },
  {
    test: /(thank|thanks|cool|nice|awesome|great)/i,
    reply: () => 'Anytime! Anything else you want to know about Pranati?',
  },
];

const OFF_TOPIC = "Let's keep it about Pranati's dev work! What would you like to know?";

/** Offline, Coral has no model — be honest instead of bluffing at trivia. */
const UNKNOWN_FUN =
  "That one I'd only be guessing at — ask Pranati herself! Meanwhile, want to hear about her projects?";

/** Signals the visitor is being playful rather than asking about the portfolio. */
const PLAYFUL =
  /(favou?rite|do(es)? (you|she|they)|is she|has she|would she|prefer|better|vs\.?|or\b.*\?|why is|what is|who is|how many|how much)/i;

export function answerLocally(question) {
  const text = (question || '').trim();
  if (!text) return OFF_TOPIC;

  for (const rule of RULES) {
    if (rule.test.test(text)) return rule.reply();
  }

  // Last resort before giving up: does the question name a project?
  const named = projects.find((project) =>
    project.name.toLowerCase().split(/[\s:]+/).some((word) => word.length > 4 && text.toLowerCase().includes(word))
  );
  if (named) {
    return `${named.name.split(':')[0]} — ${named.description}`;
  }

  // A playful question we have no canned answer for deserves a warmer brush-off
  // than the flat scope guard. (With the Gemini key set this path rarely runs —
  // the model handles these properly.)
  if (PLAYFUL.test(text)) return UNKNOWN_FUN;

  return OFF_TOPIC;
}

export default answerLocally;
