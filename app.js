//Declaration
const http = require('http');
const {
    Client,
    Collection,
    Events,
    GatewayIntentBits,
    Partials,
    ActivityType,
    EmbedBuilder,
    PermissionFlagsBits,
    ActionRowBuilder,
    ButtonStyle,
    ChannelType,
    PermissionsBitField,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle
} = require('discord.js');
const events = require('events');
const eventEmitter = new events.EventEmitter();
const {MongoClient} = require('mongodb');
const clc = require('cli-color');
const {
    token,
    contact,
    dbusr,
    dbpwd,
    addr,
    activedb,
    msgcol,
    srvcol,
    fishcol,
    notecol,
    persistcol,
    bancol,
    secretkeyscol,
    channelscol,
    focuscol,
    botlistmetoken,
    botlistmeURL
} = require('./config.json'); // These variables need to be defined in your config.json file!
const fs = require('node:fs');
const fs2 = require('./Event_Modules/fsfuncs');
const path = require('node:path');
const guildEvents = require('./Event_Modules/guildevents.js');
const messageEvents = require('./Event_Modules/messageevents.js');
const forms = require('./commands/Command_Modules/forms.js');
const client = new Client({
    intents: [GatewayIntentBits.DirectMessages, GatewayIntentBits.GuildBans, GatewayIntentBits.GuildInvites, GatewayIntentBits.GuildModeration, GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildPresences, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMessageReactions, GatewayIntentBits.GuildVoiceStates],
    partials: [Partials.Channel, Partials.Message, Partials.Reaction]
});
let isLive = false;
const EmbedCreator = require("./Event_Modules/embedcreator");
const {overwrite} = require("zod/v4");
const essentials = require("./Event_Modules/essentials");

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
    global.bancol = global.db.collection(bancol);
    global.secretkeyscol = global.db.collection(secretkeyscol);
    global.channelscol = global.db.collection(channelscol);
    global.focuscol = global.db.collection(focuscol);
    await client.user.setPresence({activities: [{name: `Bot started up!`, type: ActivityType.Custom}]});
    eventEmitter.emit('banTimer');
    eventEmitter.emit('keepAlive');
    eventEmitter.emit('updateList');
    await sleep(5);
    eventEmitter.emit('startPresence');
    eventEmitter.emit('channelsCheckStart');
});
client.login(token).then();

