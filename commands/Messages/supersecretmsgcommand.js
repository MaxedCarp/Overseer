const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const fs2 = require('../../fsfuncs')
const path = require('node:path');
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
		if (interaction.user.id !== "275305152842301440"){
			interaction.reply({ content: 'I apologize, but you do not have any rights (to use this command)!', ephemeral: true });
			return;
		}
		const msg = interaction.options.getString('message');
		const usr = interaction.options.getUser('user');
		let dmChannel = await client.users.createDM(usr.id);
		await dmChannel.send(msg);
		await interaction.reply({ content: `Message successfully set to "${usr.globalName}"!`, ephemeral: true });
	},
};