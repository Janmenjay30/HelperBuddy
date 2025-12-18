const express = require('express');
const Reminder = require('../models/Reminder');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all reminders for user
router.get('/', auth, async (req, res) => {
  try {
    const { status, type } = req.query;
    const query = { user: req.user._id };

    if (status) query.status = status;
    if (type) query.reminderType = type;

    const reminders = await Reminder.find(query).sort({ scheduledTime: 1 });
    res.json(reminders);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get single reminder
router.get('/:id', auth, async (req, res) => {
  try {
    const reminder = await Reminder.findOne({ _id: req.params.id, user: req.user._id });
    if (!reminder) {
      return res.status(404).json({ message: 'Reminder not found' });
    }
    res.json(reminder);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create reminder
router.post('/', auth, async (req, res) => {
  try {
    const { 
      title, 
      message, 
      reminderType, 
      scheduledTime, 
      isRecurring, 
      recurringPattern,
      recipientEmail,
      recipientPhone 
    } = req.body;
    
    const reminder = new Reminder({
      user: req.user._id,
      title,
      message,
      reminderType,
      scheduledTime,
      isRecurring,
      recurringPattern,
      recipientEmail: recipientEmail || req.user.email,
      recipientPhone: recipientPhone || req.user.phone
    });
    console.log('Creating reminder with data:', reminder);

    await reminder.save();
    res.status(201).json({ message: 'Reminder created', reminder });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update reminder
router.put('/:id', auth, async (req, res) => {
  try {
    const reminder = await Reminder.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true }
    );

    if (!reminder) {
      return res.status(404).json({ message: 'Reminder not found' });
    }

    res.json({ message: 'Reminder updated', reminder });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete reminder
router.delete('/:id', auth, async (req, res) => {
  try {
    const reminder = await Reminder.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    
    if (!reminder) {
      return res.status(404).json({ message: 'Reminder not found' });
    }

    res.json({ message: 'Reminder deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get upcoming reminders
router.get('/upcoming/list', auth, async (req, res) => {
  try {
    const reminders = await Reminder.find({
      user: req.user._id,
      status: 'pending',
      scheduledTime: { $gte: new Date() }
    }).sort({ scheduledTime: 1 }).limit(10);

    res.json(reminders);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
