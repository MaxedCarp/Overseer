const {  PermissionFlagsBits } = require('discord.js');
const EmbedCreator = require('./embedcreator.js');
const essentials = require('./essentials.js');
const { StdioServerTransport }  = require('@modelcontextprotocol/sdk/server/stdio.js');
const { Anthropic } = require("@anthropic-ai/sdk");
const {anthropicApiKey, anthropicBaseURL, contact} = require('../config.json');
const fetch = (url, init) => import('node-fetch').then(module => module.default(url, init));

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
				const { guild } = message
				let aimsg = false;
				if ((message.content.startsWith("<@1366170194254364855> ") || message.content.startsWith("<@1205253895258120304> ") || (message.reference)) && message.author.id === contact) {
					if (message.reference && ((await message?.fetchReference())?.author?.id !== "1366170194254364855" && (await message?.fetchReference())?.author?.id !== "1205253895258120304"))
						return;
					aimsg = true;
					const MCPClient = await import('./MCPClient.js');
					const mcpClient = new MCPClient.default({
						anthropicApiKey: anthropicApiKey,
						anthropicBaseURL: anthropicBaseURL || "https://api.anthropic.com"});
					let str = message.content.replace("<@1366170194254364855> ", "").replace("<@1205253895258120304> ", "");
					const regex = /<(?:@!?|@&|#)(\d{17,19})>/g;
					const ids = [];
					let match;
					while ((match = regex.exec(str)) !== null) {
						ids.push(match[1]); // match[1] contains just the ID.
					}
					let editedmsg = str;
					let id;
					for (id of ids){
						let usr = await message.guild.members.cache.get(id).user;
						editedmsg = await editedmsg.replace(`<@${id}>`, usr.globalName || usr.username);
					}
					await global.aicol.insertOne({srv: message.guild.id, role: "user",
						content: [{type: "text", text: editedmsg}]});
					await message.channel.sendTyping();
					let resp = await mcpClient.submitQuery(message.guild.id);
					await essentials.sleep(5);
					try {
						while (resp.content.length < 1) {
							resp = await mcpClient.submitQuery(message.guild.id);
							await essentials.sleep(5);
						}
					}
					catch (err){
						console.error(err);
					}
					await global.aicol.insertOne({srv: message.guild.id, role: "assistant",
						content: resp.content});
					let updres = resp.content[0].text;
					if (resp.content[0].text.includes("{cetuscycle}") || resp.content[0].text.includes("{cetustime}")){
						try {
							const response = await fetch('https://api.warframestat.us/pc/cetusCycle');
							console.log(response);
							const data = await response.json();

							updres = resp.content[0].text.replaceAll("{cetuscycle}", data.state).replaceAll("{cetustime}", data.timeLeft);
						} catch (error) {
							console.error('Error fetching cycle data:', error);
						}
					}
					await message.reply(updres);
				}
				let obj = await global.srvcol.findOne({ "srv": guild.id});
				if (obj.autodelist.find(id => id === message.author.id))
				{
					await message.delete();
					return;
				}
				const attachm = message.attachments.map(attach => { return { fileName: attach.name, attachurl: attach.url, fileType: attach.contentType } });
				const msgobj = { messageID: message.id, messageContent: message.content, messageAttachments: attachm, messageAuthor: { userID: message.author.id, userName: message.author.username, globalName: message.author.globalName, avatar: message.author.avatar, avatarURL: message.author.displayAvatarURL() }, messageChannelID: message.channel.id, messageServerID: message.guild.id, expire: new Date(Date.now() + 1209600000)};
				await global.msgcol.insertOne(msgobj);
				const msgcontlow = message.content.toLowerCase();
				if (obj.fishmode === true) {
					if (guild.id === "1190516697174659182" && (msgcontlow.includes("limbo") || msgcontlow.includes("limbible") || message.content.includes("<@528963161622052915>")))
						await message.react("🎩");
					const msgsplit = msgcontlow.split(' ');
					let flag = true;
					for (let prt of msgsplit) {
						let fishtest = await global.fishcol.findOne({ "name": prt })
						if (!!fishtest || message.content.includes("🐟") || msgcontlow.includes("sci-fi freak")){
							if (flag){
								await message.react("🐟");
								flag = false;
							}
						}
					}
					if (msgcontlow.includes("you know what that means"))
						await message.reply("🐟FISH!");
					if (msgcontlow.includes("ghoti")){
						await message.reply("Sorry, not a real word...").then(async msg => {
							await essentials.sleep(5);
							msg.delete();
							message.delete();
							return -1;
						})
					}
				}
				if (message.content.includes("<@1205253895258120304>") && !aimsg)
					await message.reply("Yes, how may I assist?");

				const member = guild.members.cache.find(member => member.id === message.author.id);
				if (!(guild.members.me).permissions.has(PermissionFlagsBits.ManageRoles))
					return;
				const query = (await global.secretkeyscol.aggregate([
					{
						$match: {
							srv: guild.id,
							$text: { $search: msgcontlow },
						}
					},
					{
						$addFields: {
							score: { $meta: "textScore" }
						}
					},
					{
						$sort: { score: -1 }
					}
				]).toArray())?.[0];
				if (msgcontlow.includes(query?.key)) {
					let role = guild.roles.cache.find(role => role.id === query.roleID);
					if (!member.roles.cache.has(role) && role.editable && (parseInt(`${member.joinedTimestamp}`) + (parseInt(query.agereq) * 1000)) < new Date().valueOf()) {
						member.roles.add(role);
					}
				}
			})();
		});
	};
	
	static MessageDelete(message){
		return new Promise((resolve) => {
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
					let resembed;
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
					let resembed ;
				
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
		return new Promise((resolve) => {
			(async () => {
				const messages2 = messages.filter(msg => (!msg?.author?.bot || !msg.author) && !!msg.content);
				
				if (messages2.length < 1)
					return;

				let test = [];
				for (let i =0; i < messages2.length; i++) {
					if (!!messages2.at(i))
						test.push(messages2.at(i));
				}
				let msg;
				let guild;
				let chan;
				let msgcount = test.length;
				for (let i = test.length - 1; i >= 0; i--) {
					let message = test[i];
					if (!(await global.msgcol.findOne({"messageID": message.id})))
						return;
					message = await global.msgcol.findOne({"messageID": message.id});
					guild = await client.guilds.fetch(message.guildId);
					msg = await global.msgcol.findOne({"messageID": message.id});
					chan = msg.messageChannelID;
					await global.msgcol.deleteOne({ "messageID": message.id });
				}
				let resembed = await EmbedCreator.Create(`Message${msgcount > 1 ? "s **BULK**" : ""} Deleted in: <#${chan}>`, `${msgcount} Message${msgcount > 1 ? "s" : ""} Deleted`, false, guild.name, guild.iconURL(), `Overseer`, `https://maxedcarp.net/imgs/overseer.png`, 0xFA042A, []);
				let obj = await global.srvcol.findOne({ "srv": guild.id });
				if (obj.delete === "none" || !obj)
					return;
				if (((guild.members.me).permissionsIn(obj.delete).has(PermissionFlagsBits.SendMessages) && (guild.members.me).permissionsIn(obj.delete).has(PermissionFlagsBits.ViewChannel)) || (guild.members.me).permissionsIn(obj.delete).has(PermissionFlagsBits.Administrator))
					await client.channels.cache.get(obj.delete).send({ embeds: [resembed] });
				else
					return;
				resolve(true);
			})();
		});
	}

	static MessageUpdate(omessage, nmessage){
		return new Promise((resolve) => {
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
				await global.msgcol.updateOne(look, upd);
				resolve(true);
			})();
		});		
	}

}

module.exports = messageEvents;