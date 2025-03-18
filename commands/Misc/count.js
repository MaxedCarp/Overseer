const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const purgeset = require('../Command_Modules/purgeset.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('count')
		.setDescription('Counts')
		.addSubcommand(subcommand =>
		subcommand
			.setName('attachments')
			.setDescription('Counts how many attachments exist in the channel\'s database.'))
		.addSubcommand(subcommand =>
		subcommand
			.setName('images')
			.setDescription('Counts how many images exist in the channel\'s database.'))
		.addSubcommand(subcommand =>
		subcommand
			.setName('gifs')
			.setDescription('Counts how many gifs exist in the channel\'s database.'))
		.addSubcommand(subcommand =>
		subcommand
			.setName('videos')
			.setDescription('Counts how many videos exist in the channel\'s database.'))
		.addSubcommand(subcommand =>
		subcommand
			.setName('audio')
			.setDescription('Counts how many audio files exist in the channel\'s database.'))
			.setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
	async execute(interaction) {
		const sub = interaction.options.getSubcommand();
		var test;
		switch(sub) {
			case "images": 
				test = await purgeset.getImages(interaction.channel.id, 1000000, -1);
				await interaction.reply({ content: `There are ${test.length} images in this channel's database!`, ephemeral: true });
				break;
			case "attachments": 
				test = await purgeset.getAttachments(interaction.channel.id, 1000000, -1);
				await interaction.reply({ content: `There are ${test.length} attachments in this channel's database!`, ephemeral: true });
				break;
			case "gifs": 
				test = await purgeset.getGIFs(interaction.channel.id, 1000000, -1);
				await interaction.reply({ content: `There are ${test.length} GIFs in this channel's database!`, ephemeral: true });
				break;
			case "videos": 
				test = await purgeset.getVideos(interaction.channel.id, 1000000, -1);
				await interaction.reply({ content: `There are ${test.length} videos in this channel's database!`, ephemeral: true });
				break;
			case "audio": 
				test = await purgeset.getAudio(interaction.channel.id, 1000000, -1);
				await interaction.reply({ content: `There are ${test.length} audio files in this channel's database!`, ephemeral: true });
				break;
		}
	},
};