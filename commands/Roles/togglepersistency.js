const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const fs2 = require('../../fsfuncs')
const path = require('node:path');
const dataset = require('../Command_Modules/dataset.js');
module.exports = {
	data: new SlashCommandBuilder()
		.setName('togglepersistency')
		.setDescription('Toggles role persistency (where users keep the roles when they leave or not)')
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),
	async execute(interaction) {
		const { guild } = interaction;
		const data = await global.srvcol.findOne({srv: interaction.guild.id});
		const persistency = data.rolepersistency;
		const look = {srv: interaction.guild.id};
		const test = { rolepersistency: !persistency};
		const upd = { $set: test };
		await global.srvcol.updateOne(look, upd);
		await interaction.reply({ content: `Role Persistency is now ${!persistency ? "enabled" : "disabled"}`, ephemeral: true });
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