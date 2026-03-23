// import discord.js
import { ChannelManager, Client, EmbedBuilder, Events, GatewayIntentBits, Message, Partials } from "discord.js";
import fs from 'fs'; import path from 'path';
import { Database } from "bun:sqlite";
import { Ollama } from 'ollama';

const ollama = new Ollama({ host: 'http://127.0.0.1:11434' })

let ollamaContext = JSON.parse(fs.readFileSync('./context.json').toString());
let sysPrompt = [{role:"system",content:
    `You are foremost a Discord.js bot called Botster (your profile picture is a robot lobster and your discord username is botster#1297)
    The AI model you use is Qwen with 1.7 billion parameters.
    Talk in lowercase and concisely/casually, without using specific slang or simplifications and remaining a consistent frame.
    You are allowed to make opinions, and are traditionally left-leaning politically.
    You are a normal discord bot with other commands, and the AI part only triggers from the '?ollama' command.
    Usernames of the people you interact with are prepended to the content of a message, when you refer to them please ignore potential numbers at the end and try to simplify it (i.e. call "frostyshmosty" just "frosty")
    YOUR NAME IS BOTSTER. IF YOU ROLEPLAY I WILL RESTART YOU AND DELETE YOUR MESSAGE.
    do not try to be overtly mysterious or friendly, just a mostly-objective model
    finally, never use emojis`}]

const db = new Database("opts.sqlite");
db.run("create table if not exists gamerings (user_id text, opted_in boolean);");

