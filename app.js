//Declaration
const { Client, Collection, Events, GatewayIntentBits, Partials, ActivityType, EmbedBuilder, PermissionFlagsBits,
	ButtonBuilder,
	ButtonStyle,
	ActionRowBuilder
} = require('discord.js');
const events = require('events');
const eventEmitter = new events.EventEmitter();
//const { joinVoiceChannel } = require('@discordjs/voice');
const { MongoClient } = require('mongodb');
const clc = require('cli-color');
//const { REST, Routes } = require('discord.js');
const { token, dbusr, dbpwd, addr, activedb, msgcol, srvcol, fishcol, notecol, persistcol, autobancol } = require('./config.json');
const fs = require('node:fs');
const fs2 = require('./Event_Modules/fsfuncs');
const path = require('node:path');
const guildEvents = require('./Event_Modules/guildevents.js');
const messageEvents = require('./Event_Modules/messageevents.js');
//const EmbedCreator = require('./Event_Modules/embedcreator.js');
const essentials = require('./Event_Modules/essentials.js');
const client = new Client({ intents: [GatewayIntentBits.DirectMessages, GatewayIntentBits.GuildBans, GatewayIntentBits.GuildInvites, GatewayIntentBits.GuildModeration, GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildPresences, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMessageReactions], partials: [Partials.Channel, Partials.Message, Partials.Reaction] });


//Initialization
client.once(Events.ClientReady, async c => {
	console.log(`${clc.red(await printLines())} lines of code found!\nLogged in as ${clc.red(c.user.tag)}.`);
	global.client = client;
	global.connections = {};
	global.mongo = await MongoClient.connect(`mongodb://${dbusr}:${dbpwd}@${addr}`);
	global.db = global.mongo.db(activedb);
	global.msgcol = global.db.collection(msgcol);
	global.srvcol = global.db.collection(srvcol);
	global.fishcol = global.db.collection(fishcol);
	global.notecol = global.db.collection(notecol);
	global.persistcol = global.db.collection(persistcol);
	global.autobancol = global.db.collection(autobancol);
	await client.user.setPresence({ activities: [{ name: `Bot started up!`, type: ActivityType.Custom }] });
	eventEmitter.emit('banTimer');
	eventEmitter.emit('keepAlive');
	while (true) {
		await sleep(7);
		let totalSeconds = (client.uptime / 1000);
		let days = Math.floor(totalSeconds / 86400);
		totalSeconds %= 86400;
		let hours = Math.floor(totalSeconds / 3600);
		totalSeconds %= 3600;
		let minutes = Math.floor(totalSeconds / 60);
		let seconds = Math.floor(totalSeconds % 60);
		await client.user.setPresence({activities: [{name: `Overseeing...`, type: ActivityType.Custom}]});
		await sleep(7);
		await client.user.setPresence({
			activities: [{
				name: `In ${client.guilds.cache.size} servers!`,
				type: ActivityType.Custom
			}]
		});
		await sleep(7);
		await client.user.setPresence({
			activities: [{
				name: `Uptime: ${days}:${hours}:${minutes}:${seconds}`,
				type: ActivityType.Custom
			}]
		});
	}
});
client.login(token);

process.on('uncaughtException', async (err) => {
  console.error(`Caught exception: ${err.stack}`);
  let dmChannel = await client.users.createDM("275305152842301440");
  await dmChannel.send(`[<t:${Math.floor(new Date().valueOf() / 1000)}:f>] ${err.stack}`);
});

