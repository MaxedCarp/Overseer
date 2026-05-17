const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { contact } = require('../../config.json');
module.exports = {
	data: new SlashCommandBuilder()
		.setName('updateval')
		.setDescription('You don\'t need to know')
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
	async execute(interaction) {
		if (interaction.user.id !== contact)
			return;
		global.client.guilds.cache.forEach(guild => {
			(async () => {
				await global.srvcol.updateOne({srv: guild.id}, {$set: {icon: guild.iconURL()}});
			})();
		});
	},
};