process.on('uncaughtException', async (err) => {
    console.error(`Caught exception: ${err.stack}`);
    let dmChannel = await client.users.createDM(contact);
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
eventEmitter.on('startPresence', async () => {
    // Function to update bot stats
    const PresenceUpdate = async () => {
        await client.user.setPresence({activities: [{name: `Overseeing...`, type: ActivityType.Custom}]});
        await sleep(7);
        await client.user.setPresence({
            activities: [{
                name: `In ${client.guilds.cache.size} servers!`,
                type: ActivityType.Custom
            }]
        });
        await sleep(7);
        let time = await countTime();
        let ref = {
            days: (time.days > 1 ? "days" : "day"),
            hours: (time.hours > 1 ? "hours" : "hour"),
            minutes: (time.minutes > 1 ? "minutes" : "minute"),
            seconds: (time.seconds > 1 ? "seconds" : "second")
        };
        await client.user.setPresence({
            activities: [{
                name: `Uptime: ${(time.days > 0 ? time.days + " " + ref.days + " " : "")}${(time.days > 0 || time.hours > 0 ? time.hours + " " + ref.hours + " " : "")}${(time.days > 0 || time.hours > 0 || time.minutes > 0 ? time.minutes + " " + ref.minutes + " " : "")}${time.seconds} ${ref.seconds}`,
                type: ActivityType.Custom
            }]
        });
        setTimeout(PresenceUpdate, 7000);
    };

    // Run immediately
    await PresenceUpdate();
});
eventEmitter.on('banTimer', async () => {
    // Function to update bot stats
    const BanCheck = async () => {
        client.guilds.cache.forEach(guild => {
            (async () => {
                const bans = await global.bancol.find({
                    "srv": guild.id,
                    "type": "temp",
                    expire: {$lt: parseInt(new Date().getTime() / 1000)}
                }).toArray();
                if (bans.length > 0) {
                    for (let ban of bans) {
                        await guild.members.unban(ban.user.id);
                        await global.bancol.deleteOne({srv: guild.id, user: ban.user});
                    }
                }
            })();
        });
        setTimeout(BanCheck, 60000);
    };

    // Run immediately
    await BanCheck();

});
eventEmitter.on('keepAlive', async () => {
    // Function to update bot stats
    const UpdateKeep_Alive = async () => {
        await global.mongo.db("global").collection("availability").updateOne({name: activedb}, {
            $set: {
                lastreported: Math.floor(Math.floor(new Date().valueOf() / 1000)),
                uptime: client.uptime
            }
        });
        setTimeout(UpdateKeep_Alive, 5000);
    };

    // Run immediately
    await UpdateKeep_Alive();
});
eventEmitter.on('updateList', async () => {
    // Function to update bot stats
    const updateBotStats = async () => {
        if (client.user.id !== "1205253895258120304")
            return;
        try {
            const response = await fetch(botlistmeURL, {
                method: 'POST',
                headers: {'Authorization': botlistmetoken, 'Content-Type': 'application/json'},
                body: JSON.stringify({server_count: client.guilds.cache.size, shard_count: 1})
            });

            const data = await response.json();
            console.log(!data.error ? "Successfully updated botlist.me Server Count!" : "Failed to update botlist.me Server Count.");
        } catch (error) {
            console.error('Error updating bot stats:', error);
        }
        setTimeout(updateBotStats, 86400000);
    };

    // Run immediately
    await updateBotStats();

});
eventEmitter.on('channelsCheckStart', async () => {
    // Check channels for unremoved one-time access permissions
    const ChannelsCheck = async () => {
        client.guilds.cache.forEach(guild => {
            guild.channels.cache.forEach(channel => {
                (async () => {
                    let overwrites = await global.channelscol.find({
                        "srv": guild.id,
                        "channelID": channel.id
                    }).toArray();
                    if (!!overwrites.length > 0) {
                        if (await (channel.permissionOverwrites.cache).find(exp => exp.type === 1) && channel.members.size < 1) {
                            for (const overwrite of overwrites) {
                                const members = await guild.members.fetch();
                                const member = await members.find(m => m.id === overwrite.userID && !overwrite.perm);
                                if (!!member) {
                                    await channel.permissionOverwrites.delete(member.user);
                                    await global.channelscol.deleteOne({
                                        "srv": guild.id,
                                        "channelID": channel.id,
                                        "userID": overwrite.userID
                                    })
                                }
                            }
                        }
                    }
                })();
            })
        });
        setTimeout(ChannelsCheck, 120000);
    };

    // Run immediately
    await ChannelsCheck();
});
//Interaction Event
client.on(Events.InteractionCreate, async interaction => {
    if (interaction.isChatInputCommand()) {
        if (interaction.channel.type === 1) {
            await interaction.reply("Chat commands can only be used in servers!");
            return;
        }

        const command = interaction.client.commands.get(interaction.commandName);
        if (!command) {
            console.log(`No command matching ${interaction.commandName} was found.`);
            return;
        }
        try {
            await command.execute(interaction);
        } catch (err) {
            console.error(err);
            let dmChannel = await client.users.createDM(contact);
            await dmChannel.send(`[<t:${Math.floor(new Date().valueOf() / 1000)}:f>] ${err.stack}`);
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({
                    content: 'There was an error while executing this command!',
                    ephemeral: true
                });
            } else {
                await interaction.reply({content: 'There was an error while executing this command!', ephemeral: true});
            }
        }
        const args = interaction.options["_hoistedOptions"];
        let argArr = []
        if (args.length > 0) {
            for (let arg of args)
                argArr.push(getArgs(arg));
        }
        const sub = (interaction.options["_subcommand"] ? " " + interaction.options["_subcommand"] : "");
        const exampleEmbed = await EmbedCreator.Create(`Command Created: ${command.data.name}${sub}`, null, null, interaction.guild.name, interaction.guild.iconURL(), `${interaction.user.globalName} (${interaction.user.username})`, interaction.member.displayAvatarURL(), 0xf7ef02, null, `https://discord.com/channels/${interaction.guild.id}/${interaction.channel.id}`);
        if (argArr.length > 0) {
            let str = ""
            for (i = 0; i < argArr.length; i++) {
                str += `${i + 1}. ${argArr[i].name}:\n${argArr[i].val}\n`;
            }
            exampleEmbed.setDescription(str);
        }
        let obj = await global.srvcol.findOne({"srv": interaction.guild.id});
        if (obj.command === "none" || !obj) {
            return -1;
        } else {
            if (((interaction.guild.members.me).permissionsIn(obj.command).has(PermissionFlagsBits.SendMessages) && (interaction.guild.members.me).permissionsIn(obj.command).has(PermissionFlagsBits.ViewChannel)) || (interaction.guild.members.me).permissionsIn(obj.command).has(PermissionFlagsBits.Administrator))
                await client.channels.cache.get(obj.command).send({embeds: [exampleEmbed]});
            else
                return -1;
        }
    } else if (interaction.isUserContextMenuCommand()) {
        const {username} = interaction.targetUser;
        let tst;
        if (username !== username.toLowerCase())
            tst = username + '#' + interaction.targetUser.discriminator + " (Bot)";
        const command = interaction.client.commands.get(interaction.commandName);

        const exampleEmbed = new EmbedBuilder()
            .setColor(0xf7ef02)
            .setTitle(`Command Created: ${command.data.name} (User Context Menu Command)`)
            .setAuthor({
                name: `${interaction.user.globalName} (${interaction.user.username})`,
                iconURL: interaction.member.displayAvatarURL()
            })
            .setURL(`https://discord.com/channels/${interaction.guild.id}/${interaction.channel.id}`)
            .setFooter({text: interaction.guild.name, iconURL: interaction.guild.iconURL()});
        exampleEmbed.setDescription("Target User: " + (tst || username));
        let obj = await global.srvcol.findOne({"srv": interaction.guild.id});

        if (!command) {
            console.error(clc.redBright(`No command matching ${interaction.commandName} was found.`));
            let dmChannel = await client.users.createDM(contact);
            await dmChannel.send(`[<t:${Math.floor(new Date().valueOf() / 1000)}:f>] ${err.stack}`);
            return;

        }
        try {
            await command.execute(interaction);
        } catch (err) {
            console.error(err);
            let dmChannel = await client.users.createDM(contact);
            await dmChannel.send(`[<t:${Math.floor(new Date().valueOf() / 1000)}:f>] ${err.stack}`);
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({content: 'This interaction was already replied to!', ephemeral: true});
            } else {
                await interaction.reply({content: 'There was an error while executing this command!', ephemeral: true});
            }
        }
        if (obj.command === "none" || !obj) {
            return -1;
        } else {
            if (((interaction.guild.members.me).permissionsIn(obj.command).has(PermissionFlagsBits.SendMessages) && (interaction.guild.members.me).permissionsIn(obj.command).has(PermissionFlagsBits.ViewChannel)) || (interaction.guild.members.me).permissionsIn(obj.command).has(PermissionFlagsBits.Administrator))
                await client.channels.cache.get(obj.command).send({embeds: [exampleEmbed]});
            else
                return -1;
        }
    } else if (interaction.isButton()) {
        if (interaction.customId.startsWith("ban")) {
            const args = interaction.customId.split(':');
            const member = interaction.guild.members.cache.get(args[1]);
            const confirm = await EmbedCreator.Button(`confirmban:${args[1]}`, "CONFIRM", ButtonStyle.Danger);
            const row = new ActionRowBuilder().addComponents(confirm);
            await interaction.reply({
                content: `Are you sure you wish to ban ${member}?`,
                components: [row],
                ephemeral: true
            })
        } else if (interaction.customId.startsWith("confirmban")) {
            const args = interaction.customId.split(':');
            const member = interaction.guild.members.cache.get(args[1]);
            const dt = await global.notecol.findOne({serial: {$gt: -1}});
            const msgobj = {
                srv: interaction.guild.id,
                userID: member.user.id,
                username: member.user.username,
                noteAuthor: {
                    userID: interaction.user.id,
                    userName: interaction.user.username,
                    globalName: interaction.user.globalName,
                    avatar: interaction.user.avatar,
                    avatarURL: interaction.user.displayAvatarURL()
                },
                type: "ban",
                text: `Banned through Mod Menu.`,
                serial: dt.serial + 1
            };
            await global.notecol.insertOne(msgobj);
            await member.ban();
            await interaction.reply({content: `User "${member.user}" has been successfully banned!`, ephemeral: true});
        } else if (interaction.customId.startsWith("notes")) {
            const args = interaction.customId.split(':');
            const user = interaction.guild.members.cache.get(args[1]).user;
            const notelist = new EmbedBuilder()
                .setColor(0xfa8b2a)
                .setTitle(`${user.username}'s notes`)
                .setThumbnail(user.displayAvatarURL())
                .setAuthor({name: `${interaction.user.username}`, iconURL: `${interaction.member.displayAvatarURL()}`})
                .setFooter({text: `${interaction.guild.name}`, iconURL: interaction.guild.iconURL()});
            var list = "";
            let data;
            if (args[4] === "true") {
                data = await global.notecol.find({
                    srv: interaction.guild.id,
                    userID: user.id,
                    serial: {$lt: parseInt(args[2])}
                }).sort({serial: -1}).limit(5).toArray();
                data.sort((a, b) => a.serial - b.serial);
            } else {
                data = await global.notecol.find({
                    srv: interaction.guild.id,
                    userID: user.id,
                    serial: {$gt: parseInt(args[2])}
                }).sort({serial: 1}).limit(5).toArray();
            }
            if ((await global.notecol.count({
                srv: interaction.guild.id,
                userID: user.id,
                serial: {$gt: parseInt(args[2])}
            }) > 0) && data[0]?.serial) {
                i = parseInt(args[3]);
                for (let note of data) {
                    list += `-# \\|\\|NOTE ID:${note.serial}\\|\\|\n- Note Type: ${note.type}.\n- Issued by: <@${note.noteAuthor.userID}>.\n${note.text}.\n\n`;
                    i++;
                }
                const next = await EmbedCreator.Button(`notes:${user.id}:${data[data.length - 1].serial}:${i}:false`, "Next", ButtonStyle.Primary, '▶️');
                const prev = await EmbedCreator.Button(`notes:${user.id}:${data[0].serial}:${i - 10}:true`, "Previous", ButtonStyle.Primary, '◀️', (i - 5 < 5));
                const row = new ActionRowBuilder().addComponents(prev, next);
                notelist.setDescription(list);
                await interaction.update({embeds: [notelist], components: [row], ephemeral: true})
            } else
                await interaction.reply({content: "The target user has no notes.", ephemeral: true})
        } else if (interaction.customId.startsWith("help")) {
            const args = interaction.customId.split(':');
            const num = parseInt(args[1]);
            await interaction.update({
                embeds: [await forms.GetForm(num, interaction.guild.name, interaction.guild.iconURL())],
                components: [await forms.GetComps(num)]
            });
        } else if (interaction.customId === "scinotify") {
            const modal = new ModalBuilder().setCustomId('streamNotify').setTitle('Stream Alert Menu');
            const pingCarp = new TextInputBuilder().setCustomId('pingCarp')
                .setLabel("Shall I ping Carp? (y/n)")
                .setStyle(TextInputStyle.Short)
                .setRequired(true);
            const pingStabs = new TextInputBuilder().setCustomId('pingStabs')
                .setLabel("Shall I ping Stabs? (y/n)")
                .setStyle(TextInputStyle.Short)
                .setRequired(true);
            const pingAtlas = new TextInputBuilder().setCustomId('pingAtlas')
                .setLabel("Shall I ping Atlas? (y/n)")
                .setStyle(TextInputStyle.Short)
                .setRequired(true);
            const howLong = new TextInputBuilder().setCustomId('howLong')
                .setLabel("In how long is the stream? (e.g. 1h30m)")
                .setStyle(TextInputStyle.Short)
                .setRequired(true);
            const firstActionRow = new ActionRowBuilder().addComponents(pingCarp);
            const secondActionRow = new ActionRowBuilder().addComponents(pingStabs);
            const thirdActionRow = new ActionRowBuilder().addComponents(pingAtlas);
            const fourthActionRow = new ActionRowBuilder().addComponents(howLong);
            modal.addComponents(firstActionRow, secondActionRow, thirdActionRow, fourthActionRow);

            await interaction.showModal(modal);
        } else if (interaction.customId.startsWith("cancel")) {
            await interaction.message.delete();
        }
    } else if (interaction.isModalSubmit()) {
        if (interaction.customId === "streamNotify") {
            const pingCarp = interaction.fields.getTextInputValue('pingCarp');
            const pingStabs = interaction.fields.getTextInputValue('pingStabs');
            const pingAtlas = interaction.fields.getTextInputValue('pingAtlas');
            const howLong = interaction.fields.getTextInputValue('howLong');
            const time = await essentials.parsetime(howLong, 's');
            let carp, stabs, atlas = false;
            if (pingCarp.toLowerCase() === "y" || pingCarp.toLowerCase() === "n") {
                if (pingCarp.toLowerCase() === "y") {
                    carp = true;
                    let dmChannel = await client.users.createDM("275305152842301440");
                    await dmChannel.send(`Sci is streaming <t:${Math.floor(Date.now() / 1000) + time}:R> (<t:${Math.floor(Date.now() / 1000) + time}:f>)`);
                }
            } else {
                if (!interaction.replied)
                    await interaction.reply("Error: Invalid Input at Carp Ping field! (Can only be 'y' or 'n'");
                return;
            }
            if (pingStabs.toLowerCase() === "y" || pingStabs.toLowerCase() === "n") {
                if (pingStabs.toLowerCase() === "y") {
                    stabs = true;
                    let dmChannel = await client.users.createDM("401210999518265358");
                    await dmChannel.send(`Sci is streaming <t:${Math.floor(Date.now() / 1000) + time}:R> (<t:${Math.floor(Date.now() / 1000) + time}:f>)`);
                }
            } else {
                if (!interaction.replied)
                    await interaction.reply("Error: Invalid Input at Carp Ping field! (Can only be 'y' or 'n'");
                return;
            }
            if (pingAtlas.toLowerCase() === "y" || pingAtlas.toLowerCase() === "n") {
                if (pingAtlas.toLowerCase() === "y") {
                    atlas = true;
                    let dmChannel = await client.users.createDM("800070620079456286");
                    await dmChannel.send(`Sci is streaming <t:${Math.floor(Date.now() / 1000) + time}:R> (<t:${Math.floor(Date.now() / 1000) + time}:f>)`);
                }
            } else {
                if (!interaction.replied)
                    await interaction.reply("Error: Invalid Input at Carp Ping field! (Can only be 'y' or 'n'");
                return;
            }
            if (!carp && !atlas && !stabs){
                await interaction.reply("Error: Must select at least 1 person!");
                return;
            }
            if (!interaction.replied)
            await interaction.reply({content: `Successfully sent stream notifications to ${carp ? "Carp" : ""}${(carp && stabs && atlas) ? ", " : `${carp && stabs && !atlas || carp && atlas && !stabs ? " and " : ""}`}${stabs ? "Stabs" : ""}${((stabs && atlas && !carp) || (carp && stabs && atlasz)) ? " and " : ""}${atlas ? "Atlas" : ""}`})
            await global.srvcol.updateOne({srv: "1190516697174659182"}, {$set: {stream: Date.now()}})
            await interaction.message.delete();
        }
    }
});
//Guild Events
client.on(Events.GuildCreate, async (guild) => {
    try {
        await guildEvents.GuildCreate(guild);
    } catch (err) {
        console.error(err);
        let dmChannel = await client.users.createDM(contact);
        await dmChannel.send(`[<t:${Math.floor(new Date().valueOf() / 1000)}:f>] ${err.stack}`);
    }
});
client.on(Events.GuildDelete, async (guild) => {
    try {
        await guildEvents.GuildDelete(guild);
    } catch (err) {
        console.error(err);
        let dmChannel = await client.users.createDM(contact);
        await dmChannel.send(`[<t:${Math.floor(new Date().valueOf() / 1000)}:f>] ${err.stack}`);
    }
});
client.on(Events.GuildUpdate, async (oGuild, nGuild) => {
    try {
        await guildEvents.GuildUpdate(oGuild, nGuild);
    } catch (err) {
        console.error(err);
        let dmChannel = await client.users.createDM(contact);
        await dmChannel.send(`[<t:${Math.floor(new Date().valueOf() / 1000)}:f>] ${err.stack}`);
    }
});
client.on(Events.GuildMemberAdd, async (member) => {
    try {
        await guildEvents.MemberJoin(member);
    } catch (err) {
        console.error(err);
        let dmChannel = await client.users.createDM(contact);
        await dmChannel.send(`[<t:${Math.floor(new Date().valueOf() / 1000)}:f>] ${err.stack}`);
    }
});
client.on(Events.GuildMemberRemove, async (member) => {
    try {
        await guildEvents.MemberLeave(member);
    } catch (err) {
        console.error(err);
        let dmChannel = await client.users.createDM(contact);
        await dmChannel.send(`[<t:${Math.floor(new Date().valueOf() / 1000)}:f>] ${err.stack}`);
    }
});
client.on(Events.GuildMemberUpdate, async (oldMember, newMember) => {
    try {
        await guildEvents.MemberUpdate(oldMember, newMember);
    } catch (err) {
        console.error(err);
        let dmChannel = await client.users.createDM(contact);
        await dmChannel.send(`[<t:${Math.floor(new Date().valueOf() / 1000)}:f>] ${err.stack}`);
    }
});
client.on(Events.UserUpdate, async (oldUser, newUser) => {
    try {
        await guildEvents.UserUpdate(oldUser, newUser);
    } catch (err) {
        console.error(err);
        let dmChannel = await client.users.createDM(contact);
        await dmChannel.send(`[<t:${Math.floor(new Date().valueOf() / 1000)}:f>] ${err.stack}`);
    }
});
client.on(Events.GuildBanAdd, async (ban) => {
    try {
        await guildEvents.MemberBan(ban);
    } catch (err) {
        console.error(err);
        let dmChannel = await client.users.createDM(contact);
        await dmChannel.send(`[<t:${Math.floor(new Date().valueOf() / 1000)}:f>] ${err.stack}`);
    }
});

