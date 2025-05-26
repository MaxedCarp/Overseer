const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
module.exports = {
	data: new SlashCommandBuilder()
		.setName('seticon')
		.setDescription('Sets the server icon.')
		.addStringOption(option =>
				option.setName('url')
				.setDescription('URL'))
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
	async execute(interaction) {
		await interaction.guild.setIcon(interaction.options.getString("url"))
		await interaction.reply({ content: `Done!`, ephemeral: true });
	},
};