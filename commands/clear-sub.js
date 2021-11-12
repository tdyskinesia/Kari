module.exports = {
    name: 'clear sub',
    description: "clear sub",
    execute(message,  args){
        const sqlite = require('sqlite3').verbose();

        let db = new sqlite.Database('./db/database.db');

        db.run(`DELETE FROM subs where channel_id = ` + args[0]);
        db.close();


    }
}