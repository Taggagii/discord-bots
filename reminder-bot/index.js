require('dotenv').config()
const { Client, Events, GatewayIntentBits, Collection, MessageFlags } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.commands = new Collection();

const commandFolder = path.join(__dirname, 'commands')
const subCommandFolders = fs.readdirSync(commandFolder);

subCommandFolders.forEach((subCommandFolder) => {
	const subCommandPath = path.join(commandFolder, subCommandFolder);
	const subCommandFiles = fs.readdirSync(subCommandPath).filter((file) => file.endsWith(".js"));

	subCommandFiles.forEach((subCommandFile) => {
		const subCommandFilePath = path.join(subCommandPath, subCommandFile);
		const subCommand = require(subCommandFilePath);

		if (['data', 'execute'].every((value) => Object.prototype.hasOwnProperty.call(subCommand, value))) {
			client.commands.set(subCommand.data.name, subCommand);
		} else {
			console.log(`'${subCommandFilePath}' does not contain both 'data' and 'execute' attributes`);

		}
	});
});


client.once(Events.ClientReady, (readyClient) => {
	console.log(`${readyClient.user.username} started up`);
});

client.on(Events.InteractionCreate, async (interaction) => {
	if (interaction.isChatInputCommand()) {
		const command = interaction.client.commands.get(interaction.commandName);

		if (!command) {
			console.error(`No matching command name: '${interaction.commandName}'`)
			return;
		}

		try {
			await command.execute(interaction);
		} catch (error) {
			console.error(error);
		}

		return;
	}

	if (interaction.isModalSubmit()) {
		const commandName = interaction.customId.split(':')[0];
		const command = interaction.client.commands.get(commandName);

		if (!command || !command.handleModal) {
			console.error(`Invalid modal submit for command name '${interaction.commandName}'`);
			return;
		}

		try {
			return command.handleModal(interaction);
		} catch (error) {
			console.error(error);
		}

		return;
	}
});


if (!process.env.token) {
	throw new Error("Please the bot token in the .env file")
}

client.login(process.env.token)

