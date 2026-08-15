import { projects } from './projects.js';
import { skills, skillCategories } from './skills.js';
import { about } from './about.js';
import { resume } from './resume.js';

export { projects, skills, about, resume };

/**
 * A trimmed, LLM-friendly view of everything on this site.
 *
 * Imported by BOTH the browser bundle (for Coral's offline fallback answers)
 * and by api/ask.js at build time on Vercel, so the serverless function needs
 * no database — the data ships inside the function.
 */
/**
 * What THIS site (not Pranati's other projects) is built with. Visitors who
 * like the underwater scene or the chatbot often ask "what did you use for
 * this?" — Coral had no answer for that until this existed, since her
 * context was previously only Pranati's career projects.
 */
export const siteMeta = {
  description:
    "This portfolio itself — the ocean scene, glassmorphism and me (Coral)",
  frontend: ['React 19', 'Vite', 'plain CSS with custom properties (no UI framework)'],
  threeD: ['Three.js', 'React Three Fiber — the underwater scene and my own 3D character'],
  ai: ['Google Gemini (gemini-2.5-flash)'],
  hosting:
    'A single Vercel project: the static site plus one serverless function for my chat, so there is no separate backend or database.',
  sourceCode: 'https://github.com/pranati243/pranati-portfolio',
};

export function getPortfolioContext() {
  return {
    siteMeta,
    owner: {
      name: about.name,
      role: about.role,
      bio: about.bio,
      interests: about.interests,
      learningMindset: about.learningMindset,
      strengths: about.strengths,
      weaknesses: about.weaknesses,
      funFacts: about.funFacts,
      contact: about.contact,
    },
    projects: projects.map((p) => ({
      name: p.name,
      description: p.description,
      techStack: p.techStack,
      links: { github: p.githubUrl, demo: p.demoUrl || null },
      whyIBuiltIt: typeof p.motivation === 'string' ? p.motivation : p.motivation?.problem,
      award: p.award || null,
      status: p.inProgress ? 'in progress' : 'shipped',
    })),
    skills: skillCategories.reduce((acc, category) => {
      acc[category] = skills[category].items;
      return acc;
    }, {}),
    resume: {
      summary: resume.summary,
      education: resume.education,
      experience: resume.experience.map((e) => ({
        title: e.title,
        company: e.company,
        duration: e.duration,
        current: Boolean(e.current),
        distinction: e.distinction
          ? [e.distinction, e.distinctionNote].filter(Boolean).join(' — ')
          : null,
        description: e.description,
        highlights: e.responsibilities,
      })),
      achievements: resume.achievements,
      activities: resume.activities,
    },
  };
}

export default getPortfolioContext;
