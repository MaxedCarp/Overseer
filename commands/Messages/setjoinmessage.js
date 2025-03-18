const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const fs2 = require('../../fsfuncs')
const path = require('node:path');
module.exports = {
	data: new SlashCommandBuilder()
		.setName('setjoinmsg')
		.setDescription('Sets the join message for this server.')
		.addStringOption(option =>
            option.setName('message')
                .setDescription('Message to set')
				.setRequired(true))
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageServer),
	async execute(interaction) {
		const msg = interaction.options.getString('message');
		const look = {srv: interaction.guild.id};
		test = {joinmsg: msg};
		const upd = { $set: test };
		const data = await global.srvcol.updateOne(look, upd);
		await interaction.reply({ content: `Join Message successfully set to "${msg}"!`, ephemeral: true });
	},
};