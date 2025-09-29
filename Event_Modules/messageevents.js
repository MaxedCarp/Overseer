const {PermissionFlagsBits, AttachmentBuilder} = require('discord.js');
const EmbedCreator = require('./embedcreator.js');
const essentials = require('./essentials.js');

class messageEvents {

    static MessageCreate(message) {
        return new Promise(() => {
            (async () => {
                if (!!message?.author?.bot)
                    return;
                if (message.channel.type === 1)
                    console.log(message.author.globalName + ": " + message.content);
                if (!message.guild)
                    return;
                const {guild} = message
                let obj = await global.srvcol.findOne({"srv": guild.id});
                if (obj.autodelist.find(id => id === message.author.id)) {
                    await message.delete();
                    return;
                }
                const attachm = message.attachments.map(attach => {
                    return {fileName: attach.name, attachurl: attach.url, fileType: attach.contentType}
                });
                let foc = false;
                if (await essentials.checkFocus(message.author.id, message.guild.id)) {
                    const now = new Date();
                    const utcString = now.toUTCString();
                    let newMessageContent = `**USER:** ${(message.content || "")} `

                    if (message.stickers.size > 0) {
                        const stickerUrls = []
                        message.stickers.forEach(sticker => {
                            stickerUrls.push(sticker.url);
                        });

                        stickerUrls.forEach(url => {
                            newMessageContent += `${url}\n`;
                        });
                    }
                    newMessageContent += `\n-# [[Click to View Message](https://discord.com/channels/${message.guild.id}/${message.channel.id}/${message.id})] **Message ID:** ${message.id}, **Time:** ${utcString}`;
                    const obj = await global.focuscol.findOne({"userid": message.author.id, "srv": guild.id});
                    const ch = await global.client.channels.cache.get(obj.ch);
                    foc = await ch.send({
                        content: newMessageContent,
                        files: message.attachments.map(attachment => new AttachmentBuilder(attachment.proxyURL, {name: attachment.name})) || [],
                        allowedMentions: {parse: []}
                    });
                }
                const msgobj = {
                    messageID: message.id,
                    messageContent: message.content,
                    messageAttachments: attachm,
                    messageAuthor: {
                        userID: message.author.id,
                        userName: message.author.username,
                        globalName: message.author.globalName,
                        avatar: message.author.avatar,
                        avatarURL: message.author.displayAvatarURL()
                    },
                    messageChannelID: message.channel.id,
                    messageServerID: message.guild.id,
                    focus: foc.id || false,
                    expire: new Date(Date.now() + 1209600000)
                };
                await global.msgcol.insertOne(msgobj);
                const msgcontlow = message.content.toLowerCase();
                if (obj.fishmode === true) {
                    if (guild.id === "1190516697174659182" && (msgcontlow.includes("limbo") || msgcontlow.includes("limbible") || message.content.includes("<@528963161622052915>")))
                        await message.react("🎩");
                    const msgsplit = msgcontlow.split(' ');
                    let flag = true;
                    for (let prt of msgsplit) {
                        let fishtest = await global.fishcol.findOne({"name": prt})
                        if (!!fishtest || message.content.includes("🐟") || msgcontlow.includes("sci-fi freak")) {
                            if (flag) {
                                try {
                                    await message.react("🐟");
                                } catch (err) {
                                    console.log("Reaction failed in: " + message.guild.name + ": #" + message.channel.name)
                                }
                                flag = false;
                            }
                        }
                    }
                    if (msgcontlow.includes("you know what that means"))
                        await message.reply("🐟FISH!");
                    if (msgcontlow.includes("ghoti")) {
                        await message.reply("Sorry, not a real word...").then(async msg => {
                            await essentials.sleep(5);
                            msg.delete();
                            message.delete();
                            return -1;
                        })
                    }
                }
                if (message.content.includes("<@1205253895258120304>"))
                    await message.reply("Yes, how may I assist?");


                const member = guild.members.cache.find(member => member.id === message.author.id);
                if (!(guild.members.me).permissions.has(PermissionFlagsBits.ManageRoles))
                    return;
                const query = (await global.secretkeyscol.aggregate([
                    {
                        $match: {
                            srv: guild.id,
                            $text: {$search: msgcontlow},
                        }
                    },
                    {
                        $addFields: {
                            score: {$meta: "textScore"}
                        }
                    },
                    {
                        $sort: {score: -1}
                    }
                ]).toArray())?.[0];
                if (!query){
                    return;
                }
                if (msgcontlow.includes(query?.key)) {
                    let role = guild.roles.cache.find(role => role.id === query.roleID);
                    if (!member.roles.cache.has(role) && role.editable && (parseInt(`${member.joinedTimestamp}`) + (parseInt(query.agereq) * 1000)) < new Date().valueOf()) {
                        member.roles.add(role);
                    }
                }
            })();
        });
    };