client.on(Events.VoiceStateUpdate, async (oldState, newState) => {
    try {
        await guildEvents.VoiceState(oldState, newState);
    } catch (err) {
        console.error(err);
        let dmChannel = await client.users.createDM(contact);
        await dmChannel.send(`[<t:${Math.floor(new Date().valueOf() / 1000)}:f>] ${err.stack}`);
    }
});
client.on(Events.PresenceUpdate, async (oldPresence, newPresence) => {
    try {
        await guildEvents.PresenceUpdate(oldPresence, newPresence);
    } catch (err) {
        console.error(err);
        let dmChannel = await client.users.createDM(contact);
        await dmChannel.send(`[<t:${Math.floor(new Date().valueOf() / 1000)}:f>] ${err.stack}`);
    }
});
//Message Events
client.on(Events.MessageCreate, async (message) => {
    try {
        await messageEvents.MessageCreate(message);
    } catch (err) {
        console.error(err);
        let dmChannel = await client.users.createDM(contact);
        await dmChannel.send(`[<t:${Math.floor(new Date().valueOf() / 1000)}:f>] ${err.stack}`);
    }
});
client.on(Events.MessageUpdate, async (omessage, nmessage) => {
    try {
        await messageEvents.MessageUpdate(omessage, nmessage);
    } catch (err) {
        console.error(err);
        let dmChannel = await client.users.createDM(contact);
        await dmChannel.send(`[<t:${Math.floor(new Date().valueOf() / 1000)}:f>] ${err.stack}`);
    }
});
client.on(Events.MessageDelete, async (message) => {
    try {
        await messageEvents.MessageDelete(message);
    } catch (err) {
        console.error(err);
        let dmChannel = await client.users.createDM(contact);
        await dmChannel.send(`[<t:${Math.floor(new Date().valueOf() / 1000)}:f>] ${err.stack}`);
    }
});
client.on(Events.MessageBulkDelete, async (messages) => {
    try {
        await messageEvents.MessageBulkDelete(messages);
    } catch (err) {
        console.error(err);
        console.log(messages[0]);
        let dmChannel = await client.users.createDM(contact);
        await dmChannel.send(`[<t:${Math.floor(new Date().valueOf() / 1000)}:f>] ${err.stack}`);
    }
});
client.on(Events.MessageReactionAdd, async (reaction, user) => {
    try {
        await messageEvents.ReactionAdd(reaction, user);
    } catch (err) {
        console.error(err);
        let dmChannel = await client.users.createDM(contact);
        await dmChannel.send(`[<t:${Math.floor(new Date().valueOf() / 1000)}:f>] ${err.stack}`);
    }
});
client.on(Events.MessageReactionRemove, async (reaction, user) => {
    try {
        await messageEvents.ReactionRemove(reaction, user);
    } catch (err) {
        console.error(err);
        let dmChannel = await client.users.createDM(contact);
        await dmChannel.send(`[<t:${Math.floor(new Date().valueOf() / 1000)}:f>] ${err.stack}`);
    }
});

