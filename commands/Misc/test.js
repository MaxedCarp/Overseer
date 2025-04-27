const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const fs2 = require('../../fsfuncs')
const path = require('node:path');
module.exports = {
	data: new SlashCommandBuilder()
		.setName('test')
		.setDescription('You don\'t need to know')
		.addStringOption(option =>
				option.setName('url')
				.setDescription('URL'))
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
	async execute(interaction) {
		if (interaction.user.id !== "275305152842301440")
			return;
		const look = {srv: interaction.guild.id};
		test = { april: true };
		const upd = { $set: test };
		const data = await global.srvcol.updateOne(look, upd);
		await interaction.guild.setIcon(interaction.options.getString("url") || "https://cdn.discordapp.com/attachments/1128045906558726206/1356193839555149904/Buff_Limbo_-_Troll5.png?ex=67ebad70&is=67ea5bf0&hm=9efee964b16e3145ba3c6a3bcf09a546b85016d3f1fe2a667566d788bbb85af4&")
		await interaction.reply({ content: `Done!`, ephemeral: true });
	},
};