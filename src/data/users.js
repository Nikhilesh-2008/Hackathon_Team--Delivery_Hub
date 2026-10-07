export const currentUser = {
  id: "usr_karthik",
  name: "Karthik",
  email: "karthik.dev@college.edu",
  role: "Participant", // Participant | Mentor | Organizer | Judge
  specialization: "Backend Developer",
  avatar: "",
  bio: "Pre-final year CS student passionate about distributed systems, clean REST architectures, and developer tooling. Looking to build high-impact hackathon solutions.",
  college: "National Institute of Technology",
  year: "3rd Year, B.Tech CSE",
  reputation: 1250,
  availability: "8-10 hours/week",
  skills: ["Node.js", "MongoDB", "Express", "Java", "Python", "Redis", "PostgreSQL", "Docker", "Git"],
  interests: ["AI", "Hackathons", "Web Development", "Developer Tools", "Cloud Systems"],
  codingProfiles: {
    github: "https://github.com/karthik-dev",
    leetcode: "https://leetcode.com/karthik_code",
    codechef: "https://codechef.com/users/karthik_99",
    codeforces: "https://codeforces.com/profile/karthik_cf",
  },
  projects: [
    {
      id: "p1",
      title: "AI Study Planner",
      description: "Generates tailored revision roadmaps based on syllabus PDF analysis and user availability.",
      techStack: ["Node.js", "Express", "OpenAI API", "MongoDB"],
      githubUrl: "https://github.com/karthik-dev/ai-study-planner",
      liveUrl: "https://study-planner-demo.vercel.app",
    },
    {
      id: "p2",
      title: "Smart Traffic Management System",
      description: "Computer vision and IoT backend to dynamically allocate green light timings at high-density intersections.",
      techStack: ["Python", "FastAPI", "OpenCV", "PostgreSQL"],
      githubUrl: "https://github.com/karthik-dev/smart-traffic-backend",
      liveUrl: null,
    },
    {
      id: "p3",
      title: "Hackathon Team Finder",
      description: "Skill matching and real-time collaboration workspace prototype for collegiate hackathons.",
      techStack: ["React", "Node.js", "Tailwind CSS", "Socket.io"],
      githubUrl: "https://github.com/karthik-dev/hackathon-team-hub",
      liveUrl: "https://hackhub.dev",
    },
  ],
  certificates: [
    {
      id: "c1",
      title: "AWS Certified Cloud Practitioner",
      issuer: "Amazon Web Services",
      date: "Jan 2026",
    },
    {
      id: "c2",
      title: "Postman API Fundamentals Student Expert",
      issuer: "Postman",
      date: "Nov 2025",
    },
  ],
  hackathonHistory: [
    {
      id: "h1",
      name: "AI Innovation Challenge 2025",
      position: "Winner (1st Place)",
      project: "CodeMentor AI",
      date: "Dec 2025",
      reputationEarned: 1000,
    },
    {
      id: "h2",
      name: "Smart India Hackathon (College Internal)",
      position: "Finalist",
      project: "AgriSupply Chain",
      date: "Oct 2025",
      reputationEarned: 150,
    },
    {
      id: "h3",
      name: "HackOverflow 3.0",
      position: "Participant",
      project: "Campus Connect",
      date: "Aug 2025",
      reputationEarned: 100,
    },
  ],
};

