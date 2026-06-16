// backend/server.js
import 'dotenv/config';
import express from 'express';
import cookieParser from 'cookie-parser';
import { corsMiddleware } from './middleware/cors.js';
import { rateLimiter } from './middleware/rateLimiter.js';
import authRoutes from './routes/auth.js';
import adminRoutes from './routes/admin.js';
import chatRoutes from './routes/chat.js';
import communityRoutes from './routes/community.js';
import contactRoutes from './routes/contact.js';
import flashcardsRoutes from './routes/flashcards.js';
import interactionsRoutes from './routes/interactions.js';
import pastpapersRoutes from './routes/pastpapers.js';
import quizRoutes from './routes/quiz.js';
import recallRoutes from './routes/recall.js';
import resourcesRoutes from './routes/resources.js';
import sitesectionsRoutes from './routes/sitesections.js';
import challengeRoutes from './routes/challenge.js';

const app = express();
app.use(corsMiddleware);
app.use(rateLimiter);
app.use(express.json());
app.use(cookieParser());

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/community', communityRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/flashcards', flashcardsRoutes);
app.use('/api/interactions', interactionsRoutes);
app.use('/api/pastpapers', pastpapersRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/recall', recallRoutes);
app.use('/api/resources', resourcesRoutes);
app.use('/api/sitesections', sitesectionsRoutes);
app.use('/api/challenge', challengeRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
