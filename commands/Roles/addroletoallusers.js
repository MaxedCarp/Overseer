const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
module.exports = {
	data: new SlashCommandBuilder()
		.setName('addroletoallusers')
		.setDescription('Adds a role to all users.')
		.addRoleOption(option =>
            option.setName('role')
            .setDescription('A role to be added')
			.setRequired(true))
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),
	async execute(interaction) {
		const role = interaction.options.getRole('role');
		for (let member of interaction.guild.members.cache) {
			await member.roles.add(role);
		}
		await interaction.reply("Done!");
	},
};