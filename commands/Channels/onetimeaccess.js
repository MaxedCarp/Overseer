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
        .setDefaultMemberPermissions(PermissionFlagsBits.MoveMembers),
    async execute(interaction) {
        const channel = interaction.options.getChannel('channel') || interaction?.member?.voice?.channel;
        const user = interaction.options.getUser('user');
        if (!((interaction.guild.members.me).permissionsIn(channel).has(PermissionFlagsBits.ViewChannel) || (interaction.guild.members.me).permissions.has(PermissionFlagsBits.Administrator)))
        {
            await interaction.reply({
                content: `My apologies, I do not have access to the specified channel. Please make sure I can see it first!`,
                ephemeral: true
            });
            return;
        }
        if (!interaction.member.voice.channel && !interaction.options.getChannel('channel')) {
            await interaction.reply({
                content: `My apologies, you must be in a voice channel or specify one to use this command!`,
                ephemeral: true
            });
            return;
        }
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