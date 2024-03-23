const crypto = require("crypto")
const EventEmitter = require("events")
const { stdin, stdout } = require("process")
const net = require("net")
const readline = require("readline")
const eem = EventEmitter
const fs = require("fs")
const path = require("path")

process.on("uncaughtException", (e) => {
    process.stdin.setRawMode(true)
    console.log(e)
    console.log("Press any key to exit...")
    process.stdin.resume()
    process.stdin.on("data", d => {
        console.clear()
        process.exit(0)
    })
})
try {
    // Designed to run with tcp-toolkit/tcp-server
    // Only limited to run on the SAME computer/anything refers to the 0.0.0.0 where the server run
    // NOTICE: PARTIALLY WORK WITH tcp-server UNTOUCHED! PLEASE DON'T CHANGE THE SERVER PORT OTHERWISE IT WONT WORK
    // Classes based on kiwibirb's idea.
    // TODO: make it works (completed)

    // const {strfde: decoder, strfe: encoder} = require("../lib-strfucker/lib-strfucker")

    const rl = readline.createInterface({input: process.stdin, output:process.stdout, prompt: "> "})

    process.title = "TCP CLIENT - NullifiedTheDev"
    
    if(!fs.existsSync(path.resolve('./cfg.json'))) {
        fs.appendFileSync(path.resolve('./cfg.json'), JSON.stringify({address: "0.0.0.0", port: 55674}))
        console.log("Created configuration file %s", path.resolve("./cfg.json"))
    }
    const options = require('./cfg.json')

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

    let NAME = ""
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
         * @param {string} c 
         * @param {string} u 
         */
        constructor(c, u) {
            if(typeof c !== "string" || typeof u !== "string") {
                throw new TypeError("Provided content 'c' or UUID 'u' isn't a string.")
            }
            this.header = "MSG"
            this.content = c.toString()
            this.uuid = u.toString()
            this.name = NAME
        }
    }
    /**
     * A class of `CON` packet.
     * Not to be misconsidered with TCP `CON` packet, this is used for TTELCP
     * 
     * Used for connection & UUID registering.
     * Any data sent will render invalid if this packet is NOT sent first.
     *
     */
    class CON {
        /**
         * Constructs CON packet.
         * @param {string} uuid 
         */
        constructor(uuid) {
            this.header = "CON"
            this.uuid = uuid
        }
    }
    /**
     * Main class for Client creation & intialization.
     * @extends EventEmitter
     * @constructor
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
            this.socket = net.createConnection(parseInt(options.port) !== NaN ? parseInt(options.port) : 55674, net.isIP(options.address) ? options.address : "0.0.0.0", () => {
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
         * @param {CON} payload
         * @returns Object of the Payload under parsed form in JSON
         */
        parse(payload=new Payload("_", UUID)) {
            if(!payload instanceof Payload || !payload instanceof CON) { // Check if it is Payload or not.
                throw new TypeError("Payload isn't an instance of Payload or CON. Received " + payload + " instanceof " + (payload.constructor.name || "<unknown>"))
            }
            if(payload instanceof CON) {   
                return {header: payload.header, uuid: payload.uuid}
            }
            if(!payload.content || typeof payload.content !== "string" || typeof payload.content === "object" || !payload.uuid|| typeof payload.uuid !== "string") {
                throw new Error("Payload isn't a valid Payload or CON payload. Received " + payload)
            }
            return {header: payload.header, content: payload.content, uuid: payload.uuid, name: payload.name}
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
        internalVerificator(input="") {
            let _verfrx = /([a-f]|[0-9]){8}-([a-f]|[0-9]){4}-([a-f]|[0-9]){4}-([a-f]|[0-9]){8}/gm
            if(_verfrx.test(input)) {
                return true
            } else {
                return false
            }
        }
        /**
         * If your input matches, your name isn't acceptable by TTELCP verification system.
         * @param {string} input 
         * @returns 
         */
        nameVerificator(input="") {
            let _verfrx = /[`'"~!@#$%^&*()_+={}\[\]|\\:;“’<,>.?๐฿\s]+/gmi
            if(!_verfrx.test(input)) {
                return false
            } else {
                return true
            }
        }
        /**
         * Handles Data.
         * @param {Buffer} input 
         * @returns 
         */
        datahandler(input) {
            try {
                return JSON.parse(input.toString("utf-8"))
            } catch(e) {
                return {header: "MSG", content: "*Message couldn't be parsed!", uuid: "coffee00-1234-1234-abcdabcd"}
            }
        }
        /**
         * Returns current (being connected to, at the time called) client socket interface.
         * @returns Socket
         */
        getCurrSocketInterface() {
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

    let a = false

    // Because of global needs for "clnt", i moved it there
    const clnt = new Client(UUID)

    ;(async function main() {
        /**
         * Record the username
         */
        async function listener(d=new Buffer()) {
            NAME = d.toString().trim().slice(0,12)
            if(clnt.nameVerificator(NAME) || NAME.length < 1) {
                process.stdout.moveCursor(-d?.length, -3)
                process.stdout.clearScreenDown()
                process.stdout.write("Your username contain disallowed special characters.\n")
                return;
            }
            await console.clear()
            if(d.length > 12) {
                console.error("\x1b[1;31mWARNING: Truncated your username at 12th character.\x1b[0m")
                a = false
            }
            a = true
            process.stdin.removeListener("data", listener)
            return new Promise((res, rej) => {
                res(true)
            })
        }
        process.stdout.write("Name?\n")
        await process.stdin.on("data", listener)
    })().then(_ => {
        process.stdout.clearScreenDown() // Clear screen down
        clnt.getCurrSocketInterface().on("data", (d) => {
            if(!clnt.internalVerificator(clnt.datahandler(d)?.uuid)) {
                process.stdout.write(`[CHAT] [<Invalid UUID>] *Message couldn't be displayed.\n`)
            }
            // Print formatted message to screen
            process.stdout.write(`[CHAT] [${clnt.datahandler(d)?.name}] ${clnt.datahandler(d)?.content}\n`)
            // Refresh of course
            process.stdout.clearScreenDown()
        })
            .on("end", () => {
                console.log("Server ended the connection")
            })
            .on("error", (e) => {
                console.log("An error occured: %s", e)
            })
            .on("close", (hadError) => {
                console.log("Connection closed. Error: %s", hadError)
                stdin.setRawMode(true)
                console.log("Press any key to exit...")
                stdin.resume()
                stdin.on("data", d => {
                    console.clear()
                    process.exit(0)
                })
            })
        process.stdin.on("data", d => {
            /**
             * Don't send message while users are thinking for their name
             */
            if(a !== true) {
                return false
            }
			if(d.toString().trim().length < 1) {
                process.stdout.moveCursor(0, -2)
				return false
			}
            // New payload
            const pl = new Payload(d.toString("utf-8").trim(), clnt.getUUID())
            if(pl.content === "\u0003") { // If raw mode was true, this is going to be useed
                process.exit(0)
            }
            process.stdout.moveCursor(-d.length, -2) // Stay in place, move to the very left
            process.stdout.clearLine() // Clear line
            clnt.send(pl) // Send payload to the server. It seem to be impossible to send a class, right?
        })
		process.on("beforeExit", (_) => {
            clnt.getCurrSocketInterface().destroySoon()
		})
		process.on("exit", (_) => {
            clnt.getCurrSocketInterface().destroySoon()
        })
    });
} catch(e) {
    stdin.setRawMode(true)
    console.log(e)
    console.log("Press any key to exit...")
    stdin.resume()
    stdin.on("data", d => {
        console.clear()
        process.exit(0)
    })
}