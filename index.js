const { Client, GatewayIntentBits, Collection, EmbedBuilder, ActivityType } = require('discord.js');
const { token, mongoUri } = require('./config.json');
const { MongoClient } = require('mongodb');
const fs = require('fs');
const { url } = require('inspector');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

client.commands = new Collection();

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.data.name, command);
}

let queueCollection;
let settingsCollection;
let queueMessage = null;
let queueChannelId = null;

async function main() {
    const mongoClient = new MongoClient(mongoUri);

    try {
        await mongoClient.connect();
        console.log("Connected successfully to server");

        const db = mongoClient.db('mydb');
        queueCollection = db.collection('queue');
        settingsCollection = db.collection('settings');

        const settings = await settingsCollection.findOne({ name: 'bot' });
        if (settings && settings.queueChannelId) {
            queueChannelId = settings.queueChannelId;
        }

        client.once('ready', async () => {
            console.log('Ready!');
             const totalMembers = client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0);
            let status = [
                {
                    name: 'over ' + totalMembers + ' members',
                    type: ActivityType.Watching,
                },
                {
                    name: 'discord.gg/anon',
                    type: ActivityType.Streaming,
                    url: 'https://www.twitch.tv/ninja',
                },
            ]

            setInterval(() => {
                let random = Math.floor(Math.random() * status.length);
                client.user.setActivity(status[random]);

            }, 10000);

            await checkQueueChannel();
        });

        client.on('interactionCreate', async interaction => {
            if (!interaction.isCommand()) return;

            const command = client.commands.get(interaction.commandName);

            if (!command) return;

            try {
                await command.execute(interaction, { queueCollection, settingsCollection, updateQueueMessage, queueChannelId, queueMessage, client });
            } catch (error) {
                console.error(error);
                if (!interaction.replied) {
                    await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
                }
            }
        });

        client.login(token);

    } catch (err) {
        console.error(err);
    }
}

async function updateQueueMessage() {
    if (queueChannelId) {
        try {
            // Fetch the channel directly from the API
            const channel = await client.channels.fetch(queueChannelId, true, true);
            let embed = new EmbedBuilder()
                .setTitle('Current Queue')
                .setFooter({ text: 'Anon - discord.gg/anon', iconURL: 'https://cdn.discordapp.com/attachments/1247656696164388934/1247934171519647776/image.png?ex=6661d4c3&is=66608343&hm=2d40edc71b1e7d0ea55c861c59e09d210293b9c8e04d74a126881b3b0fe1ed5c&' })
                .setTimestamp()                
                .setColor(0x00AE86);

            const queue = await queueCollection.find().toArray();

            if (queue.length > 0) {
                const sortedQueue = queue.sort((a, b) => a.timestamp - b.timestamp);
                const queueString = sortedQueue.map((entry, index) => {
                    let emoji = index === 0 ? '<a:loadinggreen:1247902667565563904>' : '<a:loadingred:1247902728357937212>';
                    return `${index + 1}. ${emoji} **<@${entry.user.id}>** - ${entry.item}`;
                }).join('\n');
                embed.setDescription(queueString);
            } else {
                embed.setDescription('The queue is currently empty.');
            }

            if (!queueMessage) {
                queueMessage = await channel.send({ embeds: [embed] });
            } else {
                try {
                    await queueMessage.edit({ embeds: [embed] });
                } catch (error) {
                    if (error.code === 10008) {
                        // The message was not found, send a new one
                        queueMessage = await channel.send({ embeds: [embed] });
                    } else {
                        throw error;
                    }
                }
            }
        } catch (error) {
            console.error(`Could not find channel with ID ${queueChannelId}:`, error);
        }
    }
}
async function checkQueueChannel() {
    if (queueChannelId) {
        try {
            // Fetch the channel directly from the API
            const channel = await client.channels.fetch(queueChannelId, true, true);
            const messages = await channel.messages.fetch({ limit: 100 });
            const botMessages = messages.filter(msg => msg.author.id === client.user.id && msg.embeds.length > 0 && msg.embeds[0].title === 'Current Queue');
            
            queueMessage = botMessages.sort((a, b) => a.createdTimestamp - b.createdTimestamp).first();

            if (!queueMessage) {
                const embed = new EmbedBuilder()
                    .setTitle('Current Queue')
                    .setDescription('The queue is currently empty.')
                    .setFooter({ text: 'Anon - discord.gg/anon', iconURL: 'https://cdn.discordapp.com/attachments/1247656696164388934/1247934171519647776/image.png?ex=6661d4c3&is=66608343&hm=2d40edc71b1e7d0ea55c861c59e09d210293b9c8e04d74a126881b3b0fe1ed5c&' })
                    .setTimestamp()
                    .setColor(0x00AE86);

                queueMessage = await channel.send({ embeds: [embed] });
            }
        } catch (error) {
            console.error(`Could not find channel with ID ${queueChannelId}:`, error);
        }
    } else {
        console.log('No queue channel set. Waiting for /setqueuechannel command.');
    }
}
main().catch(console.error);
