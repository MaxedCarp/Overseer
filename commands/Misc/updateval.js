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
		await global.client.guilds.cache.forEach(guild => {
			console.log(guild.name + " " + guild.id);
			const look = {srv: guild.id};
			global.srvcol.findOne(look).then(obj => {
				guild.members.fetch().then(members => {
					if (obj.rolepersistence) {
						members.forEach(member => {
							(async () => {
								const look2 = {srv: interaction.guild.id, userid: member.id};
								const duser = {
									srv: guild.id,
									userid: member.id,
									nickname: member.nickname,
									roles: member["_roles"]
								};
								if (!(await global.persistcol.find(look2))) {
									await global.persistcol.insertOne(duser);
								} else {
									await global.persistcol.updateOne(look2, {
										$set: {
											nickname: member.nickname,
											roles: member["_roles"]
										}
									})
								}
							})();
						});
					}
				})
			})
		});
		await interaction.reply({ content: `Role persistence lists updated successfully!`, ephemeral: true });
	},
};