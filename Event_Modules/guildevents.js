const {EmbedBuilder, PermissionFlagsBits, AttachmentBuilder} = require('discord.js');
const EmbedCreator = require('./embedcreator.js');
const essentials = require("./essentials.js");

class guildEvents {
    static MemberJoin(member) {
        return new Promise((resolve, reject) => {
            (async () => {
                var obj;
                obj = await global.srvcol.findOne({"srv": member.guild.id});
                const usrdata = await global.persistcol.findOne({srv: member.guild.id, userid: member.id});
                let shouldban = false;
                if (!!(await global.bancol.findOne({srv: member.guild.id, userId: member.id}))) {
                    shouldban = true;
                    await member.ban();
                    await global.bancol.deleteOne({srv: member.guild.id, userId: member.id});
                }
                const usr = member.user;
                const {guild} = member;
                const member2 = guild.members.cache.find(member2 => member2.id === member.id);
                if (!usr.bot && !usr.system) {
                    if (!shouldban) {
                        const exampleEmbed = new EmbedBuilder()
                            .setColor(0x69FA04)
                            .setTitle(`USER JOINED!`)
                            .setAuthor({name: `${member.user.username}`, iconURL: `${member.displayAvatarURL()}`})
                            .setDescription(obj.joinmsg.replace("{@user}", `<@${usr.id}>`).replace("{servername}", guild.name).replace("{username}", usr.username).replace("{user}", usr.globalName))
                            .setFooter({text: member.guild.name, iconURL: member.guild.iconURL()});
                        if (obj.defaultnick !== "") {
                            if ((member.guild.members.me).permissions.has(PermissionFlagsBits.ManageNicknames))
                                await member.setNickname(obj.defaultnick);
                        }
                        if (obj.rolepersistence === true && !!obj && (member.guild.members.me).permissions.has(PermissionFlagsBits.ManageRoles) && (!!usrdata)) {
                            if (!!usrdata.nickname)
                                await member.setNickname(usrdata.nickname);
                            let finrole = [];
                            for (let role of usrdata.roles) {
                                finrole.push(role);
                            }
                            if (obj?.joinroles?.length !== 0) {
                                for (let role of obj.joinroles) {
                                    finrole.push(role);
                                }
                            }
                            let roles = await guild.roles.cache.filter(role3 => finrole.indexOf(role3.id) !== -1);
                            roles = await roles.filter(role => role.editable);
                            await member2.roles.add(roles);
                        } else {
                            if (obj?.joinroles?.length !== 0 && !!obj && (member.guild.members.me).permissions.has(PermissionFlagsBits.ManageRoles)) {
                                if ((guild.members.me).permissions.has(PermissionFlagsBits.ManageRoles) || (guild.members.me).permissions.has(PermissionFlagsBits.Administrator)) {
                                    let roles = await guild.roles.cache.filter(role3 => (obj.joinroles.indexOf(role3.id) !== -1 && member2.roles.cache.find(role => role.id !== role3.id)));
                                    roles = await roles.filter(role => role.editable);
                                    await member2.roles.add(roles);
                                }
                            }
                        }
                        if (obj.join === "none" || !obj) {
                            return;
                        } else {
                            if ((guild.members.me).permissionsIn(obj.join).has(PermissionFlagsBits.SendMessages)) {
                                if (obj.ismsgembed)
                                    await client.channels.cache.get(obj.join).send({embeds: [exampleEmbed]});
                                else
                                    await client.channels.cache.get(obj.join).send(obj.joinmsg.replace("{@user}", `<@${usr.id}>`).replace("{servername}", guild.name).replace("{username}", usr.username).replace("{user}", usr.globalName))
                            } else
                                return;
                        }
                    }
                }
                if (await essentials.checkFocus(member.id, member.guild.id)) {
                    const now = new Date();
                    const utcString = now.toUTCString();
                    let newMessageContent = `# **USER HAS JOINED / REJOINED THE SERVER!!!!**\n@everyone\n-# **Time:** ${utcString}`
                    const obj2 = await global.focuscol.findOne({
                        "userid": member.id,
                        "srv": member.guild.id
                    });
                    const ch = await global.client.channels.cache.get(obj2.ch);
                    await ch.send({
                        content: newMessageContent
                    });
                }
                const exampleEmbed2 = new EmbedBuilder()
                    .setColor(0x69FA04)
                    .setTitle(`USER JOINED!`)
                    .setAuthor({
                        name: `${member.user.globalName || member.user.username} (${member.user.username})`,
                        iconURL: `${member.displayAvatarURL()}`
                    })
                    .setDescription(`${member.user}`)
                    .addFields(
                        {name: "ID", value: `${usr.id}`, inline: true},
                        {name: "Bot", value: `${usr.bot}`, inline: true},
                        {name: "Username", value: `${usr.username}`, inline: true},
                        {name: "Global Name", value: `${usr.globalName || usr.username}`, inline: true},
                        {name: "Discriminator", value: `${usr.discriminator}`, inline: true},
                        {name: "Avatar", value: `${member.displayAvatarURL()}`, inline: true},
                        {
                            name: "Created On",
                            value: `<t:${Math.floor(member.user.createdTimestamp / 1000)}:F>` + ` (<t:${Math.floor(member.user.createdTimestamp / 1000)}:R>)`,
                            inline: true
                        })
                    .setThumbnail(member.displayAvatarURL())
                    .setFooter({text: member.guild.name, iconURL: member.guild.iconURL()});
                if (obj.joinstat === "none" || !obj) {
                    return;
                } else {
                    if (((guild.members.me).permissionsIn(obj.joinstat).has(PermissionFlagsBits.SendMessages) && (guild.members.me).permissionsIn(obj.joinstat).has(PermissionFlagsBits.ViewChannel)) || (guild.members.me).permissionsIn(obj.joinstat).has(PermissionFlagsBits.Administrator))
                        await client.channels.cache.get(obj.joinstat).send({embeds: [exampleEmbed2]});
                    else
                        return;
                }
                resolve(true);
            })();
        });
    };

