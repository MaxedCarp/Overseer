const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const EmbedCreator = require('../../Event_Modules/embedcreator.js');
const purgeset = require('../Command_Modules/purgeset.js');

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
		.addSubcommand(subcommand =>
			subcommand
				.setName('user')
				.setDescription('Deletes messages sent by a specific user.')
				.addUserOption(option =>
					option.setName('user')
						.setDescription('User to delete from')
						.setRequired(true))
				.addIntegerOption(option =>
					option.setName('limit')
						.setDescription('Amount of messages to fetch')))
		.addSubcommand(subcommand =>
			subcommand
				.setName('attachments')
				.setDescription('Deletes messages containing attachments.')
				.addIntegerOption(option =>
					option.setName('limit')
						.setDescription('Amount of messages to fetch'))
				.addUserOption(option =>
					option.setName('user')
						.setDescription('Specify a user to filter by (leave blank to filter by attachments from any user)')))
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
	async execute(interaction) {
		if (!((interaction.guild.members.me).permissionsIn(interaction.channel).has(PermissionFlagsBits.ManageMessages) || (interaction.guild.members.me).permissionsIn(interaction.channel).has(PermissionFlagsBits.Administrator))) {
			await interaction.reply({content: "I apologize, but I do not have the ability to delete or purge messages. Please grant me the \"Manage Messages\" or the \"Administrator\" permission.", ephemeral: true});
			return;
		}
		const sub = interaction.options.getSubcommand();
		const lim = interaction.options.getInteger("limit") || 100;
		switch(sub) {
			case "any": {
				await purgeset.any(interaction, lim)
			}
			break;
			case "user": {
				const user = interaction.options.getUser("user");
				await purgeset.user(interaction, user, lim);
			}
			break;
			case "attachments": {
				const user = interaction.options.getUser("user");
				await purgeset.attach(interaction, user.id, lim);
			}
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