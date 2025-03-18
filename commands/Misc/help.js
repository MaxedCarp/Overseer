const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('help')
		.setDescription('Prints out a basic help form!'),
	async execute(interaction) {
		const exampleEmbed = new EmbedBuilder()
				.setColor(0x00A012)
				.setTitle(`Command List`)
				.setAuthor({
					name: `Help Form`, iconURL: `https://cdn.discordapp.com/avatars/1205253895258120304/117149e264b0a5624b74acd977dd3eb1.png`
				})
				.setDescription("< > - Parameter\n(< > < >...) - Optional parameter(s)")
				.addFields(
					{ name: 'Channels', value: "----------------" },
					{ name: 'Roles', value: "----------------" },
					{ name: 'Messages', value: "----------------" },
					{ name: 'Misc', value: "----------------" },
					{ name: '/help', value: "- Displays this help form" }
				)
				.setFooter({ text: interaction.guild.name, iconURL: interaction.guild.iconURL() });
		await interaction.reply({ embeds: [exampleEmbed], ephemeral: true });
	},
};