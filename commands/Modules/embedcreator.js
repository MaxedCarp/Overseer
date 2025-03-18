const { EmbedBuilder } = require('discord.js');
class embedcreator {
    static Create(title, description, image, footer, footericon, author, authoricon, color, fields) {
		return new Promise((resolve, reject) => {
			const embed = new EmbedBuilder();
			if (color)
				embed.setColor(color);
			if (title || " ")
				embed.setTitle(title || " ");
			if (description)
				embed.setDescription(description || " ");
			if (author && authoricon)
				embed.setAuthor({ name: author, iconURL: authoricon });
			if (footer && footericon)
				embed.setFooter({ text: footer, iconURL: footericon });
			if (fields.length > 0) {
				let newFields = []
				fields.forEach(field => {
					if (field.value.length > 2500)
						field.value = field.value.substring(0,2500);
					if (field.value.length <= 1024 && field.value.length > 0)
						newFields.push(field);
					else {
						if (field.value.length > 0) {
							newFields.push({name: field.name || " ", value: (field.value.substring(0,1024) || " "), inline: field.inline});
							let field2 = field.value.substring(1024,field.value.length);
							while (field2.length >= 1024) {
								newFields.push({name: " ", value: field2.substring(0,1024), inline: field.inline})
								field2 = field2.substring(1024,field2.length);
							}
							newFields.push({name: " ", value: field2.substring(0,field2.length), inline: field.inline});
						}
					}
				});
				embed.addFields(newFields);
			}
			if (image)
				embed.setImage(image);
			resolve(embed);
		});
    }
}
module.exports = embedcreator;