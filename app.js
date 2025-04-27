//Declaration
const { Client, Collection, Events, GatewayIntentBits, Partials, ActivityType, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const events = require('events');
const eventEmitter = new events.EventEmitter();
const { joinVoiceChannel } = require('@discordjs/voice');
const { MongoClient } = require('mongodb');
const clc = require('cli-color');
const { REST, Routes } = require('discord.js');
const { clientId, token, dbusr, dbpwd, addr } = require('./config.json');
const fs = require('node:fs');
const fs2 = require('./fsfuncs');
const path = require('node:path');
const guildEvents = require('./Event_Modules/guildevents.js');
const messageEvents = require('./Event_Modules/messageevents.js');
const EmbedCreator = require('./Event_Modules/embedcreator.js');
const essentials = require('./Event_Modules/essentials.js');
const client = new Client({ intents: [GatewayIntentBits.DirectMessages, GatewayIntentBits.GuildBans, GatewayIntentBits.GuildInvites, GatewayIntentBits.GuildModeration, GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildPresences, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMessageReactions], partials: [Partials.Channel, Partials.Message, Partials.Reaction] });

//Initialization
client.once(Events.ClientReady, async c => {
	console.log(`${clc.red(await printLines())} lines of code found!\nLogged in as ${clc.red(c.user.tag)}.`);
	global.client = client;
	global.connections = {};
	global.mongo = await MongoClient.connect(`mongodb://${dbusr}:${dbpwd}@${addr}`);
	global.db = global.mongo.db("overseer");
	global.msgcol = global.db.collection("messages");
	global.srvcol = global.db.collection("servers");
	global.fishcol = global.db.collection("fish");
	global.notecol = global.db.collection("notes");
	await client.user.setPresence({ activities: [{ name: `Bot started up!`, type: ActivityType.Custom }] });
	eventEmitter.emit('banTimer');
	while (true) {
		await sleep(7);
		let totalSeconds = (client.uptime / 1000);
		let days = Math.floor(totalSeconds / 86400);
		totalSeconds %= 86400;
		let hours = Math.floor(totalSeconds / 3600);
		totalSeconds %= 3600;
		let minutes = Math.floor(totalSeconds / 60);
		let seconds = Math.floor(totalSeconds % 60);
		await client.user.setPresence({ activities: [{ name: `Overseeing...`, type: ActivityType.Custom }] });
		await sleep(7);
		await client.user.setPresence({ activities: [{ name: `In ${client.guilds.cache.size} servers!`, type: ActivityType.Custom }] });
		await sleep(7);
		await client.user.setPresence({ activities: [{ name: `Uptime: ${days}:${hours}:${minutes}:${seconds}`, type: ActivityType.Custom }] });
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
						const data = global.srvcol.updateOne(look, upd);
					}
				});
			}
		});
	});
}
var banTimer = function () {
  setInterval(bancheck, 3000);
}
eventEmitter.on('banTimer', banTimer);
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
            return;
        }
        else {
            if (((interaction.guild.members.me).permissionsIn(obj.command).has(PermissionFlagsBits.SendMessages) && (interaction.guild.members.me).permissionsIn(obj.command).has(PermissionFlagsBits.ViewChannel)) || (interaction.guild.members.me).permissionsIn(obj.command).has(PermissionFlagsBits.Administrator))
                await client.channels.cache.get(obj.command).send({ embeds: [exampleEmbed] });
            else
                return;
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
            return;
        }
        else {
            if (((interaction.guild.members.me).permissionsIn(obj.command).has(PermissionFlagsBits.SendMessages) && (interaction.guild.members.me).permissionsIn(obj.command).has(PermissionFlagsBits.ViewChannel)) || (interaction.guild.members.me).permissionsIn(obj.command).has(PermissionFlagsBits.Administrator))
                await client.channels.cache.get(obj.command).send({ embeds: [exampleEmbed] });
            else
                return;
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
function logMapElements(value, key, map) {
  console.log(`map.get('${key}') = ${value}`);
}
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
        if (obj.user.username != obj.user.username.toLowerCase())
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
        if (obj.user.username != obj.user.username.toLowerCase())
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