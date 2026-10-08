export const mockTeams = [
  {
    id: "team_nova",
    name: "Team Nova",
    hackathonId: "hack_nexus_2026",
    hackathonTitle: "NexusHack 2026: AI & Intelligent Systems",
    challengeId: "chal_ai_edu",
    challengeTitle: "Intelligent Adaptive Study Engine",
    progress: 72,
    captainId: "usr_karthik",
    avatar: "",
    description: "Building an AI-driven adaptive syllabus roadmap and automated quiz diagnostic platform.",
    members: [
      {
        id: "usr_karthik",
        name: "Karthik",
        role: "Backend & Systems",
        specialization: "Backend Developer",
        isCaptain: true,
        taskCount: 7,
        availability: "8-10 hrs/week",
        skills: ["Node.js", "Express", "MongoDB", "Python"],
      },
      {
        id: "usr_rahul",
        name: "Rahul Sharma",
        role: "Frontend Lead",
        specialization: "Frontend Developer",
        isCaptain: false,
        taskCount: 6,
        availability: "8 hrs/week",
        skills: ["React", "Tailwind CSS", "TypeScript"],
      },
      {
        id: "usr_ananya",
        name: "Ananya Iyer",
        role: "UI/UX & Design Systems",
        specialization: "UI/UX Designer",
        isCaptain: false,
        taskCount: 4,
        availability: "10 hrs/week",
        skills: ["Figma", "Design Systems", "Tailwind"],
      },
      {
        id: "usr_vivek",
        name: "Vivek Patel",
        role: "AI/RAG Pipeline",
        specialization: "AI/ML Developer",
        isCaptain: false,
        taskCount: 5,
        availability: "12 hrs/week",
        skills: ["LangChain", "FastAPI", "Vector DBs"],
      }
    ],
    technicalDecisions: [
      { id: "td1", title: "Adopt Tailwind CSS for Rapid UI Consistency", author: "Ananya Iyer", date: "2 days ago", status: "Approved" },
      { id: "td2", title: "Use Local Vector Embeddings (FastAPI) to avoid API latency", author: "Vivek Patel", date: "Yesterday", status: "Approved" },
      { id: "td3", title: "Deploy Backend on Render and Frontend on Vercel", author: "Karthik", date: "Today", status: "In Discussion" },
    ],
    chatMessages: [
      { id: "m1", senderId: "usr_ananya", senderName: "Ananya", text: "I finished the student dashboard wireframes in Figma. Ready for review!", timestamp: "10:15 AM" },
      { id: "m2", senderId: "usr_rahul", senderName: "Rahul", text: "Awesome! The layout looks super clean. Starting to build the React components now.", timestamp: "10:20 AM" },
      { id: "m3", senderId: "usr_karthik", senderName: "Karthik", text: "Working on the diagnostic quiz evaluation endpoints in Node.js right now.", timestamp: "10:35 AM" },
      { id: "m4", senderId: "usr_vivek", senderName: "Vivek", text: "LangChain pipeline generates flashcards reliably from test PDFs now. Will expose via FastAPI.", timestamp: "11:00 AM" },
    ]
  },
  {
    id: "team_bytecraft",
    name: "ByteCraft",
    hackathonId: "hack_webcraft_2026",
    hackathonTitle: "WebCraft Global Hackathon 2026",
    challengeId: "chal_devtools",
    challengeTitle: "Lightweight API Mocking Studio",
    progress: 40,
    captainId: "usr_tanmay",
    members: [
      { id: "usr_tanmay", name: "Tanmay Deshmukh", role: "Full Stack", isCaptain: true, taskCount: 4, availability: "8 hrs/wk", skills: ["React", "Node.js"] },
      { id: "usr_sneha", name: "Sneha Mukherjee", role: "Database Dev", isCaptain: false, taskCount: 3, availability: "6 hrs/wk", skills: ["PostgreSQL", "Redis"] }
    ]
  },
  {
    id: "team_cybersentry",
    name: "CyberSentry",
    hackathonId: "hack_cybersec_2026",
    hackathonTitle: "CyberShield Defense Sprint",
    challengeId: "chal_sec_audit",
    challengeTitle: "Automated JWT & RBAC Policy Auditor",
    progress: 25,
    captainId: "usr_aditya",
    members: [
      { id: "usr_aditya", name: "Aditya Verma", role: "Sec Lead", isCaptain: true, taskCount: 3, availability: "5 hrs/wk", skills: ["Security", "Python"] },
      { id: "usr_priya", name: "Priya Nair", role: "DevOps", isCaptain: false, taskCount: 2, availability: "6 hrs/wk", skills: ["Docker", "AWS"] }
    ]
  }
];

