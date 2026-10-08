import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDatabase } from './config/db.js';
import { errorHandler } from './middleware/errorHandler.js';

// Route imports
import healthRoutes from './routes/health.routes.js';
import authRoutes from './routes/auth.routes.js';
import eventRoutes from './routes/event.routes.js';
import challengeRoutes from './routes/challenge.routes.js';
import profileRoutes from './routes/profile.routes.js';
import discoveryRoutes from './routes/discovery.routes.js';
import teamRoutes from './routes/team.routes.js';
import joinRequestRoutes from './routes/joinRequest.routes.js';
import invitationRoutes from './routes/invitation.routes.js';
import taskRoutes from './routes/task.routes.js';
import milestoneRoutes from './routes/milestone.routes.js';
import submissionRoutes from './routes/submission.routes.js';
import rubricRoutes from './routes/rubric.routes.js';
import mentorRoutes from './routes/mentor.routes.js';
import judgeRoutes from './routes/judge.routes.js';
import organizerRoutes from './routes/organizer.routes.js';
import documentRoutes from './routes/document.routes.js';
import ragRoutes from './routes/rag.routes.js';
import agentRoutes from './routes/agent.routes.js';
import notificationRoutes from './routes/notification.routes.js';
import reputationRoutes from './routes/reputation.routes.js';

dotenv.config();

const app = express();

// Global Middlewares
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Primary API Router mounted strictly under single prefix /api
const apiRouter = express.Router();

apiRouter.use(healthRoutes);
apiRouter.use(authRoutes);
apiRouter.use(eventRoutes);
apiRouter.use(challengeRoutes);
apiRouter.use(profileRoutes);
apiRouter.use(discoveryRoutes);
apiRouter.use(teamRoutes);
apiRouter.use(joinRequestRoutes);
apiRouter.use(invitationRoutes);
apiRouter.use(taskRoutes);
apiRouter.use(milestoneRoutes);
apiRouter.use(submissionRoutes);
apiRouter.use(rubricRoutes);
apiRouter.use(mentorRoutes);
apiRouter.use(judgeRoutes);
apiRouter.use(organizerRoutes);
apiRouter.use(documentRoutes);
apiRouter.use(ragRoutes);
apiRouter.use(agentRoutes);
apiRouter.use(notificationRoutes);
apiRouter.use(reputationRoutes);

app.use('/api', apiRouter);

// Fallback 404 handler for unmatched /api routes
app.use('/api', (req, res) => {
  return res.status(404).json({
    success: false,
    error: {
      code: 'RESOURCE_NOT_FOUND',
      message: `Endpoint ${req.method} ${req.originalUrl} not found`,
    },
  });
});

// Centralized Error Handling Middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

export const startServer = async () => {
  try {
    await connectDatabase();
    const server = app.listen(PORT, () => {
      console.log(`[Server] HackHub Canonical API running at http://localhost:${PORT}/api`);
    });
    return server;
  } catch (err) {
    console.error(`[Server] Startup error: ${err.message}`);
    process.exit(1);
  }
};

// Auto-start when executed directly
if (process.argv[1] && process.argv[1].endsWith('server/index.js')) {
  startServer();
}

export default app;
