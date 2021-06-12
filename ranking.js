const config = require("./config.json");
const canvacord = require("canvacord");
const Discord = require("discord.js");

module.exports = function (client) {
  const description = {
    name: "Level",
    filename: "leveling.js",
    version: "2.0"
  }
  
  console.log(` :: ⬜️ Modül: ${description.name} | Yüklenen versiyon: ${description.version} şuradan: ("${description.filename}")`)
  
  client.on("message", async (message) => {

    if (message.author.bot) return;
    if (!message.guild) return;
    if (message.channel.type === `dm`) return;
    const key = `${message.guild.id}-${message.author.id}`;
    client.points.ensure(`${message.guild.id}-${message.author.id}`, {
      user: message.author.id,
      guild: message.guild.id,
      points: 0,
      level: 1
    });
    var msgl = message.content.length / (Math.floor(Math.random() * (message.content.length - message.content.length / 100 + 1) + 10));
    if (msgl < 10) {
      var randomnum = Math.floor((Math.random() * 2) * 100) / 100
      client.points.math(key, `+`, randomnum, `points`)
      client.points.inc(key, `points`);
    }
    else {
      var randomnum = 1 + Math.floor(msgl * 100) / 100
      client.points.math(key, `+`, randomnum, `points`)
      client.points.inc(key, `points`);
    }
    const curLevel = Math.floor(0.1 * Math.sqrt(client.points.get(key, `points`)));
    if (client.points.get(key, `level`) < curLevel) {
      const embed = new Discord.MessageEmbed()
        .setTitle(`Tebrikler!:  ${message.author.username}`)
        .setTimestamp()
        .setDescription(`Level atladın! Yeni levelin: **\`${curLevel}\`**! (Puanın: \`${Math.floor(client.points.get(key, `points`) * 100) / 100}\`) `)
        .setColor("GREEN");
      message.channel.send(`<@` + message.author.id + `>`);
      message.channel.send(embed);
      client.points.set(key, curLevel, `level`);
    }
    if (message.content.toLowerCase().startsWith(`${config.PREFIX}seviye`)) {
      let rankuser = message.mentions.users.first() || message.author;
      client.points.ensure(`${message.guild.id}-${rankuser.id}`, {
        user: message.author.id,
        guild: message.guild.id,
        points: 0,
        level: 1
      });
      const filtered = client.points.filter(p => p.guild === message.guild.id).array();
      const sorted = filtered.sort((a, b) => b.points - a.points);
      const top10 = sorted.splice(0, message.guild.memberCount);
      let i = 0;
      for (const data of top10) {
        await delay(15);
        try {
          i++;
          if (client.users.cache.get(data.user).tag === rankuser.tag) break;
        } catch {
          i = `Bir hata oluştu.`;
          break;
        }
      }
      const key = `${message.guild.id}-${rankuser.id}`;
      let curpoints = Number(client.points.get(key, `points`).toFixed(2));
      let curnextlevel = Number(((Number(1) + Number(client.points.get(key, `level`).toFixed(2))) * Number(10)) * ((Number(1) + Number(client.points.get(key, `level`).toFixed(2))) * Number(10)));
      if (client.points.get(key, `level`) === undefined) i = `Seviyesi yok!`;
      let tempmsg = await message.channel.send(new Discord.MessageEmbed().setColor("RED").setAuthor("Hesaplanıyor...", "https://cdn.discordapp.com/emojis/769935094285860894.gif"))
      let color;
      let status = rankuser.presence.status;
      if (status === "dnd") { color = "#3fdc99"; }
      else if (status === "online") { color = "#3fdc99"; }
      else if (status === "idle") { color = "#3fdc99"; }
      else { status = "streaming"; color = "#3fdc99"; }
      const rank = new canvacord.Rank()
        .setAvatar(rankuser.displayAvatarURL({ dynamic: false, format: 'png' }))
        .setCurrentXP(Number(curpoints.toFixed(2)), color)
        .setRequiredXP(Number(curnextlevel.toFixed(2)), color)
        .setStatus(status, false, 7)
        .renderEmojis(true)
        .setProgressBar(color, "COLOR")
        .setRankColor(color, "COLOR")
        .setLevelColor(color, "COLOR")
        .setUsername(rankuser.username, color)
        .setRank(Number(i), "Sıra", true)
        .setLevel(Number(client.points.get(key, `level`)), "Level", true)
        .setDiscriminator(rankuser.discriminator, color);
      rank.build()
        .then(async data => {
          const attachment = new Discord.MessageAttachment(data, "seviye.png");
          const embed = new Discord.MessageEmbed()
            .setTitle(`Seviye bilgisi sahibi:  ${rankuser.username}`)
            .setColor(color)
            .setImage("attachment://seviye.png")
            .attachFiles(attachment)
          await message.channel.send(embed);
          await tempmsg.delete();
          return;
        });
    }
    if (message.content.toLowerCase() === `${config.PREFIX}sıralama`) {
      const filtered = client.points.filter(p => p.guild === message.guild.id).array();
      const sorted = filtered.sort((a, b) => b.points - a.points);
      const top10 = sorted.splice(0, 10);
      const embed = new Discord.MessageEmbed()
        .setTitle(`${message.guild.name}: Sıralama`)
        .setTimestamp()
        .setDescription(`Top 10 Sıralaması:`)
        .setColor("ORANGE");
      let i = 0;
      for (const data of top10) {
        await delay(15); try {
          i++;
          embed.addField(`**${i}**. ${client.users.cache.get(data.user).tag}`, `Puanlar: \`${Math.floor(data.points * 100) / 100}\` | Level: \`${data.level}\``);
        } catch {
          i++;
          embed.addField(`**${i}**. ${client.users.cache.get(data.user)}`, `Puanlar: \`${Math.floor(data.points * 100) / 100}\` | Level: \`${data.level}\``);
        }
      }
      //schick das embed
      return message.channel.send(embed);
    }
    if (message.content.toLowerCase() === `${config.PREFIX}yardım`) {
      const help = new Discord.MessageEmbed()
      .setAuthor("Crown Levelling")
      .setTitle("Crown: Komutlar")
      .addField(".seviye", "Seviyeni gösterir!")
      .addField(".sıralama", "Sıralamayı gösterir!")
      .setImage("https://cdn.discordapp.com/attachments/850819000593940488/853282238610407454/image0.jpg")
      message.channel.send(help)
    }

  })
  function delay(delayInms) {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(2);
      }, delayInms);
    });
  }
}

