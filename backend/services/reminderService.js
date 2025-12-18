const nodemailer = require('nodemailer');
const twilio = require('twilio');
const Reminder = require('../models/Reminder');

// Email transporter
const createEmailTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

// Twilio client
const createTwilioClient = () => {
  if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
    return twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  }
  return null;
};

// Send email reminder
const sendEmailReminder = async (reminder) => {
  try {
    const transporter = createEmailTransporter();
    
    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: reminder.recipientEmail,
      subject: `🔔 Reminder: ${reminder.title}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0;">🔔 HelperBuddy Reminder</h1>
          </div>
          <div style="background: #f9f9f9; padding: 20px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #333;">${reminder.title}</h2>
            <p style="color: #666; font-size: 16px; line-height: 1.6;">${reminder.message}</p>
            <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
            <p style="color: #999; font-size: 12px;">
              This reminder was scheduled for ${new Date(reminder.scheduledTime).toLocaleString()}
            </p>
          </div>
        </div>
      `
    });

    console.log(`✅ Email sent to ${reminder.recipientEmail} - MessageID: ${info.messageId}`);
    console.log(`📧 Response: ${info.response}`);
    return true;
  } catch (error) {
    console.error('❌ Email sending failed:', error.message);
    console.error('❌ Full error:', error);
    return false;
  }
};

// Send SMS reminder
const sendSMSReminder = async (reminder) => {
  try {
    const client = createTwilioClient();
    
    if (!client) {
      console.log('⚠️ Twilio not configured, skipping SMS');
      return false;
    }

    await client.messages.create({
      body: `🔔 HelperBuddy Reminder: ${reminder.title}\n\n${reminder.message}`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: reminder.recipientPhone
    });

    console.log(`✅ SMS sent to ${reminder.recipientPhone}`);
    return true;
  } catch (error) {
    console.error('❌ SMS sending failed:', error.message);
    return false;
  }
};

// Calculate next occurrence for recurring reminders
const getNextOccurrence = (currentTime, pattern) => {
  const next = new Date(currentTime);
  
  switch (pattern) {
    case 'daily':
      next.setDate(next.getDate() + 1);
      break;
    case 'weekly':
      next.setDate(next.getDate() + 7);
      break;
    case 'monthly':
      next.setMonth(next.getMonth() + 1);
      break;
    case 'yearly':
      next.setFullYear(next.getFullYear() + 1);
      break;
    default:
      return null;
  }
  
  return next;
};

// Check and send due reminders
const checkAndSendReminders = async () => {
  try {
    // Get current time in IST
    const nowIST = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
    const oneMinuteAgo = new Date(nowIST.getTime() - 60000);

    console.log(`🔔 Checking for reminders...`);
    console.log(`   Current time (IST): ${nowIST.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}`);
    console.log(`   Looking for reminders between: ${oneMinuteAgo.toLocaleString('en-IN')} and ${nowIST.toLocaleString('en-IN')}`);

    // Show all pending reminders for debugging
    const allPending = await Reminder.find({ status: 'pending' });
    if (allPending.length > 0) {
      console.log(`   📋 All pending reminders:`);
      allPending.forEach(r => {
        const reminderTime = new Date(r.scheduledTime);
        const isPast = reminderTime <= nowIST;
        console.log(`      - ${r.title}: ${reminderTime.toLocaleString('en-IN')} IST ${isPast ? '✅ PAST (should send)' : '⏳ FUTURE'}`);
      });
    }

    // Find pending reminders that are due
    const dueReminders = await Reminder.find({
      status: 'pending',
      scheduledTime: {
        $gte: oneMinuteAgo,
        $lte: nowIST
      }
    }).populate('user');

    console.log(`   Found ${dueReminders.length} due reminder(s)`);

    for (const reminder of dueReminders) {
      let emailSent = false;
      let smsSent = false;

      // Send based on reminder type
      if (reminder.reminderType === 'email' || reminder.reminderType === 'both') {
        emailSent = await sendEmailReminder(reminder);
      }

      if (reminder.reminderType === 'sms' || reminder.reminderType === 'both') {
        smsSent = await sendSMSReminder(reminder);
      }

      // Update reminder status
      if (emailSent || smsSent) {
        reminder.status = 'sent';
        reminder.sentAt = new Date();

        // Handle recurring reminders
        if (reminder.isRecurring && reminder.recurringPattern) {
          const nextTime = getNextOccurrence(reminder.scheduledTime, reminder.recurringPattern);
          
          if (nextTime) {
            // Create new reminder for next occurrence
            const newReminder = new Reminder({
              user: reminder.user._id,
              title: reminder.title,
              message: reminder.message,
              reminderType: reminder.reminderType,
              scheduledTime: nextTime,
              isRecurring: true,
              recurringPattern: reminder.recurringPattern,
              recipientEmail: reminder.recipientEmail,
              recipientPhone: reminder.recipientPhone
            });
            await newReminder.save();
            console.log(`🔄 Created recurring reminder for ${nextTime}`);
          }
        }
      } else {
        reminder.status = 'failed';
      }

      await reminder.save();
    }

    if (dueReminders.length > 0) {
      console.log(`📬 Processed ${dueReminders.length} reminders`);
    }
  } catch (error) {
    console.error('❌ Error checking reminders:', error.message);
  }
};

module.exports = {
  sendEmailReminder,
  sendSMSReminder,
  checkAndSendReminders
};
