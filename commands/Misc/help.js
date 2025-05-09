const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('help')
		.setDescription('Prints out a basic help form!'),
	async execute(interaction) {
		const exampleEmbed = new EmbedBuilder()
				.setColor(0x00A012)
				.setTitle(`Command List`)
				.setAuthor({
					name: `Help Form`, iconURL: `https://cdn.discordapp.com/avatars/1205253895258120304/117149e264b0a5624b74acd977dd3eb1.png`
				})
				.setDescription("< > - Parameter\n(< > < >...) - Optional parameter(s)")
				.addFields(
					{ name: 'Channels', value: "----------------" },
					{ name: '/setlogchannel <type>', value: "Sets the specified logs channel to the channel the command is executed in." },
					{ name: 'Roles', value: "----------------" },
					{ name: '/togglepersistency', value: "Enables role persistence, which allows roles to be reacquired if a member leaves and then rejoins." },
					{ name: '/joinroles add <role>', value: "Adds a roles to be assigned to new members." },
					{ name: '/joinroles list', value: "Lists all roles added on join." },
					{ name: '/joinroles remove <index>', value: "Prevent a role from being added on join (use /joinroles list to get the index)" },
					{ name: '/secretkeys add <keyset> <role> <age requirement>', value: "Assigns a role to a user if they send a message that matches the specified keyset and have the proper time-since-join (in seconds)" },
					{ name: '/secretkeys list', value: "Lists all secret keys" },
					{ name: '/secretkeys delete <index>', value: "Delete a secret keyset (use /secretkeys list list to get the index)" },
					{ name: 'Moderation', value: "----------------" },
					{ name: '/ban <user> (<reason>)', value: "Bans a user (reason will be added to the user's notes)" },
					{ name: '/timeout <user> <time> (<reason>)', value: "Times a user out for the specified duration (For example: 3 days 1h 10minutes and 32 s. Reason will be added to the user's notes)" },
					{ name: '/userstats <user>', value: "Check detailed information about the target user." },
					{ name: '/note add <user> <text>', value: "Assigns a note to a user." },
					{ name: '/note list <user>', value: "View a user's notes." },
					{ name: '/note delete <ID>', value: "Delete a user's note by ID." },
					{ name: '/purge any (<count>)', value: "Purges messages in a channel up to 100 messages." },
					{ name: 'Administration', value: "----------------" },
					{ name: '/setjoinmsg <text>', value: "Sets the join message for the server. Type {@user} to ping the user, {servername} for server name, {username} for the user's username and {user} for the user's global name." },
					{ name: '/setleavemsg <text>', value: "Sets the leave message for the server. Type {@user} to ping the user, {servername} for server name, {username} for the user's username and {user} for the user's global name." },
					{ name: 'Misc', value: "----------------" },
					{ name: '/help', value: "- Displays this help form" }
				)
				.setFooter({ text: interaction.guild.name, iconURL: interaction.guild.iconURL() });
		await interaction.reply({ embeds: [exampleEmbed], ephemeral: true });
	},
};