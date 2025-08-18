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
		const hasperms = (interaction.guild.members.me).permissions.has(PermissionFlagsBits.ManageRoles);
		if (!hasperms)
		{
			await interaction.reply({content: "My apologies. I don't have the required permissions to assign roles!", ephemeral: true});
			return;
		}
		const role = interaction.options.getRole('role');
		const members = interaction.guild.members.cache;
		members.forEach(async (member) => {
			if (!member?.user?.bot)
				await member.roles.add(role);
		});
		await interaction.reply("Done!");
	},
};