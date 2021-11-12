export function getReina(callback){
    
    const sqlite = require('sqlite3').verbose();

    let db = new sqlite.Database('./db/sample.db');

    let sql = 'SELECT channel_id channel, role_id role, name name FROM subs WHERE id = ?';

    let id = 1;

    var reinaArray = [];

        db.get(sql, id, (err, row) => {
            if(err){
                console.error(err.message);
                return callback(err);
            }
            console.log(row.channel, row.role, row.name);
            reinaArray.push(row.channel, row.role, row.name);
            db.close();
            console.log(reinaArray);
            callback(null, reinaArray);
            });
        }