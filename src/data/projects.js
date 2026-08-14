/**
 * Static project data — bundled at build time, no database, no fetch.
 * Shape mirrors the old Mongo `Project` schema so nothing downstream changed.
 *
 * `motivation` may be a plain string or a structured object
 * ({ problem, challenge, keyLearning }); ProjectModal renders both.
 */
export const projects = [
  {
    id: 'options-engine',
    name: 'Options Strategy Engine',
    description:
      'An intelligent system for automated options strategy generation, optimisation and backtesting, built alongside a Python/Flask backtesting framework with a React dashboard for visualising performance. Containerised with Docker.',
    techStack: ['Python', 'Flask', 'React', 'Docker', 'Pandas', 'NumPy'],
    githubUrl: 'https://github.com/pranati243/backtesting',
    demoUrl: 'https://options-backtest.shankh.tech/',
    motivation:
      'Built during my internship at InfinityPool Finnotech. I wanted to understand derivatives, payoff structures and risk–reward dynamics properly, so I built the thing that generates, optimises and backtests the strategies rather than just reading about them.',
    order: 1,
    featured: true,
  },
   {
    id: 'eras',
    name: 'Event Management & Club Recruitment System',
    description:
      'An internal web platform that streamlines fest coordination and club recruitment, with user authentication, live updates and an admin workflow for managing applicants. Part of the stack was later migrated to React and SQL.',
    techStack: ['PHP', 'JavaScript', 'React', 'SQL', 'HTML5', 'CSS3'],
    githubUrl: 'https://github.com/pranati243/ERAS',
    motivation:
      'This was my first full-stack project, built to replace the scattered spreadsheets and forms our clubs were using for fest coordination and recruitment. It went on to place 3rd at TechSparks, a national level competition.',
    award: '3rd place · TechSparks',
    order: 2,
    featured: true,
  },
  {
    id: 'ims',
    name: 'Information Management System (IMS) for Fr. CRIT',
    description:
      'A web-based information management system built for college use that enables faculty and students to store, update, and track academic and administrative data in a centralized platform.',
    techStack: ['PHP', 'SQL', 'JavaScript', 'HTML5', 'CSS3'],
    githubUrl: 'https://github.com/pranati243/IMS_25',
    demoUrl: 'https://ims-25-omega.vercel.app/',
    motivation:
      'I built this system to streamline how faculty and students manage and access college-related data, replacing fragmented manual processes with a structured, reliable, and easy-to-use digital solution. It also meant designing secure interfaces for data upload and multi-level approval workflows between departments.',
    order: 3,
    featured: true,
  },
  {
    id: 'lablink',
    name: 'LabLink: Laboratory Component Management System',
    description:
      'A Flutter and Firebase-based system that lets students check real-time availability and manage borrowing of laboratory components, solving the common problem of not knowing whether required equipment is available.',
    techStack: ['Flutter', 'Firebase', 'Dart', 'Cloud Firestore', 'Firebase Authentication'],
    githubUrl: 'https://github.com/pranati243/LabLink',
    motivation:
      'I built this to solve a real problem we faced as students — often we didn’t know whether a required lab component was available until we physically went to the lab. This system makes availability transparent, saves time during lab hours, and improves how shared resources are managed.',
    order: 4,
    featured: true,
  },
 
  
];

export default projects;
