module.exports = {
    name: 'clear msgs',
    description: "clear msgs",
    permissions: "perms",
    execute(message,  args){
        const sqlite = require('sqlite3').verbose();

        let db = new sqlite.Database('./db/database.db');

        db.run(`DELETE FROM messages`);
        db.close();


    }
}