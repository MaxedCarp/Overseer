const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const fs2 = require('../../fsfuncs')
const path = require('node:path');
module.exports = {
	data: new SlashCommandBuilder()
		.setName('note')
		.setDescription('Manage a user\'s notes')
		.addSubcommand(subcommand =>
		subcommand
			.setName('add')
			.setDescription('Adds a new role to be given on join.')
			.addUserOption(option =>
            option.setName('user')
                .setDescription('Target user')
				.setRequired(true))
			.addStringOption(option =>
            option.setName('note')
                .setDescription('Note to add')
				.setRequired(true)))
		.addSubcommand(subcommand =>
		subcommand
			.setName('remove')
			.setDescription('Remove a join role.')
			.addIntegerOption(option =>
            option.setName('index')
                .setDescription('Index of the role to be removed')
				.setRequired(true)))
		.addSubcommand(subcommand =>
		subcommand
			.setName('list')
			.setDescription('List all notes given for the target user.')
			.addUserOption(option =>
            option.setName('user')
                .setDescription('Target user')
				.setRequired(true)))
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),
	async execute(interaction) {
		const sub = interaction.options.getSubcommand();
		const user = interaction.options.getUser('user');
		const note = interaction.options.getString('note');
		const index = interaction.options.getInteger('index');
		switch(sub) {
			case "add":
				const msgobj = { srv: interaction.guild.id, userID: user.id, username: user.username, noteAuthor: { userID: interaction.user.id, userName: interaction.user.username, globalName: interaction.user.globalName, avatar: interaction.user.avatar, avatarURL: interaction.user.displayAvatarURL() }, type: "note", text: note.replace("\\n","\n")};
				await global.notecol.insertOne(msgobj);
				await interaction.reply({ content: `Successfully added note to user: ${user.username}`, ephemeral: true });
			break;
			case "remove":
				await interaction.reply({ content: `The target user has no notes.`, ephemeral: true });
			break;
			case "list":
				const notelist = new EmbedBuilder()
				.setColor(0xfa8b2a)
				.setTitle(`${user.username}'s notes`)
				.setThumbnail(user.displayAvatarURL())
				.setAuthor({ name: `${interaction.user.username}`, iconURL: `${interaction.member.displayAvatarURL()}` })
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
			break;
			default: return;
		}
		//await interaction.reply({ content: `${sub} channel successfully set to <#${interaction.channel.id}>!`, ephemeral: true });
	},
};