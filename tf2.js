const fs = require('fs');
const { Client, GatewayIntentBits, MessageEmbed, MessageButton, MessageActionRow } = require('discord.js');
const Gamedig = require('gamedig');

///////////////////
// Configuration //
///////////////////

// Reading the token from the discord.token file
const token = fs.readFileSync('discord.token', 'utf8').trim();

// Reading configuration from config.json
const config = JSON.parse(fs.readFileSync('config.json', 'utf8'))

// Using values from the config file
const CHANNEL_ID = config.CHANNEL_ID;
const TF2_SERVER_IP = config.TF2_SERVER_IP;
const TF2_SERVER_PORT = config.TF2_SERVER_PORT

let messageToUpdate = null;

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] });

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
        const newMessage = `There are currently ${playerCount} players on The Gravity Bong.`;
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
    // Query immediately on startup
    queryTF2Server();

    // Then set up the interval to query every 60 seconds
    const queryInterval = 60000; // 60 seconds
    setInterval(queryTF2Server, queryInterval);
}

client.login(token);
