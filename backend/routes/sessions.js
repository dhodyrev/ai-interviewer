const express = require('express');
const router = express.Router();
const InterviewSession = require('../models/InterviewSession');
const auth = require('../middleware/auth');
const aiService = require('../services/aiService');

// Get all sessions for a user
router.get('/', auth, async (req, res) => {
  try {
    const sessions = await InterviewSession.find({ createdBy: req.user._id })
      .populate('template', 'name')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      sessions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching sessions',
      error: error.message
    });
  }
});

// Get single session
router.get('/:id', auth, async (req, res) => {
  try {
    const session = await InterviewSession.findOne({
      _id: req.params.id,
      createdBy: req.user._id
    }).populate('template');

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    res.json({
      success: true,
      session
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching session',
      error: error.message
    });
  }
});

// Create session
router.post('/', auth, async (req, res) => {
  try {
    const session = new InterviewSession({
      ...req.body,
      createdBy: req.user._id,
      status: 'scheduled'
    });

    await session.save();

    res.status(201).json({
      success: true,
      session
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating session',
      error: error.message
    });
  }
});

// Start session
router.post('/:id/start', auth, async (req, res) => {
  try {
    const session = await InterviewSession.findOne({
      _id: req.params.id,
      createdBy: req.user._id,
      status: 'scheduled'
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found or already started'
      });
    }

    session.status = 'in-progress';
    session.startTime = new Date();
    await session.save();

    res.json({
      success: true,
      session
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error starting session',
      error: error.message
    });
  }
});

// End session
router.post('/:id/end', auth, async (req, res) => {
  try {
    const session = await InterviewSession.findOne({
      _id: req.params.id,
      createdBy: req.user._id,
      status: 'in-progress'
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found or not in progress'
      });
    }

    session.endSession();
    const summary = await aiService.generateSessionSummary(session._id);
    session.insights.summary = summary;
    await session.save();

    res.json({
      success: true,
      session
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error ending session',
      error: error.message
    });
  }
});

// Get session insights
router.get('/:id/insights', auth, async (req, res) => {
  try {
    const session = await InterviewSession.findOne({
      _id: req.params.id,
      createdBy: req.user._id,
      status: 'completed'
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Completed session not found'
      });
    }

    res.json({
      success: true,
      insights: session.insights
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching insights',
      error: error.message
    });
  }
});

// Delete session
router.delete('/:id', auth, async (req, res) => {
  try {
    const session = await InterviewSession.findOneAndDelete({
      _id: req.params.id,
      createdBy: req.user._id
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    res.json({
      success: true,
      message: 'Session deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting session',
      error: error.message
    });
  }
});

module.exports = router; 