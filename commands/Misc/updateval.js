const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
module.exports = {
	data: new SlashCommandBuilder()
		.setName('updateval')
		.setDescription('You don\'t need to know')
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
	async execute(interaction) {
		if (interaction.user.id !== "275305152842301440")
			return;
		const obj = await global.bancol.find()
		client.guilds.cache.forEach(guild => {
			(async () => {
				await global.srvcol.updateOne({srv: guild.id}, {$set: {icon: guild.iconURL()}});
			})();
		});
	},
};