export const participants = [
  {
    id: "usr_rahul",
    name: "Rahul Sharma",
    role: "Frontend Developer",
    specialization: "Frontend Developer",
    college: "IIT Bombay",
    year: "3rd Year",
    avatar: "",
    bio: "Passionate React & Next.js frontend dev. Love crafting crisp, responsive interfaces with clean Tailwind & micro-interactions.",
    reputation: 1180,
    matchScore: 94,
    availability: "8 hrs/week",
    skills: ["React", "Next.js", "TypeScript", "Tailwind CSS", "Redux Toolkit", "Figma"],
    interests: ["AI", "Healthcare", "EdTech", "Web3"],
    codingProfiles: {
      github: "https://github.com/rahul-sharma-dev",
      leetcode: "https://leetcode.com/rahul_fe",
    },
    projects: [
      {
        id: "rp1",
        title: "HealthPulse Telemedicine UI",
        description: "Accessible, responsive web clinic dashboard for rural doctors with offline capabilities.",
        techStack: ["Next.js", "Tailwind CSS", "TypeScript"],
        githubUrl: "https://github.com/rahul-sharma-dev/healthpulse",
      }
    ],
    whyThisPerson: {
      skillsMatch: "Strong React & TypeScript frontend match for our backend",
      interestMatch: "Deeply interested in AI + Healthcare domain",
      availabilityMatch: "Available 8 hrs/week during hackathon sprint",
      experienceMatch: "4 previous hackathons, 1 finalist medal",
      reputationScore: 1180,
    }
  },
  {
    id: "usr_ananya",
    name: "Ananya Iyer",
    role: "UI/UX Designer",
    specialization: "UI/UX Designer",
    college: "BITS Pilani",
    year: "4th Year",
    avatar: "",
    bio: "Human-centered product designer. Specialized in rapid wireframing, design systems, usability research, and frontend translation in React.",
    reputation: 1320,
    matchScore: 89,
    availability: "10 hrs/week",
    skills: ["Figma", "Design Systems", "Tailwind CSS", "Wireframing", "User Research", "Prototyping"],
    interests: ["FinTech", "Accessibility", "Open Innovation", "Developer Tools"],
    codingProfiles: {
      github: "https://github.com/ananya-designs",
    },
    projects: [
      {
        id: "ap1",
        title: "FinFlow Mobile Banking System",
        description: "Zero-clutter personal finance budgeting tool with 40+ atomic components.",
        techStack: ["Figma", "React", "Tailwind CSS"],
        githubUrl: "https://github.com/ananya-designs/finflow-ds",
      }
    ],
    whyThisPerson: {
      skillsMatch: "Complete UI/UX system specialist with React layout experience",
      interestMatch: "Passionate about clean user-centric interfaces",
      availabilityMatch: "10 hrs/week available throughout submission week",
      experienceMatch: "Won Best UI award at HackNIT 2025",
      reputationScore: 1320,
    }
  },
  {
    id: "usr_vivek",
    name: "Vivek Patel",
    role: "AI/ML Developer",
    specialization: "AI/ML Developer",
    college: "IIIT Hyderabad",
    year: "3rd Year",
    avatar: "",
    bio: "Specializing in LangChain RAG pipelines, fine-tuning lightweight SLMs, PyTorch, and multimodal agent workflows.",
    reputation: 1410,
    matchScore: 92,
    availability: "12 hrs/week",
    skills: ["Python", "PyTorch", "Hugging Face", "LangChain", "FastAPI", "Vector DBs"],
    interests: ["AI", "Generative AI", "Computer Vision", "Robotics"],
    codingProfiles: {
      github: "https://github.com/vivek-ai-hub",
      leetcode: "https://leetcode.com/vivek_ml",
      kaggle: "https://kaggle.com/vivekpatel",
    },
    projects: [
      {
        id: "vp1",
        title: "DocuQuery RAG Assistant",
        description: "Local RAG assistant for querying hundreds of academic papers simultaneously with source citations.",
        techStack: ["Python", "LangChain", "ChromaDB", "FastAPI"],
        githubUrl: "https://github.com/vivek-ai-hub/docuquery",
      }
    ],
    whyThisPerson: {
      skillsMatch: "Core Python & LangChain AI engineer needed for the AI challenge",
      interestMatch: "Direct match with current hackathon AI track",
      availabilityMatch: "High commitment (12 hrs/week)",
      experienceMatch: "6 hackathons, 2-time category winner",
      reputationScore: 1410,
    }
  },
  {
    id: "usr_priya",
    name: "Priya Nair",
    role: "DevOps & Cloud Engineer",
    specialization: "DevOps Developer",
    college: "VIT Vellore",
    year: "4th Year",
    avatar: "",
    bio: "CI/CD pipelines, Docker, Kubernetes, Terraform, and automated cloud deployments on AWS & GCP. Ensuring zero deployment headaches.",
    reputation: 1100,
    matchScore: 85,
    availability: "6 hrs/week",
    skills: ["Docker", "Kubernetes", "AWS", "GitHub Actions", "Terraform", "Linux"],
    interests: ["Cloud Systems", "Cybersecurity", "Developer Tools"],
    codingProfiles: {
      github: "https://github.com/priya-ops",
    },
    projects: [
      {
        id: "pr1",
        title: "AutoDeploy Hackathon Boilerplate",
        description: "One-click GitHub Actions workflow for zero-downtime full-stack deployments on Render & Vercel.",
        techStack: ["Docker", "GitHub Actions", "Bash"],
        githubUrl: "https://github.com/priya-ops/autodeploy",
      }
    ],
    whyThisPerson: {
      skillsMatch: "Ensures seamless hosting and live demo deployment",
      interestMatch: "Focus on stable cloud infrastructure",
      availabilityMatch: "Flexible evening hours",
      experienceMatch: "3 previous hackathon submissions delivered",
      reputationScore: 1100,
    }
  },
  {
    id: "usr_tanmay",
    name: "Tanmay Deshmukh",
    role: "Full Stack Developer",
    specialization: "Full Stack Developer",
    college: "DTU Delhi",
    year: "3rd Year",
    avatar: "",
    bio: "MERN Stack generalist + Next.js fanatic. Fast prototyping and building end-to-end features during 24-hour sprints.",
    reputation: 1200,
    matchScore: 88,
    availability: "8 hrs/week",
    skills: ["React", "Node.js", "PostgreSQL", "Prisma", "Express", "Tailwind CSS"],
    interests: ["Web Development", "FinTech", "Open Innovation"],
    codingProfiles: {
      github: "https://github.com/tanmay-fullstack",
      leetcode: "https://leetcode.com/tanmay_dtu",
    },
    projects: [
      {
        id: "tp1",
        title: "CollabBoard Realtime Canvas",
        description: "Shared brainstorming whiteboard with real-time websocket updates.",
        techStack: ["React", "Node.js", "Socket.io", "PostgreSQL"],
        githubUrl: "https://github.com/tanmay-fullstack/collabboard",
      }
    ],
    whyThisPerson: {
      skillsMatch: "Covers both frontend bridges and REST API endpoints",
      interestMatch: "Enjoys fast-paced open innovation challenges",
      availabilityMatch: "Weekend availability",
      experienceMatch: "3 hackathons completed",
      reputationScore: 1200,
    }
  },
  {
    id: "usr_sneha",
    name: "Sneha Mukherjee",
    role: "Database & Backend Developer",
    specialization: "Database Developer",
    college: "Jadavpur University",
    year: "3rd Year",
    avatar: "",
    bio: "Database indexing, query optimization, PostgreSQL schema modeling, Redis caching, and graph database algorithms.",
    reputation: 1050,
    matchScore: 78,
    availability: "6-8 hrs/week",
    skills: ["PostgreSQL", "MongoDB", "Redis", "Neo4j", "SQL Optimization", "Node.js"],
    interests: ["Data Engineering", "Backend", "AI"],
    codingProfiles: {
      github: "https://github.com/sneha-db",
      leetcode: "https://leetcode.com/sneha_sql",
    },
    projects: [
      {
        id: "sp1",
        title: "CacheFast High Throughput API",
        description: "Benchmarked Redis caching layer reducing p99 latency from 450ms to 18ms.",
        techStack: ["Node.js", "Redis", "PostgreSQL"],
        githubUrl: "https://github.com/sneha-db/cachefast",
      }
    ],
    whyThisPerson: {
      skillsMatch: "Deep DB schema & performance knowledge",
      interestMatch: "Data heavy backend systems",
      availabilityMatch: "6-8 hrs/week",
      experienceMatch: "2 hackathon projects completed",
      reputationScore: 1050,
    }
  },
  {
    id: "usr_aditya",
    name: "Aditya Verma",
    role: "Cybersecurity Analyst",
    specialization: "Cybersecurity",
    college: "BITS Goa",
    year: "4th Year",
    avatar: "",
    bio: "Application security, OAuth2 security audits, zero-trust backend authorization, and CTF player.",
    reputation: 980,
    matchScore: 74,
    availability: "5 hrs/week",
    skills: ["Application Security", "Penetration Testing", "Python", "OAuth2", "Cryptography"],
    interests: ["Cybersecurity", "Blockchain", "Cloud Systems"],
    codingProfiles: {
      github: "https://github.com/aditya-sec",
    },
    projects: [
      {
        id: "av1",
        title: "AuthShield JWT Auditor",
        description: "Automated scanner for JWT misconfigurations and weak algorithm attacks.",
        techStack: ["Python", "Cryptography", "FastAPI"],
        githubUrl: "https://github.com/aditya-sec/authshield",
      }
    ],
    whyThisPerson: {
      skillsMatch: "Strong security implementation for web endpoints",
      interestMatch: "Cybersecurity domain track",
      availabilityMatch: "5 hrs/week",
      experienceMatch: "CTF finalist",
      reputationScore: 980,
    }
  },
  {
    id: "usr_meera",
    name: "Meera Krishnan",
    role: "IoT & Embedded Systems Engineer",
    specialization: "IoT Developer",
    college: "PSG College of Tech",
    year: "3rd Year",
    avatar: "",
    bio: "Bridging hardware sensors with MQTT brokers and web telemetry dashboards. ESP32, Raspberry Pi, and Arduino.",
    reputation: 1120,
    matchScore: 81,
    availability: "8 hrs/week",
    skills: ["ESP32", "C++", "MQTT", "Python", "Node-RED", "Raspberry Pi"],
    interests: ["IoT", "Smart Cities", "Healthcare", "Robotics"],
    codingProfiles: {
      github: "https://github.com/meera-iot",
    },
    projects: [
      {
        id: "mk1",
        title: "SmartAir Campus Sensor Grid",
        description: "Low-cost wireless sensor network broadcasting AQI data via MQTT to cloud dashboard.",
        techStack: ["ESP32", "C++", "MQTT", "Node.js"],
        githubUrl: "https://github.com/meera-iot/smartair",
      }
    ],
    whyThisPerson: {
      skillsMatch: "Hardware and sensor communication expert",
      interestMatch: "IoT and Smart City challenges",
      availabilityMatch: "8 hrs/week",
      experienceMatch: "Winner of IoT Makeathon 2025",
      reputationScore: 1120,
    }
  }
];

export const demoRoles = [
  { id: "Participant", name: "Karthik (Participant)", role: "Participant", badge: "Student Dev" },
  { id: "Mentor", name: "Dr. Arvind Rao", role: "Mentor", badge: "Faculty Mentor" },
  { id: "Judge", name: "Siddharth Sen", role: "Judge", badge: "Senior Industry Judge" },
  { id: "Organizer", name: "Aakash Mehta", role: "Organizer", badge: "Hackathon Lead" },
];
