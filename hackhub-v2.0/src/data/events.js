export const hackathons = [
  {
    id: "hack_nexus_2026",
    title: "NexusHack 2026: AI & Intelligent Systems",
    organizer: "ACM Student Chapter & IEEE",
    bannerBg: "from-indigo-600 to-blue-700",
    tags: ["AI/ML", "Generative AI", "Web", "Cloud"],
    category: "AI",
    status: "Active", // "Active" | "Upcoming" | "Completed"
    registrationStatus: "Open",
    startDate: "Oct 12, 2026",
    endDate: "Oct 14, 2026",
    registrationDeadline: "Oct 10, 2026",
    submissionDeadline: "Oct 14, 2026 · 11:59 PM",
    location: "National Institute of Technology (Hybrid)",
    prizePool: "₹2,50,000",
    teamSize: "2 - 4 Members",
    challengeCount: 3,
    description: "A 48-hour intensive hackathon uniting engineers, designers, and AI researchers to build practical, production-ready intelligent workflows solving campus, healthcare, and education bottlenecks.",
    rules: [
      { id: "r1", section: "1.0", title: "Eligibility & Teams", text: "Open to all enrolled undergraduate and postgraduate students. Teams must consist of 2 to 4 members." },
      { id: "r2", section: "2.0", title: "Original Work", text: "All code must be authored during the 48-hour sprint. Open source libraries, SDKs, and pre-trained weights are allowed provided they are declared in the README." },
      { id: "r3", section: "3.0", title: "Technology Restrictions", text: "No paid proprietary backends without public tier. Teams may use free tier APIs, open-source models (Ollama, HuggingFace), and public cloud credits." },
      { id: "r4", section: "4.0", title: "Deliverables", text: "Public GitHub repository with MIT/Apache license, working deployed demo link, 2-minute demonstration video, and slide deck." },
    ],
    judgingCriteria: [
      { criteria: "Innovation & Originality", weight: "25%", desc: "Novelty of approach and real-world problem relevance." },
      { criteria: "Technical Execution", weight: "30%", desc: "Architecture cleanliness, code quality, stability, and proper API design." },
      { criteria: "UI/UX & Accessibility", weight: "20%", desc: "Intuitive user journeys, responsive design, and visual polish." },
      { criteria: "Impact & Feasibility", weight: "25%", desc: "Practical readiness, scalability, and clarity of the demo pitch." }
    ],
    challenges: [
      {
        id: "chal_ai_edu",
        title: "Intelligent Adaptive Study Engine",
        track: "AI & Education",
        problemStatement: "College students struggle with unstructured textbook PDFs, syllabus revisions, and exam stress without targeted micro-learning paths.",
        description: "Build an AI-powered assistant that ingests course syllabi and lecture slides, analyzes student weaknesses through quick diagnostic tests, and dynamically generates actionable daily study sprints with automated quizzes.",
        requirements: [
          "Interactive student dashboard for subject syllabus tracking",
          "Automated question generator from document context",
          "Progress and knowledge retention analytics",
          "Clean responsive UI with zero clutter"
        ],
        recommendedSkills: ["React", "Tailwind CSS", "Node.js", "Python / LangChain", "MongoDB / PostgreSQL"],
        deadline: "Oct 14, 2026 · 11:59 PM",
        teamRequirements: "2-4 Members (Backend + Frontend + AI/ML recommended)"
      },
      {
        id: "chal_smart_campus",
        title: "Campus Resource & Energy Optimization",
        track: "IoT & Web",
        problemStatement: "High energy wastage in university labs, unmonitored classroom electricity usage, and chaotic library seating availability.",
        description: "Develop a live telemetry dashboard and smart booking portal that aggregates simulated IoT sensor feeds to automate lab equipment scheduling and energy consumption insights.",
        requirements: [
          "Real-time sensor telemetry visualizer (power consumption & room occupancy)",
          "Room/lab seat reservation workflow with collision prevention",
          "Predictive peak-hour electricity usage alerts"
        ],
        recommendedSkills: ["React", "FastAPI / Node.js", "MQTT / WebSockets", "PostgreSQL"],
        deadline: "Oct 14, 2026 · 11:59 PM",
        teamRequirements: "2-4 Members (Frontend + IoT/Backend)"
      },
      {
        id: "chal_telehealth",
        title: "Rural Tele-Triage & Diagnostic Assistant",
        track: "Healthcare & AI",
        problemStatement: "Primary healthcare clinics in remote locations face acute shortages of specialists and structured patient triage systems.",
        description: "Create a lightweight, offline-resilient digital triage web app allowing community health workers to record patient vitals, receive AI-assisted symptom stratification, and queue priority tele-consultations.",
        requirements: [
          "Offline-first patient data capture",
          "Visual symptom selector and risk assessment matrix",
          "Secure doctor dashboard with exportable medical summaries"
        ],
        recommendedSkills: ["React", "TypeScript", "Node.js", "IndexedDB / SQLite", "Tailwind CSS"],
        deadline: "Oct 14, 2026 · 11:59 PM",
        teamRequirements: "2-4 Members (Full Stack + UI/UX)"
      }
    ]
  },
  {
    id: "hack_webcraft_2026",
    title: "WebCraft Global Hackathon 2026",
    organizer: "DevCommunity & GitHub Campus",
    bannerBg: "from-emerald-600 to-teal-700",
    tags: ["Web", "DevTools", "Open Innovation"],
    category: "Web",
    status: "Upcoming",
    registrationStatus: "Open",
    startDate: "Nov 02, 2026",
    endDate: "Nov 04, 2026",
    registrationDeadline: "Oct 28, 2026",
    submissionDeadline: "Nov 04, 2026 · 10:00 PM",
    location: "100% Online",
    prizePool: "₹1,80,000",
    teamSize: "1 - 3 Members",
    challengeCount: 2,
    description: "Focusing on developer experience, modern web performance, accessible component libraries, and browser productivity tools.",
    rules: [
      { id: "r1", section: "1.0", title: "Eligibility", text: "Open globally to student developers." }
    ],
    judgingCriteria: [
      { criteria: "Developer Experience & UX", weight: "40%", desc: "How easy and pleasant the tool is to use." },
      { criteria: "Code Architecture", weight: "35%", desc: "Component modularity and performance." },
      { criteria: "Documentation", weight: "25%", desc: "Clear README and installation instructions." }
    ],
    challenges: [
      {
        id: "chal_devtools",
        title: "Lightweight API Mocking & Inspector Studio",
        track: "Developer Tools",
        problemStatement: "Frontend developers frequently get blocked waiting for backend endpoints during hackathons and agile sprints.",
        description: "Build an in-browser zero-config API mock generator that allows frontend devs to define schema models and instantly get mock REST endpoints with simulated network lag.",
        recommendedSkills: ["React", "JavaScript", "IndexedDB", "Tailwind CSS"],
        deadline: "Nov 04, 2026 · 10:00 PM",
        teamRequirements: "1-3 Members"
      }
    ]
  },
  {
    id: "hack_cybersec_2026",
    title: "CyberShield Collegiate Defense Sprint",
    organizer: "National Cyber Security Cell",
    bannerBg: "from-slate-800 to-slate-950",
    tags: ["Cybersecurity", "Zero Trust", "Cloud Security"],
    category: "Cybersecurity",
    status: "Upcoming",
    registrationStatus: "Open",
    startDate: "Nov 15, 2026",
    endDate: "Nov 16, 2026",
    registrationDeadline: "Nov 10, 2026",
    submissionDeadline: "Nov 16, 2026 · 6:00 PM",
    location: "IIT Delhi (On-Campus)",
    prizePool: "₹3,00,000",
    teamSize: "3 - 4 Members",
    challengeCount: 2,
    description: "Build resilient security dashboards, automated vulnerability scanning monitors, and identity authentication systems.",
    rules: [],
    judgingCriteria: [],
    challenges: [
      {
        id: "chal_sec_audit",
        title: "Automated JWT & RBAC Policy Auditor",
        track: "Cybersecurity",
        problemStatement: "Broken object-level authorization (BOLA) remains the top security risk in student and early-stage startup backends.",
        description: "Create an interactive security scanner that analyzes API routes and checks for privilege escalation vulnerabilities.",
        recommendedSkills: ["Python", "Node.js", "Cybersecurity", "React"],
        deadline: "Nov 16, 2026 · 6:00 PM",
        teamRequirements: "3-4 Members"
      }
    ]
  },
  {
    id: "hack_iot_makers_2026",
    title: "SmartCity & Hardware Makeathon",
    organizer: "Makerspace Hub",
    bannerBg: "from-amber-600 to-orange-700",
    tags: ["IoT", "Hardware", "Smart Cities"],
    category: "IoT",
    status: "Upcoming",
    registrationStatus: "Open",
    startDate: "Dec 01, 2026",
    endDate: "Dec 03, 2026",
    registrationDeadline: "Nov 25, 2026",
    submissionDeadline: "Dec 03, 2026 · 8:00 PM",
    location: "Bangalore Maker Studio",
    prizePool: "₹2,00,000",
    teamSize: "2 - 4 Members",
    challengeCount: 1,
    description: "Connect microcontrollers, sensor meshes, and cloud web dashboards to solve civic traffic and waste management issues.",
    rules: [],
    judgingCriteria: [],
    challenges: []
  },
  {
    id: "hack_open_hack_2026",
    title: "OpenSphere Student Hackfest",
    organizer: "OpenSource Club",
    bannerBg: "from-purple-600 to-indigo-800",
    tags: ["Open Innovation", "Full Stack", "Social Impact"],
    category: "Open Innovation",
    status: "Active",
    registrationStatus: "Open",
    startDate: "Oct 20, 2026",
    endDate: "Oct 22, 2026",
    registrationDeadline: "Oct 18, 2026",
    submissionDeadline: "Oct 22, 2026 · 11:59 PM",
    location: "Online",
    prizePool: "₹1,50,000",
    teamSize: "2 - 4 Members",
    challengeCount: 2,
    description: "Open track hackathon welcoming any innovative project solving collegiate life, hostel management, or student mental health.",
    rules: [],
    judgingCriteria: [],
    challenges: []
  }
];
