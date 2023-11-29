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



//////////
// Main //
//////////
let messageToUpdate = null;

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] });
client.once('ready', () => {
    console.log('Bot is online!');
    initializeMessage();
});


///////////////
// Functions //
///////////////
function updateMessage(isOnline, playerCount = 0, maxPlayers = 0) {
    const embed = new MessageEmbed()
        .setTitle('Server Status')
        .setColor(isOnline ? '#00FF00' : '#FF0000') // Green if online, red if offline
        .setDescription(isOnline ? `:green_square: Online (${playerCount}/${maxPlayers})` : ':red_square: Offline');

    const joinButton = new MessageButton()
        .setStyle('LINK')
        .setLabel('Join Server')
        .setURL(`steam://connect/${TF2_SERVER_IP}:${TF2_SERVER_PORT}`)
        .setDisabled(!isOnline);

    const row = new MessageActionRow().addComponents(joinButton);

    if (messageToUpdate) {
        messageToUpdate.edit({ embeds: [embed], components: [row] });
    }
}

function initializeMessage() {
    const channel = client.channels.cache.get(CHANNEL_ID);
    if (channel) {
        const embed = new MessageEmbed()
            .setTitle('Server Status')
            .setDescription('Checking server status...');
        channel.send({ embeds: [embed] }).then(msg => {
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
        updateMessage(true, state.players.length, state.maxplayers);
    }).catch((error) => {
        console.error("Server is offline or IP is incorrect", error);
        updateMessage(false);
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
