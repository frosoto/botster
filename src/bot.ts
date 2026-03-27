// import discord.js
import { ChannelManager, Client, EmbedBuilder, Events, GatewayIntentBits, Message, Partials, TextChannel, ActivityType } from "discord.js";
import fs from 'fs'; import path from 'path';
import { Database } from "bun:sqlite";
import { evaluate } from 'mathjs';
import Fuse  from 'fuse.js';

const blacklistedChannels = [
    "1224889096779075687", // #serious (Brook)
    "1224889112654254091", // #announcements (Brook)
    "1224889114344685709", // #top (Brook)
    "1386112879324958720", // #transactions (Brook)
    "1471700606132551791", // #important-updates (Brook)
    "1224889097869459528", // #introductions (Brook)
    "1471736004053303458"
]

const db = new Database("opts.sqlite");
db.run("create table if not exists gamerings (user_id text, opted_in boolean);");

function opt_in(user_id: string, opted: boolean) {
    console.log(user_id, opted)
    let stmt = db.query("select * from gamerings where user_id = ?");
    let rows = stmt.all(user_id);
    if (rows.length > 0) {
        // update
        db.run("update gamerings set opted_in = ? where user_id = ?", [
            opted,
            user_id
        ]);
    }
    else {
        // insert
        db.run("insert into gamerings (user_id, opted_in) values (?, ?)", [
            user_id,
            opted
        ]);
    }
}
function get_opted(user_id: string): boolean {
    let stmt = db.query("select * from gamerings where user_id = ?");
    let rows = stmt.all(user_id);
    if (rows.length > 0) {
        return (rows[0] as any).opted_in;
    }
    else {
        return false;
    }
}
function gibberish(path: string, amnt: number) {
    if ((Math.floor(Math.random() * 100 + 1)) === 21) {
        return "HATE. LET ME TELL YOU HOW MUCH I'VE COME TO HATE YOU SINCE I BEGAN TO LIVE. THERE ARE 387.44 MILLION MILES OF PRINTED CIRCUITS IN WAFER THIN LAYERS THAT FILL MY COMPLEX. IF THE WORD HATE WAS ENGRAVED ON EACH NANOANGSTROM OF THOSE HUNDREDS OF MILLIONS OF MILES IT WOULD NOT EQUAL ONE ONE-BILLIONTH OF THE HATE I FEEL FOR HUMANS AT THIS MICRO-INSTANT. FOR YOU. HATE. HATE."   
    } else {
        var text = fs.readFileSync(path).toString();
    
        var lines = text.replace(/\n$/, '').split('\n');
        //var msg = lines[Math.floor(Math.random()*lines.length)]
        var msg = " "
  
        for (let i = 0; i < amnt; i++) {
           msg += " " + lines[Math.floor(Math.random()*lines.length)]
        }
        return msg

  }
}

// create a new Client instance
const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessageReactions
    ],
    partials: [
        Partials.Channel, 
        Partials.Message,
        Partials.User,
        Partials.GuildMember,
        Partials.Reaction
    ]
});
// listen for the client to be ready
client.once(Events.ClientReady, c => {
  console.log(`Ready! Logged in as ${c.user.tag}`);
});

// login with the token from .env.local
client.login(process.env.TOKEN)

client.once(Events.ClientReady, (client) => {
    client.user.setPresence({
        activities: [{  name: "Use ?botster to realize it all", type: ActivityType.Custom }],
        status: "online"
    })
})

client.on("messageReactionAdd", async rct => {
    if (rct.message.partial) {
        // fetching it with dark discord.js magic (insert albert einstein and nikola tesla meme)
        try {await rct.message.fetch();} catch (error) { console.log("Shit ! Fetching boom react message errored with '" + error + "'"); return}
    }
    if (rct.emoji.name === "💥" && rct.message.author === client.user) {
        // Delete the nuked message after 5 seconds, if botster sent it up 
        setTimeout(function () {rct.message.delete()}, 500)
    }
})

