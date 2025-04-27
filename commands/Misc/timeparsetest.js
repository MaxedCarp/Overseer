const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const essentials = require('../../Event_Modules/essentials.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('timeparsetest')
		.setDescription('Tests a time parse')
		.addStringOption(option =>
            option.setName('time')
                .setDescription('Time')
                .setRequired(true))
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
	async execute(interaction) {
		const time = await essentials.parsetime(interaction.options.getString('time'), 's');
		await interaction.reply({ content: `${interaction.options.getString('time')} = ${time} seconds!`, ephemeral: true });
	},
};