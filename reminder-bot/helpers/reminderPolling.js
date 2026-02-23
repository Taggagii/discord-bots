const { db, removeReminder } = require('../database.js');

const startReminderPolling = (client, pollInterval = 10 * 1000) => {
	setInterval(async () => {
		const now = Date.now();
		const dueReminders = db.reminders.filter(r => r.triggerDate <= now);

		if (dueReminders.length === 0) {
			return;
		};

		console.log('Handling due reminders:', dueReminders);

		for (const reminder of dueReminders) {
			try {
				const guild = await client.guilds.fetch(reminder.guildId);
				if (!guild) {
					console.warn(`Couldn't find guild for remidner ${reminder.id}`);
					return;
				}

				let channel;
				try {
					channel = await guild.channels.fetch(reminder.channelId);
				} catch (err) {
					console.warn(`Couldn't get the channel for reminder ${reminder.channelId}:`, err);
					return;
				}

				await channel.send(`**${reminder.title}**\n${reminder.content}`);

				await removeReminder(reminder.id);
			} catch (err) {
				console.error('Error sending reminder:', err);
			}
		}
	}, pollInterval);
}

module.exports = {
	startReminderPolling
};
