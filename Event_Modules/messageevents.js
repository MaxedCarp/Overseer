const { Client, Collection, Events, GatewayIntentBits, Partials, ActivityType, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const srvcol2 = global.srvcol
const EmbedCreator = require('./embedcreator.js');
const essentials = require('./essentials.js');

class messageEvents {
	
	static MessageCreate(message) {
		return new Promise((resolve, reject) => {
			(async () => {
				if (!!message?.author?.bot)
					return;
				if (message.guild === null)
					return;
				const { guild } = message
				let obj = await global.srvcol.findOne({ "srv": guild.id});
				if (obj.autodelist.find(id => id === message.author.id))
				{
					await message.delete();
					return;
				}
				if (message.channel.type === 1)
					console.log(message.author.globalName + ": " + message.content);
				if (obj.fishmode === true) {
					if (message.content.toLowerCase().includes("limbo") || message.content.toLowerCase().includes("limbible"))
						await message.react("🎩");
					const msgsplit = message.content.toLowerCase().split(' ');
					let flag = true;
					msgsplit.forEach(async prt => {
						let fishtest = await global.fishcol.findOne({ "name": prt })
						if (!!fishtest || message.content.includes("🐟") || message.content.toLowerCase().includes("sci-fi freak")){
							if (flag){
								await message.react("🐟");
								flag = false;
							}
						}
					});
					if (message.content.toLowerCase().includes("you know what that means"))
						await message.reply("🐟FISH!");
					/*if (message.content.toLowerCase().includes("ghoti")){
						await message.reply("Sorry, not a real word...").then(async msg => {
							await essentials.sleep(5);
							msg.delete();
							message.delete();
						})
					}*/
				}
				if (message.content.includes("<@1205253895258120304>"))
					await message.reply("Yes, how may I assist?");
				
				const attachm = message.attachments.map(attach => { return { fileName: attach.name, attachurl: attach.url, fileType: attach.contentType } });
				const msgobj = { messageID: message.id, messageContent: message.content, messageAttachments: attachm, messageAuthor: { userID: message.author.id, userName: message.author.username, globalName: message.author.globalName, avatar: message.author.avatar, avatarURL: message.author.displayAvatarURL() }, messageChannelID: message.channel.id, messageServerID: message.guild.id, expire: new Date(Date.now() + 1209600000)};
				await global.msgcol.insertOne(msgobj);
				
				const member = guild.members.cache.find(member => member.id === message.author.id);
				const look = { srv: guild.id, 'secretkeys.key': message.content.toLowerCase() };
				const data = await global.srvcol.aggregate([{ $unwind: '$secretkeys' }, { $match: { srv: guild.id, 'secretkeys.key': message.content.toLowerCase() } }]);
				let test = [];
				for await (const doc of data) {
					test.push(doc);
				}
				if (!(guild.members.me).permissions.has(PermissionFlagsBits.ManageRoles))
					return;
				if (test[0]) {
					let role = guild.roles.cache.find(role => role.id === test[0].secretkeys.roleID);
					if (!member.roles.cache.has(role) && role.editable && (parseInt(`${member.joinedTimestamp}`) + (parseInt(test[0].secretkeys.agereq) * 1000)) < new Date().valueOf()) {
						member.roles.add(role);
					}
				}
			})();
		});
	};
	
	static MessageDelete(message){
		return new Promise((resolve, reject) => {
			(async () => {
				if (message.guild === null)
					return;
				if (!!message?.author?.bot)
					return;
				let obj = await global.srvcol.findOne({ "srv": message.guild.id });
				const existmsg = (await global.msgcol.findOne({ "messageID": message.id }) !== null);
				const { guild } = message;
				if (!!obj.autodelist.find(id => id === message?.author?.id))
				{
					let resembed = "";
					if (message.attachments.length < 1 || (message.attachments[0]?.contentType !== "image/png" && message.attachments[0]?.contentType !== "image/jpeg" && message.attachments[0]?.contentType !== "image/webp"))
						resembed = await EmbedCreator.Create(`Message Deleted in: <#${message.channel.id}>`, message.content || " ", false, guild.name, guild.iconURL(), `${message.author.globalName || message.author.username} (${message.author.username})`,message.author.displayAvatarURL(), 0xFA042A, []);
					else
						resembed = await EmbedCreator.Create(`Image Deleted in: <#${message.channel.id}>`, message.content || " ", message.attachments[0].url, guild.name, guild.iconURL(), `${message.author.globalName || message.author.username} (${message.author.username})`,message.author.displayAvatarURL(), 0xFA042A, []);
					if (obj.delete === "none" || !obj)
						return;
					if (((guild.members.me).permissionsIn(obj.delete).has(PermissionFlagsBits.SendMessages) && (guild.members.me).permissionsIn(obj.delete).has(PermissionFlagsBits.ViewChannel)) || (guild.members.me).permissionsIn(obj.delete).has(PermissionFlagsBits.Administrator))
						await client.channels.cache.get(obj.delete).send({ embeds: [resembed] });
					else
						return;
				}
				else {
					if (!existmsg)
						return;
					const msg = await global.msgcol.findOne({ "messageID": message.id });
					let resembed = "";
				
					if (msg.messageAttachments.length < 1 || (msg.messageAttachments[0]?.fileType !== "image/png" && msg.messageAttachments[0]?.fileType !== "image/jpeg") && msg.messageAttachments[0]?.fileType !== "image/webp")
						resembed = await EmbedCreator.Create(`Message Deleted in: <#${message.channelId}>`, msg.messageContent || " ", false, guild.name, guild.iconURL(), `${msg.messageAuthor.globalName || msg.messageAuthor.userName} (${msg.messageAuthor.userName})`, `https://cdn.discordapp.com/avatars/${msg.messageAuthor.userID}/${msg.messageAuthor.avatar}`, 0xFA042A, []);
					else
						resembed = await EmbedCreator.Create(`Image Deleted in: <#${message.channelId}>`, msg.messageContent || " ", msg.messageAttachments[0].attachurl, guild.name, guild.iconURL(), `${msg.messageAuthor.globalName || msg.messageAuthor.userName} (${msg.messageAuthor.userName})`, `https://cdn.discordapp.com/avatars/${msg.messageAuthor.userID}/${msg.messageAuthor.avatar}`, 0xFA042A, []);
					if (obj.delete === "none" || !obj)
						return;
					if (((guild.members.me).permissionsIn(obj.delete).has(PermissionFlagsBits.SendMessages) && (guild.members.me).permissionsIn(obj.delete).has(PermissionFlagsBits.ViewChannel)) || (guild.members.me).permissionsIn(obj.delete).has(PermissionFlagsBits.Administrator))
						await client.channels.cache.get(obj.delete).send({ embeds: [resembed] });
					else
						return;
					await global.msgcol.deleteOne({ "messageID": message.id });
				}
				resolve(true);
			})();
		});
	}

	static MessageBulkDelete(messages){
		return new Promise((resolve, reject) => {
			(async () => {
				const messages2 = messages.filter(msg => (!msg?.author?.bot || !msg.author) && !!msg.content);
				
				if (messages2.length < 1)
					return;
				let test = [];
				let i = 0;
				while (messages2.at(i)) {
					if (messages2.at(i) != undefined)
						test.push(messages2.at(i));
					i++;
				}
				for (let i = test.length - 1; i >= 0; i--) {
					let message = test[i];
					if (message.guild === null)
						return;
					if (!!message?.author?.bot)
						return;
					if (!(await global.msgcol.findOne({ "messageID": message.id })))
						return;
					const guild = await client.guilds.fetch(message.guildId);
					let msg = await global.msgcol.findOne({ "messageID": message.id });
					let resembed = "";
				
					if (msg.messageAttachments.length < 1 || (msg.messageAttachments[0]?.fileType !== "image/png" && msg.messageAttachments[0]?.fileType !== "image/jpeg"))
						resembed = await EmbedCreator.Create(`Message BULK Deleted in: <#${message.channelId}>`, msg.messageContent || " ", false, guild.name, guild.iconURL(), `${msg.messageAuthor.globalName || msg.messageAuthor.userName} (${msg.messageAuthor.userName})`, `https://cdn.discordapp.com/avatars/${msg.messageAuthor.userID}/${msg.messageAuthor.avatar}`, 0xFA042A, []);
					else
						resembed = await EmbedCreator.Create(`Image BULK Deleted in: <#${message.channelId}>`, msg.messageContent || " ", msg.messageAttachments[0].attachurl, guild.name, guild.iconURL(), `${msg.messageAuthor.globalName || msg.messageAuthor.userName} (${msg.messageAuthor.userName})`, `https://cdn.discordapp.com/avatars/${msg.messageAuthor.userID}/${msg.messageAuthor.avatar}`, 0xFA042A, []);
					
					let obj = await global.srvcol.findOne({ "srv": message.guild.id });
					if (obj.delete === "none" || !obj)
						return;
					if (((guild.members.me).permissionsIn(obj.delete).has(PermissionFlagsBits.SendMessages) && (guild.members.me).permissionsIn(obj.delete).has(PermissionFlagsBits.ViewChannel)) || (guild.members.me).permissionsIn(obj.delete).has(PermissionFlagsBits.Administrator))
						await client.channels.cache.get(obj.delete).send({ embeds: [resembed] });
					else
						return;
					await global.msgcol.deleteOne({ "messageID": message.id });
				};
				resolve(true);
			})();
		});
	}

	static MessageUpdate(omessage, nmessage){
		return new Promise((resolve, reject) => {
			(async () => {
				if (omessage.guild === null)
					return;
				if (!!omessage?.author?.bot)
					return;
				const existmsg = (await global.msgcol.findOne({ "messageID": omessage.id }) !== null);
				if (!existmsg)
					return;
				if (omessage.content === nmessage.content)
					return;
				const { guild } = omessage;
				const noldmsg = await global.msgcol.findOne({ "messageID": omessage.id });
				const exampleEmbed = await EmbedCreator.Create(false, `**Message Edited:** [Click to View](https://discord.com/channels/${nmessage.guild.id}/${nmessage.channel.id}/${nmessage.id})`, false, nmessage.guild.name, nmessage.guild.iconURL(), `${nmessage.author.globalName || nmessage.author.username} (${nmessage.author.username})`, nmessage.author.displayAvatarURL(), 0xf7ef02, [{ name: "Old Message:", value: `${noldmsg.messageContent}`, inline: false }, { name: "New Message:", value: `${nmessage.content}`, inline: false }]);
				let obj = await global.srvcol.findOne({ "srv": nmessage.guild.id })
				if (obj.update === "none" || !obj) {
					return;
				}
				else {
					if (((guild.members.me).permissionsIn(obj.update).has(PermissionFlagsBits.SendMessages) && (guild.members.me).permissionsIn(obj.update).has(PermissionFlagsBits.ViewChannel)) || (guild.members.me).permissionsIn(obj.update).has(PermissionFlagsBits.Administrator))
						await client.channels.cache.get(obj.update).send({ embeds: [exampleEmbed] });
					else
						return;
				}
				const look = { messageID: nmessage.id };
				const attachm = nmessage.attachments.map(attach => { return { fileName: attach.name, attachurl: attach.url, fileType: attach.contentType } });
				const test = { messageContent: nmessage.content, messageAttachments: attachm, };
				const upd = { $set: test };
				const data = await global.msgcol.updateOne(look, upd);
				resolve(true);
			})();
		});		
	}

};

module.exports = messageEvents;