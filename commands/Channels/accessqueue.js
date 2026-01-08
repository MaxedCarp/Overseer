const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('accessqueue')
        .setDescription('Manage the voice channel access queue')
        .addSubcommand(subcommand =>
            subcommand
                .setName('add')
                .setDescription('Add a user to the access queue')
                .addUserOption(option =>
                    option.setName('user')
                        .setDescription('User to add to queue')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('list')
                .setDescription('List all users in the access queue'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('remove')
                .setDescription('Remove a user from the access queue')
                .addIntegerOption(option =>
                    option.setName('index')
                        .setDescription('Queue index to remove')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('push')
                .setDescription('Push access queue to a voice channel')
                .addChannelOption(option =>
                    option.setName('channel')
                        .setDescription('Voice channel')
                        .setRequired(true)
                        .addChannelTypes(2))) // GuildVoice = 2
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();

        if (subcommand === 'add') {
            const user = interaction.options.getUser('user');

            // Check if user is already in the queue
            const exists = await global.voicecol.findOne({
                type: "queue",
                id: user.id,
                srv: interaction.guild.id
            });

            if (exists) {
                await interaction.reply({
                    content: `User ${user} is already in the access queue!`,
                    ephemeral: true
                });
                return;
            }

            // Add user to the queue
            await global.voicecol.insertOne({
                type: "queue",
                id: user.id,
                srv: interaction.guild.id
            });

            await interaction.reply({
                content: `User ${user} has been added to the access queue!`,
                ephemeral: true
            });
        }

        if (subcommand === 'push') {
            const channel = interaction.options.getChannel('channel');

            // Check if bot has access to the channel
            if (!((interaction.guild.members.me).permissionsIn(channel).has(PermissionFlagsBits.ViewChannel) || (interaction.guild.members.me).permissions.has(PermissionFlagsBits.Administrator))) {
                await interaction.reply({
                    content: `My apologies, I do not have access to the specified channel. Please make sure I can see it first!`,
                    ephemeral: true
                });
                return;
            }

            // Get all queued users for this server
            const queuedUsers = await global.voicecol.find({
                type: "queue",
                srv: interaction.guild.id
            }).toArray();

            if (queuedUsers.length === 0) {
                await interaction.reply({
                    content: `The access queue is empty!`,
                    ephemeral: true
                });
                return;
            }

            let addedCount = 0;
            let skippedCount = 0;

            // Process each user in the queue
            for (const queueEntry of queuedUsers) {
                try {
                    // Check if user is in the server
                    const member = await interaction.guild.members.fetch(queueEntry.id);

                    if (!member) {
                        continue;
                    }

                    // Check if user already has access
                    const exists = channel.permissionOverwrites.cache.find(overwrite => overwrite.id === member.id && overwrite.type === 1);

                    if (!exists) {
                        // Grant permissions
                        await channel.permissionOverwrites.create(member.user, {ViewChannel: true, Connect: true, Speak: true});

                        // Add to channelscol for tracking
                        await global.channelscol.insertOne({
                            srv: interaction.guild.id,
                            channelID: channel.id,
                            userID: member.id
                        });

                        addedCount++;
                    } else {
                        skippedCount++;
                    }
                } catch (error) {
                    // User not in server or other error - silently skip
                }
            }

            // Remove all processed users from the queue
            await global.voicecol.deleteMany({
                type: "queue",
                srv: interaction.guild.id
            });

            let statusMessage = `Pushed ${addedCount} user(s) to ${channel}!`;
            if (skippedCount > 0) {
                statusMessage += ` (${skippedCount} skipped - already had access)`;
            }

            await interaction.reply({
                content: statusMessage,
                ephemeral: true
            });
        }

        if (subcommand === 'list') {
            const queuedUsers = await global.voicecol.find({
                type: "queue",
                srv: interaction.guild.id
            }).toArray();

            const queueEmbed = new EmbedBuilder()
                .setColor(0x69FA04)
                .setTitle(`Access Queue List`)
                .setAuthor({ name: `${interaction.user.username}`, iconURL: `${interaction.member.displayAvatarURL()}` })
                .setFooter({ text: interaction.guild.name, iconURL: interaction.guild.iconURL() });

            if (queuedUsers.length > 0) {
                let list = "";
                for (let i = 0; i < queuedUsers.length; i++) {
                    list += `(${i}). User: <@${queuedUsers[i].id}>.\n\n`;
                }
                queueEmbed.setDescription(list);
            } else {
                queueEmbed.setDescription("The access queue is empty!");
            }

            await interaction.reply({ embeds: [queueEmbed], ephemeral: true });
        }

        if (subcommand === 'remove') {
            const index = interaction.options.getInteger('index');

            const queuedUsers = await global.voicecol.find({
                type: "queue",
                srv: interaction.guild.id
            }).toArray();

            if (queuedUsers.length === 0) {
                await interaction.reply({
                    content: `The access queue is empty!`,
                    ephemeral: true
                });
                return;
            }

            if (index >= queuedUsers.length || index < 0) {
                await interaction.reply({
                    content: `Index out of range! Valid indices: 0-${queuedUsers.length - 1}`,
                    ephemeral: true
                });
                return;
            }

            const userToRemove = queuedUsers[index];

            await global.voicecol.deleteOne({
                type: "queue",
                id: userToRemove.id,
                srv: interaction.guild.id
            });

            await interaction.reply({
                content: `Successfully removed <@${userToRemove.id}> from the access queue (index ${index})!`,
                ephemeral: true
            });
        }
    },
};