    static MessageDelete(message) {
        return new Promise((resolve) => {
            (async () => {
                if (message.guild === null)
                    return;
                if (!!message?.author?.bot)
                    return;
                let obj = await global.srvcol.findOne({"srv": message.guild.id});
                const existmsg = (await global.msgcol.findOne({"messageID": message.id}) !== null);
                const {guild} = message;
                if (!!obj.autodelist.find(id => id === message?.author?.id)) {
                    let resembed;
                    if (message.attachments.length < 1 || (message.attachments[0]?.contentType !== "image/png" && message.attachments[0]?.contentType !== "image/jpeg" && message.attachments[0]?.contentType !== "image/webp"))
                        resembed = await EmbedCreator.Create(`Message Deleted in: <#${message.channel.id}>`, message.content || " ", false, guild.name, guild.iconURL(), `${message.author.globalName || message.author.username} (${message.author.username})`, message.author.displayAvatarURL(), 0xFA042A, []);
                    else
                        resembed = await EmbedCreator.Create(`Image Deleted in: <#${message.channel.id}>`, message.content || " ", message.attachments[0].url, guild.name, guild.iconURL(), `${message.author.globalName || message.author.username} (${message.author.username})`, message.author.displayAvatarURL(), 0xFA042A, []);
                    if (obj.delete === "none" || !obj)
                        return;
                    if (((guild.members.me).permissionsIn(obj.delete).has(PermissionFlagsBits.SendMessages) && (guild.members.me).permissionsIn(obj.delete).has(PermissionFlagsBits.ViewChannel)) || (guild.members.me).permissionsIn(obj.delete).has(PermissionFlagsBits.Administrator))
                        await client.channels.cache.get(obj.delete).send({embeds: [resembed]});
                    else
                        return;
                } else {
                    if (!existmsg)
                        return;
                    const msg = await global.msgcol.findOne({"messageID": message.id});
                    let resembed;

                    if (msg.messageAttachments.length < 1 || (msg.messageAttachments[0]?.fileType !== "image/png" && msg.messageAttachments[0]?.fileType !== "image/jpeg") && msg.messageAttachments[0]?.fileType !== "image/webp")
                        resembed = await EmbedCreator.Create(`Message Deleted in: <#${message.channelId}>`, msg.messageContent || " ", false, guild.name, guild.iconURL(), `${msg.messageAuthor.globalName || msg.messageAuthor.userName} (${msg.messageAuthor.userName})`, `https://cdn.discordapp.com/avatars/${msg.messageAuthor.userID}/${msg.messageAuthor.avatar}`, 0xFA042A, []);
                    else
                        resembed = await EmbedCreator.Create(`Image Deleted in: <#${message.channelId}>`, msg.messageContent || " ", msg.messageAttachments[0].attachurl, guild.name, guild.iconURL(), `${msg.messageAuthor.globalName || msg.messageAuthor.userName} (${msg.messageAuthor.userName})`, `https://cdn.discordapp.com/avatars/${msg.messageAuthor.userID}/${msg.messageAuthor.avatar}`, 0xFA042A, []);
                    if (obj.delete === "none" || !obj)
                        return;
                    let newMessageContent;
                    if (((guild.members.me).permissionsIn(obj.delete).has(PermissionFlagsBits.SendMessages) && (guild.members.me).permissionsIn(obj.delete).has(PermissionFlagsBits.ViewChannel)) || (guild.members.me).permissionsIn(obj.delete).has(PermissionFlagsBits.Administrator)) {
                        const newmsg = await client.channels.cache.get(obj.delete).send({embeds: [resembed]});
                        const now = new Date();
                        const utcString = now.toUTCString();
                        newMessageContent = `**MESSAGE FROM USER DELETED!**\n-# [[Click to View Ref](https://discord.com/channels/${message.guild.id}/${newmsg.channel.id}/${newmsg.id})] **Message ID:** ${message.id}, **Time:** ${utcString}`
                    } else {
                        const now = new Date();
                        const utcString = now.toUTCString();
                        newMessageContent = `**MESSAGE FROM USER DELETED!**\n-# **Message ID:** ${message.id}, **Time:** ${utcString}`
                    }
                    if (await essentials.checkFocus(msg.messageAuthor.userID, guild.id)) {

                        let replyTo = false;
                        const obj = await global.focuscol.findOne({
                            "userid": msg.messageAuthor.userID,
                            "srv": guild.id
                        });
                        if (!!msg.focus) {
                            const chan = await client.channels.cache.get(obj.ch)
                            replyTo = await chan.messages.fetch(msg.focus);
                        }

                        if (!!replyTo) {
                            await replyTo.reply({content: newMessageContent, allowedMentions: {parse: []}});
                        } else {
                            const ch = await global.client.channels.cache.get(obj.ch);
                            await ch.send({
                                content: newMessageContent,
                                allowedMentions: {parse: []}
                            })
                        }
                    }
                    await global.msgcol.deleteOne({"messageID": message.id});
                }
                resolve(true);
            })();
        });
    }

