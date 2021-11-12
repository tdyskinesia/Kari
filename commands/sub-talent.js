module.exports = {
    name: 'sub talent',
    description: "sub talent",
    execute(message, command, args){
      const sqlite = require('sqlite3').verbose();

      let db = new sqlite.Database('./db/sample.db');

      var name = args[0] + " " + args[1];
      args.splice(0,2);
      console.log(name);
      args.push(name);

      let testArray = args;
      testArray.splice(0, 0, null);
      console.log(testArray);

        // insert one row into the langs table
        db.run(`INSERT INTO subs VALUES(?, ?, ?, ?, ?)`, testArray, function(err) {
          if (err) {
            return console.log(err.message);
          }
          // get the last insert id
          console.log(`A row has been inserted with rowid ${this.lastID}`);
          return this.lastID.toString();
        });

        // close the database connection
        db.close();
      
      message.channel.send(testArray);





    }
}