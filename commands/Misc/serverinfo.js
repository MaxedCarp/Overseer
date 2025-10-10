const {SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits} = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('serverinfo')
        .setDescription('Prints all known Server information'),
    async execute(interaction) {
        const guild = interaction.guild;
        const bots = guild.members.cache.filter(m => !!m.user.bot);
        const users = guild.members.cache.filter(m => !m.user.bot);
        const sounds = await guild.soundboardSounds.fetch()
        const stats = new EmbedBuilder()
            .setColor(0xfa8b2a)
            .setTitle(guild.name)
            .setDescription("**Server Description**\n" + guild.description)
            .setThumbnail(guild.iconURL())
            .addFields(
                {name: "Owner", value: `<@${guild.ownerId}>`},
                {name: "Server ID", value: guild.id},
                {name: "Server Icon", value: guild.iconURL()},
                {name: "Member Count", value: users.size + "", inline: true},
                {name: "Bot Count", value: bots.size + "", inline: true},
                {name: "Total", value: guild.memberCount + "", inline: true},
                {name: "Emojis", value: guild.emojis.cache.size + "", inline: true},
                {name: "Stickers", value: guild.stickers.cache.size + "", inline: true},
                {name: "Soundboards", value: sounds.size + "", inline: true}
            )
            .setFooter({text: guild.name, iconURL: guild.iconURL()});
        await interaction.reply({embeds: [stats], ephemeral: true});
    },
};