const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const fs2 = require('../../Event_Modules/fsfuncs')
const path = require('node:path');
module.exports = {
	data: new SlashCommandBuilder()
		.setName('note')
		.setDescription('Manage a user\'s notes')
		.addSubcommand(subcommand =>
		subcommand
			.setName('add')
			.setDescription('Write a note to the specified user.')
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
			.setName('delete')
			.setDescription('Delete a note by ID.')
			.addIntegerOption(option =>
            option.setName('id')
                .setDescription('The ID of the note you wish to remove.')
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
		const index = interaction.options.getInteger('id');
		switch(sub) {
			case "add":
				const msgobj = { srv: interaction.guild.id, userID: user.id, username: user.username, noteAuthor: { userID: interaction.user.id, userName: interaction.user.username, globalName: interaction.user.globalName, avatar: interaction.user.avatar, avatarURL: interaction.user.displayAvatarURL() }, type: "note", text: note.replace("\\n","\n"), serial: ((await global.notecol.find().sort({"serial": -1}).toArray())[0].serial) + 1};
				await global.notecol.insertOne(msgobj);
				await interaction.reply({ content: `Successfully added note to user: ${user.username}`, ephemeral: true });
			break;
			case "delete":
				if (await global.notecol.count({serial: index, srv: interaction.guild.id}) > 0) {
					await global.notecol.deleteOne({serial: index, srv: interaction.guild.id});
					await interaction.reply({content: `Note #${index} deleted successfully.`, ephemeral: true});
				}
				else
					await interaction.reply({content: `Either note #${index} does not exist or you have no permission to delete it.`, ephemeral: true});
			break;
			case "list":
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
					data.forEach(note => {
						list += `-# \\|\\|NOTE ID:${note.serial}\\|\\|\n- Note Type: ${note.type}.\n- Issued by: <@${note.noteAuthor.userID}>.\n${note.text}.\n\n`;
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