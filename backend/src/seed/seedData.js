import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import { User } from '../models/User.js';
import { Profile } from '../models/Profile.js';
import { Event } from '../models/Event.js';
import { Team } from '../models/Team.js';
import { Task } from '../models/Task.js';
import { MentorFeedback } from '../models/MentorFeedback.js';
import { Reputation } from '../models/Reputation.js';
import { Notification } from '../models/Notification.js';

const seedDatabase = async () => {
  try {
    await connectDB();
    console.log('[Seed] Clearing existing collections...');

    await Promise.all([
      User.deleteMany(),
      Profile.deleteMany(),
      Event.deleteMany(),
      Team.deleteMany(),
      Task.deleteMany(),
      MentorFeedback.deleteMany(),
      Reputation.deleteMany(),
      Notification.deleteMany(),
    ]);

    console.log('[Seed] Creating demo users...');
    const karthik = await User.create({
      name: 'Karthik',
      email: 'karthik.dev@college.edu',
      passwordHash: 'password123',
      role: 'Participant',
    });

    const rahul = await User.create({
      name: 'Rahul Sharma',
      email: 'rahul.dev@college.edu',
      passwordHash: 'password123',
      role: 'Participant',
    });

    const ananya = await User.create({
      name: 'Ananya Iyer',
      email: 'ananya.design@college.edu',
      passwordHash: 'password123',
      role: 'Participant',
    });

    const vivek = await User.create({
      name: 'Vivek Patel',
      email: 'vivek.ai@college.edu',
      passwordHash: 'password123',
      role: 'Participant',
    });

    const priya = await User.create({
      name: 'Priya Nair',
      email: 'priya.ops@college.edu',
      passwordHash: 'password123',
      role: 'Participant',
    });

    const arvind = await User.create({
      name: 'Dr. Arvind Rao',
      email: 'arvind.rao@college.edu',
      passwordHash: 'password123',
      role: 'Mentor',
    });

    const siddharth = await User.create({
      name: 'Siddharth Sen',
      email: 'siddharth.judge@tech.com',
      passwordHash: 'password123',
      role: 'Judge',
    });

    const aakash = await User.create({
      name: 'Aakash Mehta',
      email: 'aakash.organizer@campus.edu',
      passwordHash: 'password123',
      role: 'Organizer',
    });

    console.log('[Seed] Creating profiles...');
    await Profile.create([
      {
        user: karthik._id,
        bio: 'Pre-final year CS student passionate about distributed systems, clean REST architectures, and developer tooling.',
        specialization: 'Backend Developer',
        college: 'National Institute of Technology',
        year: '3rd Year, B.Tech CSE',
        skills: ['Node.js', 'MongoDB', 'Express', 'Java', 'Python', 'Redis', 'PostgreSQL', 'Docker'],
        interests: ['AI', 'Hackathons', 'Web Development', 'Developer Tools'],
        availability: '8-10 hours/week',
        reputationScore: 1250,
        codingProfiles: {
          github: 'https://github.com/karthik-dev',
          leetcode: 'https://leetcode.com/karthik_code',
        },
        projects: [
          {
            title: 'AI Study Planner',
            description: 'Generates tailored revision roadmaps based on syllabus PDF analysis.',
            techStack: ['Node.js', 'Express', 'MongoDB'],
            githubUrl: 'https://github.com/karthik-dev/ai-study-planner',
            liveUrl: 'https://study-planner-demo.vercel.app',
          },
          {
            title: 'Smart Traffic Management System',
            description: 'Computer vision and IoT backend to dynamically allocate green light timings.',
            techStack: ['Python', 'FastAPI', 'PostgreSQL'],
            githubUrl: 'https://github.com/karthik-dev/smart-traffic-backend',
          },
        ],
      },
      {
        user: rahul._id,
        bio: 'Passionate React & Next.js frontend dev. Love crafting crisp, responsive interfaces with clean Tailwind.',
        specialization: 'Frontend Developer',
        college: 'IIT Bombay',
        year: '3rd Year',
        skills: ['React', 'Next.js', 'TypeScript', 'Tailwind CSS', 'Figma'],
        interests: ['AI', 'Healthcare', 'EdTech'],
        availability: '8 hrs/week',
        reputationScore: 1180,
        codingProfiles: { github: 'https://github.com/rahul-sharma-dev' },
      },
      {
        user: ananya._id,
        bio: 'Human-centered product designer. Specialized in rapid wireframing and design systems.',
        specialization: 'UI/UX Designer',
        college: 'BITS Pilani',
        year: '4th Year',
        skills: ['Figma', 'Design Systems', 'Tailwind CSS', 'Prototyping'],
        interests: ['FinTech', 'Accessibility', 'Open Innovation'],
        availability: '10 hrs/week',
        reputationScore: 1320,
        codingProfiles: { github: 'https://github.com/ananya-designs' },
      },
      {
        user: vivek._id,
        bio: 'Specializing in LangChain RAG pipelines, fine-tuning lightweight SLMs, and FastAPI.',
        specialization: 'AI/ML Developer',
        college: 'IIIT Hyderabad',
        year: '3rd Year',
        skills: ['Python', 'PyTorch', 'LangChain', 'FastAPI', 'Vector DBs'],
        interests: ['AI', 'Generative AI', 'Computer Vision'],
        availability: '12 hrs/week',
        reputationScore: 1410,
        codingProfiles: { github: 'https://github.com/vivek-ai-hub' },
      },
      {
        user: priya._id,
        bio: 'CI/CD pipelines, Docker, Kubernetes, and automated cloud deployments on AWS & GCP.',
        specialization: 'DevOps Developer',
        college: 'VIT Vellore',
        year: '4th Year',
        skills: ['Docker', 'Kubernetes', 'AWS', 'GitHub Actions', 'Linux'],
        interests: ['Cloud Systems', 'Cybersecurity'],
        availability: '6 hrs/week',
        reputationScore: 1100,
      },
    ]);

    console.log('[Seed] Creating Hackathons & Challenges...');
    const nexusHack = await Event.create({
      title: 'NexusHack 2026: AI & Intelligent Systems',
      organizer: 'ACM Student Chapter & IEEE',
      tags: ['AI/ML', 'Generative AI', 'Web', 'Cloud'],
      category: 'AI',
      status: 'Active',
      registrationStatus: 'Open',
      startDate: 'Oct 12, 2026',
      endDate: 'Oct 14, 2026',
      registrationDeadline: 'Oct 10, 2026',
      submissionDeadline: 'Oct 14, 2026 · 11:59 PM',
      location: 'National Institute of Technology (Hybrid)',
      prizePool: '₹2,50,000',
      teamSize: '2 - 4 Members',
      description: 'A 48-hour intensive hackathon uniting engineers and designers to build practical intelligent workflows.',
      rules: [
        { section: '1.0', title: 'Eligibility & Teams', text: 'Open to enrolled undergraduate and postgraduate students. Teams of 2 to 4.' },
        { section: '2.0', title: 'Original Work', text: 'All application code must be authored during the active hackathon sprint window.' },
      ],
      judgingCriteria: [
        { criteria: 'Innovation & Originality', weight: '25%', desc: 'Novelty of approach and problem relevance.' },
        { criteria: 'Technical Execution', weight: '30%', desc: 'Architecture cleanliness and stability.' },
        { criteria: 'UI/UX Polish', weight: '20%', desc: 'Responsive design and accessibility.' },
        { criteria: 'Impact & Pitch', weight: '25%', desc: 'Practical readiness and demo pitch.' },
      ],
      challenges: [
        {
          title: 'Intelligent Adaptive Study Engine',
          track: 'AI & Education',
          problemStatement: 'College students struggle with unstructured textbook PDFs, syllabus revisions, and exam stress.',
          description: 'Build an AI-powered assistant that ingests course syllabi and dynamically generates actionable study sprints.',
          requirements: ['Interactive syllabus dashboard', 'Automated diagnostic quiz generator', 'Knowledge analytics'],
          recommendedSkills: ['React', 'Node.js', 'Python', 'MongoDB'],
          deadline: 'Oct 14, 2026 · 11:59 PM',
        },
        {
          title: 'Campus Resource & Energy Optimization',
          track: 'IoT & Web',
          problemStatement: 'High energy wastage in university labs and unmonitored electricity usage.',
          description: 'Develop a live telemetry dashboard that automates lab equipment scheduling.',
          recommendedSkills: ['React', 'FastAPI', 'MQTT', 'PostgreSQL'],
          deadline: 'Oct 14, 2026 · 11:59 PM',
        },
      ],
    });

    await Event.create({
      title: 'WebCraft Global Hackathon 2026',
      organizer: 'DevCommunity & GitHub Campus',
      tags: ['Web', 'DevTools', 'Open Innovation'],
      category: 'Web',
      status: 'Upcoming',
      registrationStatus: 'Open',
      startDate: 'Nov 02, 2026',
      endDate: 'Nov 04, 2026',
      location: '100% Online',
      prizePool: '₹1,80,000',
      description: 'Focusing on developer productivity, modern web performance, and browser tools.',
    });

    console.log('[Seed] Creating Teams...');
    const teamNova = await Team.create({
      name: 'Team Nova',
      event: nexusHack._id,
      hackathonTitle: nexusHack.title,
      challengeTitle: 'Intelligent Adaptive Study Engine',
      description: 'Building an AI-driven adaptive syllabus roadmap and automated quiz diagnostic platform.',
      captain: karthik._id,
      progress: 72,
      members: [
        { user: karthik._id, name: 'Karthik', role: 'Backend & Systems', specialization: 'Backend Developer', isCaptain: true, taskCount: 7, availability: '8-10 hrs/week' },
        { user: rahul._id, name: 'Rahul Sharma', role: 'Frontend Lead', specialization: 'Frontend Developer', isCaptain: false, taskCount: 6, availability: '8 hrs/week' },
        { user: ananya._id, name: 'Ananya Iyer', role: 'UI/UX & Design Systems', specialization: 'UI/UX Designer', isCaptain: false, taskCount: 4, availability: '10 hrs/week' },
        { user: vivek._id, name: 'Vivek Patel', role: 'AI/RAG Pipeline', specialization: 'AI/ML Developer', isCaptain: false, taskCount: 5, availability: '12 hrs/week' },
      ],
      technicalDecisions: [
        { title: 'Adopt Tailwind CSS for Rapid UI Consistency', author: 'Ananya Iyer', date: '2 days ago', status: 'Approved' },
        { title: 'Use Local Vector Embeddings (FastAPI) to avoid latency', author: 'Vivek Patel', date: 'Yesterday', status: 'Approved' },
      ],
      chatMessages: [
        { senderId: String(ananya._id), senderName: 'Ananya', text: 'I finished the student dashboard wireframes in Figma!', timestamp: '10:15 AM' },
        { senderId: String(rahul._id), senderName: 'Rahul', text: 'Awesome! Layout looks super clean. Starting React components now.', timestamp: '10:20 AM' },
        { senderId: String(karthik._id), senderName: 'Karthik', text: 'Working on diagnostic quiz evaluation endpoints in Node.js right now.', timestamp: '10:35 AM' },
      ],
    });

    console.log('[Seed] Creating Tasks...');
    await Task.create([
      { team: teamNova._id, title: 'Build Authentication & Role Switcher UI', owner: 'Rahul Sharma', status: 'COMPLETED', priority: 'High', deadline: 'Oct 12', tag: 'Frontend' },
      { team: teamNova._id, title: 'Design Student Dashboard Wireframes', owner: 'Ananya Iyer', status: 'COMPLETED', priority: 'Medium', deadline: 'Oct 12', tag: 'Design' },
      { team: teamNova._id, title: 'Implement Syllabus Extraction Pipeline', owner: 'Vivek Patel', status: 'COMPLETED', priority: 'High', deadline: 'Oct 13', tag: 'AI/RAG' },
      { team: teamNova._id, title: 'Create REST API for Topic Quiz Generation', owner: 'Karthik', status: 'IN_PROGRESS', priority: 'High', deadline: 'Oct 13', tag: 'Backend' },
      { team: teamNova._id, title: 'Deploy Backend API to Cloud (Render)', owner: 'Karthik', status: 'BLOCKED', priority: 'High', deadline: 'Oct 14', tag: 'DevOps' },
      { team: teamNova._id, title: 'Record 2-Minute Product Demo Walkthrough', owner: 'Ananya Iyer', status: 'TODO', priority: 'High', deadline: 'Oct 14', tag: 'Submission' },
    ]);

    console.log('[Seed] Creating Feedback, Reputation & Notifications...');
    await MentorFeedback.create({
      team: teamNova._id,
      mentorName: 'Dr. Arvind Rao',
      mentorRole: 'Faculty Mentor · AI & Distributed Systems',
      title: 'Promising RAG Flow, Watch Out for Vector Search Latency',
      comment: 'The syllabus ingestion pipeline is well-structured. Make sure you cache the generated diagnostic quiz questions so judges do not experience model inference lag during demo.',
      rating: 4.8,
    });

    await Reputation.create([
      { user: karthik._id, event: 'AI Innovation Challenge 2025', type: 'Hackathon 1st Place', points: '+1000', date: 'Dec 2025', description: 'Built CodeMentor AI. Highest architectural score across 120 collegiate teams.' },
      { user: karthik._id, event: 'Smart India Hackathon Internal', type: 'Finalist Placement', points: '+150', date: 'Oct 2025', description: 'Qualified for national finals in smart agriculture.' },
      { user: karthik._id, event: 'NexusHack 2026 Milestone Sprints', type: 'Task Execution', points: '+15', date: 'Oct 2026', description: 'Closed critical database and API sprint tasks.' },
    ]);

    await Notification.create([
      { user: karthik._id, type: 'team', title: 'Invitation Accepted', message: 'Rahul Sharma accepted your team invitation for Team Nova.', time: '25m ago', link: '/team' },
      { user: karthik._id, type: 'deadline', title: 'Submission Approaching', message: 'NexusHack 2026 submission closes in 28 hours (Oct 14 · 11:59 PM).', time: '2h ago', link: '/team/submission' },
      { user: karthik._id, type: 'feedback', title: 'Mentor Feedback Received', message: 'Dr. Arvind Rao reviewed your AI Quiz generation module.', time: '4h ago', link: '/team/feedback' },
    ]);

    console.log('✅ [Seed] Database successfully seeded with rich mock entities!');
    process.exit(0);
  } catch (error) {
    console.error('❌ [Seed Error]:', error);
    process.exit(1);
  }
};

seedDatabase();
