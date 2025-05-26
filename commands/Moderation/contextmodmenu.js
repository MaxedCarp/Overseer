const { EmbedBuilder, ContextMenuCommandBuilder, ApplicationCommandType, PermissionFlagsBits, ActionRowBuilder, ButtonStyle} = require('discord.js');
const EmbedCreator = require("../../Event_Modules/embedcreator");
module.exports = {
	data: new ContextMenuCommandBuilder()
		.setName('Open Mod Menu')
		.setType(ApplicationCommandType.User)
		.setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),
	async execute(interaction) {
		const member = interaction.guild.members.cache.get(interaction.targetUser.id);
		const user = member.user;
		const notes = await global.notecol.count({srv: interaction.guild.id, userID: user.id, type: "note"});
		const prev = await global.notecol.count({srv: interaction.guild.id, userID: user.id, type: {$ne: "note"}});
		const bans = await global.notecol.count({srv: interaction.guild.id, userID: user.id, $or: [{type: "ban"},{type: "tempban"}]});
		const modmenu = await EmbedCreator.Create(`Mod Menu - ${user.globalName || user.username} ${user.globalName ? "(" + user.username + ")" : ""}`,`Notes: ${notes}\nTotal Punishments: ${prev}\nBans: ${bans}`,null,interaction.guild.name,interaction.guild.iconURL(),null,null,0xff9900,null,null, member.displayAvatarURL());

		const notebtn = await EmbedCreator.Button(`notes:${user.id}`, "View Notes", ButtonStyle.Primary);
		const banbtn = await EmbedCreator.Button(`ban:${user.id}`, "Ban User", ButtonStyle.Danger);
		const isadmin = (interaction.guild.members.me).permissions.has(PermissionFlagsBits.Administrator);
		const ismod = (interaction.guild.members.me).permissions.has(PermissionFlagsBits.BanMembers)
		let rowModMenu;
		if ((isadmin || ismod) && member?.bannable && !member?.user?.bot) {
			rowModMenu = new ActionRowBuilder().addComponents(notebtn, banbtn);
		}
		else {
			rowModMenu = new ActionRowBuilder().addComponents(notebtn);
		}

		await interaction.reply({ embeds: [modmenu], components:[rowModMenu], ephemeral: true });
	}
};