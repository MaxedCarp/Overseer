const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { contact } = require('../../config.json');
module.exports = {
	data: new SlashCommandBuilder()
		.setName('supersecretmsgcommand')
		.setDescription('YOU (don\'t) KNOW WHAT THAT MEANS!')
		.addStringOption(option =>
            option.setName('message')
                .setDescription('Message')
				.setRequired(true))
		.addUserOption(option =>
            option.setName('user')
                .setDescription('User')
				.setRequired(true)),
	async execute(interaction) {
		const isContact = interaction.user.id === contact;
		const isAdmin = interaction.member.permissions.has(PermissionFlagsBits.Administrator);
		if (!isContact && !isAdmin) {
			interaction.reply({ content: 'I apologize, but you do not have any rights (to use this command)!', ephemeral: true });
			return;
		}
		const msg = interaction.options.getString('message');
		const usr = interaction.options.getUser('user');
		let dmChannel = await global.client.users.createDM(usr.id);
		await dmChannel.send(msg);
		await interaction.reply({ content: `Message successfully sent to "${usr.globalName}"!`, ephemeral: true });
	},
};