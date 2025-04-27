const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['open-ended', 'multiple-choice', 'rating'],
    default: 'open-ended'
  },
  options: [String],
  followUp: {
    type: Boolean,
    default: false
  },
  followUpPrompt: String
});

const interviewTemplateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: String,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  questions: [questionSchema],
  aiPersona: {
    type: String,
    required: true,
    default: 'professional'
  },
  targetAudience: {
    type: String,
    required: true
  },
  objectives: [String],
  tags: [String],
  isPublic: {
    type: Boolean,
    default: false
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
interviewTemplateSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('InterviewTemplate', interviewTemplateSchema); 