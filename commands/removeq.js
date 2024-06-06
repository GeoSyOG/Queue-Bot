const { SlashCommandBuilder } = require('@discordjs/builders');
const { PermissionFlagsBits} = require('discord.js');


module.exports = {
    data: new SlashCommandBuilder()
        .setName('removeq')
        .setDescription('Removes a user from the queue')
        .addUserOption(option => option.setName('user').setDescription('The user to remove').setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .setDMPermission(false),

async execute(interaction, { queueCollection, updateQueueMessage, queueChannelId }) {
    if (!queueChannelId) {
        await interaction.reply({ content: 'Queue channel is not set. Please set the queue channel first.', ephemeral: true });
        return;
    }

    const user = interaction.options.getUser('user');
    const userInQueue = await queueCollection.findOne({ 'user.id': user.id });

    if (userInQueue) {
        await queueCollection.deleteOne({ '_id': userInQueue._id });
        await interaction.reply({ content: `Removed ${user.tag} from the queue`, ephemeral: true });
        await updateQueueMessage();
    } else {
        await interaction.reply({ content: `${user.tag} is not in the queue`, ephemeral: true });
    }
}
};
