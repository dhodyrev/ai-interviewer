// backend/routes/interviews.js
const router = require('express').Router();
const auth = require('../middleware/auth');
const Interview = require('../models/Interview');
const InterviewTemplate = require('../models/InterviewTemplate');
const { generateResponse } = require('../services/aiService');

// Create new interview session
router.post('/', async (req, res) => {
  try {
    const { templateId, participant } = req.body;
    
    // Verify template exists
    const template = await InterviewTemplate.findById(templateId);
    if (!template) return res.status(404).json({ message: 'Interview template not found' });
    
    // Create interview session
    const interview = new Interview({
      template: templateId,
      participant,
      status: 'pending',
      messages: [
        { role: 'system', content: template.systemPrompt }
      ]
    });
    
    const savedInterview = await interview.save();
    
    res.status(201).json({
      id: savedInterview._id,
      status: savedInterview.status,
      joinLink: `${process.env.FRONTEND_URL}/interviews/join/${savedInterview._id}`
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get interview details (for PM)
router.get('/:id', auth, async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.id)
      .populate('template');
    
    if (!interview) return res.status(404).json({ message: 'Interview not found' });
    
    // Verify ownership of template
    if (interview.template.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to access this interview' });
    }
    
    res.json(interview);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get interview by participant (no auth required)
router.get('/join/:id', async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.id)
      .populate('template', 'title product');
    
    if (!interview) return res.status(404).json({ message: 'Interview not found' });
    
    // Don't send full message history, just template info
    // backend/routes/interviews.js (continued)
    // Don't send full message history, just template info
    res.json({
        id: interview._id,
        template: {
          title: interview.template.title,
          product: interview.template.product
        },
        status: interview.status
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // Get all interviews for a template
  router.get('/template/:templateId', auth, async (req, res) => {
    try {
      const template = await InterviewTemplate.findOne({
        _id: req.params.templateId,
        createdBy: req.user.id
      });
      
      if (!template) return res.status(404).json({ message: 'Template not found' });
      
      const interviews = await Interview.find({ template: req.params.templateId })
        .select('participant status startTime endTime createdAt')
        .sort('-createdAt');
      
      res.json(interviews);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // Update interview participant info
  router.put('/join/:id', async (req, res) => {
    try {
      const { name, email, demographics } = req.body;
      
      const interview = await Interview.findById(req.params.id);
      if (!interview) return res.status(404).json({ message: 'Interview not found' });
      
      // Only allow updates if interview is pending
      if (interview.status !== 'pending') {
        return res.status(400).json({ message: 'Interview already started or completed' });
      }
      
      interview.participant = {
        name: name || interview.participant.name,
        email: email || interview.participant.email,
        demographics: demographics || interview.participant.demographics
      };
      
      const updatedInterview = await interview.save();
      
      res.json({
        id: updatedInterview._id,
        status: updatedInterview.status
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // Start interview
  router.post('/:id/start', async (req, res) => {
    try {
      const interview = await Interview.findById(req.params.id)
        .populate('template');
      
      if (!interview) return res.status(404).json({ message: 'Interview not found' });
      
      // Only allow starting if interview is pending
      if (interview.status !== 'pending') {
        return res.status(400).json({ message: 'Interview already started or completed' });
      }
      
      // Update interview status
      interview.status = 'in-progress';
      interview.startTime = new Date();
      
      // Generate AI greeting using first question
      const initialQuestion = interview.template.questions.find(q => q.order === 0) || 
                             interview.template.questions[0];
      
      const greeting = await generateResponse({
        messages: [
          ...interview.messages,
          { 
            role: 'assistant', 
            content: `Hello! I'm an AI interviewer and I'll be asking you some questions about your experience with ${interview.template.product}. Let's start with: ${initialQuestion.text}`
          }
        ]
      });
      
      // Add AI greeting to messages
      interview.messages.push({ 
        role: 'assistant', 
        content: greeting
      });
      
      const updatedInterview = await interview.save();
      
      res.json({
        id: updatedInterview._id,
        status: updatedInterview.status,
        messages: updatedInterview.messages
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // Process user message
  router.post('/:id/message', async (req, res) => {
    try {
      const { message } = req.body;
      
      const interview = await Interview.findById(req.params.id)
        .populate('template');
      
      if (!interview) return res.status(404).json({ message: 'Interview not found' });
      
      // Ensure interview is in progress
      if (interview.status !== 'in-progress') {
        return res.status(400).json({ message: 'Interview not in progress' });
      }
      
      // Add user message
      interview.messages.push({
        role: 'user',
        content: message
      });
      
      // Generate AI response
      const aiResponse = await generateResponse({
        messages: interview.messages,
        template: interview.template
      });
      
      // Add AI response
      interview.messages.push({
        role: 'assistant',
        content: aiResponse
      });
      
      const updatedInterview = await interview.save();
      
      res.json({
        id: updatedInterview._id,
        messages: updatedInterview.messages.slice(-2) // Return only last 2 messages for efficiency
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  

// backend/routes/interviews.js (updated complete route)
// Complete interview
router.post('/:id/complete', async (req, res) => {
    try {
      const interview = await Interview.findById(req.params.id)
        .populate('template');
      
      if (!interview) return res.status(404).json({ message: 'Interview not found' });
      
      // Only allow completing if interview is in progress
      if (interview.status !== 'in-progress') {
        return res.status(400).json({ message: 'Interview not in progress' });
      }
      
      interview.status = 'completed';
      interview.endTime = new Date();
      
      // Add final message from AI
      interview.messages.push({
        role: 'assistant',
        content: 'Thank you so much for your time and insights! The interview is now complete.'
      });
      
      // Generate analysis
      const analysis = await analyzeInterview(interview);
      
      // Store analysis results
      interview.insights = new Map(Object.entries(analysis));
      interview.sentimentAnalysis = { overall: analysis.sentiment };
      interview.keyThemes = analysis.insights.slice(0, 5); // Top 5 insights as themes
      
      const updatedInterview = await interview.save();
      
      res.json({
        id: updatedInterview._id,
        status: updatedInterview.status
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  module.exports = router;
