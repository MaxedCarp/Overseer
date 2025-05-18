const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const EmbedCreator = require('../../Event_Modules/embedcreator.js');
const essentials = require("../../Event_Modules/essentials.js");
module.exports = {
	data: new SlashCommandBuilder()
		.setName('tempban')
		.setDescription('Ban a user')
		.addUserOption(option =>
            option.setName('user')
                .setDescription('User to ban')
				.setRequired(true))
		.addStringOption(option =>
			option.setName('time')
				.setDescription('How long?')
				.setRequired(true))
		.addStringOption(option =>
            option.setName('reason')
                .setDescription('Reason'))
		.setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),
	async execute(interaction) {
		const member = interaction.options.getMember('user');
		const time = interaction.options.getString('time');
		const reason = interaction.options.getString('reason');
		const isadmin = (interaction.guild.members.me).permissions.has(PermissionFlagsBits.Administrator);
		const ismod = (interaction.guild.members.me).permissions.has(PermissionFlagsBits.BanMembers)
		if (!(isadmin || ismod)) {
			await interaction.reply({ content: `My apologies. I don't have the required permissions to ban!`, ephemeral: true });
			return;
		}
		if (!member?.bannable) {
			await interaction.reply({ content: `My apologies. Either this user has a higher role than me or they are not in the server, so I could not ban them.`, ephemeral: true });
			return;
		}
		if (member.user.bot) {
			await interaction.reply({content: `My apologies. This user is a bot so I could not ban them!`, ephemeral: true});
			return;
		}
		const user = member.user;
		await member.ban();
		let obj = await global.srvcol.findOne({ "srv": interaction.guild.id});
		const inttime = await essentials.parsetime(time, "s");
		const bandata = {id: user.id, expire: Math.floor(new Date().getTime() / 1000) + inttime, username: user.username, globalName: user.globalName}
		obj.banlist.push(bandata);
		await global.srvcol.updateOne({srv: interaction.guild.id}, { $set: {banlist: obj.banlist} });
		await interaction.reply({ content: `User: ${member.user} temporarily banned for ${await essentials.parsetime(time, "s")} seconds.\nReason: ${reason || "No reason provided."}.`});
		const dt = await global.notecol.findOne({serial: {$gt: -1}});
		const msgobj = { srv: interaction.guild.id, userID: user.id, username: user.username, noteAuthor: { userID: interaction.user.id, userName: interaction.user.username, globalName: interaction.user.globalName, avatar: interaction.user.avatar, avatarURL: interaction.user.displayAvatarURL() }, type: "tempban", text: `${reason || "No reason provided."}.`, serial: dt.serial + 1};
		await global.notecol.insertOne(msgobj);
		let resembed = await EmbedCreator.Create(`Moderation Command executed in: <#${interaction.channel.id}>`, `Command: /tempban\nTarget User: ${member.user}.\nTime: ${time}`, false, interaction.guild.name, interaction.guild.iconURL(), `${interaction.user.globalName || interaction.user.username} (${interaction.user.username})`, `https://cdn.discordapp.com/avatars/${interaction.user.id}/${interaction.user.avatar}`, 0xff9900, []);
		if (obj.delete === "none" || !obj)
			return;
		if (((interaction.guild.members.me).permissionsIn(obj.moderationlog).has(PermissionFlagsBits.SendMessages) && (interaction.guild.members.me).permissionsIn(obj.moderationlog).has(PermissionFlagsBits.ViewChannel)) || (interaction.guild.members.me).permissionsIn(obj.moderationlog).has(PermissionFlagsBits.Administrator))
			await client.channels.cache.get(obj.moderationlog).send({ embeds: [resembed] });
		else
			return;
	},
};