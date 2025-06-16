const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
module.exports = {
	data: new SlashCommandBuilder()
		.setName('setjoinmsg')
		.setDescription('Sets the join message for this server.')
		.addStringOption(option =>
            option.setName('message')
                .setDescription('Message to set')
				.setRequired(true))
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
	async execute(interaction) {
		const msg = interaction.options.getString('message');
		const look = {srv: interaction.guild.id};
		let test = {joinmsg: msg};
		const upd = { $set: test };
		await global.srvcol.updateOne(look, upd);
		await interaction.reply({ content: `Join Message successfully set to "${msg}"!`, ephemeral: true });
	},
};