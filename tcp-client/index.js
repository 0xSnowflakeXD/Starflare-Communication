// Designed to run with tcp-toolkit/tcp-server
// NOTICE: PARTIALLY WORK WITH tcp-server UNTOUCHED! PLEASE DON'T CHANGE THE SERVER PORT OTHERWISE IT WONT WORK
// TODO: make it works

/**
 * Packet params
 * @param message<String>
 * @param author<AuthorInstance>
 */

const crypto = require("crypto")
const net = require("net")

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

const client = net.createConnection(55674, "0.0.0.0", () => {
    console.log("Connected to server.")
    client.write("Hi! I am " + UUID)
})

// setInterval(() => {
//     process.stdout.write(UUIDGen() + "\n")
// }, 1)