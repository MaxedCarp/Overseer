const {SlashCommandBuilder, PermissionFlagsBits} = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('talkingstick')
        .setDescription('Get the talking stick, rendering everyone else in your voice channel unable to speak.')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

    async execute(interaction) {
        // Validation: Check if user is in a voice channel
        if (!interaction.member.voice.channel) {
            await interaction.reply({
                content: `You must be in a voice channel to use this command!`,
                ephemeral: true
            });
            return;
        }

        const voiceChannel = interaction.member.voice.channel;

        // Validation: Check if bot has MuteMembers permission
        if (!interaction.guild.members.me.permissionsIn(voiceChannel).has(PermissionFlagsBits.MuteMembers)) {
            await interaction.reply({
                content: `My apologies, I don't have permission to mute members in ${voiceChannel}.`,
                ephemeral: true
            });
            return;
        }

        // Check current state (toggle logic)
        const talkingstickDoc = await global.voicecol.findOne({
            type: "talkingstick",
            srv: interaction.guild.id,
            channelID: voiceChannel.id
        });

        if (!talkingstickDoc) {
            // ACTIVATE talkingstick mode

            // Create channel marker document
            await global.voicecol.insertOne({
                type: "talkingstick",
                srv: interaction.guild.id,
                channelID: voiceChannel.id,
                initiatorID: interaction.user.id,
                timestamp: new Date()
            });

            // Mute all members except initiator
            const members = voiceChannel.members;
            let mutedCount = 0;

            for (const [memberId, member] of members) {
                if (memberId === interaction.user.id) continue; // Skip initiator
                if (member.user.bot) continue; // Skip bots

                const wasMuted = member.voice.serverMute;

                // Check if user already has tracking document (avoid duplicates)
                const existingMuteDoc = await global.voicecol.findOne({
                    type: "mute",
                    srv: interaction.guild.id,
                    userID: memberId
                });

                if (!existingMuteDoc) {
                    // Create tracking document (guild-wide, no channelID)
                    await global.voicecol.insertOne({
                        type: "mute",
                        srv: interaction.guild.id,
                        userID: memberId,
                        wasPreviouslyMuted: wasMuted,
                        mutedByTalkingstick: true
                    });
                }

                // Mute the member (only if not already muted)
                if (!wasMuted) {
                    try {
                        await member.voice.setMute(true);
                    } catch (error) {
                    }
                }
            }

            await interaction.reply({
                content: `You now have the talking stick! You are now the only one who can speak in ${voiceChannel}.`,
                ephemeral: true
            });

        } else {
            // DEACTIVATE talkingstick mode

            // Check if user is the initiator
            if (talkingstickDoc.initiatorID !== interaction.user.id) {
                await interaction.reply({
                    content: `My apologies, someone already has the talking stick in this channel.`,
                    ephemeral: true
                });
                return;
            }

            // Delete channel marker document first
            await global.voicecol.deleteOne({
                type: "talkingstick",
                srv: interaction.guild.id,
                channelID: voiceChannel.id
            });

            // Unmute everyone still in THIS channel who has mute tracking
            const remainingMembers = voiceChannel.members;
            let unmutedCount = 0;

            for (const [memberId, member] of remainingMembers) {
                const memberMuteDoc = await global.voicecol.findOne({
                    type: "mute",
                    srv: interaction.guild.id,
                    userID: memberId
                });

                if (memberMuteDoc) {
                    // Delete tracking document BEFORE unmuting to prevent race condition
                    // with manual unmute prevention handler
                    await global.voicecol.deleteOne({
                        type: "mute",
                        srv: interaction.guild.id,
                        userID: memberId
                    });

                    // Unmute if they weren't previously muted
                    if (!memberMuteDoc.wasPreviouslyMuted) {
                        try {
                            await member.voice.setMute(false);
                            unmutedCount++;
                        } catch (error) {
                        }
                    }
                }
            }

            await interaction.reply({
                content: `You no longer have the talking stick! All members have been unmuted.`,
                ephemeral: true
            });
        }
    },
};
