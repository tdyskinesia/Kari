module.exports = (client) => {
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
    client.user.setPresence({
        status: 'online',
        activities: [
            {
                name: statusOptions[counter],
                type: 'WATCHING'
            }
        ]
    })

    if(++counter >= statusOptions.length){
        counter = 0;
    }
    setTimeout(updateStatus, 1000 * 20)
}
updateStatus()

    
}