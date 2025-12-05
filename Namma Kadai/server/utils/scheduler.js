const ServiceRecord = require('../models/ServiceRecord');
const Customer = require('../models/Customer');
const Notification = require('../models/Notification');
const { sendSMS, sendEmail } = require('./notify');

// Check for services due in 0-3 days and send daily notifications
const checkDueServices = async () => {
  try {
    const now = new Date();
    now.setHours(0, 0, 0, 0); // Start of today

    const today = new Date(now);
    const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

    console.log(`🔍 Checking for services between ${today.toDateString()} and ${threeDaysFromNow.toDateString()}`);

    // Find service records due in 0-3 days
    const dueRecords = await ServiceRecord.find({
      nextServiceDate: {
        $gte: today,
        $lte: threeDaysFromNow
      }
    }).populate('customerId');

    console.log(`Found ${dueRecords.length} services in 0-3 day window`);

    let notificationCount = 0;

    for (const record of dueRecords) {
      const customer = record.customerId;

      if (!customer) {
        console.log(`Customer not found for record ${record._id}`);
        continue;
      }

      // Calculate days until service
      const serviceDate = new Date(record.nextServiceDate);
      serviceDate.setHours(0, 0, 0, 0);
      const daysUntil = Math.ceil((serviceDate - today) / (1000 * 60 * 60 * 24));

      // Check if notification already sent today for this service
      const todayStart = new Date(now);
      const todayEnd = new Date(now);
      todayEnd.setHours(23, 59, 59, 999);

      const existingNotification = await Notification.findOne({
        serviceRecordId: record._id,
        sentAt: {
          $gte: todayStart,
          $lte: todayEnd
        }
      });

      if (existingNotification) {
        console.log(`Notification already sent today for customer ${customer.name}`);
        continue;
      }

      // Create urgency message based on days until service
      let urgencyMessage = '';
      if (daysUntil === 0) {
        urgencyMessage = '⚠️ DUE TODAY';
      } else if (daysUntil === 1) {
        urgencyMessage = '⏰ Upcoming due in 1 day (TOMORROW)';
      } else if (daysUntil === 2) {
        urgencyMessage = '📅 Upcoming due in 2 days';
      } else if (daysUntil === 3) {
        urgencyMessage = '📅 Upcoming due in 3 days';
      }

      // Format the notification message with customer details
      const serviceDateFormatted = serviceDate.toLocaleDateString('en-IN');
      const message = `
${urgencyMessage}

RO Service Reminder

Customer Details:
━━━━━━━━━━━━━━━━━━━━
👤 Name: ${customer.name}
📞 Phone: ${customer.phone}
🔧 Model: ${customer.model}
📍 Address: ${customer.address || 'N/A'}

📅 Service Due: ${serviceDateFormatted}
⏱️  Days Remaining: ${daysUntil} day${daysUntil !== 1 ? 's' : ''}

${record.priorityParts && record.priorityParts.length > 0 ? '⚙️ Priority Parts:\n' + record.priorityParts.map(p => `   • ${p.part}: ${p.care}`).join('\n') : ''}

${record.notes ? `📝 Notes: ${record.notes}\n` : ''}
Please schedule the service appointment.
      `.trim();

      const subject = `RO Service ${urgencyMessage} - ${customer.name}`;

      // Prepare recipients: Admin + Customer
      const recipients = [];

      // Add admin (from env variables)
      if (process.env.ADMIN_PHONE || process.env.ADMIN_EMAIL) {
        recipients.push({
          name: 'Admin',
          phone: process.env.ADMIN_PHONE,
          email: process.env.ADMIN_EMAIL
        });
      }

      // Add customer
      recipients.push({
        name: customer.name,
        phone: customer.phone,
        email: customer.email
      });

      // Send notifications to all recipients
      let overallSuccess = false;
      const notificationResults = [];

      for (const recipient of recipients) {
        let smsResult = null;
        let emailResult = null;

        // Send SMS if phone number exists
        if (recipient.phone) {
          smsResult = await sendSMS(recipient.phone, message);
          if (smsResult.success) overallSuccess = true;
        }

        // Send email if email exists
        if (recipient.email) {
          emailResult = await sendEmail(recipient.email, subject, message);
          if (emailResult.success) overallSuccess = true;
        }

        notificationResults.push({
          recipient: recipient.name,
          phone: recipient.phone,
          email: recipient.email,
          smsStatus: smsResult?.success ? 'sent' : 'failed',
          emailStatus: emailResult?.success ? 'sent' : 'failed',
          smsError: smsResult?.error,
          emailError: emailResult?.error
        });

        console.log(`📧 Notification sent to ${recipient.name} - SMS: ${smsResult?.success ? '✅' : '❌'}, Email: ${emailResult?.success ? '✅' : '❌'}`);
      }

      // Determine overall status
      const status = overallSuccess ? 'sent' : 'failed';

      // Create notification record with details
      const recipientSummary = notificationResults.map(r =>
        `${r.recipient} (${r.phone || 'no phone'} / ${r.email || 'no email'}): SMS ${r.smsStatus}, Email ${r.emailStatus}`
      ).join('; ');

      await Notification.create({
        serviceRecordId: record._id,
        customerId: customer._id,
        channel: 'both',
        to: recipientSummary,
        message: message,
        status: status,
        error: notificationResults
          .filter(r => r.smsError || r.emailError)
          .map(r => `${r.recipient}: SMS: ${r.smsError || 'OK'}, Email: ${r.emailError || 'OK'}`)
          .join('; ') || null
      });

      // Mark as notified only on the due date (day 0)
      if (daysUntil === 0 && !record.notified) {
        record.notified = true;
        record.notifiedAt = new Date();
        await record.save();
      }

      notificationCount++;
      console.log(`Notification sent for customer ${customer.name} - ${daysUntil} days until service - Status: ${status}`);
    }

    return {
      success: true,
      count: notificationCount,
      message: `Processed ${notificationCount} notifications`
    };
  } catch (error) {
    console.error('Scheduler error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

module.exports = { checkDueServices };
