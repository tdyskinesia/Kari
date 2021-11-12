module.exports = {
    name: 'get sub',
    description: "getsub",
    execute(message, client, args){




        return client.channels.cache.get(outputArray[0].toString()).send("<@&" + outputArray[1].toString() + "> " + outputArray[2]);
    }
}