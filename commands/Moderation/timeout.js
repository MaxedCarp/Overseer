const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('timeout')
		.setDescription('Time out a user')
		.addUserOption(option =>
            option.setName('user')
                .setDescription('User to mute')
				.setRequired(true))
		.addStringOption(option =>
            option.setName('time')
                .setDescription('How long?')
				.setRequired(true))
		.setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),
	async execute(interaction) {
		const parseDuration = await import('parse-duration');
		const member = interaction.options.getMember('user');
		const time = interaction.options.getString('time');
		if (!member.roles.highest.editable) {
			await interaction.reply({ content: `You can not time out this user!`, ephemeral: true });
			return;
		}
		if (parseDuration.default(time,'d') <= parseDuration.default("28 days",'d')) {
			member.timeout(parseDuration.default(time,'ms'))
			await interaction.reply({ content: `User: ${member.user} timed out for: ${parseDuration.default(time,'s')} seconds`, ephemeral: true });
		}
		else {
			member.timeout(parseDuration.default("28 days",'ms'))
			await interaction.reply({ content: `User: ${member.user} timed out for: ${parseDuration.default("28 days",'s')} seconds`, ephemeral: true });
		}
	},
};