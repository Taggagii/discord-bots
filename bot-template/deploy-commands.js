require('dotenv').config()
const { REST, Routes } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');

const commands = [];

const commandFolder = path.join(__dirname, 'commands')
const subCommandFolders = fs.readdirSync(commandFolder);

subCommandFolders.forEach((subCommandFolder) => {
	const subCommandPath = path.join(commandFolder, subCommandFolder);
	const subCommandFiles = fs.readdirSync(subCommandPath).filter((file) => file.endsWith(".js"));

	subCommandFiles.forEach((subCommandFile) => {
		const subCommandFilePath = path.join(subCommandPath, subCommandFile);
		const subCommand = require(subCommandFilePath);

		if (['data', 'execute'].every((value) => Object.prototype.hasOwnProperty.call(subCommand, value))) {
			commands.push(subCommand.data.toJSON())
		} else {
			console.log(`'${subCommandFilePath}' does not contain both 'data' and 'execute' attributes`);

		}
	});
});

const rest = new REST().setToken(process.env.token);

(async () => {
	try {
		console.log(`STarted refreshing ${commands.length} slash commands`);
		const data = await rest.put(Routes.applicationGuildCommands(process.env.botId, process.env.guildId), { body: commands });
		console.log(`Successfully refreshed ${data.length} slash commands`);
	} catch (error) {
		console.error(error)
	}
})();

