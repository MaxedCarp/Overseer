const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const fs2 = require('../../fsfuncs')
const path = require('node:path');
const dataset = require('../Modules/dataset.js');
module.exports = {
	data: new SlashCommandBuilder()
		.setName('secretkeys')
		.setDescription('Manages secret keyset roles')
		.addSubcommand(subcommand =>
		subcommand
			.setName('add')
			.setDescription('Adds a new secret role keyset.')
			.addStringOption(option =>
            option.setName('keyset')
                .setDescription('A keyword or a sentence to be detected')
				.setRequired(true))
			.addRoleOption(option =>
            option.setName('role')
                .setDescription('A role to be added')
				.setRequired(true))
			.addIntegerOption(option =>
            option.setName('agerequirement')
                .setDescription('A minimum amount of time the user has to be in the server before gaining the role.')
				.setRequired(true)))
		.addSubcommand(subcommand =>
		subcommand
			.setName('delete')
			.setDescription('Deletes a secret role keyset.')
			.addIntegerOption(option =>
            option.setName('index')
                .setDescription('Index of the keyset to be deleted')
				.setRequired(true)))
		.addSubcommand(subcommand =>
		subcommand
			.setName('list')
			.setDescription('list all secret role keysets.'))
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),
	async execute(interaction) {
		const sub = interaction.options.getSubcommand();
		const keyset = interaction.options.getString('keyset');
		const role = interaction.options.getRole('role');
		const agereq = interaction.options.getInteger('agerequirement');
		const index = interaction.options.getInteger('index');
		switch(sub) {
			case "add":
				await dataset.addSecretKey(interaction.guild.id, keyset.toLowerCase(), role.id, agereq);
				await interaction.reply({ content: `Successfully added role "${role}" with the keyword(s) "${keyset.toLowerCase()}"! Required age: ${agereq} seconds.`, ephemeral: true });
			break;
			case "delete":
				await dataset.delSecretKey(interaction.guild.id, index);
				await interaction.reply({ content: `Successfully deleted keyset at index ${index}!`, ephemeral: true });
			break;
			case "list":
			const secretkeylist = new EmbedBuilder()
				.setColor(0x69FA04)
				.setTitle(`Secret Key List`)
				.setAuthor({ name: `${interaction.user.username}`, iconURL: `${interaction.member.displayAvatarURL()}` })
				.setFooter({ text: interaction.guild.name, iconURL: interaction.guild.iconURL() });
				var list = "";
				const data = await global.srvcol.findOne({srv: interaction.guild.id});
				data.secretkeys.forEach(obj => {
					list += `(${data.secretkeys.indexOf(obj)}) Keyword(s): ${obj.key}. Role: <@&${obj.roleID}>. Minimum Age: ${obj.agereq} seconds.\n\n`;
				});
				secretkeylist.setDescription(list);
				await interaction.reply({ embeds: [secretkeylist], ephemeral: true });
			break;
			default: return;
		}
		//await interaction.reply({ content: `${sub} channel successfully set to <#${interaction.channel.id}>!`, ephemeral: true });
	},
};