const {SlashCommandBuilder, PermissionFlagsBits, ChannelType} = require('discord.js');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('hostmigration')
        .setDescription('Grant a user access to a channel for a limited time')
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('Voice channel to move to')
                .addChannelTypes(ChannelType.GuildVoice)
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.MoveMembers),
    async execute(interaction) {
        const channel = interaction.options.getChannel('channel');
        if (!((interaction.guild.members.me).permissionsIn(channel).has(PermissionFlagsBits.ViewChannel) || (interaction.guild.members.me).permissions.has(PermissionFlagsBits.Administrator)))
        {
            await interaction.reply({
                content: `My apologies, I do not have access to the specified channel. Please make sure I can see it first!`,
                ephemeral: true
            });
            return;
        }
        if (!interaction.member.voice.channel) {
            await interaction.reply({
                content: `My apologies, you must be in a voice channel to use this command!`,
                ephemeral: true
            });
            return;
        }
        console.log(channel.permissionOverwrites.cache);
        await interaction.member.voice.channel.members.forEach((member) => {
            member.voice.setChannel(channel);
        });
        await interaction.reply({content: `Successfully moved all users to channel: ${channel.name} `, ephemeral: true});
    },
};