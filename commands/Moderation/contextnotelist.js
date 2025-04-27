const { EmbedBuilder, ContextMenuCommandBuilder, ApplicationCommandType, PermissionFlagsBits } = require('discord.js');
module.exports = {
	data: new ContextMenuCommandBuilder()
		.setName('View User\'s Note List')
		.setType(ApplicationCommandType.User)
		.setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),
	async execute(interaction) {
		const member = interaction.guild.members.cache.get(interaction.targetUser.id);
		const user = member.user;
		const notelist = new EmbedBuilder()
			.setColor(0xfa8b2a)
			.setTitle(`${user.username}'s notes`)
			.setThumbnail(user.displayAvatarURL())
			.setAuthor({ name: `${interaction.user.globalName || interaction.user.username} (${interaction.user.username})`, iconURL: `${interaction.member.displayAvatarURL()}` })
			.setFooter({ text: interaction.guild.name, iconURL: interaction.guild.iconURL() });
		var list = "";
		const data = await global.notecol.find({srv: interaction.guild.id, userID: user.id}).toArray();
		if (data.length > 0) {
			i = 1;
			data.forEach(note => {
				list += `(${i}).\n- Note Type: ${note.type}.\n- Issued by: <@${note.noteAuthor.userID}>.\n${note.text}.\n\n`;
				i++;
			});
			notelist.setDescription(list);
			await interaction.reply({ embeds: [notelist], ephemeral: true })
		}
		else 
			await interaction.reply({ content: "The target user has no notes.", ephemeral: true })
	}
};