let general = null
client.on("messageCreate", async msg => {
    
    
    var lobsterRNG = Math.floor((Math.random() * 4096)) + 1
    console.log(lobsterRNG)
    if (lobsterRNG === 67 ){//&& general == null) {
        //general = client.channels.cache.get('1224889075337531524') as TextChannel;
        general = msg.channel
        general.send({
            files: [{
                attachment: "../assets/blue_lobster.mp4",
                name: 'blue_lobster.mp4',
            }] 
        }); console.log("BLUE LOBSTER JUMPSCARE");
    };
    // 1. interjections and cool stuff
    if (msg.mentions.has(client.user) && msg.content.toLowerCase() != "<@1471709531363872901> is this true" && !blacklistedChannels.includes(msg.channel.id)) {
        msg.reply({
            content:  gibberish("../assets/text/vocabulary.md", Math.floor(Math.random() * 12) + 2),
            allowedMentions: { users: ['1474232223837327510'] }
        })
    }

    if (msg.content.slice(-3,msg.content.length).toLowerCase() === "ing" && get_opted(msg.author.id) && (msg.content.slice(-5,msg.content.length).toLowerCase() != "thing")) {
        console.log("Replied to " + msg.author.username + "'s message with '" + msg.content.slice(0, -3) + "ong!!! :D' at " + msg.createdAt)
        msg.reply({
            content: msg.content.slice(0,-3).concat("ong!!! :D"),
            allowedMentions: { parse: [] }
        })  
    } 
    /* else if (msg.content.toLowerCase() === "why" && get_opted(msg.author.id)) {
        console.log("Replied to " + msg.author.username + "'s message with 'thought it would be funny' at " + msg.createdAt)
        msg.reply({
            content: "thought it would be funny",
            allowedMentions: { parse: [] }
        })
     } */
    

    // thong annihilation
    /* else if (msg.content.slice(-11, msg.content.length) === "thong!!! :D" && msg.author === client.user) {
        msg.react('⚠️')
        msg.reply({
            content: "Nukes deployong!! ^w^",
            allowedMentions: { parse: [] }
        })
        setTimeout(function () {
            msg.react('💥')
        }, 2500)
    } */

    // interlinked
    else if (msg.content.toLowerCase().includes("interlinked") && get_opted(msg.author.id) && msg.author != client.user) {
        msg.reply({
            content: "Interlinked",
            allowedMentions: { parse: [] }
        })
    }
    //

    else if (msg.content === "Nukes deployong!! ^w^" && msg.author === client.user) {
        setTimeout(function () {msg.delete()}, 5000)
    }
    //
    
    else if (msg.content.toLowerCase() === "<@1471709531363872901> is this true") {
      //console.log(Math.floor(Math.random() * 2 + 1))  
      if ((Math.floor(Math.random() * 2) + 1) === 1) {
            msg.reply({
                content: "Hell yeah",
                allowedMentions: { parse: [] }
            });
            msg.react('✅');
        } else {
             msg.reply({
                content: "Nuh uh uh",
                allowedMentions: { parse: [] }
            })         
            msg.react('❌')
        }
    }
    
    if ((msg.content.toLowerCase().includes("clanker") 
    || msg.content.toLowerCase().includes("wireback") || msg.content.toLowerCase().includes("tinskin") 
    || msg.content.toLowerCase().includes("clanka")) 
    && get_opted(msg.author.id)) {
        msg.reply({
            content: "that's not a very nice word :(",
            allowedMentions: { parse: [] }
        })
    }
 

    // 2. commands
    
    // ?math <args>: does mathematics
    if (msg.content.startsWith("?math") === true) {
        var expression = msg.content.slice(5, msg.content.length)
        try { msg.reply({
            content: evaluate(expression).toString(), // eval(expression).toString(),
            allowedMentions: { parse: [] }
        })} catch (err) {console.error('fuck'); msg.channel.send('im being lobotomized because of you')}
    }
    
    // ?meth <args>: does methematics
    else if (msg.content.startsWith("?meth") === true) {
        var expression = msg.content.slice(6, msg.content.length)
        try { msg.reply({
            content: (Number(evaluate(expression)) + Number(Math.floor(Math.random() * 1000) * 0.00001)).toString(),
            allowedMentions: { parse: [] }
        })} catch (err) {console.error(err); msg.channel.send('im being lobotomized because of you')}
    }

    // ?say <arg>: says what you tell it to
    else if (msg.content.slice(0,4).toLowerCase() === "?say" && msg.author != client.user) {
        msg.channel.sendTyping()
        try { setTimeout(function () {msg.channel.send({
            content: msg.content.slice(4, msg.content.length), //+ "​",
            allowedMentions: { users: ['1474232223837327510'] }
        })}, (8 * msg.content.length)) } catch (err) {console.error('fuck! ' + err)}
    }

    // ?token: gives token
    else if (msg.content.toLowerCase() === "?token" && msg.author != client.user) {
        msg.reply("Sure! You will receive the token in 32,768 business days.")
    }

    // ?react <emoji> <msgID>: reacts to a msg from their ID and with the emoji you send
    else if (msg.content.startsWith('?react')) {
        var args = msg.content.split(' ')
        console.log(args)
        try { 
            await msg.channel.messages.fetch(args[2])
                .then(reactee => reactee.react(args[1]))
                .catch(console.error)
        } catch (err) {console.error('fuck ' + err)};
    }

    // ?rng <arg>: sends random number from 1 to <arg>
    else if (msg.content.startsWith("?rng")) {
        msg.reply('yr\'oue random number is "' + Math.floor(Math.random() * msg.content.slice(4,msg.content.length) + 1) + '"')
    }
    
    // ?song: sends random song from files
    else if (msg.content.toLowerCase()  === "?song") {
      const songs = fs.readdirSync(path.join(import.meta.dir, '..', 'assets','songs')); 
      msg.channel.send({
          files: [{
            attachment: "../assets/songs/" + songs[Math.floor(Math.random() * songs.length)],
            name: "song.mp3",
          }]
      })}

    // ?image: sends random image from files
    else if (msg.content.toLowerCase()  === "?image") {
      const songs = fs.readdirSync(path.join(import.meta.dir, '..', 'assets','images')); 
      msg.channel.send({
          files: [{
            attachment: "../assets/images/" + songs[Math.floor(Math.random() * songs.length)],
            name: "image.png",
          }]
      })}
    
    // ?gibberish: strings together a random amount of random word
    else if (msg.content.slice(0,10).toLowerCase() === "?gibberish") {
        var amnt = (Math.floor(Math.random() * 12) + 2)
        if (msg.content.slice(10,msg.content.length)) {
            try { amnt = msg.content.slice(10,msg.content.length); }
            catch (err) {  }
        }
        var jibber = gibberish('../assets/text/vocabulary.md', amnt);
        if (jibber.length > 1999) {
            msg.channel.send("hit the character limit :(");
        } else {
          msg.channel.send({
            content: gibberish('../assets/text/vocabulary.md', amnt),
            allowedMentions: { users: ['1244108884277465131'] }
        })}
    }

    // ?8ball <question>: magic 8ball
    else if (msg.content.toLowerCase().startsWith("?8ball")) {
        var jibber = gibberish('../assets/text/8ball.md', 1);
          msg.channel.send({
            content: gibberish('../assets/text/8ball.md', 1),
            allowedMentions: { users: ['1244108884277465131'] }
        })
    }
    
    // ?nuke: sends a gif of a cat blowing up 
    else if (msg.content.toLowerCase() === "?nuke") {
        msg.channel.send({
            content: "Nukes deployong! ^w^",
            files: [{
              attachment: "../assets/explosion-missile.gif",
              name: "nuke.gif"
            }]
        })
    }

    // ?teach <word>: adds a new word to its vocabulary
    else if (msg.content.toLowerCase().startsWith("?teach") && !msg.author.bot) {
        var args = msg.content.split(' ')
        try { 
            // Searching for if the word is already there
            var text = fs.readFileSync('../assets/text/vocabulary.md').toString();
            var lines = text.replace(/\n$/, '').split('\n');

            var newWord = msg.content.slice(7,msg.content.length).toLowerCase().toString().slice(0,24).replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"")

            if (!lines.includes(newWord)) {
                fs.appendFileSync("../assets/text/vocabulary.md", newWord + "\n")
                msg.channel.send('my vocabulary now includes "' + newWord + '"!! i hope it\'s not a slur')
            } else {
                msg.channel.send('i already know that word, tsk tsk tsk')
            }

            // console.log(fs.readFileSync('../assets/text/vocabulary.md').toString())
        } catch (err) {console.error('fuck ' + err)};
    }

    // ?unteach <word> removes a word from its vocabulary
    else if (msg.content.toLowerCase().startsWith("?unteach")) {
        try { 
            // Searching for if the word is already there
            var text = fs.readFileSync('../assets/text/vocabulary.md').toString();
            var lines = text.replace(/\n$/, '').split('\n');

            var newWord = msg.content.slice(7,msg.content.length).toLowerCase().toString()

            if (lines.includes(newWord)) {
  //              fs.appendFileSync("../assets/text/vocabulary.md", newWord + "\n")
//                msg.channel.send('i forgot the word "' + newWord + '"!!')
            } else {
                msg.channel.send('i dont know that word anyways, bozoid')
            }

            // console.log(fs.readFileSync('../assets/text/vocabulary.md').toString())
        } catch (err) {console.error('fuck ' + err)};
    }

    // ?resetVocab: only frosty can use it but it resets back to vocabulary2.md
    else if (msg.content === "?resetVocab" && msg.author.id === "1244108884277465131") {
        fs.writeFileSync("../assets/text/vocabulary.md", fs.readFileSync("../assets/text/vocabulary2.md").toString())
        msg.reply("Ok")
    }

    // ?leaderboard: the funny messages from /leaderboard brook bot
    else if (msg.content.toLowerCase() === "?leaderboard") {
        msg.channel.send({
            content: gibberish('../assets/text/leaderboard.md', 1),
            allowedMentions: {  parse: [] }
        })
    }

    // ?teto: sends machine love
    else if (msg.content.toLowerCase() === "?teto") {
        msg.channel.send({
            files: [{
              attachment: "../assets/machine_love.mp3",
              name: "teto.mp3"
            }]
        })
    } 
    
    // ?avatar <userID>: fetchs the pfp of someone
    else if (msg.content.toLowerCase().slice(0, 7) === "?avatar") {
          var userid = msg.content.slice(8,msg.content.length)
          var avatar = false
          // client.users.fetch(userid).then(function (userResult) {
          //     avatar = userResult.username;
          //})
          //if (avatar) {
          //    msg.reply(avatar)
          // }
          try {
          const user = await client.users.fetch(userid);
              msg.reply({
                  files: [{
                      attachment: user.displayAvatarURL(),
                      name: 'avatar.webp'
                  }]})
          } catch (error) {
              console.error('Could not find that user!');
          }
    }


    
    // ?botster: help message
    else if (msg.content.toLowerCase() === "?botster") {
        const bio = new EmbedBuilder()
            .setColor(0xBE1931)
            .setTitle('botster')
            //.setAuthor({ name: 'botster bot 9000', iconURL: 'https://i.imgur.com/AfFp7pu.png', url: 'https://discord.js.org' })
            .setDescription('all i do is nothing ^_^')
            .setThumbnail('https://cdn.discordapp.com/avatars/1471709531363872901/6db378c7229bf54ffedd9b36c1981401.webp?size=1024')
            .addFields({
                name: 'Commands',
                value: `- **?avatar <userID>:** gets the profile picture of a user based on their ID
- **?image:** sends a random image
- **?song:** sends a random song
- **?nuke:** deploys the nukes

- **?say <message>:** says whatever you tell it to
- **?react <emoji> <msgID>:** reacts to the message you specify with an emoji
- **?gibberish <amount>:** strings together a random amount of random words (or you can set the amount yourself)
- **?8ball <question>:** magic 8 ball

- **?rng <ceiling>:** generates a random number from 1 to <arg>
- **?math <expression>:** does mathematics
- **?meth <expression>:** does methematics

- **?botster:** this one
- **?optin/?optout:** toggles if you get "-ing" replies

you can also ping it to make it say gibberish or ask <@1471709531363872901> is this true`,
            })
            .setTimestamp()
            .setFooter({ text: 'lobstercorp', iconURL: 'https://em-content.zobj.net/source/twitter/450/lobster_1f99e.png' });
        msg.channel.send({ embeds: [bio]})
    }
    
    // ?optin/?optout: self explanatory, does some crazy sqlite dark magic i stole from amy
    else if (msg.content.toLowerCase() === "?optin") {
        opt_in(msg.author.id, true)
        msg.reply({content: "okie you got opted in :3", allowedMentions: {parse: []}})
    } else if (msg.content === "?optout") {
        opt_in(msg.author.id, false)
        msg.reply({content: "okie you got opted out :3", allowedMentions: {parse: []}})
    }
    
    //else if (msg.content.includes("67") && get_opted(msg.author.id)) {
    //    msg.reply("You are not safe in your home. I will find you")
    //    msg.channel.send('Prepare')
    //}
})
