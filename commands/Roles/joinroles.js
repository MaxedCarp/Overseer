const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
module.exports = {
	data: new SlashCommandBuilder()
		.setName('joinroles')
		.setDescription('Manages join roles list')
		.addSubcommand(subcommand =>
		subcommand
			.setName('add')
			.setDescription('Adds a new role to be given on join.')
			.addRoleOption(option =>
            option.setName('role')
                .setDescription('A role to be added')
				.setRequired(true)))
		.addSubcommand(subcommand =>
		subcommand
			.setName('remove')
			.setDescription('Remove a join role.')
			.addIntegerOption(option =>
            option.setName('index')
                .setDescription('Index of the role to be removed')
				.setRequired(true)))
		.addSubcommand(subcommand =>
		subcommand
			.setName('list')
			.setDescription('List all roles given on join.'))
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),
	async execute(interaction) {
		const sub = interaction.options.getSubcommand();
		const role = interaction.options.getRole('role');
		const index = interaction.options.getInteger('index');
		switch(sub) {
			case "add":
				const data = await global.srvcol.findOne({srv: interaction.guild.id});
				if (data.joinroles.indexOf(role.id) === -1) {
					data.joinroles.push(role.id);
					const look = {srv: interaction.guild.id};
					const test = { joinroles: data.joinroles};
					const upd = { $set: test };
					await global.srvcol.updateOne(look, upd);
				}
				await interaction.reply({ content: `Successfully added role "${role}" to be added on join!`, ephemeral: true });
			break;
			case "remove":
				const data2 = await global.srvcol.findOne({srv: interaction.guild.id});
				if (index >= (data2.joinroles.length) && data2.joinroles.length > 0) {
					await interaction.reply({ content: `Index too big!`, ephemeral: true });
				}
				if (data2.joinroles.length > 0 && index < (data2.joinroles.length)) {
					const roles = data2.joinroles.filter(eRole => eRole !== data2.joinroles[index]);
					const look = {srv: interaction.guild.id};
					const test = { joinroles: roles};
					const upd = { $set: test };
					await global.srvcol.updateOne(look, upd);
					await interaction.reply({ content: `Successfully removed join role at index ${index}!`, ephemeral: true });
				}
				else if (index < (data2.joinroles.length))
					await interaction.reply({ content: `There are no join roles on this server!`, ephemeral: true });
			break;
			case "list":
				const joinrolelist = new EmbedBuilder()
				.setColor(0x69FA04)
				.setTitle(`Join Role List`)
				.setAuthor({ name: `${interaction.user.username}`, iconURL: `${interaction.member.displayAvatarURL()}` })
				.setFooter({ text: interaction.guild.name, iconURL: interaction.guild.iconURL() });
				var list = "";
				const data3 = await global.srvcol.findOne({srv: interaction.guild.id});
				if (data3.joinroles.length > 0) {
					for (let eRole of data3.joinroles) {
						list += `(${data3.joinroles.indexOf(eRole)}). Role: <@&${eRole}>.\n\n`;
					}
					joinrolelist.setDescription(list);
				}
				else
					joinrolelist.setDescription("There are no join roles on this server!");
				await interaction.reply({ embeds: [joinrolelist], ephemeral: true });
			break;
			default: return;
		}
	},
};