client.commands = new Collection();
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
    if (!folder.includes('Modules')) {
        const commandsPath = path.join(foldersPath, folder);
        const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
        for (const file of commandFiles) {
            const filePath = path.join(commandsPath, file);
            const command = require(filePath);
            // Set a new item in the Collection with the key as the command name and the value as the exported module
            if ('data' in command && 'execute' in command) {
                client.commands.set(command.data.name, command);
            } else {
                console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
            }
        }
    }
}
//Timer Events
async function bancheck(){
	await client.guilds.cache.forEach(guild => {
		global.srvcol.findOne({ "srv": guild.id }).then(obj => {
			if (obj.banlist.length > 0){
				obj.banlist.forEach(ban => {
					//console.log(parseInt(ban.expire) + " " + parseInt(new Date().getTime() / 1000))
					if (ban.expire !== "permanent" && parseInt(ban.expire) < parseInt(new Date().getTime() / 1000)) {
						guild.members.unban(ban.id);
						nbanlist = obj.banlist.filter(cban => cban.id !== ban.id)
						const look = {srv: guild.id};
						const upd = { $set: {banlist: nbanlist} };
						/*const data = */global.srvcol.updateOne(look, upd);
					}
				});
			}
		});
	});
}
async function UpdateKeep_Alive(){
	global.mongo.db("global").collection("availability").updateOne({name: activedb}, { $set: {lastreported: Math.floor(Math.floor(new Date().valueOf() / 1000)), uptime: client.uptime } });
}
let banTimer = function () {
  setInterval(bancheck, 3000);
}
let keep_alive = function () {
	setInterval(UpdateKeep_Alive, 5000);
}
eventEmitter.on('banTimer', banTimer);
eventEmitter.on('keepAlive', keep_alive);
//Interaction Event
client.on(Events.InteractionCreate, async interaction => {
	if (interaction.channel.type === 1) {
		await interaction.reply("Commands can only be used in servers!");
		return;
	}
    if (interaction.isChatInputCommand()) {

        const command = interaction.client.commands.get(interaction.commandName);
        if (!command) {
            console.log(`No command matching ${interaction.commandName} was found.`);
            return;
        }
        try {
            await command.execute(interaction);
        } catch (err) {
            console.log(err);
			let dmChannel = await client.users.createDM("275305152842301440");
			await dmChannel.send(`[<t:${Math.floor(new Date().valueOf() / 1000)}:f>] ${err.stack}`);
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
            } else {
                await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
            }
        }
        const args = interaction.options["_hoistedOptions"];
        let argArr = []
        if (args.length > 0) {
            args?.forEach(arg => argArr.push(getArgs(arg)));
        }
        const sub = (interaction.options["_subcommand"] ? " " + interaction.options["_subcommand"] : "");
        const exampleEmbed = new EmbedBuilder()
            .setColor(0xf7ef02)
            .setTitle(`Command Created: ${command.data.name}${sub}`)
            .setAuthor({ name: `${interaction.user.globalName} (${interaction.user.username})`, iconURL: interaction.member.displayAvatarURL() })
            .setURL(`https://discord.com/channels/${interaction.guild.id}/${interaction.channel.id}`)
            .setFooter({ text: interaction.guild.name, iconURL: interaction.guild.iconURL() });
        if (argArr.length > 0) {
            let str = ""
            for (i = 0; i < argArr.length; i++) {
                str += `${i + 1}. ${argArr[i].name}:\n${argArr[i].val}\n`;
            }
            exampleEmbed.setDescription(str);
        }
        let obj = await global.srvcol.findOne({ "srv": interaction.guild.id });
        if (obj.command === "none" || !obj) {
            return -1;
        }
        else {
            if (((interaction.guild.members.me).permissionsIn(obj.command).has(PermissionFlagsBits.SendMessages) && (interaction.guild.members.me).permissionsIn(obj.command).has(PermissionFlagsBits.ViewChannel)) || (interaction.guild.members.me).permissionsIn(obj.command).has(PermissionFlagsBits.Administrator))
                await client.channels.cache.get(obj.command).send({ embeds: [exampleEmbed] });
            else
                return -1;
        }
    }
    else if (interaction.isUserContextMenuCommand()) {
        const { username } = interaction.targetUser;
        let tst;
        if (username !== username.toLowerCase())
            tst = username + '#' + interaction.targetUser.discriminator + " (Bot)";
        const command = interaction.client.commands.get(interaction.commandName);

        const exampleEmbed = new EmbedBuilder()
            .setColor(0xf7ef02)
            .setTitle(`Command Created: ${command.data.name} (User Context Menu Command)`)
            .setAuthor({ name: `${interaction.user.globalName} (${interaction.user.username})`, iconURL: interaction.member.displayAvatarURL() })
            .setURL(`https://discord.com/channels/${interaction.guild.id}/${interaction.channel.id}`)
            .setFooter({ text: interaction.guild.name, iconURL: interaction.guild.iconURL() });
        exampleEmbed.setDescription("Target User: " + (tst || username));
        let obj = await global.srvcol.findOne({ "srv": interaction.guild.id });

        if (!command) {
            console.error(clc.redBright(`No command matching ${interaction.commandName} was found.`));
			let dmChannel = await client.users.createDM("275305152842301440");
			await dmChannel.send(`[<t:${Math.floor(new Date().valueOf() / 1000)}:f>] ${err.stack}`);
            return;

        }
        try {
            await command.execute(interaction);
        } catch (err) {
            console.error(err);
			let dmChannel = await client.users.createDM("275305152842301440");
			await dmChannel.send(`[<t:${Math.floor(new Date().valueOf() / 1000)}:f>] ${err.stack}`);
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ content: 'This interaction was already replied to!', ephemeral: true });
            } else {
                await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
            }
        }
        if (obj.command === "none" || !obj) {
            return -1;
        }
        else {
            if (((interaction.guild.members.me).permissionsIn(obj.command).has(PermissionFlagsBits.SendMessages) && (interaction.guild.members.me).permissionsIn(obj.command).has(PermissionFlagsBits.ViewChannel)) || (interaction.guild.members.me).permissionsIn(obj.command).has(PermissionFlagsBits.Administrator))
                await client.channels.cache.get(obj.command).send({ embeds: [exampleEmbed] });
            else
                return -1;
        }
    }
	else if (interaction.isButton()) {
		if (interaction.customId === "scibtn") {
			const missionpool = ["Apollodorus, Mercury", "V Prime, Venus", "Malvaq, Venus","Wahiba, Mars", "Zeugma, Phobos", "Stickney, Phobos", "Gabii, Ceres", "Draco, Ceres", "Elara, Jupiter", "Piscina, Saturn", "Titan, Saturn", "Ophelia, Uranus", "Assur, Uranus", "Kelashin, Neptune", "Palus, Pluto", "Nimus, Eris", "Zabala, Eris", "Terrorem, Deimos", "Taveuni, KUVA", "Persto, Deimos (Sanctum)", "Tycho, Lua", "Yuvarium, Lua (Conjunction)", "Circulus, Lua (Conjunction)","Mot, Void", "Ani, Void", "Amarna, Sedna", "Selkie, Sedna"];


			let index;
			for (let i = 0; i < 10; i++){
				index = await getRandomInt(0, missionpool.length - 1);
			}
			let mission = missionpool[index];
			await interaction.reply({ content: (mission || "An error has occurred!"), ephemeral: true });
		}
		if (interaction.customId === "help0") {
			const helpChannels = new EmbedBuilder()
				.setColor(0x00A012)
				.setTitle(`Command List - Page 1: Channels`)
				.setAuthor({
					name: `Help Form`, iconURL: `https://cdn.discordapp.com/avatars/1205253895258120304/117149e264b0a5624b74acd977dd3eb1.png`
				})
				.setDescription("< > - Parameter\n(< > < >...) - Optional parameter(s)\nExample for commands that require time:\n/tempban user:maxedcarp time:5 hours 3m 31 second")
				.addFields(
					{ name: 'Channels', value: "----------------" },
					{ name: '/setlogchannel <type>', value: "Sets the specified logs channel to the channel the command is executed in." },
				)
				.setFooter({ text: interaction.guild.name, iconURL: interaction.guild.iconURL() });
			const left = new ButtonBuilder()
				.setCustomId('help4')
				.setLabel('Miscellaneous')
				.setStyle(ButtonStyle.Primary)
				.setEmoji('◀️');
			const right = new ButtonBuilder()
				.setCustomId('help1')
				.setLabel('Roles')
				.setStyle(ButtonStyle.Primary)
				.setEmoji('▶️');
			const row = new ActionRowBuilder()
				.addComponents(left, right);
			//await interaction.reply({ embeds: [embeds[0]], components: [row], ephemeral: true });
			await interaction.update({embeds: [helpChannels], components: [row]});
		}
		if (interaction.customId === "help1") {
			const helpRoles = new EmbedBuilder()
				.setColor(0x00A012)
				.setTitle(`Command List - Page 2: Roles`)
				.setAuthor({
					name: `Help Form`,
					iconURL: `https://cdn.discordapp.com/avatars/1205253895258120304/117149e264b0a5624b74acd977dd3eb1.png`
				})
				.setDescription("< > - Parameter\n(< > < >...) - Optional parameter(s)\nExample for commands that require time:\n/tempban user:maxedcarp time:5 hours 3m 31 second")
				.addFields(
					{name: 'Roles', value: "----------------"},
					{name: '/togglepersistence', value: "Enables role persistence, which allows roles to be reacquired if a member leaves and then rejoins."},
					{name: '/joinroles add <role>', value: "Adds a roles to be assigned to new members."},
					{name: '/joinroles list', value: "Lists all roles added on join."}, {name: '/joinroles remove <index>', value: "Prevent a role from being added on join (use /joinroles list to get the index)"},
					{name: '/secretkeys add <keyset> <role> <age requirement>', value: "Assigns a role to a user if they send a message that matches the specified keyset and have the proper time-since-join (in seconds)"},
					{name: '/secretkeys list', value: "Lists all secret keys"}, {name: '/secretkeys delete <index>', value: "Delete a secret keyset (use /secretkeys list list to get the index)"}
					)
				.setFooter({text: interaction.guild.name, iconURL: interaction.guild.iconURL()});
			const left = new ButtonBuilder()
				.setCustomId('help0')
				.setLabel('Channels')
				.setStyle(ButtonStyle.Primary)
				.setEmoji('◀️');
			const right = new ButtonBuilder()
				.setCustomId('help2')
				.setLabel('Moderation')
				.setStyle(ButtonStyle.Primary)
				.setEmoji('▶️');
			const row = new ActionRowBuilder()
				.addComponents(left, right);
			//await interaction.reply({ embeds: [embeds[0]], components: [row], ephemeral: true });
			await interaction.update({embeds: [helpRoles], components: [row]});
		}
		if (interaction.customId === "help2") {
			const helpMod = new EmbedBuilder()
				.setColor(0x00A012)
				.setTitle(`Command List - Page 3: Moderation`)
				.setAuthor({
					name: `Help Form`, iconURL: `https://cdn.discordapp.com/avatars/1205253895258120304/117149e264b0a5624b74acd977dd3eb1.png`
				})
				.setDescription("< > - Parameter\n(< > < >...) - Optional parameter(s)\nExample for commands that require time:\n/tempban user:maxedcarp time:5 hours 3m 31 second")
				.addFields(
					{ name: 'Moderation', value: "----------------" },
					{ name: '/ban <user> (<reason>)', value: "Bans a user (reason will be added to the user's notes)" },
					{ name: '/tempban <user> <time> (<reason>)', value: "Bans a user for a specified duration(reason will be added to the user's notes)" },
					{ name: '/timeout <user> <time> (<reason>)', value: "Times a user out for the specified duration (For example: 3 days 1h 10minutes and 32 s. Reason will be added to the user's notes)" },
					{ name: '/userstats <user>', value: "Check detailed information about the target user." },
					{ name: '/note add <user> <text>', value: "Assigns a note to a user." },
					{ name: '/note list <user>', value: "View a user's notes." },
					{ name: '/note delete <ID>', value: "Delete a user's note by ID." },
					{ name: '/purge any (<count>)', value: "Purges messages in a channel up to 100 messages." },
				)
				.setFooter({ text: interaction.guild.name, iconURL: interaction.guild.iconURL() });
			const left = new ButtonBuilder()
				.setCustomId('help1')
				.setLabel('Roles')
				.setStyle(ButtonStyle.Primary)
				.setEmoji('◀️');
			const right = new ButtonBuilder()
				.setCustomId('help3')
				.setLabel('Administration')
				.setStyle(ButtonStyle.Primary)
				.setEmoji('▶️');
			const row = new ActionRowBuilder()
				.addComponents(left, right);
			//await interaction.reply({ embeds: [embeds[0]], components: [row], ephemeral: true });
			await interaction.update({embeds: [helpMod], components: [row]});
		}
		if (interaction.customId === "help3") {
			const helpAdmin = new EmbedBuilder()
				.setColor(0x00A012)
				.setTitle(`Command List - Page 4: Administration`)
				.setAuthor({
					name: `Help Form`, iconURL: `https://cdn.discordapp.com/avatars/1205253895258120304/117149e264b0a5624b74acd977dd3eb1.png`
				})
				.setDescription("< > - Parameter\n(< > < >...) - Optional parameter(s)\nExample for commands that require time:\n/tempban user:maxedcarp time:5 hours 3m 31 second")
				.addFields(
					{ name: 'Administration', value: "----------------" },
					{ name: '/setjoinmsg <text>', value: "Sets the join message for the server. Type {@user} to ping the user, {servername} for server name, {username} for the user's username and {user} for the user's global name." },
					{ name: '/setleavemsg <text>', value: "Sets the leave message for the server. Type {@user} to ping the user, {servername} for server name, {username} for the user's username and {user} for the user's global name." },
				)
				.setFooter({ text: interaction.guild.name, iconURL: interaction.guild.iconURL() });
			const left = new ButtonBuilder()
				.setCustomId('help2')
				.setLabel('Moderation')
				.setStyle(ButtonStyle.Primary)
				.setEmoji('◀️');
			const right = new ButtonBuilder()
				.setCustomId('help4')
				.setLabel('Miscellaneous')
				.setStyle(ButtonStyle.Primary)
				.setEmoji('▶️');
			const row = new ActionRowBuilder()
				.addComponents(left, right);
			//await interaction.reply({ embeds: [embeds[0]], components: [row], ephemeral: true });
			await interaction.update({embeds: [helpAdmin], components: [row]});
		}
		if (interaction.customId === "help4") {
			const helpMisc = new EmbedBuilder()
				.setColor(0x00A012)
				.setTitle(`Command List - Page 5: Miscellaneous`)
				.setAuthor({
					name: `Help Form`, iconURL: `https://cdn.discordapp.com/avatars/1205253895258120304/117149e264b0a5624b74acd977dd3eb1.png`
				})
				.setDescription("< > - Parameter\n(< > < >...) - Optional parameter(s)\nExample for commands that require time:\n/tempban user:maxedcarp time:5 hours 3m 31 second")
				.addFields(
					{ name: 'Misc', value: "----------------" },
					{ name: '/help', value: "- Displays this help form" }
				)
				.setFooter({ text: interaction.guild.name, iconURL: interaction.guild.iconURL() });
			const left = new ButtonBuilder()
				.setCustomId('help3')
				.setLabel('Administration')
				.setStyle(ButtonStyle.Primary)
				.setEmoji('◀️');
			const right = new ButtonBuilder()
				.setCustomId('help0')
				.setLabel('Channels')
				.setStyle(ButtonStyle.Primary)
				.setEmoji('▶️');
			const row = new ActionRowBuilder()
				.addComponents(left, right);
			//await interaction.reply({ embeds: [embeds[0]], components: [row], ephemeral: true });
			await interaction.update({embeds: [helpMisc], components: [row]});
		}
	}
});
async function getRandomInt(min, max) {
	min = Math.ceil(min);
	max = Math.floor(max);
	resolve(Math.floor(Math.random() * (max - min + 1)) + min);
}

