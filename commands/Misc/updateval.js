const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const fs2 = require('../../Event_Modules/fsfuncs')
const path = require('node:path');
module.exports = {
	data: new SlashCommandBuilder()
		.setName('updateval')
		.setDescription('You don\'t need to know')
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
	async execute(interaction) {
		if (interaction.user.id !== "275305152842301440")
			return;
		/*const look = {};
		test = {}
		test[sub] = interaction.channel.id;
		const upd = { $set: test };
		const data = await global.srvcol.updateOne(look, upd);
		await interaction.reply({ content: `${sub} channel successfully set to <#${interaction.channel.id}>!`, ephemeral: true });*/
		//console.log(global.client.guilds.cache);
		await global.client.guilds.cache.forEach(guild => {
			console.log(guild.name + " " + guild.id);
			const look = {srv: guild.id};
			const upd = { $set: {name: guild.name} };
			const data = global.srvcol.updateOne(look, upd);
		});
		await interaction.reply({ content: `Server names updated successfully!`, ephemeral: true });
	},
};