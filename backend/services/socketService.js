const { InterviewSession } = require('../models/InterviewSession');
const aiService = require('./aiService');

class SocketService {
  constructor(io) {
    this.io = io;
    this.setupSocketHandlers();
  }

  setupSocketHandlers() {
    this.io.on('connection', (socket) => {
      console.log('New client connected');

      socket.on('join_session', async (sessionId) => {
        try {
          const session = await InterviewSession.findById(sessionId);
          if (!session) {
            socket.emit('error', { message: 'Session not found' });
            return;
          }

          socket.join(sessionId);
          socket.emit('session_joined', {
            sessionId,
            messages: session.messages
          });
        } catch (error) {
          socket.emit('error', { message: error.message });
        }
      });

      socket.on('send_message', async (data) => {
        try {
          const { sessionId, content } = data;
          const session = await InterviewSession.findById(sessionId);
          
          if (!session) {
            socket.emit('error', { message: 'Session not found' });
            return;
          }

          // Add user message to session
          session.messages.push({
            role: 'user',
            content,
            timestamp: new Date()
          });

          // Analyze the response
          const analysis = await aiService.analyzeResponse(sessionId, content);
          
          // Generate follow-up question
          const followUpQuestion = await aiService.generateFollowUpQuestion(
            sessionId,
            session.messages.slice(-5).map(m => `${m.role}: ${m.content}`).join('\n')
          );

          // Add AI response to session
          session.messages.push({
            role: 'assistant',
            content: followUpQuestion,
            timestamp: new Date(),
            metadata: analysis
          });

          await session.save();

          // Broadcast the messages to all clients in the session
          this.io.to(sessionId).emit('new_messages', {
            messages: session.messages.slice(-2)
          });
        } catch (error) {
          socket.emit('error', { message: error.message });
        }
      });

      socket.on('end_session', async (sessionId) => {
        try {
          const session = await InterviewSession.findById(sessionId);
          if (!session) {
            socket.emit('error', { message: 'Session not found' });
            return;
          }

          session.endSession();
          const summary = await aiService.generateSessionSummary(sessionId);
          session.insights.summary = summary;
          
          await session.save();

          this.io.to(sessionId).emit('session_ended', {
            summary,
            insights: session.insights
          });
        } catch (error) {
          socket.emit('error', { message: error.message });
        }
      });

      socket.on('disconnect', () => {
        console.log('Client disconnected');
      });
    });
  }
}

module.exports = SocketService; 