const { ActionRowBuilder, ButtonBuilder, ButtonStyle, SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('help')
		.setDescription('Prints out a basic help form!'),
	async execute(interaction) {
		const helpChannels = new EmbedBuilder()
				.setColor(0x00A012)
				.setTitle(`Command List - Page 1: Channels`)
				.setAuthor({
					name: `Help Form`, iconURL: `https://cdn.discordapp.com/avatars/1205253895258120304/117149e264b0a5624b74acd977dd3eb1.png`
				})
				.setDescription("< > - Parameter\n(< > < >...) - Optional parameter(s)\nExample for commands that require time:\n/tempban user:maxedcarp time:5 hours 3m 31 second")
				.addFields(
					{ name: 'Channels', value: "----------------" },
					{ name: '/setlogchannel <type>', value: "Sets the specified logs channel to the channel the command is executed in." },
				)
				.setFooter({ text: interaction.guild.name, iconURL: interaction.guild.iconURL() });
		const left = new ButtonBuilder()
			.setCustomId('help4')
			.setLabel('Miscellaneous')
			.setStyle(ButtonStyle.Primary)
			.setEmoji('◀️');
		const right = new ButtonBuilder()
			.setCustomId('help1')
			.setLabel('Roles')
			.setStyle(ButtonStyle.Primary)
			.setEmoji('▶️');
		const row = new ActionRowBuilder()
			.addComponents(left, right);
		await interaction.reply({ embeds: [helpChannels], components: [row], ephemeral: true });
	},
};