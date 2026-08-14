export const resume = {
  summary:
    'IT undergraduate with hands-on experience across full-stack web development (Python/Flask, React, PHP) and current research experience applying machine learning to computer vision problems. Comfortable working across the stack from database to UI, with a growing focus on applied ML.',
  education: [
    {
      degree: 'B.Tech in Information Technology',
      institution: 'Fr. C. Rodrigues Institute of Technology, Vashi',
      year: 'Aug 2023 — June 2027 (expected)',
      cgpa: '9.5 / 10',
      details:
        'Focus on Software Engineering, Full-Stack Web Development, Databases, and Data Structures & Algorithms.',
    },
    {
      degree: 'Class XII (HSC)',
      institution: 'Arya Gurukul International College, Airoli',
      year: 'May 2023',
      score: '75.83%',
    },
    {
      degree: 'Class X (ICSE)',
      institution: 'Hiranandani Foundation School, Thane',
      year: 'July 2021',
      score: '97%',
    },
  ],
  experience: [
    {
      title: 'Project Intern',
      company: 'Tata Institute of Fundamental Research (TIFR)',
      duration: 'June 2026 — Present',
      current: true,
      description:
        'Researching an ML-based inspection pipeline for the CMS Live Module, focused on automated wirebond inspection.',
      responsibilities: [
        'Building a YOLO-based object detection pipeline for automated wirebond defect identification',
        'Reviewing existing detection architectures and datasets to design a suitable model pipeline ahead of implementation',
      ],
    },
    {
      title: 'Software Engineer Intern',
      company: 'InfinityPool Finnotech',
      duration: 'June 2025 — April 2026',
      distinction: 'Completed with distinction',
      distinctionNote: 'Offered an extension at the end of the internship',
      description:
        'Built backtesting and options tooling for evaluating equity and derivatives trading strategies.',
      responsibilities: [
        'Developed a backtesting framework in Python and Flask to evaluate equity trading strategies against historical data, with a React dashboard for visualising performance',
        'Built an Options Strategy Engine to generate, optimise and backtest dynamic options strategies',
        'Containerised the application with Docker for consistent deployment',
      ],
    },
    {
      title: 'Web Development Intern (In-house)',
      company: 'Fr. CRIT, Vashi',
      duration: 'Dec 2024 — July 2025',
      description:
        'Built internal platforms used by college faculty and students for data management and fest coordination.',
      responsibilities: [
        'Built the Information Management System (IMS) for faculty and students using PHP and SQL, centralising data management and streamlining workflow between departments',
        'Designed and implemented secure web interfaces for data upload and multi-level approval workflows',
        'Developed an Event Management & Club Recruitment platform to streamline fest coordination and recruitment; later migrated part of the stack to React and SQL',
      ],
    },
  ],
  /** Campus leadership — rendered as its own block in the Resume section. */
  activities: [
    {
      role: 'Secretary, Institute Innovation Council (IIC)',
      organisation: 'Fr. CRIT',
      duration: 'June 2025 — June 2026',
      description:
        'Supporting campus innovation and entrepreneurship through idea competitions, mentorship and hackathons.',
    },
    {
      role: 'Member, E-Cell (Entrepreneurship Cell)',
      organisation: 'Fr. CRIT',
      duration: 'Aug 2024 — June 2026',
      description: 'Organising project competitions, outreach programmes and innovation workshops.',
    },
  ],
  achievements: [
    {
      title: '3rd place — TechSparks, national level competition',
      detail: 'For the Event Management and Club Recruitment System',
    },
    {
      title: 'Smart India Hackathon',
      detail: 'Participant in the 2024 and 2025 editions',
    },
  ],
  certifications: [],
};

export default resume;
