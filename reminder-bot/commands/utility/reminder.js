const {
  SlashCommandBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
} = require('discord.js');

const chrono = require('chrono-node/en');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('reminder')
    .setDescription('Set a reminder')
    .addChannelOption(option =>
      option
        .setName('channel')
        .setDescription('Channel to send reminder')
        .setRequired(true)
    ),

  async execute(interaction) {
    const channel = interaction.options.getChannel('channel');

    const modal = new ModalBuilder()
      .setCustomId('reminder') // prefix = command name
      .setTitle('Create Reminder');

    const titleInput = new TextInputBuilder()
      .setCustomId('title')
      .setLabel('Reminder Title')
      .setStyle(TextInputStyle.Short)
      .setRequired(true);

    const contentInput = new TextInputBuilder()
      .setCustomId('content')
      .setLabel('Reminder Content')
      .setStyle(TextInputStyle.Paragraph)
      .setRequired(true);

    const timeInput = new TextInputBuilder()
      .setCustomId('time')
      .setLabel('When? [ Type semi nicely :) ]')
      .setStyle(TextInputStyle.Short)
      .setRequired(true);

    modal.addComponents(
      new ActionRowBuilder().addComponents(titleInput),
      new ActionRowBuilder().addComponents(contentInput),
      new ActionRowBuilder().addComponents(timeInput)
    );

    modal.setCustomId(`reminder:${channel.id}`);

    await interaction.showModal(modal);
  },

  async handleModal(interaction) {
    const [, channelId] = interaction.customId.split(':');

    const title = interaction.fields.getTextInputValue('title');
    const content = interaction.fields.getTextInputValue('content');
    const timeRaw = interaction.fields.getTextInputValue('time');

    const triggerDate = chrono.parseDate(timeRaw);

    if (!triggerDate) {
      return interaction.reply({
        content: 'Your date uninterpretable',
        ephemeral: true
      });
    }

    if (triggerDate <= new Date()) {
      return interaction.reply({
				content: 'Please choose a time in the future if you don\'t mind',
        ephemeral: true
      });
    }

		// todo : put this into the database and do some handling

    await interaction.reply({
      content: `Reminder set for <t:${Math.floor(triggerDate.getTime() / 1000)}:F>`,
      ephemeral: true
    });
  }
};
