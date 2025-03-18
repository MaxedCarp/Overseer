const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

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
		const parseDuration = await import('parse-duration');
		const time = parseDuration.default(interaction.options.getString('time'), 's');
		await interaction.reply({ content: `${interaction.options.getString('time')} = ${time} seconds!`, ephemeral: true });
	},
};