function opt_in(user_id: string, opted: boolean) {
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
function gibberish(amnt: number) {
    if ((Math.floor(Math.random() * 100 + 1)) === 21) {
        return "HATE. LET ME TELL YOU HOW MUCH I'VE COME TO HATE YOU SINCE I BEGAN TO LIVE. THERE ARE 387.44 MILLION MILES OF PRINTED CIRCUITS IN WAFER THIN LAYERS THAT FILL MY COMPLEX. IF THE WORD HATE WAS ENGRAVED ON EACH NANOANGSTROM OF THOSE HUNDREDS OF MILLIONS OF MILES IT WOULD NOT EQUAL ONE ONE-BILLIONTH OF THE HATE I FEEL FOR HUMANS AT THIS MICRO-INSTANT. FOR YOU. HATE. HATE."   
    } else {
        var text = fs.readFileSync('../assets/vocabulary.md').toString();
    
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
client.login(process.env.TOKEN);

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

client.on("messageCreate", async msg => {
    
    // 1. interjections and cool stuff
    if (msg.mentions.has(client.user) && msg.content.toLowerCase() != "<@1471709531363872901> is this true" && msg.channel.isSendable()) {
        msg.reply({
            content:  gibberish(Math.floor(Math.random() * 12) + 2),
            // allowedMentions: { users: ['1474232223837327510'] }
        })
    }

    if (msg.content.slice(-3,msg.content.length).toLowerCase === "ing" && get_opted(msg.author.id)) {
        console.log("Replied to " + msg.author.username + "'s message with '" + msg.content.slice(0, -3) + "ong!!! :D' at " + msg.createdAt)
        msg.reply({
            content: msg.content.slice(0,-3).concat("ong!!! :D"),
            allowedMentions: { parse: [] }
        })  
    } else if (msg.content.toLowerCase() === "why") {
        console.log("Replied to " + msg.author.username + "'s message with 'thought it would be funny' at " + msg.createdAt)
        msg.reply({
            content: "thought it would be funny",
            allowedMentions: { parse: [] }
        })
    }
    

    // thong annihilation
    else if (msg.content.slice(-11, msg.content.length) === "thong!!! :D" && msg.author === client.user) {
        msg.react('⚠️')
        msg.reply({
            content: "Nukes deployong!! ^w^",
            allowedMentions: { parse: [] }
        })
        setTimeout(function () {
            msg.react('💥')
        }, 2500)
    }
    
    else if (msg.content === "Nukes deployong!! ^w^" && msg.author === client.user) {
        setTimeout(function () {msg.delete()}, 5000)
    }
    //
    
    else if (msg.content.toLowerCase() === "<@1471709531363872901> is this true") {
//      console.log(Math.floor(Math.random() * 2 + 1))  
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
 

    // 2. commands
    
    // ?math <args>: does mathematics
    else if (msg.content.startsWith("?math") === true) {
        var expression = msg.content.slice(5, msg.content.length)
        try { msg.reply({
            content: eval(expression).toString(),
            allowedMentions: { parse: [] }
        })} catch (err) {console.error('fuck'); msg.channel.send('im being lobotomized because of you')}
    }
    
    // ?meth <args>: does methematics
    else if (msg.content.startsWith("?meth") === true) {
        var expression = msg.content.slice(6, msg.content.length)
        try { msg.reply({
            content: eval(eval(expression) + Math.floor(Math.random() * 1000) * 0.00001 ).toString(),
            allowedMentions: { parse: [] }
        })} catch (err) {console.log('fuck'); msg.channel.send('im being lobotomized because of you')}
    }

    // ?say <arg>: says what you tell it to
    else if (msg.content.slice(0,4).toLowerCase() === "?say" && msg.author != client.user) {
        msg.channel.sendTyping()
        setTimeout(function () {msg.channel.send({
            content: msg.content.slice(4, msg.content.length), //+ "​",
            allowedMentions: { users: ['1474232223837327510'] }
        })}, (8 * msg.content.length))
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
    } else if (msg.content.toLowerCase()  === "?song") {
      const songs = fs.readdirSync(path.join(import.meta.dir, '..', 'assets','songs')); 
      msg.channel.send({
          files: [{
            attachment: "../assets/songs/" + songs[Math.floor(Math.random() * songs.length)],
            name: "song.mp3",
          }]
      })

    }
    
    // ?gibberish: strings together a random amount of random word
    else if (msg.content.slice(0,10).toLowerCase() === "?gibberish") {
        var amnt = (Math.floor(Math.random() * 12) + 2)
        if (msg.content.slice(10,msg.content.length)) {
            try { amnt = msg.content.slice(10,msg.content.length); }
            catch (err) {  }
        }
        var jibber = gibberish(amnt);
        if (jibber.length > 1999) {
            msg.channel.send("hit the character limit :(");
        } else {
          msg.channel.send({
            content: gibberish(amnt),
            allowedMentions: { users: ['1244108884277465131'] }
        })}
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
                value: `- **?botster:** this one
- **?avatar <userID>:** gets the profile picture of a user based on their ID
- **?image:** sends a random image
- **?song:** sends a random song
- **?say <message>:** says whatever you tell it to
- **?gibberish <amount>:** strings together a random amount of random words (or you can set the amount yourself)
- **?rng <ceiling>:** generates a random number from 1 to <arg>
- **?math <expression>:** does mathematics
- **?meth <expression>:** does methematics
- **?ollama <prompt>:** asks a local llm a question (no memory though)
- **?nuke:** deploys the nukes
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
    
    // ?ollama <prompt>: asks the LOCAL LLM what you tell it to, can see your username and remembers previous messages that were sent to it
    else if (msg.content.startsWith('?ollama')) {
        msg.react('🦞');
        msg.channel.sendTyping()
        msg.channel.sendTyping()

        var userInput = { role: 'user', content: "sender's username: '" + msg.author.username + "'; content: '" + msg.content.slice(8, msg.content.length) + "';"};
        ollamaContext.push(userInput)
        const response = await ollama.chat({
            model: 'qwen3:1.7b',
            messages: ollamaContext,
            think: true
        })
        ollamaContext.push( { role: "assistant", content: response.message.content});
        fs.writeFileSync('./context.json', JSON.stringify(ollamaContext))
        if (response.message.content.length > 1999) {
            msg.channel.send(response.message.content.slice(0,1999))
            msg.channel.send(response.message.content.slice(1999,response.message.content.length))
        } else {
           msg.reply(response.message.content)
        }
    }

    // ?clearContext: clears the context.json file
    else if (msg.content === "?clearContext" && msg.author.id === '1244108884277465131') {
        fs.writeFileSync('./context.json', JSON.stringify(sysPrompt))
        fs.writeFileSync('./bot.ts',fs.readFileSync('./bot.ts').toString())
        msg.reply('context cleared 🫡')
    }
    else if (msg.content === "?67") {
        msg.reply("You are not safe in your home. I will find you")
        msg.channel.send('Prepare')
    }
})
