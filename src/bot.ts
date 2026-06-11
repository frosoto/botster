// import discord.js
import { ChannelManager, Client, EmbedBuilder, Events, GatewayIntentBits, Message, Partials, TextChannel, ActivityType, ButtonStyle, ButtonBuilder, Options } from "discord.js";
import fs from 'fs'; import path from 'path';
import { Database } from "bun:sqlite";
import { ceil, evaluate } from 'mathjs';
import { Pagination } from 'pagination.djs';

console.log("Please let my code work, oh great Anders Hejlsberg (inventor of TypeScript)!")

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
        let text = fs.readFileSync(path).toString();
    
        let lines = text.replace(/\n$/, '').split('\n');
        //let msg = lines[Math.floor(Math.random()*lines.length)]
        let msg = " "
  
        for (let i = 0; i < amnt; i++) {
           msg += lines[Math.floor(Math.random()*lines.length)] + " "
        }
        return msg

  }
}

function rng(floor: number, ceiling: number) {
    return (Math.floor(Math.random() * (ceiling + 1 - floor)) + floor)
}

function respond(msg: Message, content: string, reply: boolean, pings: string[]) {
    let newContent = content.replace(/(?<=\b\w+)ing\b/g, 'ong').replace(/thong/g, 'thing').slice(0, 100)
    if (rng(1, 50) === 42 && msg.content.startsWith("?")) {
        console.log("huh")
        try {msg.reply({
            content: "im so sorry but the response i shouldve sent died in a car crash",
            allowedMentions: { parse: [] }
        }); return} catch (err) {console.error("What")}
    };
    if (reply) {
        if (pings[0] != null) { 
            // replying to a msg, {content: foo, reply: true, pings: []}
            console.log("replying to a msg, {content: \`" + content + "\`, pings: [" + pings.toString() + "]}")
            try {msg.reply({
                content: newContent,
                // allowedMentions: { users: [ "1244108884277465131" ] },
            })} catch(err) {
                (client.channels.cache.get("1488055455879004160") as TextChannel).send('ERROR: ' + err)
            }
        } else {
            console.log("replying to a msg, {content: \`" + content + "\`, pings: [null]}")
            try {msg.reply({
                content: newContent,
                allowedMentions: { parse: [] }
            })} catch(err) {
                (client.channels.cache.get("1488055455879004160") as TextChannel).send('ERROR: ' + err)
                console.log("ERROR: " + err)
            }
        }
    } else if (msg.inGuild()) {
        if (pings[1] != null) { 
            console.log("responding to a msg, {content: \`" + content + "\`, pings: [" + pings.toString() + "]}")
            try {msg.channel.send({
                content: newContent, 
                allowedMentions: { users: pings }
            })} catch(err) {
                (client.channels.cache.get("1488055455879004160") as TextChannel).send('ERROR: ' + err)
            }
        } else {
            console.log("responding to a msg, {content: \`" + content + "\`, pings: [null]}")
            try {msg.channel.send({
                content: newContent, 
                allowedMentions: { parse: [] }
            })} catch(err) {
                (client.channels.cache.get("1488055455879004160") as TextChannel).send('ERROR: ' + err)
                console.log("ERROR: " + err)
            }
        }
    }
}

function jabber(msg: Message, amnt: number) {
    respond(msg, gibberish("../assets/text/vocabulary.md", amnt).slice(0,1999), false, ["1244108884277465131"])
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
        try {await rct.message.fetch()} catch (err) {console.error("boom react thingy errored with " + err)}
    };

    if (rct.emoji.name === "💥" && rct.message.author === client.user) {
        rct.message.delete()
    } else if (rct.emoji.id != "1309965553770954914" && !rct.me && rct.message.author === client.user && rng(1, 3) == 2) {
        respond(rct.message, rct.emoji.name, false, [])
    } else if (rct.emoji.id === "1309965553770954914" && Number(rct.count) === 3 && rct.message.author === client.user) {
        respond(rct.message, "Thank you for the upvotes kind strangers!", true, [])
    }
})

