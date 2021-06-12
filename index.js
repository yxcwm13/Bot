const Discord = require("discord.js");         
const client = new Discord.Client();          
const config = require("./config.json");       
const Enmap = require("enmap")                 
const canvacord = require("canvacord")         
client.points = new Enmap({ name: "points" }); 
client.on("ready", ()=>console.log("Rank Bot online 🆙")); 
const leveling = require("./ranking");         
leveling(client);         
client.on("ready", () => {
client.user.setActivity("ranking wars | say .rank to see your rank", {type: 5})
});
client.login(process.env.TOKEN);
