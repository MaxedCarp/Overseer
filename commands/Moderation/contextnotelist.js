const { EmbedBuilder, ContextMenuCommandBuilder, ApplicationCommandType, PermissionFlagsBits,
	ButtonStyle,
	ActionRowBuilder
} = require('discord.js');
const EmbedCreator = require("../../Event_Modules/embedcreator");
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
			.setAuthor({ name: `${interaction.user.username}`, iconURL: `${interaction.member.displayAvatarURL()}` })
			.setFooter({ text: `${interaction.guild.name}`, iconURL: interaction.guild.iconURL() });
		var list = "";
		const data = await global.notecol.find({srv: interaction.guild.id, userID: user.id}).toArray();
		if (await global.notecol.count({srv: interaction.guild.id, userID: user.id}) > 0){
			i = 1;
			for (let note of data) {
				list += `-# \\|\\|NOTE ID:${note.serial}\\|\\|\n- Note Type: ${note.type}.\n- Issued by: <@${note.noteAuthor.userID}>.\n${note.text}.\n-------------------\n<t:${note.time}:f>\n\n`;
				i++;
			}
			const prev = await EmbedCreator.Button(`note`,"Previous", ButtonStyle.Primary, '◀️',true);
			const next = await EmbedCreator.Button(`notes:${user.id}:${data[data.length - 1].serial}:${i}:false`,"Next", ButtonStyle.Primary,'▶️');
			const row = new ActionRowBuilder().addComponents(prev, next);
			notelist.setDescription(list);
			await interaction.reply({ embeds: [notelist], components: [row], ephemeral: true })
		}
		else 
			await interaction.reply({ content: "The target user has no notes.", ephemeral: true })
	}
};