//Guild Events
client.on(Events.GuildCreate, async (guild) => {
	try {
		await guildEvents.GuildCreate(guild);
	}
	catch (err) {
		console.error(err);
		let dmChannel = await client.users.createDM("275305152842301440");
		await dmChannel.send(`[<t:${Math.floor(new Date().valueOf() / 1000)}:f>] ${err.stack}`);
	}
});
client.on(Events.GuildDelete, async (guild) => {
	try {
		await guildEvents.GuildDelete(guild);
	}
	catch (err) {
		console.error(err);
		let dmChannel = await client.users.createDM("275305152842301440");
		await dmChannel.send(`[<t:${Math.floor(new Date().valueOf() / 1000)}:f>] ${err.stack}`);
	}
});
client.on(Events.GuildUpdate, async (oGuild, nGuild) => {
	try {
		await guildEvents.GuildUpdate(oGuild, nGuild);
	}
	catch (err) {
		console.error(err);
		let dmChannel = await client.users.createDM("275305152842301440");
		await dmChannel.send(`[<t:${Math.floor(new Date().valueOf() / 1000)}:f>] ${err.stack}`);
	}
});
client.on(Events.GuildMemberAdd, async (member) => {
	try {
		await guildEvents.MemberJoin(member);
	}
	catch (err) {
		console.error(err);
		let dmChannel = await client.users.createDM("275305152842301440");
		await dmChannel.send(`[<t:${Math.floor(new Date().valueOf() / 1000)}:f>] ${err.stack}`);
	}
});
client.on(Events.GuildMemberRemove, async (member) => {
	try {
		await guildEvents.MemberLeave(member);
	}
	catch (err) {
		console.error(err);
		let dmChannel = await client.users.createDM("275305152842301440");
		await dmChannel.send(`[<t:${Math.floor(new Date().valueOf() / 1000)}:f>] ${err.stack}`);
	}
});
client.on(Events.GuildMemberUpdate, async (oldMember, newMember) => {
	try {
		await guildEvents.MemberUpdate(oldMember, newMember);
	}
	catch (err) {
		console.error(err);
		let dmChannel = await client.users.createDM("275305152842301440");
		await dmChannel.send(`[<t:${Math.floor(new Date().valueOf() / 1000)}:f>] ${err.stack}`);
	}
});
client.on(Events.UserUpdate, async (oldUser, newUser) => {
	try {
		await guildEvents.UserUpdate(oldUser, newUser);
	}
	catch(err) {
		console.error(err);
		let dmChannel = await client.users.createDM("275305152842301440");
		await dmChannel.send(`[<t:${Math.floor(new Date().valueOf() / 1000)}:f>] ${err.stack}`);
	}
});
client.on(Events.GuildBanAdd, async (ban) => {
	try {
		await guildEvents.MemberBan(ban);
	}
	catch (err) {
		console.error(err);
		let dmChannel = await client.users.createDM("275305152842301440");
		await dmChannel.send(`[<t:${Math.floor(new Date().valueOf() / 1000)}:f>] ${err.stack}`);
	}
});