client.on("messageCreate", async msg => {

    if (!blacklistedChannels.includes(msg.channel.id) && rng(1, 4096) === 2) {
        msg.channel.send({
            files: [{
                attachment: "../assets/blue_lobster.mp4",
                name: "blue_lobster.mp4"
            }]
        });
        console.log("BlUE LOBSTER JUMPSCARE");
    }

    let args = msg.content.split(' ');
    if (msg.author != client.user) {
        console.log("Message received! " + msg.channel.id + " " + Date())
    }
    
    if (msg.content.toLowerCase().endsWith("ing") && get_opted(msg.author.id) && !msg.content.toLowerCase().endsWith("thing") && !msg.content.toLowerCase().endsWith("content warning")
        && msg.content.length < 101) {
        // if their message ends with "ing" (and NOT "thing") then it will interject with a classic botster message
        if (rng(1, 6) > 1 && msg.content.length <= 128) {
            // 1/6 chance to not respond, because gambling is great!! woo
            respond(msg, msg.content.slice(0,-3).replace(/(?<=\b\w+)ing\b/g, 'ong').replace(/thong/g, 'thing') + "ong!!! :D", true, [])
        }
    }

    // jabbers if pinged (as long as it doesnt conflict with the "is it true")
    if (msg.mentions.has(client.user) && msg.content.toLowerCase().replace(/\s/g,"") != "<@1471709531363872901>isthistrue") {
        jabber(msg,rng(2,14))
    }

    // @botster is this true: has a 50/50 chance to say it's true, otherwise it says Nuh uh
    else if (msg.content.toLowerCase().replace(/\s/g, "") === "<@1471709531363872901>isthistrue") {
        // 50/50 chance 
        if (rng(1,2) === 1) {
            respond(msg, "hells yeah, this is so #" + (2 + 2 === 4) + "!", true, [msg.author.id])
            if (msg.reference) {
                (await msg.fetchReference()).react('✅')
            } else {
                msg.react('✅')
            }
        } else {
            respond(msg, "noo!! this is so " + (2 + 2 === 3) + "....", true, [msg.author.id])
            if (msg.reference) {
                (await msg.fetchReference()).react('❌')
            } else {
                msg.react('❌')
            }
        }
    }

    if ((msg.content.toLowerCase().includes("clanker") || msg.content.toLowerCase().includes("clanka")
    || msg.content.toLowerCase().includes("wireback") || msg.content.toLowerCase().includes("tinskin")) && get_opted(msg.author.id)) {
        respond(msg, "that's not a very nice word :(", true, [])
    }

    if ((args[0] === "john" || args[0] === "joe" || args[0] === "johnny" || args[0] === "joseph" || args[0] === "jonathan") && !args[2] && args[1] && get_opted(msg.author.id)) {
        respond(msg, "OMG I'm such a big fan of " + args[0] + " " + args[1], true, [])
    }

    if (msg.content.toLowerCase().replace(/!.,?;:1234567890/g,"").replace(/\s/g, "") === "thanksbotster") {
        respond(msg, "heh... you're so welcome... B)", true, [])
    }

    if (msg.content.toLowerCase().replace(/!.,?;:1234567890/g, "").replace(/\s/g,"").endsWith("sorrybotster")) {
        respond(msg, "it's okay, im very forgivong!!! :D", true, [])
    }

    if (msg.content.toLowerCase().replace(/!.,?;:1234567890/g, "").replace(/\s/g,"").endsWith("yougetitbotster") ||
        msg.content.toLowerCase().replace(/!.,?;:1234567890/g, "").replace(/\s/g,"").endsWith("yougetmebotster") ||
        msg.content.toLowerCase().replace(/!.,?;:1234567890/g, "").replace(/\s/g,"").endsWith("botsteryouunderstand")) {
        respond(msg, "i am cursed with knowledge", false, [])
    }

    // if message is just a number, botster will repeat but add 1 more
    if (Number(msg.content).toString() != "NaN" && get_opted(msg.author.id) && msg.content) {
        console.log(msg.content)
        respond(msg, (Number(msg.content) + 1) + "!!! :D", true, [])
    }

    // :3
    if ((msg.content.endsWith(" :3") || msg.content.endsWith(" >:3") || msg.content === ":3" || msg.content === ">:3") && get_opted(msg.author.id) && msg.author != client.user) {
        respond(msg, ":3", false, [])
    }





    // COMMANDS COMMANDS COMMANDS COMMANDS
    
    // my new innovative piping mechanism :fire:
/*    if (args[1] === "|" ) {// && (args[2] === pipableCmds[1] || args[2] === pipableCmds[2]) && pipableCmds.includes(args[0],3)) {

    } */

    // ?say <content>: Botster sends what you tell it to in its own message, excluding attached media.
    if (args[0]?.toLowerCase() === "?say" && msg.author != client.user) {
        // sends gibberish if they dont append an argument, to prevent "Erroring" (errors bad)
        if (args[1] != null) {
                respond(msg, msg.content.slice(4, msg.content.length), false, [])
        } else {
            jabber(msg, rng(2,8))
        }
    }

    /* else if (args[0]?.toLowerCase() === "?leetsay" && msg.author != client.user) {
        if (args[1] != null) {
            respond(msg, msg.content.toUpperCase().replace('T','7').replace('B','8').replace('I','1').replace('S','5').replace('E','3').replace('A','4').replace('G','6').replace('O','0'), false, [])
        } else if (args[1] === "|" && args[2] === "gibberish") {

        }
    } */

    // ?react <emoji> <msgID>: reacts to a specific message with a specific emoji. has to be sent in the same channel
    else if (args[0]?.toLowerCase() === "?react" && msg.author != client.user) {
        if (args[1] && Number(args[2]).toString() != "NaN") {
            try {
                await msg.channel.messages.fetch(args[2])
                    .then(reactee => reactee.react(args[1]))
                    .catch(console.error)
            } catch (err) {console.error(err)}
        } else if (args[1] && msg.fetchReference() != null) {
            (await msg.fetchReference()).react(args[1])
        }
    }

    // ?avatar <userID>: gets the avatar of someone based on their userID
    else if (args[0] === "?avatar" && msg.author != client.user) {
        try {
            const user = await client.users.fetch(args[1]);
            msg.reply({
                files: [{
                    attachment: user.displayAvatarURL({size: 512}),
                    name: 'avatar.webp'
                }]
            });
            console.log("got someones avatar " + args[1] + " ")
        } catch(err) {
            respond(msg,"couldnt find that gamer",true,[])
        };
    }

    // ?pick
    else if (args[0].toLowerCase() === "?pick" && msg.author != client.user) {
	    respond(msg, "i pick " + args[rng(1,args.length - 1)].replace(/_/g," ").replace(/[\r\n]+/gm, " "), true, []);
    }
    // ?8ball <question>: asks the magic 8 ball glorious botster a question
    else if (args[0]?.toLowerCase() === "?8ball" && msg.author != client.user) {
        respond(msg, gibberish('../assets/text/8ball.md', 1), true, [])
    }

    // ?motivation: sends a random motivational quote from motivation.md
    else if (args[0]?.toLowerCase() === "?motivation" && msg.author != client.user) {
        respond(msg, gibberish('../assets/text/motivation.md', 1), true, [])
    }

    else if (args[0]?.toLowerCase() === "?ban" && msg.author != client.user && msg.author.id != "1153836038918242304") {
        respond(msg, "BEEP BOOP I AM GOING TO BAN THEM 🤖🤖🤖", false, [])
    }

    // ?gibberish/?jabber <amount>: jibber jabbers on, random word generator, <amount> controls how many words it sends
    else if ((args[0]?.toLowerCase() === "?gibberish" || args[0]?.toLowerCase() === "?jabber") && msg.author != client.user) {
        // if it's actually a number then it'll use that
        if (Number(args[1]).toString() != "NaN" && args[2] != "|") {
            if (args[2] && args[2] != "|") {
                // revolutionary feature where it continues your sentence with gibberish
                respond(msg, msg.content.slice(12 + args[1]?.length, msg.content.length).replace(/<gibber>/g, gibberish('../assets/text/vocabulary.md', 1).slice(1,-1))
                + gibberish("../assets/text/vocabulary.md", Number(args[1])), false, [])
            } else if (args[2] != "|") {
                jabber(msg, Number(args[1]?.slice(0,5)))
            }
        } else if (args[1]) {
            if (args[1] === "|" && args[2] === "?unteach") {
                // unteaches a random word, i love piping!!!
                const gibber = gibberish('../assets/text/vocabulary.md', 1)
                const vocab = fs.readFileSync("../assets/text/vocabulary.md")
                fs.writeFileSync('../assets/text/vocabulary.md', vocab.toString().replace("\n" + gibber,""))
                respond(msg, "i now DONT know the word \"" + gibber + "\"!!!", false, [])
            } else if ((args[1] === "|" && args[2] === "?scramble") || (Number(args[1]).toString() != "NaN" && args[2] === "|" && args[3] === "?scramble")) {
                let gibber = gibberish('../assets/text/vocabulary.md', rng(1, 8))
                console.log(gibber)
                if (Number(args[1]).toString() != "NaN") {
                    gibber = gibberish('../assets/text/vocabulary.md', Number(args[1]))
                }

                let gibberArgs = gibber.split(" "); let scrambledContent = "";
                console.log(gibberArgs)
                for (let i = 1; i < gibberArgs.length; i++) {
                    let splitWord = gibberArgs[i]?.split('');
                    for (let i2 = 1; i2 <= gibberArgs[i]?.length; i2++) {
                        let letter = splitWord[rng(0, splitWord.length - 1)]
                        scrambledContent = scrambledContent + letter
                        splitWord?.splice(splitWord.indexOf(letter), 1)
                    }
                    scrambledContent = scrambledContent + " "
                    // console.log(scrambledContent)
                }
                respond(msg, scrambledContent, true, [])
            } else {
                // revolutionary feature where it continues your sentence with gibberish
                respond(msg, msg.content.slice(11, msg.content.length).replace(/<gibber>/g, gibberish('../assets/text/vocabulary.md', 1).slice(1,-1))
                + gibberish("../assets/text/vocabulary.md", rng(1,5)), false, [])
            }
        } else {
            jabber(msg, rng(2,8))
        }
    }

    // ?vocabulary: sends the vocabulary.md file
    else if (args[0]?.toLowerCase() === "?vocabulary") {
        msg.reply({
            content: "OK",
            allowedMentions: { parse: [] },
            files: [{
                attachment: '../assets/text/vocabulary.md',
                name: 'vocabulary.md'
            }]
        })
    }

    // ?teach <vocabulary>: teaches botster a new word/phrase! 24 character limit
    else if (args[0]?.toLowerCase() === "?teach" && !msg.author.bot && args[1] && msg.author.id != "1354237568992018475") {
        let newVocab = msg.content.slice(7, msg.content.length).toLowerCase().slice(0,24).replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"").replace(/\s+/g,"")

        let vocab = fs.readFileSync('../assets/text/vocabulary.md')
        let lines = vocab.toString().replace(/\n$/, '').split('\n')

        // if it's NOT in the file, appends it. pretty simple
        if (!lines.includes(newVocab)) {
            fs.appendFileSync('../assets/text/vocabulary.md', newVocab + "\n")
            respond(msg, "i now know the word \"" + newVocab + "\"!!! hopefully it's not a slur", false, [])
        } else {
            respond(msg, "i already know that word :​sob:", false, [])
        }
    }

    else if (args[0]?.toLowerCase() === "?unteach" && !msg.author.bot) {
        let oldVocab = msg.content.slice(9, msg.content.length).slice(0,24) //.toLowerCase().slice(0,24).replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"").replace(/\s+/g,"")
        console.log(oldVocab)
 
        let vocab = fs.readFileSync('../assets/text/vocabulary.md')
        let lines = vocab.toString().replace(/\n$/, '').split('\n')

        // if it's in the file already, removes it. pretty simple
        if (lines.includes(oldVocab)) {
            fs.writeFileSync('../assets/text/vocabulary.md', vocab.toString().replace("\n" + oldVocab + "\n","\n"))
            respond(msg, "i now DONT know the word \"" + oldVocab + "\"!!!", false, [])
        } else {
            respond(msg, "i dont know that word :​sob:, maybe teach it", false, [])
        }
    }

    // ?wordnew: makes a new word
    else if (args[0]?.toLowerCase() === "?wordnew" && msg.author != client.user) {
        const vowels = "aeiouy".split(''); const consonants = "bcdfghjklmnpqrstvwxz".split('');
        let newWord = ""
        for (let i = 0; i < rng(3,14); i++) {
            // stitches together a 4-7 character word with random letters
            if (rng(1,3) === 1) {
                newWord = newWord + vowels[rng(0,vowels.length - 1)]
            } else {
                newWord = newWord + consonants[rng(0,consonants.length - 1)]
            }
        }
        if (args[1] === "|" && args[2] === "?teach") {    
            let lines = fs.readFileSync('../assets/text/vocabulary.md').toString().replace(/\n$/, '').split('\n')

            if (!lines.includes(newWord)) {
                fs.appendFileSync('../assets/text/vocabulary.md', newWord + "\n")
                respond(msg, "i now know the word \"" + newWord + "\"!!! hopefully it's not a slur", false, [])
            } else {
                respond(msg, "i already know that word :​sob:", false, [])
            }
        } else if (args[1] === "|" && args[2] === "?scramble") {
            let scrambledContent = ""
            let splitWord = newWord.split('');
            for (let i2 = 1; i2 <= newWord.length; i2++) {
                let letter = splitWord[rng(0, splitWord.length - 1)]
                scrambledContent = scrambledContent + letter
                splitWord?.splice(splitWord.indexOf(letter), 1)
            }
            respond(msg, scrambledContent, true, [])
        } else {
            respond(msg, "i invented a new word, it's \"" + newWord + "\"!!! :D", false, [])
        }
    }

    // ?scramble: scrambles a word/phrase
    else if (args[0]?.toLowerCase() === "?scramble" && msg.author != client.user) {
        let scrambledContent = ""
        for (let i = 1; i < args.length; i++) {
            let splitWord = args[i]?.split('');
            for (let i2 = 1; i2 <= args[i]?.length; i2++) {
                let letter = splitWord[rng(0, splitWord.length - 1)]
                scrambledContent = scrambledContent + letter
                splitWord?.splice(splitWord.indexOf(letter), 1)
            }
            scrambledContent = scrambledContent + " "
            // console.log(scrambledContent)
        }
        respond(msg, scrambledContent, true, [])
    }

    // ?rng <floor> <ceiling>: random number generator
    else if (args[0]?.toLowerCase() === "?rng" && msg.author != client.user) {
        // making sure both arguments are present (floor and ceiling)
        let theNumber = rng(Number(args[1]), Number(args[2])).toString()
        // example output: "RNG from `1`-`5` is `3`"
        if (args[3] === "|" && args[4] === "?gibberish") {
            respond(msg, gibberish("../assets/text/vocabulary.md", Number(theNumber.slice(0,4))), false, [])
        } else {
            respond(msg, "RNG from `" + args[1] + "`-`" + args[2] + "` is \`" + theNumber + "\`", true, [])
        }
    } 

    // ?math <expression>: evaluates math, but it DOESN'T use eval() or anything so don't bother
    else if (args[0]?.toLowerCase() === "?math" && msg.author != client.user) {
        if (args[1]) {
            let expression = msg.content.slice(5, msg.content.length)
            respond(msg, "your expression equals \"" + evaluate(expression).toString() + "\"", true, [])
        } else {
            // starts quaking and trembling in fear if there's no math (to prevent erroring)
            respond(msg, "AAAAAA YOU DIDNT SEND ANYTHING FOR ME TO MATH", true, [msg.author.id.toString()])
        }
    }
    // ?meth <expression>: evaluates meth
    else if (args[0]?.toLowerCase() === "?meth" && msg.author != client.user) {
        let expression = msg.content.slice(5, msg.content.length)
        let offset = Number(Math.floor(Math.random() * 1000) * 0.00001)
        respond(msg, "your _        _ equals \"\"\"" + (Number(evaluate(expression)) + Number(offset)) + "\"\"\"\" !", false, [])
    }
    
    // ?opt<in/out>: opts you in or out
    else if (args[0]?.toLowerCase().startsWith("?opt") && msg.author != client.user) { 
        // if they send ?optin then it'll opt them in, but if they send anything else it won't
        opt_in(msg.author.id, (args[0].toLowerCase().slice(4, args[0].length) === "in")) 
        respond(msg, "O K, you just got opted " + args[0].toLowerCase().slice(4,args[0].length), false, [])
        // this technically means that you can say ?optwortjowetu0345 and botster will say "O K, you just got opted wortjowetu0345"
    }

    // ?eval <javascript>: runs javascript code! on my own machine!
    else if (args[0]?.toLowerCase() === "?eval" ){// && msg.author != client.user) {
        respond(msg, "Runnong your JavaScript code now! :D", true, [])
        if (args[1]?.startsWith('console.log(') && (msg.content.endsWith(')'))) {
            respond(msg, "```js\n" + msg.content.slice(18, -1) + "\n```", false, [])
        } else if (args[1]?.startsWith('console.error(') && msg.content.endsWith(')')) {
            respond(msg, "```ansi\n[2;31m" + msg.content.slice(20,-1) + "[0m\n```", false, [])
        }
    }

    else if (args[0]?.toLowerCase() === "?botster") {
        const pagination = new Pagination(msg)
            .setColor(0xBE1931)
            .setTitle('botster')
            .setDescription('I will botst until the sands of time are gone!! :D')
            .setThumbnail('https://cdn.discordapp.com/avatars/1471709531363872901/9d8b4c838aa3525dbfd9c8f8931fd569.webp?size=1024')
            .setFields([{
                name: 'Normal Commands',
                value: `- **?say <message>:** Says what you tell it to!
- **?leetsay <message>:** Says what you tell it to but like a l33t h4x0r would...
- **?rng <floor> <ceiling>:** Generates a random number from the fields you provided!
- **?eval <code>:** Totally runs your javascript code through eval(), 1000%
- **?optin/?optout:** Opts you in or out to interjections. Fun fact: if you say anything after "?opt" other than "in" then it will opt you out, and the command still works. Try it with ?optwoejrtolsfm or something like that
- **?math <expression>:** Uses mathematics to solve your expression.
- **?meth <expression>:** Uses methematics to solve your expression.
- **?pick <options>:** Picks from a variety of options, separated by spaces. Replaces all underscores with spaces.
                `
            }, {
                name: 'Vocabulary/Gibberish Commands', 
                value: `- **?gibberish <amount/start>:** Sends gibberish with random words from vocabulary.md. Can customize the amount of words with an argument, make it generate gibberish after a specified string, or pipe it to send a random amount of words within your own range like **?gibberish | ?rng 50 60**.
- **?vocabulary:** Sends the vocabulary.md file
- **?wordnew:** Generates a new word from completely random letters in a random order!
- **?teach:** Teaches a new word to my vocabulary, you can pipe it like **?teach | ?wordnew** to make it a new word I invent.
- **?unteach:** Removes a word from my vocabulary, you can pipe it like **?unteach | ?gibberish** to remove a random word. Please be nice!
- **?8ball <question>:** Responds with a random Magic 8 Ball phrase to help answer questions or decide decisions.
- **?motivation:** Sends a random motivational quote from motvation.md`
            }, {
                name: 'Interjections',
                value: `- Any message that ends in "ing" will be repeated but with "ong!!! :D" at the end!
- Saying "clanker", "clanka", "wireback", or "tinskin" makes Botster get real sad and say "that's not a very nice word :("
- Saying "john <blank>" makes Botster go "OMG I'm such a big fan of john <blank>". This also works for "joe", "johnny", "joseph", and "jonathan"
- This doesn't require being opted in, but saying "<@1471709531363872901> is this true" will ask Botster if it's true or not (50/50 chance)`
            }
            ])
            .setTimestamp()
            .setFooter({ text: 'lobstercorp', iconURL: 'https://discord.com/assets/058354fcb696333d.svg'});
        pagination.paginateFields(true)
        pagination.setEmojis({
            firstEmoji: '<:lobster_left2:1493437591528411277>',
            prevEmoji: '<:lobster_left:1493437568514003138>',
            nextEmoji: '<:lobster_right:1493437661145206824>',
            lastEmoji: '<:lobster_right2:1493437674659254285>'
        })
        // pagination.buttons = { prev: new ButtonBuilder(), next: new ButtonBuilder() };
        pagination.setLimit(1)
        pagination.render()
    }
})
