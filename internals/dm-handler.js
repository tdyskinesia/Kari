/**
 * @param  {Discord.Client} client
 */
module.exports = (client, prefix) => {

    client.on('messageCreate', async(message)=>{
        if(message.guild!=null) return;
        if(message.partial) await message.fetch();
        if(message.author.bot) return;
        if(!message.content.startsWith(prefix)) return;
        const args = message.content.slice(prefix.length).split(/ +/);
        const command = args.shift().toLowerCase();
        if(command === 'suggestion'){
            await message.channel.send('Your suggestion has been logged! Thank you!')
            let DM = await client.users.cache.get('201198863669919744').createDM()
            DM.send("Suggestion from "+message.author.username + ": "+message.content)
        }
        else if(command === 'bugreport'){
            await message.channel.send('Your bug has been logged. Thank you!')
            let DM = await client.users.cache.get('201198863669919744').createDM()
            DM.send("Bug Report from "+message.author.username + ": "+message.content)
        }
    })
}