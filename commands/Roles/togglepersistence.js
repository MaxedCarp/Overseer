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
		members.forEach(member => {
			const look = {srv: interaction.guild.id};
			const duser = { nickname: member.nickname, roles: member["_roles"] };
			data.users[member.id] = duser;
			const test = { users: data.users};
			const upd = { $set: test };
			global.srvcol.updateOne(look, upd).then();
		});
	},
};