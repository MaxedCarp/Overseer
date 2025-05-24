const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
module.exports = {
	data: new SlashCommandBuilder()
		.setName('updateval')
		.setDescription('You don\'t need to know')
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
	async execute(interaction) {
		if (interaction.user.id !== "275305152842301440")
			return;
		const db = global.mongo.db("overseer");
		const col = db.collection("autoban");
		const head = await col.findOne();
		head.test.forEach(usr => {
			col.insertOne({srv: head.srvs[0], userId: usr}).then();
			col.insertOne({srv: head.srvs[1], userId: usr}).then();
			col.insertOne({srv: head.srvs[2], userId: usr}).then();
		});
	},
};