const {SlashCommandBuilder, PermissionFlagsBits, ChannelType} = require('discord.js');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('onetimeaccess')
        .setDescription('Grant a user access to a channel for a limited time')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('User to grant access to the channel for')
                .setRequired(true))
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('Voice channel to grant access to')
                .addChannelTypes(ChannelType.GuildVoice))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
    async execute(interaction) {
        const user = interaction.options.getUser('user');
        if (!interaction.member.voice.channel && !interaction.options.getChannel('channel')) {
            await interaction.reply({
                content: `You must be in a voice channel or specify one to use this command!`,
                ephemeral: true
            });
            return;
        }
        const channel = interaction.options.getChannel('channel') || interaction?.member?.voice?.channel;
        console.log(channel.permissionOverwrites.cache);
        const exists = (channel.permissionOverwrites.cache).find(overwrite => overwrite.id === user.id && overwrite.type === 1);
        if (!exists) {
            await channel.permissionOverwrites.create(user, {ViewChannel: true, Connect: true, Speak: true});
            await global.channelscol.insertOne({srv: interaction.guild.id, channelID: channel.id, userID: user.id})
            await interaction.reply({
                content: `User ${user} has been granted access to channel ${channel}!`,
                ephemeral: true
            });
        } else {
            await interaction.reply({content: `User already has access to this channel!`, ephemeral: true});
        }
    },
};