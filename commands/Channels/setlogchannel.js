const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const fs2 = require('../../fsfuncs')
const path = require('node:path');
module.exports = {
	data: new SlashCommandBuilder()
		.setName('setlogchannel')
		.setDescription('Sets a log channel')
		.addSubcommand(subcommand =>
		subcommand
			.setName('update')
			.setDescription('Sets the Message Updates log channel.'))
		.addSubcommand(subcommand =>
		subcommand
			.setName('delete')
			.setDescription('Sets the Message Deletes log channel.'))
		.addSubcommand(subcommand =>
		subcommand
			.setName('command')
			.setDescription('Sets the Commands log channel.'))
		.addSubcommand(subcommand =>
		subcommand
			.setName('join')
			.setDescription('Sets the Join Messages channel.'))
		.addSubcommand(subcommand =>
		subcommand
			.setName('leave')
			.setDescription('Sets the Leave Messages channel.'))
		.addSubcommand(subcommand =>
		subcommand
			.setName('joinstat')
			.setDescription('Sets the User Information on Join log channel.'))
		.addSubcommand(subcommand =>
		subcommand
			.setName('leavestat')
			.setDescription('Sets the User Information on Leave log channel.'))
		.addSubcommand(subcommand =>
		subcommand
			.setName('bans')
			.setDescription('Sets the Ban Messages channel.'))
		.addSubcommand(subcommand =>
		subcommand
			.setName('banstat')
			.setDescription('Sets the User Information on Ban log channel.'))
		.addSubcommand(subcommand =>
		subcommand
			.setName('userupdate')
			.setDescription('Sets the User Updates log channel.'))
		.addSubcommand(subcommand =>
		subcommand
			.setName('moderationlog')
			.setDescription('Sets the Moderation Log channel.'))
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
	async execute(interaction) {
		const sub = interaction.options.getSubcommand();
		const look = {srv: interaction.guild.id};
		test = {}
		test[sub] = interaction.channel.id;
		const upd = { $set: test };
		const data = await global.srvcol.updateOne(look, upd);
		await interaction.reply({ content: `${sub} channel successfully set to <#${interaction.channel.id}>!`, ephemeral: true });
	},
};