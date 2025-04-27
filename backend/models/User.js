// backend/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['admin', 'product_manager'],
    default: 'product_manager'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);

// backend/models/InterviewTemplate.js
const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
  text: { type: String, required: true },
  type: { type: String, enum: ['open', 'scale', 'multiple-choice'], default: 'open' },
  options: [String],
  followUpStrategy: { type: String },
  order: { type: Number }
});

const InterviewTemplateSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  product: { type: String },
  goals: [String],
  questions: [QuestionSchema],
  systemPrompt: { type: String, required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('InterviewTemplate', InterviewTemplateSchema);

// backend/models/Interview.js
const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  role: { type: String, enum: ['system', 'assistant', 'user'], required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

const InterviewSchema = new mongoose.Schema({
  template: { type: mongoose.Schema.Types.ObjectId, ref: 'InterviewTemplate', required: true },
  participant: {
    name: { type: String },
    email: { type: String },
    demographics: { type: Map, of: String }
  },
  status: { type: String, enum: ['pending', 'in-progress', 'completed'], default: 'pending' },
  messages: [MessageSchema],
  insights: { type: Map, of: String },
  sentimentAnalysis: { type: Map, of: Number },
  keyThemes: [String],
  startTime: { type: Date },
  endTime: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Interview', InterviewSchema);