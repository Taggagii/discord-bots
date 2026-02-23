require('dotenv').config()
const { Client, Events, GatewayIntentBits } = require('discord.js');

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once(Events.ClientReady, (readyClient) => {
	console.log(`Bot ready ${readyClient}`);
});

if (!process.env.secret) {
	throw new Error("Please the bot secret in the .env file")
}

client.login(process.env.secret)

