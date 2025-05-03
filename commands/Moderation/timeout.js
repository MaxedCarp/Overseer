const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const EmbedCreator = require('../../Event_Modules/embedcreator.js');
const essentials = require('../../Event_Modules/essentials.js');

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
		.addStringOption(option =>
            option.setName('reason')
                .setDescription('Reason'))
		.setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),
	async execute(interaction) {
		const member = interaction.options.getMember('user');
		const user = member.user;
		const reason = interaction.options.getString('reason');
		const time = interaction.options.getString('time');
		if (!member.roles.highest.editable) {
			await interaction.reply({ content: `You can not time out this user!`, ephemeral: true });
			return;
		}
		if (await essentials.parsetime(time,'d') <= await essentials.parsetime("28 days",'d')) {
			member.timeout(await essentials.parsetime(time,'ms'));
			await interaction.reply({ content: `User: ${member.user} timed out for: ${await essentials.parsetime(time,'s')} seconds`, ephemeral: true });
		}
		else {
			member.timeout(await essentials.parsetime("28 days",'ms'))
			await interaction.reply({ content: `User: ${member.user} timed out for: ${await essentials.parsetime("28 days",'s')} seconds`, ephemeral: true });
		}
		const msgobj = { srv: interaction.guild.id, userID: user.id, username: user.username, noteAuthor: { userID: interaction.user.id, userName: interaction.user.username, globalName: interaction.user.globalName, avatar: interaction.user.avatar, avatarURL: interaction.user.displayAvatarURL() }, type: "timeout", text: `- Length: ${time}.\n${reason || "No reason provided."}.`, serial: (await global.notecol.findOne({serial: {$gt: -1}}).serial) + 1};
		await global.notecol.insertOne(msgobj);
		let obj = await global.srvcol.findOne({ "srv": interaction.guild.id});
		let resembed = await EmbedCreator.Create(`Moderation Command executed in: <#${interaction.channel.id}>`, `Command: /timeout\nTarget User: ${member.user}.\nTime: ${time}.`  || " ", false, interaction.guild.name, interaction.guild.iconURL(), `${interaction.user.globalName || interaction.user.username} (${interaction.user.username})`, `https://cdn.discordapp.com/avatars/${interaction.user.id}/${interaction.user.avatar}`, 0xff9900, []);
		if (obj.delete === "none" || !obj)
			return;
		if (((interaction.guild.members.me).permissionsIn(obj.moderationlog).has(PermissionFlagsBits.SendMessages) && (interaction.guild.members.me).permissionsIn(obj.moderationlog).has(PermissionFlagsBits.ViewChannel)) || (interaction.guild.members.me).permissionsIn(obj.moderationlog).has(PermissionFlagsBits.Administrator))
			await client.channels.cache.get(obj.moderationlog).send({ embeds: [resembed] });
		else
			return;
	},
};