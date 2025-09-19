const {SlashCommandBuilder, PermissionFlagsBits, ChannelType} = require('discord.js');
const {essentials} = require('../../Event_Modules/essentials.js')
module.exports = {
    data: new SlashCommandBuilder()
        .setName('unfocus')
        .setDescription('Unfocus a user')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('User to grant access to the channel for')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction) {
        const user = interaction.options.getUser('user');
        const isFocus = await essentials.checkFocus(user.id, interaction.guild.id);
        if (!isFocus) {
            await interaction.reply({content: "My apologies, but this user is not currently being focused!", ephemeral: true});
        } else {
            const obj = await global.focuscol.findOne({"userid": user.id, "srv": interaction.guild.id});
            const ch = await global.client.channels.cache.get(obj.ch);
            await ch.delete();
            await global.focuscol.deleteOne({srv: interaction.guild.id, userid: user.id})
            await interaction.reply({
                content: `No longer focusing on user ${user}!`,
                ephemeral: true
            });
        }
    },
};