//------------------------------------- Functions
function sleep(seconds) {
    return new Promise(r => setTimeout(r, seconds * 1000))
}

function getArgs(obj) {
    if (obj.type === 3) {
        return {name: obj.name, val: obj.value};
    } else if (obj.type === 4) {
        return {name: obj.name, val: obj.value};
    } else if (obj.type === 5) {
        return {name: obj.name, val: obj.value};
    } else if (obj.type === 6) {
        let tst;
        if (obj.user.username !== obj.user.username.toLowerCase())
            tst = obj.user.username + '#' + obj.user.discriminator + " (Bot)";
        return {name: obj.name, val: (tst || obj.user.username)};
    } else if (obj.type === 7) {
        return {name: obj.name, val: `<#${obj.channel.id}>`};
    } else if (obj.type === 8) {
        return {name: obj.name, val: `Role Name: ${obj.role.name}.\nRole ID: ${obj.role.id}`};
    } else if (obj.type === 9) {
        let tst;
        if (obj.user.username !== obj.user.username.toLowerCase())
            tst = obj.user.username + '#' + obj.user.discriminator + " (Bot)";
        return {name: obj.name, val: (tst || obj.user.username)};
    } else if (obj.type === 10) {
        return {name: obj.name, val: obj.value};
    } else if (obj.type === 11) {
        return {
            name: obj.name,
            val: `Attachment Type: ${obj.attachment.contentType}.\nName: ${obj.attachment.name}.\nAttachment URL: ${obj.attachment.url}`
        };
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
            } catch (err) {

            }
        }
    }
    return count;
}

