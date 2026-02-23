const { addReminder, removeReminder, loadReminders } = require('../database.js');

function scheduleReminder(client, reminder) {
  const delay = Math.max(reminder.time - Date.now(), 0);
  setTimeout(async () => {
    const channel = await client.channels.fetch(reminder.channelId);
    if (channel) {
      channel.send(`**${reminder.title}**\n${reminder.content}`);
    }
    removeReminder(reminder.id);
  }, delay);
}

function initReminders(client) {
  const reminders = loadReminders();
  for (const reminder of reminders) {
    scheduleReminder(client, reminder);
  }
}

function createReminder(client, reminderData) {
  const reminder = {
    id: Date.now().toString(),
    ...reminderData,
    time: reminderData.time.getTime()
  };
  addReminder(reminder);
  scheduleReminder(client, reminder);
}

module.exports = {
  initReminders,
  createReminder
};
