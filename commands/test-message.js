module.exports = {
    name: 'test message',
    description: "test message",
    execute(message,  args){
        const sqlite = require('sqlite3').verbose();

        let db = new sqlite.Database('./db/sample.db');

        let d = new Date()
        d.setMinutes(d.getMinutes()+2)

        db.run(`INSERT INTO messages VALUES(?, ?, ?, ?, ?)`, [5, "10am PST,1pm EST,3am JST", "test title", "test vidID", d.toISOString()], function(err) {
            if (err) {
              return console.log(err.message);
            }
            // get the last insert id
            console.log(`A row has been inserted with rowid ${this.lastID}`);
            return this.lastID.toString();
          });
        db.close();


    }
}