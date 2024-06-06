const { SlashCommandBuilder } = require('@discordjs/builders');
const { PermissionFlagsBits} = require('discord.js');


module.exports = {

    data: new SlashCommandBuilder()
        .setName('queue')
        .setDescription('Displays the current queue')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .setDMPermission(false),

    async execute(interaction, { updateQueueMessage, queueChannelId }) {
        if (!queueChannelId) {
            await interaction.reply({ content: 'Queue channel is not set. Please set the queue channel first.', ephemeral: true });
            return;
        }

        await updateQueueMessage();
        await interaction.reply({ content: 'Updated the queue message', ephemeral: true });
    }
};