export const mockTasks = [
  {
    id: "task_1",
    title: "Build Authentication & Role Switcher UI",
    owner: "Rahul Sharma",
    ownerAvatar: "",
    status: "COMPLETED", // "TODO" | "IN_PROGRESS" | "BLOCKED" | "COMPLETED"
    priority: "High",
    deadline: "Oct 12",
    tag: "Frontend",
    description: "Implement simple clean login screen and quick demo role selection bar."
  },
  {
    id: "task_2",
    title: "Design Student Dashboard Wireframes",
    owner: "Ananya Iyer",
    ownerAvatar: "",
    status: "COMPLETED",
    priority: "Medium",
    deadline: "Oct 12",
    tag: "Design",
    description: "Figma wireframes with clear hierarchy for syllabus progress and study cards."
  },
  {
    id: "task_3",
    title: "Implement Syllabus Extraction & Ingestion Pipeline",
    owner: "Vivek Patel",
    ownerAvatar: "",
    status: "COMPLETED",
    priority: "High",
    deadline: "Oct 13",
    tag: "AI/RAG",
    description: "Ingest syllabus PDF texts and chunk into structured topic vectors."
  },
  {
    id: "task_4",
    title: "Create REST API for Topic Quiz Generation",
    owner: "Karthik",
    ownerAvatar: "",
    status: "IN_PROGRESS",
    priority: "High",
    deadline: "Oct 13",
    tag: "Backend",
    description: "Express routes for creating customized diagnostic tests and tracking attempts."
  },
  {
    id: "task_5",
    title: "Develop Interactive Question Card UI",
    owner: "Rahul Sharma",
    ownerAvatar: "",
    status: "IN_PROGRESS",
    priority: "Medium",
    deadline: "Oct 13",
    tag: "Frontend",
    description: "Quiz card component with instant feedback, explanations, and score tracking."
  },
  {
    id: "task_6",
    title: "Setup PostgreSQL Schema & Indexing",
    owner: "Karthik",
    ownerAvatar: "",
    status: "COMPLETED",
    priority: "High",
    deadline: "Oct 12",
    tag: "Database",
    description: "User progress tables, topic completion indexes, and quiz submission schemas."
  },
  {
    id: "task_7",
    title: "Integrate LLM Flashcard Summary Prompts",
    owner: "Vivek Patel",
    ownerAvatar: "",
    status: "IN_PROGRESS",
    priority: "Medium",
    deadline: "Oct 13",
    tag: "AI/RAG",
    description: "Refine prompt engineering for 3-bullet concept summaries per syllabus section."
  },
  {
    id: "task_8",
    title: "Deploy Backend API to Cloud (Render)",
    owner: "Karthik",
    ownerAvatar: "",
    status: "BLOCKED",
    priority: "High",
    deadline: "Oct 14",
    tag: "DevOps",
    description: "Resolve SSL handshake and CORS policy issue on staging instance."
  },
  {
    id: "task_9",
    title: "Record 2-Minute Product Demo Walkthrough",
    owner: "Ananya Iyer",
    ownerAvatar: "",
    status: "TODO",
    priority: "High",
    deadline: "Oct 14",
    tag: "Submission",
    description: "Screen capture key user flow: syllabus upload -> dynamic roadmap -> diagnostic quiz."
  },
  {
    id: "task_10",
    title: "Finalize Slide Deck & Problem Impact PPT",
    owner: "Rahul Sharma",
    ownerAvatar: "",
    status: "TODO",
    priority: "Medium",
    deadline: "Oct 14",
    tag: "Submission",
    description: "Compile 6-slide presentation summarizing problem, tech stack, architecture, and roadmap."
  },
  {
    id: "task_11",
    title: "Run End-to-End Responsive Testing",
    owner: "Ananya Iyer",
    ownerAvatar: "",
    status: "TODO",
    priority: "Low",
    deadline: "Oct 14",
    tag: "QA",
    description: "Validate dashboard responsiveness on mobile devices and tablet breakpoints."
  },
  {
    id: "task_12",
    title: "Review Rulebook Submission Checklist",
    owner: "Karthik",
    ownerAvatar: "",
    status: "TODO",
    priority: "High",
    deadline: "Oct 14",
    tag: "Submission",
    description: "Verify all mandatory deliverables (repo, live link, video, slide deck) conform to rules."
  }
];

export const mockTimeline = [
  { day: "Day 1 (Monday)", date: "Oct 12", title: "Project Setup & Design Tokens", status: "completed", desc: "Team sync, GitHub repo initialized, design system components created." },
  { day: "Day 1 (Monday)", date: "Oct 12", title: "Database Schema & Ingestion API", status: "completed", desc: "Database models designed, initial syllabus parsing prototype tested." },
  { day: "Day 2 (Tuesday)", date: "Oct 13", title: "Core UI Flow & AI Pipeline", status: "in_progress", desc: "Building question cards, hooking up LLM flashcard generation." },
  { day: "Day 2 (Tuesday)", date: "Oct 13", title: "Backend Deployment & Testing", status: "pending", desc: "Unblock staging API deployment and test full end-to-end flow." },
  { day: "Day 3 (Wednesday)", date: "Oct 14", title: "Demo Video & Final Submission", status: "pending", desc: "Screen recording demo, slide deck completion, and official submission." },
];
