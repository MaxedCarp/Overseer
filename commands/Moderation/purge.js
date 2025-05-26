const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const EmbedCreator = require('../../Event_Modules/embedcreator.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('purge')
		.setDescription('Deletes multiple messages at once')
		.addSubcommand(subcommand =>
		subcommand
			.setName('any')
			.setDescription('Deletes messages without any filters.')
			.addIntegerOption(option =>
				option.setName('limit')
				.setDescription('Amount of messages to fetch')))
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
	async execute(interaction) {
		if (!((interaction.guild.members.me).permissionsIn(interaction.channel).has(PermissionFlagsBits.ManageMessages) || (interaction.guild.members.me).permissionsIn(interaction.channel).has(PermissionFlagsBits.Administrator))) {
			await interaction.reply({content: "I apologize, but I do not have the ability to delete or purge messages. Please grant me the \"Manage Messages\" or the \"Administrator\" permission.", ephemeral: true});
			return;
		}
		const sub = interaction.options.getSubcommand();
		const lim = interaction.options.getInteger("limit") || 100;
		switch(sub) {
			case "any": 
				const look = { "messageChannelID": interaction.channel.id };
				let msgs = await global.msgcol.find(look).sort({"_id": -1}).limit(lim).toArray();
				let chatmsgs = [];
				for (let i = 0;i < msgs.length;i++){
					try {
						let chatmsg = await interaction.channel.messages.fetch(msgs[i].messageID);
						await chatmsgs.push(chatmsg);
					}
					catch(err) {
						await global.msgcol.deleteOne({ "messageID": msgs[i].messageID });
					}
				}
				await interaction.channel.bulkDelete(chatmsgs);
				await interaction.reply({ content: `Sucessfully deleted ${chatmsgs.length} messages!`, ephemeral: true })
			break;
		}
		let obj = await global.srvcol.findOne({ "srv": interaction.guild.id});
		let resembed = await EmbedCreator.Create(`Moderation Command executed in: <#${interaction.channel.id}>`, `Command: /purge\nSub Command: ${sub}.\nLimit: ${lim}.`  || " ", false, interaction.guild.name, interaction.guild.iconURL(), `${interaction.user.globalName || interaction.user.username} (${interaction.user.username})`, `https://cdn.discordapp.com/avatars/${interaction.user.id}/${interaction.user.avatar}`, 0xff9900, []);
		if (obj.delete === "none" || !obj)
			return;
		if (((interaction.guild.members.me).permissionsIn(obj.moderationlog).has(PermissionFlagsBits.SendMessages) && (interaction.guild.members.me).permissionsIn(obj.moderationlog).has(PermissionFlagsBits.ViewChannel)) || (interaction.guild.members.me).permissions.has(PermissionFlagsBits.Administrator))
			await client.channels.cache.get(obj.moderationlog).send({ embeds: [resembed] });
		else
			return;
	},
};