const {SlashCommandBuilder, PermissionFlagsBits, ChannelType} = require('discord.js');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('focus')
        .setDescription('Focus on a user\'s actions')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('User to grant access to the channel for')
                .setRequired(true))
        .addChannelOption(option =>
            option.setName('category')
                .setDescription('Parent category works')
                .setRequired(true)
                .addChannelTypes(ChannelType.GuildCategory))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction) {
        const user = interaction.options.getUser('user');
        const newChannel = await interaction.guild.channels.create({
            name: `focus-${user.username}`,
            type: ChannelType.GuildText,
            parent: interaction.options.getChannel('category')
        });
        await newChannel.setTopic(`This channel will log every action user with ID "${user.id}" takes.`);
        await global.focuscol.insertOne({srv: interaction.guild.id, userid: user.id, ch: newChannel.id})
        await interaction.reply({
            content: `Now focusing on user ${user} in channel ${newChannel}!`,
            ephemeral: true
        });
    },
};