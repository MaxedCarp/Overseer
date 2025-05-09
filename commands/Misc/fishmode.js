const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
module.exports = {
	data: new SlashCommandBuilder()
		.setName('fishmode')
		.setDescription('Toggles fish mode, which will react to various kinds of fish (LOL)')
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageServer),
	async execute(interaction) {
		const data = await global.srvcol.findOne({srv: interaction.guild.id});
		const fishmode = data.fishmode;
		const look = {srv: interaction.guild.id};
		const test = { fishmode: !fishmode};
		const upd = { $set: test };
		await global.srvcol.updateOne(look, upd);
		await interaction.reply({ content: `Fish mode is now ${!persistence ? "enabled" : "disabled"}`, ephemeral: true });
	},
};