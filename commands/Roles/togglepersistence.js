const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
module.exports = {
	data: new SlashCommandBuilder()
		.setName('togglepersistence')
		.setDescription('Toggles role persistence (where users keep the roles when they leave or not)')
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),
	async execute(interaction) {
		const { guild } = interaction;
		const data = await global.srvcol.findOne({srv: interaction.guild.id});
		const persistence = data.rolepersistence;
		const look = {srv: interaction.guild.id};
		const test = { rolepersistence: !persistence};
		const upd = { $set: test };
		await global.srvcol.updateOne(look, upd);
		await interaction.reply({ content: `Role Persistence is now ${!persistence ? "enabled" : "disabled"}`, ephemeral: true });
		const members = await guild.members.fetch();
		if (!persistence) {
			await members.forEach(member => {
				(async () => {
					const look2 = {srv: interaction.guild.id, userid: member.id};
					const duser = {srv: guild.id, userid: member.id, nickname: member.nickname, roles: member["_roles"]};
					if (!(await global.persistcol.findOne(look2))) {
						await global.persistcol.insertOne(duser);
					}
					else {
						await global.persistcol.updateOne(look, {$set: {nickname: member.nickname, roles: member["_roles"]}})
					}
				})();
			});
		}
		else {
			await global.persistcol.deleteMany(look);
		}
	},
};