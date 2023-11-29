const fs = require('fs');
const { Client, GatewayIntentBits } = require('discord.js');
const Gamedig = require('gamedig');

// Reading the token from the discord.token file
const token = fs.readFileSync('discord.token', 'utf8').trim();

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] });

// Replace with your channel ID and Team Fortress 2 server details
const CHANNEL_ID = '1179213850495684718';
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

client.login(token);
