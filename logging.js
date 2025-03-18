const { EmbedBuilder } = require('discord.js');
class loggi {
    static msgDelEmbed(content, author, channel, isbulk){
		let bulk = "";
		if (isbulk)
			bulk = " bulk";
		const exampleEmbed = new EmbedBuilder()
            .setColor(0xFA042A)
            .setTitle(`Message${bulk} deleted in: ${channel}`)
			.setDescription(content)
			.setAuthor({ name: `${author.username} (${author.displayName})`, iconURL: author.displayAvatarURL() })
			.setFooter({ text: 'Raging Catfish', iconURL: "https://maxedcarp.net/imgs/rcf.png" });
		return exampleEmbed;
	}
	static imgDelEmbed(img, author, channel, isbulk){
		let bulk = "";
		if (isbulk)
			bulk = " bulk";
		const exampleEmbed = new EmbedBuilder()
            .setColor(0xFA042A)
            .setTitle(`Image${bulk} deleted in: ${channel}`)
			.setAuthor({ name: `${author.username} (${author.displayName})`, iconURL: author.displayAvatarURL() })
			.setImage(img)
			.setFooter({ text: 'Raging Catfish', iconURL: "https://maxedcarp.net/imgs/rcf.png" });
		return exampleEmbed;
	}
}
module.exports = loggi;