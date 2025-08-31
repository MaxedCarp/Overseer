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
        if (!locale)
        	await interaction.reply({content: `Successfully deleted ${chatmsgs.length} messages!`, ephemeral: true});
    }
    static async attach(interaction, lim, type, user) {
        let look;
        if (!user) {
            if (type === "any") {
                look = {messageChannelID: interaction.channel.id, messageAttachments: {$exists: true, $ne: []}}
            }
            else if (type !== "other") {
                look = {messageChannelID: interaction.channel.id, "messageAttachments.fileType": (new RegExp(type, "i"))}
            }
            else {
                look = {messageChannelID: interaction.channel.id, "messageAttachments.fileType": {$in: [/application/i, null]}}
            }
        } else {
            if (type === "any") {
            look = {
                messageChannelID: interaction.channel.id, "messageAuthor.userID": user, messageAttachments: {$exists: true, $ne: []}}
            }
            else if (type !== "other") {
                look = {messageChannelID: interaction.channel.id, "messageAuthor.userID": user, "messageAttachments.fileType": (new RegExp(type, "i"))}
            }
            else {
                look = {messageChannelID: interaction.channel.id, "messageAuthor.userID": user, "messageAttachments.fileType": {$in: [/application/i, null]}}
            }
        }
        let msgs = await global.msgcol.find(look).sort({"_id": -1}).limit(lim).toArray();
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