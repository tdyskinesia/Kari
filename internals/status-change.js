module.exports = {
   async it(client) {
const sc = require('./scrape.js')

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

let strArr = await sc()
let counter = 0
let counter2 = 0

const updateStatus = async() => {
    if(strArr.length!=0){
    await client.user.setPresence({
        status: 'online',
        activities: [
            {
                name: strArr[counter][0] + ": " + strArr[counter][1],
                type: 'WATCHING',
                url: strArr[counter][2]
            }
        ]
    })
}
    if(strArr.length==0){
        await client.user.setPresence({
            status: 'online',
            activities: [
                {
                    name: statusOptions[counter],
                    type: 'WATCHING'
                }
            ]
        })
    }
    
    if(++counter >= strArr.length&&strArr.length>0){
        counter = 0;
        return next(client);

    }
    else if (++counter2 >= statusOptions.length){
        counter = 0;
        return next(client)
    }
}

setInterval(updateStatus, 1000 * 17)    


updateStatus()

    
},
async next(client){
    await it(client)
}
}