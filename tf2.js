const { Client, GatewayIntentBits } = require('discord.js');
const Gamedig = require('gamedig');
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] });


// Replace with your Discord bot token and channel ID
const BOT_TOKEN = 'MTE3OTIxMTc4NzU5ODU2MTM2MQ.G3hZha.wsnV-4pCbMmaq4T1E8fncWQhzf3y58_0Lk8iQc';
const CHANNEL_ID = '1179213850495684718';

// Replace with your Team Fortress 2 server details
const TF2_SERVER_IP = '100.24.39.231';
const TF2_SERVER_PORT = '27015'

let messageToUpdate = null;

client.once('ready', () => {
    console.log('Bot is online!');
    initializeMessage();
});

function initializeMessage() {
    const channel = client.channels.cache.get(CHANNEL_ID);
    if (channel) {
        channel.send('Initializing server status...').then(msg => {
            messageToUpdate = msg;
            queryTF2ServerPeriodically();
        });
    } else {
        console.error('Channel not found!');
    }
}

function queryTF2Server() {
    Gamedig.query({
        type: 'tf2',
        host: TF2_SERVER_IP,
        port: TF2_SERVER_PORT
    }).then((state) => {
        const playerCount = state.players.length;
        const newMessage = `There are currently ${playerCount} players on the TF2 server.`;
        updateMessage(newMessage);
    }).catch((error) => {
        console.error("Server is offline or IP is incorrect", error);
    });
}

function updateMessage(newMessage) {
    if (messageToUpdate) {
        messageToUpdate.edit(newMessage);
    }
}

function queryTF2ServerPeriodically() {
    const queryInterval = 60000; // Query every 60 seconds
    setInterval(queryTF2Server, queryInterval);
}

client.login(BOT_TOKEN);

