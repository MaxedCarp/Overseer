const EmbedCreator = require("../../Event_Modules/embedcreator");
const {ButtonBuilder, ButtonStyle, ActionRowBuilder} = require("discord.js");

class forms {
    static GetForm(number, gname, gicon, ){
		return new Promise((resolve) => {
			(async () => {
				const helpChannels = await EmbedCreator.Create(`Command List - Page 1: Channels`, `< > - Parameter\n(< > < >...) - Optional parameter(s)\nExample for commands that require time:\n/tempban user:maxedcarp time:5 hours 3m 31 second`, false, gname, gicon, `Help Form`, `https://maxedcarp.net/imgs/overseer.png`, 0x00A012, [{ name: 'Channels', value: "----------------" }, { name: '/setlogchannel <type>', value: "Sets the specified logs channel to the channel the command is executed in." }]);
				const helpRoles = await EmbedCreator.Create(`Command List - Page 2: Roles`, `< > - Parameter\n(< > < >...) - Optional parameter(s)\nExample for commands that require time:\n/tempban user:maxedcarp time:5 hours 3m 31 second`, false, gname, gicon, `Help Form`, `https://maxedcarp.net/imgs/overseer.png`, 0x00A012, [{name: 'Roles', value: "----------------"}, {name: '/togglepersistence', value: "Enables role persistence, which allows roles to be reacquired if a member leaves and then rejoins."}, {name: '/joinroles add <role>', value: "Adds a roles to be assigned to new members."}, {name: '/joinroles list', value: "Lists all roles added on join."}, {name: '/joinroles remove <index>', value: "Prevent a role from being added on join (use /joinroles list to get the index)"}, {name: '/secretkeys add <keyset> <role> <age requirement>', value: "Assigns a role to a user if they send a message that matches the specified keyset and have the proper time-since-join (in seconds)"}, {name: '/secretkeys list', value: "Lists all secret keys"}, {name: '/secretkeys delete <index>', value: "Delete a secret keyset (use /secretkeys list list to get the index)"}]);
				const helpMod = await EmbedCreator.Create(`Command List - Page 3: Moderation`, `< > - Parameter\n(< > < >...) - Optional parameter(s)\nExample for commands that require time:\n/tempban user:maxedcarp time:5 hours 3m 31 second`, false, gname, gicon, `Help Form`, `https://maxedcarp.net/imgs/overseer.png`, 0x00A012, [{ name: 'Moderation', value: "----------------" }, { name: '/ban <user> (<reason>)', value: "Bans a user (reason will be added to the user's notes)" }, { name: '/tempban <user> <time> (<reason>)', value: "Bans a user for a specified duration(reason will be added to the user's notes)" }, { name: '/timeout <user> <time> (<reason>)', value: "Times a user out for the specified duration (For example: 3 days 1h 10minutes and 32 s. Reason will be added to the user's notes)" }, { name: '/userstats <user>', value: "Check detailed information about the target user." }, { name: '/note add <user> <text>', value: "Assigns a note to a user." }, { name: '/note list <user>', value: "View a user's notes." }, { name: '/note delete <ID>', value: "Delete a user's note by ID." }, { name: '/purge any (<count>)', value: "Purges messages without any filters up to 100 messages." },{ name: '/purge user <user> (<count>)', value: "Purges messages sent by a specific user up to 100 messages." }, { name: '/purge attachments (<count>) (<user>)', value: "Purges messages containing attachments up to 100 messages." }]);
				const helpAdmin = await EmbedCreator.Create(`Command List - Page 4: Administration`, `< > - Parameter\n(< > < >...) - Optional parameter(s)\nExample for commands that require time:\n/tempban user:maxedcarp time:5 hours 3m 31 second`, false, gname, gicon, `Help Form`, `https://maxedcarp.net/imgs/overseer.png`, 0x00A012, [{ name: 'Administration', value: "----------------" }, { name: '/setjoinmsg <text>', value: "Sets the join message for the server. Type {@user} to ping the user, {servername} for server name, {username} for the user's username and {user} for the user's global name." }, { name: '/setleavemsg <text>', value: "Sets the leave message for the server. Type {@user} to ping the user, {servername} for server name, {username} for the user's username and {user} for the user's global name." }]);
				const helpMisc = await EmbedCreator.Create(`Command List - Page 5: Miscellaneous`, `< > - Parameter\n(< > < >...) - Optional parameter(s)\nExample for commands that require time:\n/tempban user:maxedcarp time:5 hours 3m 31 second`, false, gname, gicon, `Help Form`, `https://maxedcarp.net/imgs/overseer.png`, 0x00A012, [{ name: 'Misc', value: "----------------" }, { name: '/help', value: "- Displays this help form" }]);
				const forms = [helpChannels, helpRoles, helpMod, helpAdmin, helpMisc];
				resolve(forms[number]);
			})();
		});
	};
	static GetComps(number) {
		return new Promise((resolve) => {
			(async () => {
				// Buttons
				const leftChan = await EmbedCreator.Button("help:4",'Miscellaneous', ButtonStyle.Primary,'◀️');
				const rightChan = await EmbedCreator.Button("help:1",'Roles',ButtonStyle.Primary,'▶️');
				const leftRole = await EmbedCreator.Button("help:0",'Channels', ButtonStyle.Primary,'◀️');
				const rightRole = await EmbedCreator.Button("help:2",'Moderation',ButtonStyle.Primary,'▶️');
				const leftMod = await EmbedCreator.Button("help:1",'Roles', ButtonStyle.Primary,'◀️');
				const rightMod = await EmbedCreator.Button("help:3",'Administration',ButtonStyle.Primary,'▶️');
				const leftAdmin = await EmbedCreator.Button("help:2",'Moderation', ButtonStyle.Primary,'◀️');
				const rightAdmin = await EmbedCreator.Button("help:4",'Miscellaneous',ButtonStyle.Primary,'▶️');
				const leftMisc = await EmbedCreator.Button("help:3",'Administration', ButtonStyle.Primary,'◀️');
				const rightMisc = await EmbedCreator.Button("help:0",'Channels',ButtonStyle.Primary,'▶️');

				// Rows
				const rowChan = new ActionRowBuilder().addComponents(leftChan, rightChan);
				const rowRole = new ActionRowBuilder().addComponents(leftRole, rightRole);
				const rowMod = new ActionRowBuilder().addComponents(leftMod, rightMod);
				const rowAdmin = new ActionRowBuilder().addComponents(leftAdmin, rightAdmin);
				const rowMisc = new ActionRowBuilder().addComponents(leftMisc, rightMisc);

				const rows = [rowChan, rowRole, rowMod, rowAdmin, rowMisc];
				resolve(rows[number]);
			})();
		});
	}
}
module.exports = forms;