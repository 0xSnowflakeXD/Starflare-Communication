// Designed to run with tcp-toolkit/tcp-server
// Only limited to run on the SAME computer/anything refers to the 0.0.0.0 where the server run
// NOTICE: PARTIALLY WORK WITH tcp-server UNTOUCHED! PLEASE DON'T CHANGE THE SERVER PORT OTHERWISE IT WONT WORK
// Classes based on kiwibirb's idea.
// TODO: make it works (completed)

const crypto = require("crypto")
const EventEmitter = require("events")
const { stdin, stdout } = require("process")
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
/**
 * Not TTY Error. I don't know what's this for
 */
class NotTTYError extends Error {
    constructor(s) {
        super(s + " is not TTY.")
    }
}
/**
 * Payload.
 */
class Payload {
    /**
     * Make a payload from provided content and UUID.
     * Make an error if one of two parameter isn't a string.
     * @param {String} c 
     * @param {String} u 
     */
    constructor(c, u) {
        if(typeof c !== "string" || typeof u !== "string") {
            throw new TypeError("Provided content 'c' or UUID 'u' isn't a string.")
        }
        this.content = c.toString()
        this.uuid = u.toString()
    }
}

/**
 * Main class for Client creation & intialization.
 * @extends EventEmitter
 */
class Client extends EventEmitter {
    /**
     * Create a client with provided UUID.
     * @since Snapshot 4922
     * @author NullifiedTheDev
     * @param {string} _UUID
     */
    constructor(_UUID) {
        super()
        this.UUID = _UUID || UUIDGen()
        this.socket = net.createConnection(55674, '0.0.0.0', () => {
            console.log("Connected to server.")
            this.socket.setKeepAlive(5000)
        })
        this.socket.on("timeout", () => {
            this.socket.end(() => {
                console.log("Ended connection due to timeout.")
                this.socket.destroy()
            })
        })
        this.socket.on("data", (d) => {
            this.emit("message", d.toString("utf-8"))
        })
    }
    /**
     * Parse provided payload. Returns parsed payload in JSON.
     * Will throw an Error if `payload` isn't instance of Payload. A TypeError is thrown if the payload isn't valid (to avoid what i call "Class name camouflage").
     * @since Snapshot 4922
     * @author NullifiedTheDev
     * @param {Payload} payload 
     * @returns Object of the Payload under parsed form in JSON
     */
    parse(payload) {
        if(!payload instanceof Payload) { // Check if it is Payload or not.
            throw new Error("Payload isn't an instance of Payload. Received " + payload + " instanceof " + (payload.constructor.name || "<unknown>"))
        }
        if(!payload.content || typeof payload.content !== "string" || !payload.uuid || typeof payload.content !== "string") {
            throw new TypeError("Payload isn't a valid Payload. Received " + payload)
        }
        return {content: payload.content, uuid: payload.uuid}
    }
    /**
     * Parse provided payload then send.
     * @since Snapshot 4922
     * @author NullifiedTheDev
     * @param {Payload} payload
     * @returns Promise containing socket 
     */
    send(payload) {
        return void new Promise((res, rej) => {
            try {
                let payload_ = this.parse(payload)
                this.socket.write(JSON.stringify(payload_))
                res(this.socket)
            } catch(e) {
                rej(e)
            }
        })
    }
    /**
     * Get UUID.
     * @returns UUID
     */
    getUUID() {
        return this.UUID
    }
    /**
     * Verify if the input is a valid UUID that is acceptable by TTELCP verification system.
     * @param {string} input 
     * @returns boolean
     */
    internalVerificator(input) {
        let _verfrx = /([a-f]|[0-9]){8}-([a-f]|[0-9]){4}-([a-f]|[0-9]){4}-([a-f]|[0-9]){8}/gm
        if(_verfrx.test(input)) {
            return true
        }
    }
    /**
     * Handles Data.
     * @param {Buffer} input 
     * @returns 
     */
    datahandler(input) {
        if (!input instanceof Buffer) { throw new TypeError("Datahandler can only handle Buffers!") }
        if (input.toString('utf-8').length < 3 || !input.toString('utf-8').startsWith("{") || !input.toString("utf-8").endsWith("}")) { return false }
        try {
            return JSON.parse(input.toString("utf-8"))
        } catch(e) {
            return {content: "*Message couldn't be parsed!", uuid: "coffee00-1234-1234-effec100"}
        }
    }
    /**
     * Returns client socket interface.
     * @returns Socket
     */
    getClientInterface() {
        return this.socket
    }
}

if(!process.stdin.isTTY) { // STDIN is not a TTY cause various input problems
    throw new NotTTYError("STDIN")
}
if(!process.stdout.isTTY) { // STDOUT is not a TTY cause various formatting & output problems
    throw new NotTTYError("STDOUT")
}

// Resume to make the input method turn from brick to actually usable things and set raw mode to false.
stdin.resume()
stdin.setRawMode(false)

;(async function main() {
    process.stdout.clearScreenDown() // Clear screen down
    const clnt = new Client(UUID)
    clnt.getClientInterface().on("data", (d) => {
        // Print formatted message to screen
        process.stdout.write(`[CHAT] [${clnt.datahandler(d)?.uuid}] ${clnt.datahandler(d)?.content}\n`)
        // Refresh of course
        process.stdout.clearScreenDown()
    })
    process.stdin.on("data", d => {
        // New payload
        const pl = new Payload(d.toString("utf-8").trim(), clnt.getUUID())
        if(pl.content === "\u0003") { // If raw mode was true, this is going to be useed
            process.exit(0)
        }
        process.stdout.moveCursor(-d.length, -2) // Stay in place, move to the very left
        process.stdout.clearLine() // Clear line
        clnt.send(pl) // Send payload to the server. It seem to be impossible to send a class, right?
    })
})();