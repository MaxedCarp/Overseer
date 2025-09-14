const {SlashCommandBuilder, PermissionFlagsBits, ChannelType} = require('discord.js');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('movealltochannel')
        .setDescription('Grant a user access to a channel for a limited time')
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('Voice channel to move to')
                .addChannelTypes(ChannelType.GuildVoice)
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
    async execute(interaction) {
        if (!interaction.member.voice.channel) {
            await interaction.reply({
                content: `You must be in a voice channel to use this command!`,
                ephemeral: true
            });
            return;
        }
        const channel = interaction.options.getChannel('channel');
        console.log(channel.permissionOverwrites.cache);
        await interaction.member.voice.channel.members.forEach((member) => {
            member.voice.setChannel(channel);
        });
        await interaction.reply({content: `Successfully moved all users to channel: ${channel.name} `, ephemeral: true});
    },
};