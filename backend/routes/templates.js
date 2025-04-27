const express = require('express');
const router = express.Router();
const InterviewTemplate = require('../models/InterviewTemplate');
const auth = require('../middleware/auth');

// Get all templates
router.get('/', auth, async (req, res) => {
  try {
    const templates = await InterviewTemplate.find({
      $or: [
        { createdBy: req.user._id },
        { isPublic: true }
      ]
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      templates
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching templates',
      error: error.message
    });
  }
});

// Get single template
router.get('/:id', auth, async (req, res) => {
  try {
    const template = await InterviewTemplate.findOne({
      _id: req.params.id,
      $or: [
        { createdBy: req.user._id },
        { isPublic: true }
      ]
    });

    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Template not found'
      });
    }

    res.json({
      success: true,
      template
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching template',
      error: error.message
    });
  }
});

// Create template
router.post('/', auth, async (req, res) => {
  try {
    const template = new InterviewTemplate({
      ...req.body,
      createdBy: req.user._id
    });

    await template.save();

    res.status(201).json({
      success: true,
      template
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating template',
      error: error.message
    });
  }
});

// Update template
router.put('/:id', auth, async (req, res) => {
  try {
    const template = await InterviewTemplate.findOneAndUpdate(
      {
        _id: req.params.id,
        createdBy: req.user._id
      },
      req.body,
      { new: true, runValidators: true }
    );

    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Template not found'
      });
    }

    res.json({
      success: true,
      template
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating template',
      error: error.message
    });
  }
});

// Delete template
router.delete('/:id', auth, async (req, res) => {
  try {
    const template = await InterviewTemplate.findOneAndDelete({
      _id: req.params.id,
      createdBy: req.user._id
    });

    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Template not found'
      });
    }

    res.json({
      success: true,
      message: 'Template deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting template',
      error: error.message
    });
  }
});

// Duplicate template
router.post('/:id/duplicate', auth, async (req, res) => {
  try {
    const originalTemplate = await InterviewTemplate.findById(req.params.id);
    
    if (!originalTemplate) {
      return res.status(404).json({
        success: false,
        message: 'Template not found'
      });
    }

    const newTemplate = new InterviewTemplate({
      ...originalTemplate.toObject(),
      _id: undefined,
      name: `${originalTemplate.name} (Copy)`,
      createdBy: req.user._id,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    await newTemplate.save();

    res.status(201).json({
      success: true,
      template: newTemplate
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error duplicating template',
      error: error.message
    });
  }
});

module.exports = router; 