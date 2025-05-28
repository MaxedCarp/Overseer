const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
module.exports = {
	data: new SlashCommandBuilder()
		.setName('secretkeys')
		.setDescription('Manages secret keyset roles')
		.addSubcommand(subcommand =>
		subcommand
			.setName('add')
			.setDescription('Adds a new secret role keyset.')
			.addStringOption(option =>
            option.setName('key')
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
			.addStringOption(option =>
            option.setName('key')
                .setDescription('Key to be deleted')
				.setRequired(true)))
		.addSubcommand(subcommand =>
		subcommand
			.setName('list')
			.setDescription('list all secret role keysets.'))
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),
	async execute(interaction) {
		const sub = interaction.options.getSubcommand();
		const key = interaction.options.getString('key');
		const role = interaction.options.getRole('role');
		const agereq = interaction.options.getInteger('agerequirement');
		switch(sub) {
			case "add":
				await global.secretkeyscol.insertOne({srv: interaction.guild.id, key: key.toLowerCase(), roleID: role.id, agereq: agereq});
				await interaction.reply({ content: `Successfully added role "${role}" with the keyword(s) "${key.toLowerCase()}"! Required age: ${agereq} seconds.`, ephemeral: true });
			break;
			case "delete":
				if (!!(await global.secretkeyscol.findOne())) {
					await global.secretkeyscol.deleteOne({srv: interaction.guild.id, key: key.toLowerCase()});
					await interaction.reply({content: `Key "${key.toLowerCase()}" deleted successfully!`, ephemeral: true});
				}
				else {
					await interaction.reply({content: `Key "${key.toLowerCase()}" does not exist!`, ephemeral: true});
				}
			break;
			case "list":
				const secretkeylist = new EmbedBuilder()
					.setColor(0x69FA04)
					.setTitle(`Secret Key List`)
					.setAuthor({ name: `${interaction.user.username}`, iconURL: `${interaction.member.displayAvatarURL()}` })
					.setFooter({ text: interaction.guild.name, iconURL: interaction.guild.iconURL() });
					var list = "";
					const keys = await global.secretkeyscol.find({srv: interaction.guild.id}).toArray();
					for (key of keys) {
						list += `(${keys.indexOf(key)}) Key: ${key.key}. Role: <@&${key.roleID}>. Minimum Age: ${key.agereq} seconds.\n\n`;
					}
					secretkeylist.setDescription(list);
					await interaction.reply({ embeds: [secretkeylist], ephemeral: true });
				break;
			default: return;
		}
	},
};