const live = http.createServer(async (req, res) => {
    res.setHeader('Connection', 'close');
    res.end('OK');
    if (!isLive) {
        console.log("CHANNEL IS LIVE");
        isLive = !isLive;
        const guild = await global.client.guilds.cache.get("1190516697174659182");
        const everyoneRole = guild.roles.everyone;
        const currentPermissions = everyoneRole.permissions;
        const newPermissions = new PermissionsBitField(currentPermissions)
            .remove(PermissionsBitField.Flags.Connect);
        await everyoneRole.setPermissions(newPermissions);
    }
});
live.listen(3110, () => {
    console.log('Live check initiated');
});
const notlive = http.createServer(async (req, res) => {
    res.setHeader('Connection', 'close');
    res.end('OK');
    if (isLive) {
        console.log("CHANNEL IS NO LONGER LIVE!");
        isLive = !isLive;
        const guild = await global.client.guilds.cache.get("1190516697174659182");
        const everyoneRole = guild.roles.everyone;
        const currentPermissions = everyoneRole.permissions;
        const newPermissions = new PermissionsBitField(currentPermissions)
            .add(PermissionsBitField.Flags.Connect);
        await everyoneRole.setPermissions(newPermissions);
    }
});
notlive.listen(3111, () => {
    console.log('Live check initiated');
});

async function countTime() {
    let totalSeconds = (client.uptime / 1000);
    let days = Math.floor(totalSeconds / 86400);
    totalSeconds %= 86400;
    let hours = Math.floor(totalSeconds / 3600);
    totalSeconds %= 3600;
    let minutes = Math.floor(totalSeconds / 60);
    let seconds = Math.floor(totalSeconds % 60);
    return {days: days, hours: hours, minutes: minutes, seconds: seconds};
}