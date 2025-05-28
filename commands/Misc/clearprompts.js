const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
module.exports = {
	data: new SlashCommandBuilder()
		.setName('clearprompts')
		.setDescription('Clears overseer\'s prompts in this server'),
	async execute(interaction) {
		if (interaction.user.id !== "275305152842301440")
			return;
		await global.aicol.deleteMany({srv: interaction.guild.id});
	},
};