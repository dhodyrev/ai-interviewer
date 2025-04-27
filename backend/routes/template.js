// backend/routes/templates.js
const router = require('express').Router();
const auth = require('../middleware/auth');
const InterviewTemplate = require('../models/InterviewTemplate');

// Get all templates for a user
router.get('/', auth, async (req, res) => {
  try {
    const templates = await InterviewTemplate.find({ createdBy: req.user.id });
    res.json(templates);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single template
router.get('/:id', auth, async (req, res) => {
  try {
    const template = await InterviewTemplate.findOne({
      _id: req.params.id,
      createdBy: req.user.id
    });
    
    if (!template) return res.status(404).json({ message: 'Template not found' });
    
    res.json(template);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create template
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, product, goals, questions, systemPrompt } = req.body;
    
    const template = new InterviewTemplate({
      title,
      description,
      product,
      goals,
      questions,
      systemPrompt,
      createdBy: req.user.id
    });
    
    const savedTemplate = await template.save();
    res.status(201).json(savedTemplate);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update template
router.put('/:id', auth, async (req, res) => {
  try {
    const template = await InterviewTemplate.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.user.id },
      req.body,
      { new: true }
    );
    
    if (!template) return res.status(404).json({ message: 'Template not found' });
    
    res.json(template);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete template
router.delete('/:id', auth, async (req, res) => {
  try {
    const template = await InterviewTemplate.findOneAndDelete({
      _id: req.params.id,
      createdBy: req.user.id
    });
    
    if (!template) return res.status(404).json({ message: 'Template not found' });
    
    res.json({ message: 'Template deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;