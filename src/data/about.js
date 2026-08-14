/**
 * About + contact details for the portfolio owner.
 * `strengths` / `weaknesses` are fed to Coral so quirky questions get
 * honest, in-character answers instead of invented ones.
 */
export const about = {
  name: 'Pranati Arun',
  role: 'IT Undergraduate · Full-Stack & Applied ML',
  tagline: 'I build web apps that solve problems I actually ran into.',
  bio: "Hey! I'm an IT undergraduate who likes building web applications that solve real problems — and lately, teaching models to see them. I've worked across the stack from database to UI, and I'm now applying machine learning to computer vision as a research intern at TIFR. When I'm not coding, you'll find me watching films, reading tech blogs, or working on side projects that make my daily life easier.",
  interests: [
    'Applied machine learning & computer vision',
    'Full-stack web development',
    'Open source contribution',
    'Movie watching',
  ],
  learningMindset:
    "I believe the best way to learn is by building. Every project teaches me something new, whether it's a technical skill or how to debug a tricky problem at 2 AM. I'm not afraid to make mistakes — they're just opportunities to understand things better. Right now I'm going deep on object detection and model pipelines, while keeping one hand in the full-stack work I came from.",
  strengths: [
    'Quick learner who adapts to new technologies fast',
    'Strong problem-solving and debugging skills',
    'Passionate about learning the world of computer science',
    'Extremely committed — will make sure the work given to her is complete',
    'Great at breaking down complex problems into manageable pieces',
  ],
  weaknesses: [
    'Perfectionist — will refactor code until it is "just right"',
    'Sometimes spends too much time on minor UI details',
    'Can get lost in documentation rabbit holes when learning new tech',
    'Tends to overthink architecture decisions on smaller projects',
  ],
  /**
   * The off-duty stuff. Coral answers "what's her favourite film?" style
   * questions from here, so she never has to guess at a personal detail.
   * Phrase these as facts, not as scripted replies — she rewords them.
   */
  funFacts: {
    favouriteSciFiFilm:
      'Interstellar. She knows it is the predictable answer and stands by it anyway.',
    marvel: 'Big Marvel fan. Iron Man is the favourite.',
    beachOrMountains:
      'Beach, without hesitation. She actively dislikes trekking — do not invite her on a hike.',
    generalMovies: 'Certified movie buff; films are the default way she switches off.',
    codingHours: 'Night owl. The good commits happen late.',
  },

  contact: {
    email: 'pranati.arun@gmail.com',
    phone: '+91 7045017168',
    location: 'Thane, Maharashtra',
    github: 'https://github.com/pranati243',
    linkedin: 'https://www.linkedin.com/in/pranati-arun',
  },
  resumeUrl: '/resume.pdf',
};

export default about;
