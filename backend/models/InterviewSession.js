const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['user', 'assistant', 'system'],
    required: true
  },
  content: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  metadata: {
    sentiment: String,
    keyThemes: [String],
    followUpNeeded: Boolean
  }
});

const interviewSessionSchema = new mongoose.Schema({
  template: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'InterviewTemplate',
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  participant: {
    name: String,
    email: String,
    demographics: {
      age: Number,
      gender: String,
      location: String
    }
  },
  status: {
    type: String,
    enum: ['scheduled', 'in-progress', 'completed', 'cancelled'],
    default: 'scheduled'
  },
  messages: [messageSchema],
  startTime: Date,
  endTime: Date,
  duration: Number,
  insights: {
    summary: String,
    keyFindings: [String],
    sentimentAnalysis: {
      overall: String,
      byTopic: [{
        topic: String,
        sentiment: String
      }]
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt timestamp before saving
interviewSessionSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Calculate duration when session ends
interviewSessionSchema.methods.endSession = function() {
  this.status = 'completed';
  this.endTime = new Date();
  this.duration = (this.endTime - this.startTime) / 1000; // Duration in seconds
};

module.exports = mongoose.model('InterviewSession', interviewSessionSchema); 