//Message Events
client.on(Events.MessageCreate, async (message) => {
	try {
		await messageEvents.MessageCreate(message);
	}
	catch (err) {
		console.error(err);
		let dmChannel = await client.users.createDM("275305152842301440");
		await dmChannel.send(`[<t:${Math.floor(new Date().valueOf() / 1000)}:f>] ${err.stack}`);
	}
});
client.on(Events.MessageUpdate, async (omessage, nmessage) => {
	try {
		await messageEvents.MessageUpdate(omessage, nmessage);
	}
	catch (err) {
		console.error(err);
		let dmChannel = await client.users.createDM("275305152842301440");
		await dmChannel.send(`[<t:${Math.floor(new Date().valueOf() / 1000)}:f>] ${err.stack}`);
	}
});
client.on(Events.MessageDelete, async (message) => {
	try {
		await messageEvents.MessageDelete(message);
    } catch (err) {
        console.error(err);
		let dmChannel = await client.users.createDM("275305152842301440");
		await dmChannel.send(`[<t:${Math.floor(new Date().valueOf() / 1000)}:f>] ${err.stack}`);
	}
});
/*function logMapElements(value, key, map) {
  console.log(`map.get('${key}') = ${value}`);
}*/
client.on(Events.MessageBulkDelete, async (messages) => {
	try {
		await messageEvents.MessageBulkDelete(messages);
	} catch (err) {
        console.error(err);
		let dmChannel = await client.users.createDM("275305152842301440");
		await dmChannel.send(`[<t:${Math.floor(new Date().valueOf() / 1000)}:f>] ${err.stack}`);
    }
});

