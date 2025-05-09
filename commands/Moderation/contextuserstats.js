const { EmbedBuilder, ContextMenuCommandBuilder, ApplicationCommandType, PermissionFlagsBits } = require('discord.js');
module.exports = {
	data: new ContextMenuCommandBuilder()
		.setName('View Detailed User Stats')
		.setType(ApplicationCommandType.User)
		.setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),
	async execute(interaction) {
		const member = interaction.guild.members.cache.get(interaction.targetUser.id);
		const user = member.user;
		const stats = new EmbedBuilder()
            .setColor(0xfa8b2a)
            .setTitle(`User Detail Sheet!`)
			.setAuthor({ name: `${user.globalName || user.username} (${user.username})`, iconURL: `${member.displayAvatarURL()}` })
			.setDescription(`${user}`)
			.setThumbnail(member.displayAvatarURL())
			.addFields(
			{ name: "ID", value: `${user.id}`, inline: true },
			{ name: "Bot", value: `${user.bot}`, inline: true },
			{ name: "System", value: `${user.system}`, inline: true },
			{ name: "Username", value: `${user.username}`, inline: true },
			{ name: "Global Name", value: `${user.globalName || user.username}`, inline: true },
			{ name: "Discriminator", value: `${user.discriminator}`, inline: true },
			{ name: "Avatar", value: `${member.displayAvatarURL()}`, inline: true },
			{ name: "Join Date", value: `<t:${member.joinedTimestamp}`.slice(0, -3) + ":F>" + ` (<t:${member.joinedTimestamp}`.slice(0, -3) + ":R>)", inline: true },
			{ name: "Created On", value: `<t:${user.createdTimestamp}`.slice(0, -3) + ":F>" + ` (<t:${user.createdTimestamp}`.slice(0, -3) + ":R>)", inline: true })
			.setFooter({ text: member.guild.name, iconURL: member.guild.iconURL() });
		await interaction.reply({ embeds: [stats], ephemeral: true });
	}
};