    static async #getSampleMessage(msgs) {
        let guild;
        let guildid;
        let guild2;
        let guildicon;
        let guildname;
        let chan;
        let flag = true;
        for (let i = msgs.length - 1; i >= 0; i--) {
            let message = msgs[i];
            const msg = await global.msgcol.findOne({"messageID": message.id})
            if (msg) {
                if (flag) {
                    guild = await client.guilds.fetch(msg.messageServerID);
                    guildid = guild.id;
                    guild2 = await global.srvcol.findOne({srv: message.guild.id});
                    guildicon = guild.iconURL();
                    guildname = guild2.name;
                    chan = msg.messageChannelID;
                    flag = false;
                }
            }
        }
        return {guild, guildid, guild2, guildicon, guildname, chan};
    }

    static MessageBulkDelete(messages) {
        return new Promise((resolve) => {
            (async () => {
                const messages2 = messages.filter(msg => (!msg?.author?.bot));
                if (messages2.length < 1)
                    return;
                let test = [];
                await messages2.forEach(msg => {
                    test.push(msg);
                });
                const messageIds = test.map(message => message.id);
                const {
                    guild,
                    guildid,
                    guild2,
                    guildicon,
                    guildname,
                    chan
                } = await messageEvents.#getSampleMessage(test);
                for (let i = test.length - 1; i >= 0; i--) {
                    await global.msgcol.deleteMany({"messageID": {$in: messageIds}});
                }
                let resembed = await EmbedCreator.Create(`Message${test.length > 1 ? "s **BULK**" : ""} Deleted in: <#${chan}>`, `${test.length} Message${test.length > 1 ? "s" : ""} Deleted`, false, guildname, guildicon, `Overseer`, `https://maxedcarp.net/imgs/overseer.png`, 0xFA042A, []);
                const obj = await srvcol.findOne({srv: guildid});
                if (obj?.delete === "none" || !obj?.delete) {
                    return;
                } else {
                    if (((guild.members.me).permissionsIn(obj?.delete).has(PermissionFlagsBits.SendMessages) && (guild.members.me).permissionsIn(obj?.delete).has(PermissionFlagsBits.ViewChannel)) || (guild.members.me).permissionsIn(obj?.delete).has(PermissionFlagsBits.Administrator))
                        await client.channels.cache.get(obj?.delete).send({embeds: [resembed]});
                    else
                        return;
                }
                resolve(true);
            })();
        });
    }

    static MessageUpdate(omessage, nmessage) {
        return new Promise((resolve) => {
            (async () => {
                if (omessage.guild === null)
                    return;
                if (!!omessage?.author?.bot)
                    return;
                const existmsg = (await global.msgcol.findOne({"messageID": omessage.id}) !== null);
                if (!existmsg)
                    return;
                if (omessage.content === nmessage.content)
                    return;
                const {guild} = omessage;
                const noldmsg = await global.msgcol.findOne({"messageID": omessage.id});
                const exampleEmbed = await EmbedCreator.Create(false, `**Message Edited:** [Click to View](https://discord.com/channels/${nmessage.guild.id}/${nmessage.channel.id}/${nmessage.id})`, false, nmessage.guild.name, nmessage.guild.iconURL(), `${nmessage.author.globalName || nmessage.author.username} (${nmessage.author.username})`, nmessage.author.displayAvatarURL(), 0xf7ef02, [{
                    name: "Old Message:",
                    value: `${noldmsg.messageContent}`,
                    inline: false
                }, {name: "New Message:", value: `${nmessage.content}`, inline: false}]);
                let obj = await global.srvcol.findOne({"srv": nmessage.guild.id})
                if (obj.fishmode === true) {
                    if (nmessage.content.toLowerCase().includes("ghoti")) {
                        await nmessage.reply("Sorry, not a real word...").then(async msg => {
                            await essentials.sleep(5);
                            msg.delete();
                            nmessage.delete();
                            return -1;
                        })
                    }
                }
                const look = {messageID: nmessage.id};
                const attachm = nmessage.attachments.map(attach => {
                    return {fileName: attach.name, attachurl: attach.url, fileType: attach.contentType}
                });
                const test = {messageContent: nmessage.content, messageAttachments: attachm,};
                const upd = {$set: test};
                await global.msgcol.updateOne(look, upd);
                let newMessageContent;
                if ((obj.update !== "none" && !!obj) && (((guild.members.me).permissionsIn(obj.update).has(PermissionFlagsBits.SendMessages) && (guild.members.me).permissionsIn(obj.update).has(PermissionFlagsBits.ViewChannel)) || (guild.members.me).permissionsIn(obj.update).has(PermissionFlagsBits.Administrator))) {
                    const newmsg = await client.channels.cache.get(obj.update).send({embeds: [exampleEmbed]});
                    const now = new Date();
                    const utcString = now.toUTCString();
                    newMessageContent = `**USER EDITED A MESSAGE!**\n-# [[Click to View Ref](https://discord.com/channels/${nmessage.guild.id}/${newmsg.channel.id}/${newmsg.id})] **Message ID:** ${nmessage.id}, **Time:** ${utcString}`
                } else {
                    const now = new Date();
                    const utcString = now.toUTCString();
                    newMessageContent = `**USER EDITED A MESSAGE!**\n-# **Message ID:** ${nmessage.id}, **Time:** ${utcString}`
                }
                if (await essentials.checkFocus(noldmsg.messageAuthor.userID, guild.id)) {
                    let replyTo = false;
                    const obj = await global.focuscol.findOne({
                        "userid": noldmsg.messageAuthor.userID,
                        "srv": guild.id
                    });
                    if (!!noldmsg.focus) {
                        const chan = await client.channels.cache.get(obj.ch)
                        replyTo = await chan.messages.fetch(noldmsg.focus);
                    }
                    if (!!replyTo) {
                        await replyTo.reply({content: newMessageContent, allowedMentions: {parse: []}});
                    } else {
                        const ch = await global.client.channels.cache.get(obj.ch);
                        await ch.send({
                            content: newMessageContent,
                            allowedMentions: {parse: []}
                        })
                    }
                }
                resolve(true);
            })();
        });
    }

    static ReactionAdd(reaction, user) {
        return new Promise((resolve) => {
            (async () => {
                if (await essentials.checkFocus(user.id, reaction.message.guild.id)) {
                    const now = new Date();
                    const utcString = now.toUTCString();
                    let newMessageContent = `**USER ADDED A REACTION`
                    const obj = await global.focuscol.findOne({
                        "userid": user.id,
                        "srv": reaction.message.guild.id
                    });
                    if (!reaction.emoji.url)
                        newMessageContent += `: ${reaction.emoji}`;
                    newMessageContent += `!**\n-# [[Click to View Message](https://discord.com/channels/${reaction.message.guild.id}/${reaction.message.channel.id}/${reaction.message.id})] **Message ID:** ${reaction.message.id}, **Time:** ${utcString}`;
                    let msg;
                    if (reaction.emoji.url) {
                        msg = {content: newMessageContent, allowedMentions: {parse: []}, files: [reaction.emoji.url]}
                    } else {
                        msg = {content: newMessageContent, allowedMentions: {parse: []}}
                    }
                    const ch = await global.client.channels.cache.get(obj.ch);
                    await ch.send(msg);
                }
                resolve(true);
            })();
        });
    }

    static ReactionRemove(reaction, user) {
        return new Promise((resolve) => {
            (async () => {
                if (await essentials.checkFocus(user.id, reaction.message.guild.id)) {
                    const now = new Date();
                    const utcString = now.toUTCString();
                    let newMessageContent = `**[${utcString}] USER REMOVED A REACTION`
                    const obj = await global.focuscol.findOne({
                        "userid": user.id,
                        "srv": reaction.message.guild.id
                    });
                    if (!reaction.emoji.url)
                        newMessageContent += `: ${reaction.emoji}`;
                    newMessageContent += `!**\n-# [[Click to View Message](https://discord.com/channels/${reaction.message.guild.id}/${reaction.message.channel.id}/${reaction.message.id})] **Message ID:** ${reaction.message.id}, **Time:** ${utcString}`;
                    let msg;
                    if (reaction.emoji.url) {
                        msg = {content: newMessageContent, allowedMentions: {parse: []}, files: [reaction.emoji.url]}
                    } else {
                        msg = {content: newMessageContent, allowedMentions: {parse: []}}
                    }
                    const ch = await global.client.channels.cache.get(obj.ch);
                    await ch.send(msg);
                }
                resolve(true);
            })();
        });
    }
}

module.exports = messageEvents;