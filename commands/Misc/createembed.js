const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
module.exports = {
	data: new SlashCommandBuilder()
		.setName('createembed')
		.setDescription('Sends an Embed')
		.addStringOption(option =>
            option.setName('title')
                .setDescription('Embed Title')
                .setRequired(true))
		.addStringOption(option =>
            option.setName('titleurl')
                .setDescription('Embed Title URL'))
		.addStringOption(option =>
            option.setName('description')
                .setDescription('Embed Description'))
		.addStringOption(option =>
            option.setName('thumbnail')
                .setDescription('Embed Thumbnail'))
		.addStringOption(option =>
            option.setName('author')
                .setDescription('Embed Author'))
		.addStringOption(option =>
            option.setName('authorimg')
                .setDescription('Embed Author Image'))
		.addStringOption(option =>
            option.setName('image')
                .setDescription('Embed Image'))
		.addStringOption(option =>
            option.setName('fields')
                .setDescription('Embed Fields'))
		.addStringOption(option =>
            option.setName('fielddesc')
                .setDescription('Embed Field Descriptions'))
		.addStringOption(option =>
            option.setName('fieldinline')
                .setDescription('Embed Field Inlines'))
		.addIntegerOption(option =>
            option.setName('color')
			.setDescription('Embed Color'))
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
	async execute(interaction) {
		const title = interaction.options.getString('title');
		const titleurl = interaction.options.getString('titleurl');
		const desc = interaction.options.getString('description');
		const thumb = interaction.options.getString('thumbnail');
		const author = interaction.options.getString('author');
		const authorimg = interaction.options.getString('authorimg');
		const img = interaction.options.getString('image');
		const fields = interaction.options.getString('fields');
		const fieldesc = interaction.options.getString('fielddesc');
		const inlines = interaction.options.getString('fieldinline');
		const color = interaction.options.getInteger('color');
		const exampleEmbed = new EmbedBuilder();
		if (color)
			exampleEmbed.setColor(color);
        exampleEmbed.setTitle(title);
		if (titleurl)
			exampleEmbed.setURL(titleurl);
		if (desc){
			desc2 = desc.replaceAll("\\n", "\n");
			exampleEmbed.setDescription(desc2);
		}
		if (thumb)
			exampleEmbed.setThumbnail(thumb);
		if (author)
			if (authorimg)
				exampleEmbed.setAuthor({ name: author, iconURL: authorimg });
		if (img)
			exampleEmbed.setImage(img);
		if (inlines){
			var ninlines = inlines.split(',');
			var newinlines = [];
			ninlines.forEach(v => {
				if (v === 't')
					newinlines.push(true);
				else
					newinlines.push(false);
			});
			console.log(newinlines);
		}
		if (fields){
			fieldesc2 = fieldesc.replaceAll("\\n", "\n");
			let splitfield = fields.split('//, ');
			let splitfieldesc = fieldesc2.split('//, ');
			for (i = 0; i < splitfield.length; i++){
				if (inlines)
					exampleEmbed.addFields({ name: splitfield[i], value: splitfieldesc[i], inline: newinlines[i]});
				else
					exampleEmbed.addFields({ name: splitfield[i], value: splitfieldesc[i]});
			}
			
		}
        exampleEmbed.setFooter({ text: interaction.guild.name, iconURL: interaction.guild.iconURL() });
        await interaction.channel.send({ embeds: [exampleEmbed] });
		await interaction.reply({ content: "Embed posted successfully!", ephemeral: true });
	},
};