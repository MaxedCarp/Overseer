class purgeset {
    static getImages(channel, lim, sor) {
        return new Promise((resolve) => {
            const look = {
                $and: [{
                    messageChannelID: channel,
                    $or: [{"messageAttachments.fileType": "image/png"}, {"messageAttachments.fileType": "image/jpeg"}, {"messageAttachments.fileType": "image/webp"}]
                }]
            };
            const data = global.msgcol.find(look).limit(lim).sort({"_id": sor}).toArray();
            resolve(data);
        });
    }

    static getAttachments(channel, lim, sor) {
        return new Promise((resolve) => {
            const look = {
                $and: [{
                    messageChannelID: channel,
                    messageAttachments: {$not: {$eq: []}},
                    "messageAttachments.fileType": {$not: {$eq: "text/css; charset=utf-8"}}
                }]
            };
            const data = global.msgcol.find(look).limit(lim).sort({"_id": sor}).toArray();
            resolve(data);
        });
    }

    static getVideos(channel, lim, sor) {
        return new Promise((resolve) => {
            const look = {
                $and: [{
                    messageChannelID: channel,
                    $or: [{"messageAttachments.fileType": "video/mp4"}, {"messageAttachments.fileType": "video/mkv"}]
                }]
            };
            const data = global.msgcol.find(look).limit(lim).sort({"_id": sor}).toArray();
            resolve(data);
        });
    }

    static getGIFs(channel, lim, sor) {
        return new Promise((resolve) => {
            const look = {$and: [{messageChannelID: channel, "messageAttachments.fileType": "image/gif"}]};
            const data = global.msgcol.find(look).limit(lim).sort({"_id": sor}).toArray();
            resolve(data);
        });
    }

    static getAudio(channel, lim, sor) {
        return new Promise((resolve) => {
            const look = {
                $and: [{
                    messageChannelID: channel,
                    $or: [{"messageAttachments.fileType": "audio/mpeg"}, {"messageAttachments.fileType": "audio/mp3"}, {"messageAttachments.fileType": "audio/m4a"}]
                }]
            };
            const data = global.msgcol.find(look).limit(lim).sort({"_id": sor}).toArray();
            resolve(data);
        });
    }

    static any(interaction, lim) {
        return new Promise((resolve) => {
            (async () => {
                const look = {"messageChannelID": interaction.channel.id};
                let msgs = await global.msgcol.find(look).sort({"_id": -1}).limit(lim).toArray();
                let chatmsgs = [];
                for (let i = 0; i < msgs.length; i++) {
                    try {
                        let chatmsg = await interaction.channel.messages.fetch(msgs[i].messageID);
                        await chatmsgs.push(chatmsg);
                    } catch (err) {
                        await global.msgcol.deleteOne({"messageID": msgs[i].messageID});
                    }
                }
                await interaction.channel.bulkDelete(chatmsgs);
                await interaction.reply({content: `Successfully deleted ${chatmsgs.length} messages!`, ephemeral: true})
                resolve(true);
            })();
        });
    }

    static async user(interaction, user, lim, locale = false) {
        let look;
        if (locale) {
            look = {"messageServerID": interaction.guild.id, "messageAuthor.userID": user.id};
        } else {
            look = {"messageChannelID": interaction.channel.id, "messageAuthor.userID": user.id};
        }
        let msgs = await global.msgcol.find(look).sort({"_id": -1}).limit(lim).toArray();
        const comp = {};
        let chatmsgs = [];
        for (let i = 0; i < msgs.length; i++) {
            try {
                const channel = await global.client.channels.fetch(msgs[i].messageChannelID);
                let chatmsg = await channel.messages.fetch(msgs[i].messageID);
                comp[chatmsg.channel.id] = {msgs: [], name: chatmsg.channel.id};
                comp[chatmsg.channel.id].push(chatmsg);
                chatmsgs.push(chatmsg);
            } catch (err) {
                await global.msgcol.deleteOne({"messageID": msgs[i].messageID});
            }
        }
        //await interaction.channel.bulkDelete(chatmsgs);
        comp.forEach(c => {
            (async () => {
                const chan = await global.client.channels.fetch(c.name);
                await chan.bulkDelete(c.msgs);
            })();
        });

        if (!locale)
            return chatmsgs;
    }

    static async attach(interaction, lim, type, user) {
        const query = {messageChannelID: interaction.channel.id}
        if (!!user) {
            query["messageAuthor.userID"] = user;
        }
        if (type === "any") {
            query["messageAttachments"] = {$exists: true, $ne: []};
        } else {
            query["messageAttachments.fileType"] =
                (type !== "other" ?
                    (new RegExp(type, "i")) : {$in: [/application/i, null]});
        }
        let msgs = await global.msgcol.find(query).sort({"_id": -1}).limit(lim).toArray();
        let chatmsgs = [];
        for (let i = 0; i < msgs.length; i++) {
            try {
                let chatmsg = await interaction.channel.messages.fetch(msgs[i].messageID);
                chatmsgs.push(chatmsg);
            } catch (err) {
                await global.msgcol.deleteOne({"messageID": msgs[i].messageID});
            }
        }
        await interaction.channel.bulkDelete(chatmsgs);
        await interaction.reply({content: `Successfully deleted ${chatmsgs.length} messages!`, ephemeral: true});
    }
}

module.exports = purgeset;