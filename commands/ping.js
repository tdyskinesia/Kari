module.exports = {
  name: 'ping',
  description: "Embed",
  async execute(message, args){
    const Discord = require('discord.js');
    await message.channel.send("Pong!");
  }
}
