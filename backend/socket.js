// backend/socket.js
const Interview = require('./models/Interview');
const { generateResponse } = require('./services/aiService');

module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log('New client connected');
    
    // Join interview room
    socket.on('joinInterview', async (interviewId) => {
      socket.join(`interview_${interviewId}`);
      console.log(`Client joined interview room: interview_${interviewId}`);
      
      try {
        const interview = await Interview.findById(interviewId);
        if (interview && interview.status === 'in-progress') {
          // Send last few messages to sync client
          socket.emit('messageHistory', interview.messages.slice(-5));
        }
      } catch (error) {
        console.error('Error fetching interview:', error);
      }
    });
    
    // Handle user message
    socket.on('sendMessage', async ({ interviewId, message }) => {
      try {
        const interview = await Interview.findById(interviewId)
          .populate('template');
        
        if (!interview || interview.status !== 'in-progress') {
          socket.emit('error', { message: 'Interview not available' });
          return;
        }
        
        // Add user message
        const userMessage = {
          role: 'user',
          content: message,
          timestamp: new Date()
        };
        interview.messages.push(userMessage);
        
        // Broadcast user message to all in the room
        io.to(`interview_${interviewId}`).emit('newMessage', userMessage);
        
        // Start "typing" indicator
        io.to(`interview_${interviewId}`).emit('typing', true);
        
        // Generate AI response
        const aiResponse = await generateResponse({
          messages: interview.messages,
          template: interview.template
        });
        
        // Add AI response to database
        const assistantMessage = {
          role: 'assistant',
          content: aiResponse,
          timestamp: new Date()
        };
        interview.messages.push(assistantMessage);
        await interview.save();
        
        // Stop "typing" indicator and send response
        io.to(`interview_${interviewId}`).emit('typing', false);
        io.to(`interview_${interviewId}`).emit('newMessage', assistantMessage);
      } catch (error) {
        console.error('Error processing message:', error);
        socket.emit('error', { message: 'Failed to process message' });
      }
    });
    
    // Handle disconnect
    socket.on('disconnect', () => {
      console.log('Client disconnected');
    });
  });
};