    static MemberLeave(member) {
        return new Promise((resolve, reject) => {
            (async () => {
                let obj = await global.srvcol.findOne({"srv": member.guild.id});
                const usr = member.user;
                let shouldban = false;
                if (!!(await global.bancol.findOne({srv: member.guild.id, userId: member.id}))) {
                    shouldban = true;
                    await member.ban();
                    await global.bancol.deleteOne({srv: member.guild.id, userId: member.id});
                }
                if (!usr.bot && !usr.system && !shouldban) {
                    const exampleEmbed = new EmbedBuilder()
                        .setColor(0xFA042A)
                        .setTitle(`USER LEFT!`)
                        .setAuthor({name: `${member.user.username}`, iconURL: `${member.displayAvatarURL()}`})
                        .setDescription(obj.leavemsg.replace("{@user}", `<@${usr.id}>`).replace("{servername}", member.guild.name).replace("{username}", usr.username).replace("{user}", usr.globalName))
                        .setFooter({text: member.guild.name, iconURL: member.guild.iconURL()});
                    if (obj.leave === "none" || !obj) {
                        return;
                    } else {
                        if (((member.guild.members.me).permissionsIn(obj.leave).has(PermissionFlagsBits.SendMessages) && (member.guild.members.me).permissionsIn(obj.leave).has(PermissionFlagsBits.ViewChannel)) || (member.guild.members.me).permissionsIn(obj.leave).has(PermissionFlagsBits.Administrator)) {
                            if (obj.ismsgembed)
                                await client.channels.cache.get(obj.leave).send({embeds: [exampleEmbed]});
                            else
                                await client.channels.cache.get(obj.leave).send(obj.leavemsg.replace("{@user}", `<@${usr.id}>`).replace("{servername}", member.guild.name).replace("{username}", usr.username).replace("{user}", usr.globalName))
                        } else
                            return;
                    }
                }
                if (await essentials.checkFocus(member.id, member.guild.id)) {
                    const now = new Date();
                    const utcString = now.toUTCString();
                    let newMessageContent = `# **USER HAS LEFT THE SERVER!!!!**\n@everyone\n-# **Time:** ${utcString}`
                    const obj2 = await global.focuscol.findOne({
                        "userid": member.id,
                        "srv": member.guild.id
                    });
                    const ch = await global.client.channels.cache.get(obj2.ch);
                    await ch.send({
                        content: newMessageContent
                    });
                }
                const exampleEmbed2 = new EmbedBuilder()
                    .setColor(0xFA042A)
                    .setTitle(`USER LEFT!`)
                    .setAuthor({
                        name: `${member.user.globalName || member.user.username} (${member.user.username})`,
                        iconURL: `${member.displayAvatarURL()}`
                    })
                    .setDescription(`${member.user}`)
                    .addFields(
                        {name: "ID", value: `${usr.id}`, inline: true},
                        {name: "Bot", value: `${usr.bot}`, inline: true},
                        {name: "Username", value: `${usr.username}`, inline: true},
                        {name: "Global Name", value: `${usr.globalName || usr.username}`, inline: true},
                        {name: "Discriminator", value: `${usr.discriminator}`, inline: true},
                        {name: "Avatar", value: `${member.displayAvatarURL()}`, inline: true},
                        {name: "Join Date", value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:F>`, inline: true},
                        {
                            name: "Created On",
                            value: `<t:${Math.floor(member.user.createdTimestamp / 1000)}:F>` + ` (<t:${Math.floor(member.user.createdTimestamp / 1000)}:R>)`,
                            inline: true
                        })
                    .setThumbnail(member.displayAvatarURL())
                    .setFooter({text: member.guild.name, iconURL: member.guild.iconURL()});
                if (obj.leavestat === "none" || !obj) {
                    return;
                } else {
                    if (((member.guild.members.me).permissionsIn(obj.leavestat).has(PermissionFlagsBits.SendMessages) && (member.guild.members.me).permissionsIn(obj.leavestat).has(PermissionFlagsBits.ViewChannel)) || (member.guild.members.me).permissionsIn(obj.leavestat).has(PermissionFlagsBits.Administrator))
                        await client.channels.cache.get(obj.leavestat).send({embeds: [exampleEmbed2]});
                    else
                        return;
                }
                resolve(true);
            })();
            ;

        });
    };

    static MemberBan(ban) {
        return new Promise((resolve, reject) => {
            (async () => {
                const {guild, user, reason} = ban;
                let obj = await global.srvcol.findOne({"srv": guild.id});
                const exampleEmbed = new EmbedBuilder()
                    .setColor(0xFA042A)
                    .setTitle(`USER BANNED!`)
                    .setAuthor({name: `${user.username}`, iconURL: `${user.displayAvatarURL()}`})
                    .setDescription(obj.banmsg.replace("{@user}", `<@${user.id}>`).replace("{servername}", guild.name).replace("{username}", user.username).replace("{user}", user.globalName))
                    .setFooter({text: guild.name, iconURL: guild.iconURL()});
                if (await essentials.checkFocus(user.id, guild.id)) {
                    const now = new Date();
                    const utcString = now.toUTCString();
                    let newMessageContent = `# **USER HAS BEEN BANNED!!!**\n@everyone\n-# **Time:** ${utcString}`;
                    const obj2 = await global.focuscol.findOne({
                        "userid": user.id,
                        "srv": guild.id
                    });
                    const ch = await global.client.channels.cache.get(obj2.ch);
                    await ch.send({
                        content: newMessageContent
                    });
                }
                if (obj.bans === "none" || !obj) {
                    return;
                } else {
                    if (((guild.members.me).permissionsIn(obj.bans).has(PermissionFlagsBits.SendMessages) && (guild.members.me).permissionsIn(obj.bans).has(PermissionFlagsBits.ViewChannel)) || (guild.members.me).permissionsIn(obj.bans).has(PermissionFlagsBits.Administrator)) {
                        if (obj.ismsgembed)
                            await client.channels.cache.get(obj.bans).send({embeds: [exampleEmbed]});
                        else
                            await client.channels.cache.get(obj.bans).send(obj.banmsg.replace("{@user}", `<@${user.id}>`).replace("{servername}", guild.name).replace("{username}", user.username).replace("{user}", user.globalName));
                    } else
                        return;
                }
                const usr = user;
                const exampleEmbed2 = new EmbedBuilder()
                    .setColor(0xFA042A)
                    .setTitle(`USER BANNED!`)
                    .setAuthor({
                        name: `${user.globalName || user.username} (${user.username})`,
                        iconURL: `${user.displayAvatarURL()}`
                    })
                    .setDescription(`${user}`)
                    .addFields(
                        {name: "ID", value: `${usr.id}`, inline: true},
                        {name: "Bot", value: `${usr.bot}`, inline: true},
                        {name: "Username", value: `${usr.username}`, inline: true},
                        {name: "Global Name", value: `${usr.globalName || usr.username}`, inline: true},
                        {name: "Discriminator", value: `${usr.discriminator}`, inline: true},
                        {name: "Avatar", value: `${user.displayAvatarURL()}`, inline: true},
                        {
                            name: "Created On",
                            value: `<t:${user.createdTimestamp}`.slice(0, -3) + ":F>" + ` (<t:${user.createdTimestamp}`.slice(0, -3) + ":R>)",
                            inline: true
                        })
                    .setThumbnail(user.displayAvatarURL())
                    .setFooter({text: guild.name, iconURL: guild.iconURL()});
                if (obj.banstat === "none" || !obj) {
                    return;
                } else {
                    if (((guild.members.me).permissionsIn(obj.banstat).has(PermissionFlagsBits.SendMessages) && (guild.members.me).permissionsIn(obj.banstat).has(PermissionFlagsBits.ViewChannel)) || (guild.members.me).permissionsIn(obj.banstat).has(PermissionFlagsBits.Administrator))
                        await client.channels.cache.get(obj.banstat).send({embeds: [exampleEmbed2]});
                    else
                        return;
                }
                resolve(true);
            })();
        });
    };

    static MemberUpdate(oldMember, newMember) {
        return new Promise((resolve, reject) => {
            (async () => {
                if (oldMember["_roles"] !== newMember["_roles"] || oldMember.nickname !== newMember.nickname) {
                    let flag = false;
                    const {guild} = oldMember;
                    let obj = await global.srvcol.findOne({"srv": guild.id});
                    if ((parseInt(`${oldMember.joinedTimestamp}`) + 7500) < new Date().valueOf()) {
                        const look = {srv: guild.id, userid: newMember.id};
                        if (!!(await global.persistcol.findOne(look))) {
                            const duser = {nickname: newMember.nickname, roles: newMember["_roles"]};
                            await global.persistcol.updateOne(look, {$set: duser});
                        } else {
                            const duser = {
                                srv: guild.id,
                                userid: newMember.id,
                                nickname: newMember.nickname,
                                roles: newMember["_roles"]
                            };
                            await global.persistcol.insertOne(duser);
                        }
                    }
                    const exampleEmbed = await EmbedCreator.Create(false, `**User Updated:**`, false, guild.name, guild.iconURL(), `${oldMember.user.globalName || oldMember.user.username} (${oldMember.user.username})`, oldMember.displayAvatarURL(), 0xff9900, []);
                    if (oldMember.nickname !== newMember.nickname) {
                        exampleEmbed.addFields([{
                            name: "Nickname Changed",
                            value: `Old Nickname: ${oldMember.nickname || "**None**"}\nNew Nickname: ${newMember.nickname || "**None**"}`,
                            inline: false
                        }]);
                        flag = true;
                    }
                    let rolesadd = newMember["_roles"].filter(role => oldMember["_roles"].indexOf(role) === -1);
                    let rolesrem = oldMember["_roles"].filter(role => newMember["_roles"].indexOf(role) === -1);
                    if (rolesadd.length > 0) {
                        rolesadd = rolesadd.map(role => role = `<@&${role}>`);
                        exampleEmbed.addFields([{name: "Added Roles:", value: `${rolesadd}`, inline: false}]);
                        flag = true;
                    }
                    if (rolesrem.length > 0) {
                        rolesrem = rolesrem.map(role => role = `<@&${role}>`);
                        exampleEmbed.addFields([{name: "Removed Roles:", value: `${rolesrem}`, inline: false}]);
                        flag = true;
                    }
                    const now = new Date();
                    const utcString = now.toUTCString();
                    if (await essentials.checkFocus(newMember.id, guild.id)) {
                        let newMessageContent;
                        if (!oldMember.communicationDisabledUntil && newMember.communicationDisabledUntil && newMember.communicationDisabledUntil !== oldMember.communicationDisabledUntil) {
                            newMessageContent = `**USER TIMED OUT UNTIL: ${newMember.communicationDisabledUntil.toUTCString()}!**`
                        } else {
                            newMessageContent = `**USER TIME-OUT EXPIRED!**`
                        }
                        newMessageContent += `\n-# **Time:** ${utcString}`;
                        const obj = await global.focuscol.findOne({
                            "userid": newMember.id,
                            "srv": guild.id
                        });
                        const ch = await global.client.channels.cache.get(obj.ch);
                        await ch.send({
                            content: newMessageContent,
                            allowedMentions: {parse: []}
                        });
                    }
                    if (obj.userupdate === "none" || !obj || !flag) {
                        return;
                    } else {
                        if (((guild.members.me).permissionsIn(obj.userupdate).has(PermissionFlagsBits.SendMessages) && (guild.members.me).permissionsIn(obj.userupdate).has(PermissionFlagsBits.ViewChannel)) || (guild.members.me).permissionsIn(obj.userupdate).has(PermissionFlagsBits.Administrator))
                            await client.channels.cache.get(obj.userupdate).send({embeds: [exampleEmbed]});
                        else
                            return;
                    }
                }
                resolve(true);
            })();
        });
    };

    static UserUpdate(oldUser, newUser) {
        return new Promise((resolve, reject) => {
            (async () => {
                let flag = false;
                await client.guilds.cache.forEach(guild => {
                    (async () => {
                        if (guild.members.cache.has(newUser.id)) {
                            let obj = await global.srvcol.findOne({"srv": guild.id});
                            const member = guild.members.cache.find(member => member.id === oldUser.id);
                            if (oldUser.username !== newUser.username || oldUser.globalName !== newUser.globalName || oldUser.avatar !== newUser.avatar || oldUser.system !== newUser.system || oldUser.bot) {
                                const exampleEmbed = await EmbedCreator.Create(false, `**User Updated:**`, false, guild.name, guild.iconURL(), `${newUser.globalName || newUser.username} (${newUser.username})`, newUser.displayAvatarURL(), 0xff9900, []);
                                if (oldUser.username !== newUser.username) {
                                    if (await essentials.checkFocus(oldUser.id, guild.id)) {
                                        const now = new Date();
                                        const utcString = now.toUTCString();
                                        let newMessageContent = `**USER HAS CHANGED USERNAME: ${newUser.username}!**`
                                        newMessageContent += `\n-# **Time:** ${utcString}`;
                                        const obj = await global.focuscol.findOne({
                                            "userid": oldUser.id,
                                            "srv": guild.id
                                        });
                                        const ch = await global.client.channels.cache.get(obj.ch);
                                        await ch.setName(`focus-${newUser.username}`);
                                        await ch.send({
                                            content: newMessageContent,
                                            allowedMentions: {parse: []}
                                        });
                                    }
                                    exampleEmbed.addFields([{
                                        name: "Username Changed",
                                        value: `Old Username: ${oldUser.username}\nNew Username: ${newUser.username}`,
                                        inline: false
                                    }]);
                                    flag = true;
                                }
                                if (oldUser.globalName !== newUser.globalName) {
                                    if (await essentials.checkFocus(oldUser.id, guild.id)) {
                                        const now = new Date();
                                        const utcString = now.toUTCString();
                                        let newMessageContent = `**[${utcString}] USER HAS CHANGED GLOBAL / DISPLAY NAME: ${newUser.globalName}!**`

                                        const obj = await global.focuscol.findOne({
                                            "userid": oldUser.id,
                                            "srv": guild.id
                                        });
                                        const ch = await global.client.channels.cache.get(obj.ch);
                                        await ch.send({
                                            content: newMessageContent,
                                            allowedMentions: {parse: []}
                                        });
                                    }
                                    exampleEmbed.addFields([{
                                        name: "Global Name Changed",
                                        value: `Old Global Name: ${oldUser.globalName || "**None**"}\nNew Global Name: ${newUser.globalName || "**None**"}`,
                                        inline: false
                                    }]);
                                    flag = true;
                                }
                                if (oldUser.avatar !== newUser.avatar) {
                                    if (await essentials.checkFocus(oldUser.id, guild.id)) {
                                        const now = new Date();
                                        const utcString = now.toUTCString();
                                        let newMessageContent = `**USER HAS CHANGED PROFILE PICTURE!**`
                                        newMessageContent += `\n-# **Time:** ${utcString}`;
                                        const obj = await global.focuscol.findOne({
                                            "userid": oldUser.id,
                                            "srv": guild.id
                                        });
                                        const ch = await global.client.channels.cache.get(obj.ch);
                                        await ch.send({
                                            content: newMessageContent,
                                            files: [newUser.displayAvatarURL()],
                                            allowedMentions: {parse: []}
                                        });
                                    }
                                    exampleEmbed.setThumbnail(newUser.displayAvatarURL());
                                    exampleEmbed.addFields([{
                                        name: "Avatar Changed",
                                        value: `Old Avatar: ${oldUser.displayAvatarURL()}\nNew Avatar: ${newUser.displayAvatarURL()}`,
                                        inline: false
                                    }]);
                                    flag = true;
                                }
                                if (obj.userupdate === "none" || !obj || !flag) {
                                    return;
                                }
                                if (oldUser.system !== newUser.system) {
                                    exampleEmbed.addFields([{
                                        name: "User \"System\" Status Changed",
                                        value: `Old \"System\" Status: ${oldUser.system}\nOld \"Bot\" Status: ${newUser.system}`,
                                        inline: false
                                    }]);
                                    flag = true;
                                }
                                if (oldUser.bot !== newUser.bot) {
                                    exampleEmbed.addFields([{
                                        name: "User \"Bot\" Status Changed",
                                        value: `Old \"Bot\" Status: ${oldUser.bot}\nOld \"Bot\" Status: ${newUser.bot}`,
                                        inline: false
                                    }]);
                                    flag = true;
                                } else {
                                    if (((guild.members.me).permissionsIn(obj.userupdate).has(PermissionFlagsBits.SendMessages) && (guild.members.me).permissionsIn(obj.userupdate).has(PermissionFlagsBits.ViewChannel)) || (guild.members.me).permissionsIn(obj.userupdate).has(PermissionFlagsBits.Administrator))
                                        await client.channels.cache.get(obj.userupdate).send({embeds: [exampleEmbed]});
                                }
                            }
                        }
                    })();
                });
                resolve(true);
            })();
        });
    };

    static GuildUpdate(oGuild, nGuild) {
        return new Promise((resolve, reject) => {
            (async () => {
                if ((oGuild.name !== nGuild.name) || (oGuild.iconURL() !== nGuild.iconURL())) {
                    const look = {srv: oGuild.id};
                    const upd = {$set: {name: nGuild.name, icon: nGuild.iconURL()}};
                    await global.srvcol.updateOne(look, upd);
                }
                resolve(true);
            })();
        });
    };

    static VoiceState(oldState, newState) {
        return new Promise((resolve, reject) => {
            (async () => {
                const newChan = newState.channel;
                const oldChan = oldState.channel;
                if (newChan?.id === "1422378190122385529") {
                    const overwrite = await global.channelscol.findOne({
                        "srv": newState.guild.id,
                        "channelID": newChan.id,
                        "userID": newState.member.user.id
                    });
                    if (!overwrite && newState.member.user.id !== "275305152842301440") {
                        await newState.disconnect();
                        let dmChannel = await client.users.createDM(newState.member.user.id);
                        await dmChannel.send(`Please message Carp before trying to join this channel!`);
                    }
                }
                if (oldChan?.id && !newChan?.id) { //leave
                    let overwrites = await global.channelscol.find({
                        "srv": oldState.guild.id,
                        "channelID": oldChan.id
                    }).toArray();
                    if (!!overwrites.length > 0) {
                        if (oldChan.members.size < 1) {
                            if (await (oldChan.permissionOverwrites.cache).find(exp => exp.type === 1)) {
                                for (const overwrite of overwrites) {
                                    const members = await newState.guild.members.fetch();
                                    const member = await members.find(m => m.id === overwrite.userID);
                                    await oldChan.permissionOverwrites.delete(member.user);
                                    await global.channelscol.deleteOne({
                                        "srv": oldState.guild.id,
                                        "channelID": oldChan.id,
                                        "userID": overwrite.userID
                                    })
                                }
                            }
                        } else {
                            const overwrite = await global.channelscol.findOne({
                                "srv": newState.guild.id,
                                "channelID": oldChan.id,
                                "userID": newState.member.user.id
                            });
                            if (!!overwrite) {
                                if (await (oldChan.permissionOverwrites.cache).find(exp => exp.type === 1 && exp.id === overwrite.userID)) {
                                    const members = await newState.guild.members.fetch();
                                    const member = await members.find(m => m.id === overwrite.userID);
                                    await oldChan.permissionOverwrites.delete(member.user);
                                    await global.channelscol.deleteOne({
                                        "srv": oldState.guild.id,
                                        "channelID": oldChan.id,
                                        "userID": overwrite.userID
                                    })
                                }
                            }
                        }
                    }
                    if ((await essentials.checkFocus(oldState.member.id, oldState.guild.id))) {
                        const now = new Date();
                        const utcString = now.toUTCString();
                        let newMessageContent = `**USER HAS LEFT VOICE CHANNEL: ${oldChan}!**`
                        if (oldChan.members.size > 0) {
                            newMessageContent += "\n**Remaining Participants:**\n"
                            oldChan.members.forEach(m => {
                                newMessageContent += `- ${m}\n`
                            });
                        }
                        newMessageContent += `\n-# **Time:** ${utcString}`;

                        const obj = await global.focuscol.findOne({
                            "userid": oldState.member.id,
                            "srv": oldState.guild.id
                        });
                        const ch = await global.client.channels.cache.get(obj.ch);
                        await ch.send({
                            content: newMessageContent,
                            allowedMentions: {parse: []}
                        });
                    }
                    oldChan.members.forEach(m => {
                        (async () => {
                            if (await essentials.checkFocus(m.id, newState.guild.id) && m.id !== newState.member.id) {
                                const now = new Date();
                                const utcString = now.toUTCString();
                                let newMessageContent = `**VOICE CHANNEL PARTICIPANT LEFT: ${newState.member}!**`
                                newMessageContent += `\n-# Voice Channel: ${oldChan.name}, **Time:** ${utcString}`;
                                const obj = await global.focuscol.findOne({
                                    "userid": m.id,
                                    "srv": newState.guild.id
                                });
                                const ch = await global.client.channels.cache.get(obj.ch);
                                await ch.send({
                                    content: newMessageContent,
                                    allowedMentions: {parse: []}
                                });
                            }
                        })()
                    })
                } else if (!oldChan?.id && newChan?.id) { //join
                    if (await essentials.checkFocus(newState.member.id, newState.guild.id)) {
                        const now = new Date();
                        const utcString = now.toUTCString();
                        let newMessageContent = `**USER HAS JOINED VOICE CHANNEL: ${newChan}!**`
                        newMessageContent += `\n-# **Time:** ${utcString}`;
                        if (newChan.members.size > 1) {
                            newMessageContent += "\n**Other Participants:**\n"
                            newChan.members.forEach(m => {
                                if (m.id !== newState.member.id)
                                    newMessageContent += `- ${m}\n`
                            });
                        }

                        const obj = await global.focuscol.findOne({
                            "userid": newState.member.id,
                            "srv": newState.guild.id
                        });
                        const ch = await global.client.channels.cache.get(obj.ch);
                        await ch.send({
                            content: newMessageContent,
                            allowedMentions: {parse: []}
                        });
                    }
                    newChan.members.forEach(m => {
                        (async () => {
                            if (await essentials.checkFocus(m.id, newState.guild.id) && m.id !== newState.member.id) {
                                const now = new Date();
                                const utcString = now.toUTCString();
                                let newMessageContent = `**NEW VOICE CHANNEL PARTICIPANT: ${newState.member}!**`
                                newMessageContent += `\n-# Voice Channel: ${newChan.name}, **Time:** ${utcString}`;

                                const obj = await global.focuscol.findOne({
                                    "userid": m.id,
                                    "srv": newState.guild.id
                                });
                                const ch = await global.client.channels.cache.get(obj.ch);
                                await ch.send({
                                    content: newMessageContent,
                                    allowedMentions: {parse: []}
                                });
                            }
                        })()
                    })
                }
                if ((newChan && oldChan) && newChan !== oldChan) { //move
                    if (await essentials.checkFocus(newState.member.id, newState.guild.id)) {
                        const now = new Date();
                        const utcString = now.toUTCString();
                        let newMessageContent = `**USER HAS MOVED VOICE CHANNELS.**\nOld Channel: ${oldChan}. New Channel: ${newChan}!`
                        newMessageContent += `\n-# **Time:** ${utcString}`;
                        if (oldChan.members.size > 0) {
                            newMessageContent += "\n**Old Channel Participants:**\n"
                            oldChan.members.forEach(m => {
                                newMessageContent += `- ${m}\n`
                            });
                        }
                        if (newChan.members.size > 1) {
                            newMessageContent += "\n**New Channel Participants:**\n"
                            newChan.members.forEach(m => {
                                if (m.id !== newState.member.id)
                                    newMessageContent += `- ${m}\n`
                            });
                        }

                        const obj = await global.focuscol.findOne({
                            "userid": newState.member.id,
                            "srv": newState.guild.id
                        });
                        const ch = await global.client.channels.cache.get(obj.ch);
                        await ch.send({
                            content: newMessageContent,
                            allowedMentions: {parse: []}
                        });
                    }
                    let overwrites = await global.channelscol.find({
                        "srv": oldState.guild.id,
                        "channelID": oldChan.id
                    }).toArray();
                    if (!!overwrites.length > 0) {
                        if (oldChan.members.size < 1) {
                            if (await (oldChan.permissionOverwrites.cache).find(exp => exp.type === 1)) {
                                for (const overwrite of overwrites) {
                                    const members = await newState.guild.members.fetch();
                                    const member = await members.find(m => m.id === overwrite.userID);
                                    await oldChan.permissionOverwrites.delete(member.user);
                                    await global.channelscol.deleteOne({
                                        "srv": oldState.guild.id,
                                        "channelID": oldChan.id,
                                        "userID": overwrite.userID
                                    })
                                }
                            }
                        } else {
                            const overwrite = await global.channelscol.findOne({
                                "srv": newState.guild.id,
                                "channelID": oldChan.id,
                                "userID": newState.member.user.id
                            });
                            if (!!overwrite) {
                                if (await (oldChan.permissionOverwrites.cache).find(exp => exp.type === 1 && exp.id === overwrite.userID)) {
                                    const members = await newState.guild.members.fetch();
                                    const member = await members.find(m => m.id === overwrite.userID);
                                    await oldChan.permissionOverwrites.delete(member.user);
                                    await global.channelscol.deleteOne({
                                        "srv": oldState.guild.id,
                                        "channelID": oldChan.id,
                                        "userID": overwrite.userID
                                    })
                                }
                            }
                        }
                    }
                }
                if (oldState.selfDeaf !== newState.selfDeaf && (newChan && oldChan)) {
                    if (await essentials.checkFocus(newState.member.id, newState.guild.id)) {
                        const now = new Date();
                        const utcString = now.toUTCString();
                        let newMessageContent;
                        if (newState.selfDeaf) {
                            newMessageContent = `**USER HAS SELF DEAFENED!**`
                        } else {
                            newMessageContent = `**USER HAS SELF UN-DEAFENED!**`
                        }
                        newMessageContent += `\n-# Voice Channel: ${newChan.name}, **Time:** ${utcString}`;
                        const obj = await global.focuscol.findOne({
                            "userid": newState.member.id,
                            "srv": newState.guild.id
                        });
                        const ch = await global.client.channels.cache.get(obj.ch);
                        await ch.send({
                            content: newMessageContent,
                            allowedMentions: {parse: []}
                        });
                    }
                }
                if (oldState.selfMute !== newState.selfMute && (newChan && oldChan) && !newState.selfDeaf) {
                    if (await essentials.checkFocus(newState.member.id, newState.guild.id)) {
                        const now = new Date();
                        const utcString = now.toUTCString();
                        let newMessageContent;
                        if (newState.selfMute) {
                            newMessageContent = `**USER HAS SELF MUTED!**`
                        } else {
                            if (!oldState.selfDeaf)
                                newMessageContent = `**USER HAS SELF UN-MUTED!**`
                        }
                        newMessageContent += `\n-# Voice Channel: ${newChan.name}, **Time:** ${utcString}`;
                        const obj = await global.focuscol.findOne({
                            "userid": newState.member.id,
                            "srv": newState.guild.id
                        });
                        const ch = await global.client.channels.cache.get(obj.ch);
                        await ch.send({
                            content: newMessageContent,
                            allowedMentions: {parse: []}
                        });
                    }
                }
                if (oldState.serverMute !== newState.serverMute && (newChan && oldChan)) {
                    if (await essentials.checkFocus(newState.member.id, newState.guild.id)) {
                        const now = new Date();
                        const utcString = now.toUTCString();
                        let newMessageContent;
                        if (newState.serverMute) {
                            newMessageContent = `**USER WAS SERVER MUTED!**`
                        } else {
                            newMessageContent = `**USER WAS SERVER UN-MUTED!**`
                        }
                        newMessageContent += `\n-# Voice Channel: ${newChan.name}, **Time:** ${utcString}`;
                        const obj = await global.focuscol.findOne({
                            "userid": newState.member.id,
                            "srv": newState.guild.id
                        });
                        const ch = await global.client.channels.cache.get(obj.ch);
                        await ch.send({
                            content: newMessageContent,
                            allowedMentions: {parse: []}
                        });
                    }
                }
                if (oldState.serverDeaf !== newState.serverDeaf && (newChan && oldChan)) {
                    if (await essentials.checkFocus(newState.member.id, newState.guild.id)) {
                        const now = new Date();
                        const utcString = now.toUTCString();
                        let newMessageContent;
                        if (newState.serverDeaf) {
                            newMessageContent = `**USER WAS SERVER DEAFENED!**`
                        } else {
                            newMessageContent = `**USER WAS SERVER UN-DEAFENED!**`
                        }
                        newMessageContent += `\n-# Voice Channel: ${newChan.name}, **Time:** ${utcString}`;
                        const obj = await global.focuscol.findOne({
                            "userid": newState.member.id,
                            "srv": newState.guild.id
                        });
                        const ch = await global.client.channels.cache.get(obj.ch);
                        await ch.send({
                            content: newMessageContent,
                            allowedMentions: {parse: []}
                        });
                    }
                }
                resolve(true);
            })();
        });
    };

    static PresenceUpdate(oldPresence, newPresence) {
        return new Promise((resolve, reject) => {
            (async () => {
                if (!!newPresence?.member && newPresence?.guild && !newPresence?.member?.user?.bot) {
                    const oStatus = oldPresence?.status ?? 'UNKNOWN';
                    const nStatus = newPresence?.status ?? 'UNKNOWN';
                    if (oStatus !== nStatus) {
                        if (await essentials.checkFocus(newPresence.member.id, newPresence.guild.id)) {
                            const now = new Date();
                            const utcString = now.toUTCString();
                            let newMessageContent = `**USER `
                            if (nStatus === "offline")
                                newMessageContent += `HAS GONE OFFLINE**!`;
                            else if (oStatus === "offline") {
                                newMessageContent += `HAS COME ONLINE**!`;
                            } else if (nStatus === "idle") {
                                newMessageContent += `IS NOW AWAY**!`;
                            } else if (oStatus === "idle" && (nStatus === "dnd" || nStatus === "online")) {
                                newMessageContent += `IS NO LONGER AWAY**!`;
                            } else {
                                return;
                            }
                            newMessageContent += `\n-# **Time:** ${utcString}`;
                            const obj = await global.focuscol.findOne({
                                "userid": newPresence.member.id,
                                "srv": newPresence.guild.id
                            });
                            const ch = await global.client.channels.cache.get(obj.ch);
                            await ch.send({
                                content: newMessageContent,
                                allowedMentions: {parse: []}
                            });
                        }
                    }
                }
                resolve(true);
            })();
        });
    }

    static GuildDelete(guild) {
        return new Promise((resolve, reject) => {
            (async () => {
                await global.srvcol.deleteOne({srv: guild.id});
                await global.persistcol.deleteMany({srv: guild.id});
                resolve(true);
            })();
        });
    };

    static GuildCreate(guild) {
        return new Promise((resolve, reject) => {
            (async () => {
                if (!(await global.srvcol.findOne({"srv": guild.id}))) {
                    const obj = {
                        srv: guild.id,
                        name: guild.name,
                        icon: guild.iconURL(),
                        delete: "none",
                        update: "none",
                        join: "none",
                        leave: "none",
                        bans: "none",
                        command: "none",
                        joinstat: "none",
                        leavestat: "none",
                        banstat: "none",
                        userupdate: "none",
                        rolepersiustence: false,
                        joinmsg: "Welcome {@user}!!!",
                        leavemsg: "Goodbye!\n{@user} left the server. :(",
                        banmsg: "{@user} has been banned from {servername}!",
                        ismsgembed: false,
                        defaultnick: "",
                        autodelist: [],
                        joinroles: [],
                        editlog: [],
                        banlist: [],
                        secretkeys: [],
                        fishmode: false
                    };
                    await global.srvcol.insertOne(obj);
                }
                resolve(true);
            })();
        });
    };
};

module.exports = guildEvents;