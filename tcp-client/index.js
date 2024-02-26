// Designed to run with tcp-toolkit/tcp-server
// Only limited to run on the SAME computer/anything refers to the 0.0.0.0 where the server run
// NOTICE: PARTIALLY WORK WITH tcp-server UNTOUCHED! PLEASE DON'T CHANGE THE SERVER PORT OTHERWISE IT WONT WORK
// TODO: make it works (completed)

const crypto = require("crypto")
const EventEmitter = require("events")
const { read } = require("fs")
const net = require("net")
const readline = require("readline")
const eem = EventEmitter

const rl = readline.createInterface({input: process.stdin, output:process.stdout, prompt: "> "})

/**
 * Generate UUID with TTELCP protocol standards for the TTELCP client.
 * Return an UUID for the packet verification stage.
 * @author NullifiedTheDev
 * @returns UUID
 */
function UUIDGen() {
    let uuid = []
    uuid.push(crypto.createHash("sha256").update(Date.now().toString()).digest("hex").toString().slice(0, 8))
    uuid.push(Buffer.from(crypto.randomBytes(8)).toString("hex").slice(0, 4))
    uuid.push((Buffer.from("12c-").toString("hex").slice(1, 3) + crypto.createHash("sha256").update(crypto.randomBytes(8)).digest("hex").toString()).slice(0, 4))
    uuid.push((crypto.createHash("sha512").update(Buffer.from(crypto.randomBytes(8))).digest("hex").toString().slice(1, 2) + Buffer.from(crypto.randomBytes(15)).toString("hex")).slice(4,12))
    return uuid.join('-')
}
const UUID = UUIDGen()
// process.stdout.write("Please enter your username: ")

// async function listenInput() {
//      let data = ''
//      process.stdin.on('data', (d) => {
//         data = d
//     })
//     return data
// }

// listenInput()
//     .then((d) => {
//         eem.emit("_r", d)
//     })

// SCHEMA:
// {
//     uuid: UUID,
//     content: ""
// }

var client = net.createConnection(55674, '0.0.0.0', () => {
    console.log("Connected to server.")
    client.setKeepAlive(5000)
})
client.on("timeout", () => {
    client.end(() => {
        console.log("Ended connection due to timeout.")
        client.destroy()
    })
})
client.once("close", () => {
    console.log("The server closed the connection.")
})
client.once("end", () => {
    console.log("The server ended the connection.")
})
client.on("ready", () => {
    console.log("Connection ready!")
    rl.prompt()
})
client.once("error", (e) => {
    console.log("We can't reach to the destination server. Please try again!\nPress ctrl+c to exit!")
})
client.on("data", (data) => {
    const str = JSON.parse(data.toString("utf-8").replace(/\n/, "")).content
    process.stdout.write(str)
})

if(!process.stdin.isTTY) {
    throw new Error("FATAL: Terminal is not TTY. Couldn't process input")
}

/**
 * Write the payload to client.write()
 * @param {String} d
 */

process.stdin.resume()

rl.on("line", (data) => {
    if(!data || data == '' || data == "\n") {
        return false
    }
    const payload = {
        uuid: UUID,
        content: data
    }
    client.write(`${JSON.stringify(payload)}`)
    rl.prompt()
}).on("close", () => {
    process.exit(0)
})

// setInterval(() => {
//     process.stdout.write(UUIDGen() + "\n")
// }, 1)