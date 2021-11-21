module.exports = (client, bool) => {
const statusOptions = [
    'Reina Sun',
    'Nene Amano',
    'Isla Coleman',
    'Charlotte Suzu',
    'Aruru Gray',
    'Shee Icho',
    'Namiji Freesia',
    'Lua Asuka',
    'Neena Makurano'
]


let counter = 0

const updateStatus = () => {
    if(!bool){
    client.user.setPresence({
        status: 'online',
        activities: [
            {
                name: statusOptions[counter],
                type: 'WATCHING'
            }
        ]
    })
} else {
    client.user.setPresence({
        status: 'online',
        activities: [
            {
                name: 'UNDERGOING MAINTENANCE',
                type: 'PLAYING'
            }
        ]
    })
}

    if(++counter >= statusOptions.length){
        counter = 0;
    }
    setTimeout(updateStatus, 1000 * 20)
}
updateStatus()

    
}