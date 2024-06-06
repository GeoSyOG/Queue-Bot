const { SlashCommandBuilder } = require('@discordjs/builders');
const { PermissionFlagsBits} = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('addq')
        .setDescription('Adds a user to the queue')
        .addUserOption(option => option.setName('user').setDescription('The user to add').setRequired(true))
        .addStringOption(option => option.setName('item').setDescription('The item for the queue').setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .setDMPermission(false),


    async execute(interaction, { queueCollection, updateQueueMessage, queueChannelId }) {
        if (!queueChannelId) {
            await interaction.reply({ content: 'Queue channel is not set. Please set the queue channel first.', ephemeral: true });
            return;
        }
        const user = interaction.options.getUser('user');
        const item = interaction.options.getString('item');

        await queueCollection.insertOne({ user, item });
        await interaction.reply({ content: `Added ${user.tag} to the queue with item: ${item}`, ephemeral: true });
        await updateQueueMessage();
    }
};
