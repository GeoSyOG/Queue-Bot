const { SlashCommandBuilder } = require('@discordjs/builders');
const { PermissionFlagsBits} = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('clearq')
        .setDescription('Clears the queue')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .setDMPermission(false),

    async execute(interaction, { queueCollection, updateQueueMessage, queueChannelId }) {
        if (!queueChannelId) {
            await interaction.reply({ content: 'Queue channel is not set. Please set the queue channel firt.', ephemeral: true });
            return;
        }

        await queueCollection.deleteMany({});
        await interaction.reply({ content: 'Cleared the queue', ephemeral: true });
        await updateQueueMessage();
    }
};
