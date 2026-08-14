/**
 * Skills grouped by category, mirroring the resume's Technical Skills section.
 * Order of the keys is the render order.
 */
export const skills = {
  Languages: {
    blurb: 'Day to day, plus coursework',
    items: [
      'Python',
      'JavaScript',
      'PHP',
      'SQL',
      'C',
      'C++',
      'Java',
    ],
  },
  Frontend: {
    blurb: 'What visitors actually touch',
    items: ['React', 'HTML5', 'CSS3', 'Tailwind CSS'],
  },
  Backend: {
    blurb: 'The machinery under the surface',
    items: ['Flask', 'REST APIs', 'PHP', 'Docker'],
  },
  Databases: {
    blurb: 'Where everything is kept',
    items: ['MongoDB', 'MySQL'],
  },
  'Machine Learning': {
    blurb: 'Current research direction',
    items: ['Computer Vision', 'YOLO object detection', 'Model pipelines'],
  },
  'Cloud & Tools': {
    blurb: 'Daily drivers',
    items: [
      'AWS (basics)',
      'GCP (basics)',
      'Firebase Hosting',
      'Git',
      'GitHub',
      'GitHub Actions (basics)',
      'VS Code',
    ],
  },
};

export const skillCategories = Object.keys(skills);

/** Flat list — handy for Coral's context and for quick searching. */
export const allSkills = skillCategories.flatMap((c) => skills[c].items);

export default skills;
