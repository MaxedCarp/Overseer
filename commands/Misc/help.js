const { ActionRowBuilder, ButtonBuilder, ButtonStyle, SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const forms = require("../Command_Modules/forms.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName('help')
		.setDescription('Prints out a basic help form!'),
	async execute(interaction) {
		await interaction.reply({ embeds: [await forms.GetForm(0, interaction.guild.name, interaction.guild.iconURL())], components: [await forms.GetComps(0)], ephemeral: true });
	},
};