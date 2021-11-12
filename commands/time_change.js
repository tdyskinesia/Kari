module.exports = {
  name: 't',
  description: "t",
  execute(message, args){
    var today = new Date();

    console.log(today.getMinutes());

    today.setSeconds(today.getSeconds()+5);
    console.log(today.getMinutes());
    message.channel.send("MINUTE ADDED?");

    return today;
  }
}