const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const EmbedCreator = require('../../Event_Modules/embedcreator.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ban')
		.setDescription('Ban a user')
		.addUserOption(option =>
            option.setName('user')
                .setDescription('User to ban')
				.setRequired(true))
		.addStringOption(option =>
            option.setName('reason')
                .setDescription('Reason'))
		.setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),
	async execute(interaction) {
		const member = interaction.options.getMember('user');
		//const user = member.user;
		const reason = interaction.options.getString('reason');
		if (!member?.roles?.highest.editable) {
			await interaction.reply({ content: `My apologies. Either this user has a higher role than me or they are not in the server, so I could not ban them.`, ephemeral: true });
			return;
		}
		await member.ban();
		await interaction.reply({ content: `User: <@${member.id}> banned successfully for: ${reason} || "No reason provided."}.`});
		const msgobj = { srv: interaction.guild.id, userID: user.id, username: user.username, noteAuthor: { userID: interaction.user.id, userName: interaction.user.username, globalName: interaction.user.globalName, avatar: interaction.user.avatar, avatarURL: interaction.user.displayAvatarURL() }, type: "ban", text: `${reason || "No reason provided."}.`, serial: (await global.notecol.findOne({serial: {$gt: -1}}).serial) + 1};
		await global.notecol.insertOne(msgobj);
		let obj = await global.srvcol.findOne({ "srv": interaction.guild.id});
		let resembed = await EmbedCreator.Create(`Moderation Command executed in: <#${interaction.channel.id}>`, `Command: /ban\nTarget User: <@${member.id}>.`, false, interaction.guild.name, interaction.guild.iconURL(), `${interaction.user.globalName || interaction.user.username} (${interaction.user.username})`, `https://cdn.discordapp.com/avatars/${interaction.user.id}/${interaction.user.avatar}`, 0xff9900, []);
		if (obj.delete === "none" || !obj)
			return;
		if (((interaction.guild.members.me).permissionsIn(obj.moderationlog).has(PermissionFlagsBits.SendMessages) && (interaction.guild.members.me).permissionsIn(obj.moderationlog).has(PermissionFlagsBits.ViewChannel)) || (interaction.guild.members.me).permissionsIn(obj.moderationlog).has(PermissionFlagsBits.Administrator))
			await client.channels.cache.get(obj.moderationlog).send({ embeds: [resembed] });
		else
			return;
	},
};