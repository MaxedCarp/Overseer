const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
module.exports = {
	data: new SlashCommandBuilder()
		.setName('unsetlogchannel')
		.setDescription('Unsets a log channel')
		.addStringOption(option =>
			option.setName('type')
				.setDescription('Type of log channel to unset')
				.setRequired(true)
				.addChoices(
					{ name: 'Edited Messages', value: 'update' },
					{ name: 'Deleted Messages', value: 'delete' },
					{ name: 'Overseer Commands', value: 'command' },
					{ name: 'User Join Messages', value: 'join' },
					{ name: 'User Leave Messages', value: 'leave' },
					{ name: 'User Join Details', value: 'joinstat' },
					{ name: 'User Leave Details', value: 'leavestat' },
					{ name: 'User Bans', value: 'bans' },
					{ name: 'User Ban Details', value: 'banstat' },
					{ name: 'User Updates', value: 'userupdate' },
					{ name: 'Moderation Log', value: 'moderationlog' }
				))
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
	async execute(interaction) {
		const look = {srv: interaction.guild.id};
		let test = {}
		test[interaction.options.getString("type")] = "none";
		const upd = { $set: test };
		await global.srvcol.updateOne(look, upd);
		await interaction.reply({ content: `${interaction.options.getString("type")} channel unset successfully!`, ephemeral: true });
	},
};