// Designed to run with tcp-toolkit/tcp-server
// Only limited to run on the SAME computer/anything refers to the 127.0.0.1 where the server run
// NOTICE: PARTIALLY WORK WITH tcp-server UNTOUCHED! PLEASE DON'T CHANGE THE SERVER PORT OTHERWISE IT WONT WORK
// TODO: make it works

/**
 * Packet params
 * @param message<String>
 * @param author<AuthorInstance>
 */

const crypto = require("crypto")
const net = require("net")
const { stdin } = require("process")

class Packet {
    constructor(data, uuid) {
        if(typeof data !== 'object' || !(data instanceof Object)) {
            throw new TypeError("Data")
        }
        this.data = data
        this.uuid = uuid
        return this
    }
}
class AuthorInstance {
    constructor(uuid, name) {
        this.uuid = uuid
        this.name = name
        return this
    }
}

class Message extends Packet {
    constructor(content, name, uuid) {
        super(data)
        this.author = new AuthorInstance()
        this.content = content.replace(/\\.{1}/gmi, "")
        this._content = content

        data = {}
    }
}

function UUIDGen() {
    let uuid = [,,,,]
    uuid[0] = crypto.createHash("sha256").update(Date.now().toString()).digest("hex").toString().slice(0, 16)
    uuid[1] = Buffer.from(crypto.randomBytes(8)).toString("hex").slice(0, 8)
    uuid[2] = (Buffer.from("12c-").toString("hex").slice(1, 3) + crypto.createHash("sha256").update(crypto.randomBytes(8)).digest("hex").toString()).slice(0, 8)
    uuid[3] = (crypto.createHash("sha512").update(Buffer.from(crypto.randomBytes(8))).digest("hex").toString().slice(1, 2) + Buffer.from(crypto.randomBytes(15)).toString("hex")).slice(0,16)
    return uuid.join('-')
}

const UUID = UUIDGen()
var username = ""

// process.stdout.write("Please enter your username: ")

// async function listenInput() {
//     let data = ''
//     process.stdin.on('data', (d) => {
//         data = d
//     })
//     return data
// }

// listenInput()
//     .then((d) => {
//         username = d
//     })

const client = net.createConnection(55674, '127.0.0.1', () => {
    console.log("Connected to server.")
    client.allowHalfOpen = true
    client.setNoDelay(true)
    client.setKeepAlive(5000)
    client.write("Hi! I am " + (username || UUID) + '\n')
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
})
client.once("error", (e) => {
    console.log("Something went wrong! The server you're connecting may not be available or there was an error occured during the connection. Please try again!\nPress ctrl+c to exit!")
})
client.on("data", (data) => {
    console.log("[CHAT] " + data.toString("utf-8").replace("[CHAT] ", "").replace("\n", ""))
})

process.stdin.resume()

process.stdin.on("data", (d) => {
    process.stdout.moveCursor(-d.length, -1)
    client.write("[CHAT] " + d)
})

// setInterval(() => {
//     process.stdout.write(UUIDGen() + "\n")
// }, 1)