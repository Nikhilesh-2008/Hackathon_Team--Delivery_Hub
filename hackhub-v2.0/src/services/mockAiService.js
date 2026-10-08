export const mockAiService = {
  askRulebook: async (query) => {
    await new Promise((res) => setTimeout(res, 600)); // simulated latency
    const q = query.toLowerCase();

    if (q.includes("external api") || q.includes("api")) {
      return {
        answer: "Yes. External APIs and public SDKs are allowed as long as they have free/accessible tiers and are openly declared in your repository README.",
        source: "Rulebook v2 · Section 3.0 (Technology Restrictions)",
        confidence: 0.96
      };
    }

    if (q.includes("team") || q.includes("size") || q.includes("member")) {
      return {
        answer: "Teams must consist of 2 to 4 enrolled undergraduate or postgraduate students. Cross-college teams are permitted in online tracks.",
        source: "Rulebook v2 · Section 1.0 (Eligibility & Teams)",
        confidence: 0.98
      };
    }

    if (q.includes("submission") || q.includes("deliverable") || q.includes("video")) {
      return {
        answer: "All submissions must include a public GitHub repository, working live deployment link, 2-minute product video walkthrough, and slide presentation.",
        source: "Rulebook v2 · Section 4.0 (Deliverables)",
        confidence: 0.94
      };
    }

    if (q.includes("code") || q.includes("pre-existing") || q.includes("start")) {
      return {
        answer: "All core application logic must be authored during the 48-hour hackathon period. Boilerplates, UI libraries, and public npm modules are allowed.",
        source: "Rulebook v2 · Section 2.0 (Original Work)",
        confidence: 0.95
      };
    }

    return {
      answer: "According to the official hackathon rulebook, teams must deliver fully working code created during the event window adhering to the evaluation rubrics and open source guidelines.",
      source: "Rulebook v2 · General Guidelines",
      confidence: 0.89
    };
  },

  getDeliveryPlan: async (teamStatus) => {
    await new Promise((res) => setTimeout(res, 500));
    return {
      canFinishBeforeDeadline: true,
      assessment: "Your team has completed 72% of milestones and is in a strong position. The critical path involves resolving the Render deployment blocker and recording the 2-minute demo video.",
      criticalBlocker: "Backend Render deployment SSL/CORS issue (Task #8)",
      recommendations: [
        "Reassign deployment support to Karthik & Rahul this evening.",
        "Ananya to record demo script walkthrough Saturday afternoon once deployment passes.",
        "Conduct final judging checklist review 4 hours before cutoff."
      ],
      proposedSchedule: [
        { time: "Saturday 4:00 PM", task: "Resolve Render backend CORS & verify API endpoints" },
        { time: "Saturday 8:00 PM", task: "Freeze frontend features and trigger production Vercel build" },
        { time: "Sunday 10:00 AM", task: "Record 2-minute product demo walkthrough" },
        { time: "Sunday 4:00 PM", task: "Complete submission checklist and submit project" }
      ]
    };
  }
};
