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
			members.forEach(member => {
				(async () => {
					const look = {srv: interaction.guild.id, userid: member.id};
					const duser = {srv: guild.id, userid: member.id, nickname: member.nickname, roles: member["_roles"]};
					//data.users[member.id] = duser;
					if (!!(await global.persistcol.find(look))) {
						await global.persistcol.insertOne(duser);
					}
					else {
						await global.persistcol.updateOne(look, {$set: {nickname: member.nickname, roles: member["_roles"]}})
					}
				})();
			});
		}
		else {
			members.forEach(member => {
				(async () => {
					const look = {srv: interaction.guild.id, userid: member.id};
					if (!(await global.persistcol.find(look))) {
						await global.persistcol.deleteOne(look);
					}
				})();
			});
		}
	},
};