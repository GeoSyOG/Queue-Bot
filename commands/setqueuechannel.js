const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const { PermissionFlagsBits} = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setqueuechannel')
        .setDescription('Sets the queue channel')
        .addChannelOption(option => option.setName('channel').setDescription('The channel to set as queue channel').setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .setDMPermission(false),

async execute(interaction, { settingsCollection, queueMessage, updateQueueMessage, client }) {
    
    const channel = interaction.options.getChannel('channel');
    let queueChannelId = null; // Define queueChannelId
    const oldChannelId = queueChannelId;
    queueChannelId = channel.id;
    
        
        await settingsCollection.updateOne({ name: 'bot' }, { $set: { queueChannelId: channel.id } }, { upsert: true });

        // Move the queue message to the new channel if it exists
        if (queueMessage) {
            try {
                const newChannel = await client.channels.fetch(queueChannelId);
                const embed = new EmbedBuilder()
                    .setTitle('Current Queue')
                    .setDescription(queueMessage.embeds[0].description)
                    .setColor(0x00AE86);

                // Send the new message to the new channel
                const newQueueMessage = await newChannel.send({ embeds: [embed] });

                // Delete the old queue message
                await queueMessage.delete();

                // Update the queueMessage reference to the new message
                queueMessage = newQueueMessage;

                await interaction.reply({ content: `Queue channel has been set to ${channel.name} and the queue has been moved.`, ephemeral: true });
                await updateQueueMessage();
            } catch (error) {
                console.error('Failed to move the queue message:', error);
                await interaction.reply({ content: `Failed to move the queue message to ${channel.name}. Please check my permissions.`, ephemeral: true });
            }
        } else {
            await interaction.reply({ content: `Queue channel has been set to ${channel.name}.`, ephemeral: true });
        }
    }
};
