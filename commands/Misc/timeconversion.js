const { SlashCommandBuilder,  PermissionFlagsBits } = require('discord.js');
const essentials = require('../../Event_Modules/essentials.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('timeconversion')
		.setDescription('Converts a time string to a unit of your choice')
		.addStringOption(option =>
			option.setName('unit')
				.setDescription('Time unit to convert to')
				.setRequired(true)
				.addChoices(
					{ name: 'Years', value: 'year' },
					{ name: 'Months', value: 'month' },
					{ name: 'Weeks', value: 'week' },
					{ name: 'Days', value: 'day' },
					{ name: 'Hours', value: 'hour' },
					{ name: 'Minutes', value: 'minute' },
					{ name: 'Seconds', value: 'second' },
					{ name: 'Milliseconds', value: 'milliseconds' },
				))
		.addStringOption(option =>
            option.setName('time')
                .setDescription('Time')
                .setRequired(true))
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
	async execute(interaction) {
		const unit = interaction.options.getString('unit')
		const time = await essentials.parsetime(interaction.options.getString('time'), unit);
		await interaction.reply({ content: `${interaction.options.getString('time')} = ${Math.floor(time)} ${unit}(s)!`, ephemeral: true });
	},
};