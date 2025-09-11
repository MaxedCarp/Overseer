const {EmbedBuilder, PermissionFlagsBits} = require('discord.js');
const EmbedCreator = require('./embedcreator.js');
const {overwrite} = require("zod/v4");

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
                                    exampleEmbed.addFields([{
                                        name: "Username Changed",
                                        value: `Old Username: ${oldUser.username}\nNew Username: ${newUser.username}`,
                                        inline: false
                                    }]);
                                    flag = true;
                                }
                                if (oldUser.globalName !== newUser.globalName) {
                                    exampleEmbed.addFields([{
                                        name: "Global Name Changed",
                                        value: `Old Global Name: ${oldUser.globalName || "**None**"}\nNew Global Name: ${newUser.globalName || "**None**"}`,
                                        inline: false
                                    }]);
                                    flag = true;
                                }
                                if (oldUser.avatar !== newUser.avatar) {
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
                                    else
                                        return;
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
                if (oGuild.name !== nGuild.name) {
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
                if (oldChan?.id && !newChan?.id) {
                    let overwrites = await global.channelscol.find({
                        "srv": oldState.guild.id,
                        "channelID": oldChan.id
                    }).toArray();
                    if (!!overwrites.length > 0) {
                        if (await (oldChan.permissionOverwrites.cache).find(exp => exp.type === 1) && oldChan.members.size < 1) {
                            for (const overwrite of overwrites) {
                                const members = await oldState.guild.members.fetch();
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
                } else {
                    const overwrite = await global.channelscol.findOne({
                        "srv": newState.guild.id,
                        "channelID": newChan.id,
                        "userID": newState.member.user.id
                    });
                    if (!!overwrite) {
                        if ((newChan.permissionOverwrites.cache).find(exp => exp.id === overwrite.userID && exp.type === 1)) {
                            const members = await newState.guild.members.fetch();
                            const member = members.find(m => m.id === overwrite.userID);
                            await newChan.permissionOverwrites.delete(member.user);
                            await global.channelscol.deleteOne({
                                "srv": newState.guild.id,
                                "channelID": newChan.id,
                                "userID": overwrite.userID
                            })
                        }
                    }
                }

                resolve(true);
            })();
        });
    };

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