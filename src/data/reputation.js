export const mockNotifications = [
  {
    id: "notif_1",
    type: "team",
    title: "Invitation Accepted",
    message: "Rahul Sharma accepted your team invitation for Team Nova.",
    time: "25m ago",
    read: false,
    link: "/team",
  },
  {
    id: "notif_2",
    type: "deadline",
    title: "Submission Approaching",
    message: "NexusHack 2026 submission closes in 28 hours (Oct 14 · 11:59 PM).",
    time: "2h ago",
    read: false,
    link: "/team/submission",
  },
  {
    id: "notif_3",
    type: "feedback",
    title: "Mentor Feedback Received",
    message: "Dr. Arvind Rao reviewed your AI Quiz generation module.",
    time: "4h ago",
    read: true,
    link: "/team/feedback",
  },
  {
    id: "notif_4",
    type: "reputation",
    title: "Reputation Updated",
    message: "You earned +15 reputation for completing 4 core backend tasks.",
    time: "1d ago",
    read: true,
    link: "/reputation",
  },
  {
    id: "notif_5",
    type: "event",
    title: "New Hackathon Announced",
    message: "Registration for WebCraft Global Hackathon 2026 is now open.",
    time: "2d ago",
    read: true,
    link: "/events",
  }
];

export const mockFeedback = [
  {
    id: "fb_1",
    teamId: "team_nova",
    authorName: "Dr. Arvind Rao",
    authorRole: "Faculty Mentor · AI & Distributed Systems",
    avatar: "",
    timestamp: "Today · 2:15 PM",
    rating: 4.5,
    title: "Promising RAG Flow, Watch Out for Vector Search Latency",
    comment: "The syllabus ingestion pipeline is well-structured. For the live jury evaluation, make sure you cache the generated diagnostic quiz questions in Redis or memory so judges do not experience a 4-5 second model inference lag during demo.",
    recommendations: [
      "Add a fast fallback cache for the sample syllabus files",
      "Include a visual indicator showing the exact source textbook chunk",
      "Keep the demo presentation concise on the actual user problem solved"
    ]
  },
  {
    id: "fb_2",
    teamId: "team_nova",
    authorName: "Pooja Hegde",
    authorRole: "Industry Mentor · Senior Product Lead",
    avatar: "",
    timestamp: "Yesterday · 6:40 PM",
    rating: 4.8,
    title: "Clean UI Hierarchy & Intuitive Flow",
    comment: "The wireframes and current component implementation look very clean. Students will immediately understand the diagnostic quiz concept. Make sure the mobile view handles the quiz timer comfortably.",
    recommendations: [
      "Ensure color contrast on score badges is sharp",
      "Add a quick celebratory animation on quiz completion"
    ]
  }
];

export const mockReputationHistory = [
  {
    id: "rep_1",
    event: "AI Innovation Challenge 2025",
    type: "Hackathon 1st Place",
    points: "+1000",
    date: "Dec 2025",
    description: "Built CodeMentor AI. Highest architectural score across 120 collegiate teams."
  },
  {
    id: "rep_2",
    event: "Smart India Hackathon Internal",
    type: "Finalist Placement",
    points: "+150",
    date: "Oct 2025",
    description: "Qualified for national finals round in Smart Agriculture category."
  },
  {
    id: "rep_3",
    event: "HackOverflow 3.0",
    type: "Event Participation & Delivery",
    points: "+100",
    date: "Aug 2025",
    description: "Completed project submission within deadline with working live demo."
  },
  {
    id: "rep_4",
    event: "NexusHack 2026 Milestone Sprints",
    type: "Task Execution",
    points: "+15",
    date: "Oct 2026",
    description: "Closed critical database and API sprint tasks ahead of schedule."
  }
];

export const mockInvitations = [
  {
    id: "inv_1",
    fromUser: {
      name: "Tanmay Deshmukh",
      avatar: "",
      teamName: "ByteCraft",
      hackathon: "WebCraft Global 2026",
      roleNeeded: "Backend Architect"
    },
    message: "Hey Karthik, saw your MongoDB & Express experience. Would love to have you architect our mocking API service.",
    status: "PENDING", // "PENDING" | "ACCEPTED" | "REJECTED"
    date: "Yesterday"
  }
];