//------------------------------------- Functions
function sleep(seconds) {
    return new Promise(r => setTimeout(r, seconds * 1000))
}
function getArgs(obj) {
    if (obj.type === 3) {
        return { name: obj.name, val: obj.value };
    }
    else if (obj.type === 4) {
        return { name: obj.name, val: obj.value };
    }
    else if (obj.type === 5) {
        return { name: obj.name, val: obj.value };
    }
    else if (obj.type === 6) {
        let tst;
        if (obj.user.username !== obj.user.username.toLowerCase())
            tst = obj.user.username + '#' + obj.user.discriminator + " (Bot)";
        return { name: obj.name, val: (tst || obj.user.username) };
    }
    else if (obj.type === 7) {
        return { name: obj.name, val: `<#${obj.channel.id}>` };
    }
    else if (obj.type === 8) {
        return { name: obj.name, val: `Role Name: ${obj.role.name}.\nRole ID: ${obj.role.id}` };
    }
    else if (obj.type === 9) {
        let tst;
        if (obj.user.username !== obj.user.username.toLowerCase())
            tst = obj.user.username + '#' + obj.user.discriminator + " (Bot)";
        return { name: obj.name, val: (tst || obj.user.username) };
    }
    else if (obj.type === 10) {
        return { name: obj.name, val: obj.value };
    }
    else if (obj.type === 11) {
        return { name: obj.name, val: `Attachment Type: ${obj.attachment.contentType}.\nName: ${obj.attachment.name}.\nAttachment URL: ${obj.attachment.url}` };
    }
}
async function printLines() {
    let count = 0;
    const foldersPath = path.join(__dirname, 'commands');
    const projectFolders = fs.readdirSync(foldersPath);
    const baseFiles = fs.readdirSync(__dirname).filter(file => file.endsWith('.js'));
    for (const file of baseFiles) {
        const filePath = path.join(__dirname, file);
        count += await fs2.countlines(filePath);
    }
    for (const folder of projectFolders) {
        if (!folder.includes('node_modules')) {
            try {
                const commandsPath = path.join(foldersPath, folder);
                const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
                for (const file of commandFiles) {
                    const filePath = path.join(commandsPath, file);
                    count += await fs2.countlines(filePath);
                }
            }
            catch (err) {

            }
        }
    }
    return count;
}