// Designed to run with tcp-toolkit/tcp-server
// Only limited to run on the SAME computer/anything refers to the 0.0.0.0 where the server run
// NOTICE: PARTIALLY WORK WITH tcp-server UNTOUCHED! PLEASE DON'T CHANGE THE SERVER PORT OTHERWISE IT WONT WORK
// Kiwibirb rewrite this in TS
// Irreversible damage-
// TODO: make it works (completed)
const crypto = require("crypto")
const { read } = require("fs")

import { EventEmitter } from "node:events";
import { Socket } from "node:net";
import { createInterface, Readline } from "node:readline/promises";
import { promisify } from "node:util";
import { stdout, stdin, exit } from "node:process";
import { error, info } from "node:console";

const DEFAULT_PORT = 55674;
const DEFAULT_HOST = '127.0.0.1';

/**
 * A raw message sent to or received from the TTELCP server.
 */
interface TTELCPMessagePayload {
    uuid: string,
    content: string,
}
/**
 * A TTELCP Client User interface.
 */
interface User {
    username: string;
    id: string;
}
/**
 * Options for sending a TTELCP message. 
 */
interface SendOptions {
    content: string;
}
class Client extends EventEmitter {
    /**
     * The user that instantiated the client.
     */
    user: User;
    /**
     * A TCP connection to the server.
     */
    socket: Socket;
    /**
     * Connection status of client.
     */
    connected: boolean = false;
    constructor (username: string) {
        super();
        this.user = { username, id: make_uuid() };
        this.socket = new Socket();
    }
    /**
     * Internal handler for TCP data.
     */
    private handle_data (data: Buffer): void {
        // Sanity checking.
        if (data.length < 3 || data[0] !== "{".charCodeAt(0)) return void(0);
        // Data parsing.
        let json_data = null;
        try { json_data = JSON.parse(data.toString("utf-8")); }
        catch (e) { return void(0); }
        // Type checking.
        if (!is_TTELCPMessagePayload(json_data)) return void(0);
        // Trim the message whitespace.
        if (json_data.content = json_data.content.trim()) return void(0);
        // Ignore empty messages.
        if (json_data.content.length === 0) return void(0);
        // Emit an event if everything is correct.
        this.emit("message", json_data);
    }
    /**
     * Internal handler for TCP socket closure.
     */
    private handle_close () {
        this.emit("close");
        this.connected = false;
    }
    /**
     * Internal handler for TCP socket errors.
     */
    private handle_error (e: Error) {
        this.emit("error", e);
        this.connected = false;
    }
    /**
     * Connect to the remote server.
     */
    public connect (ip: string = DEFAULT_HOST, port: number = DEFAULT_PORT): Promise<void> {
        if (this.connected === true) throw new Error("Client already connected.");
        this.socket.on("data", this.handle_data);
        this.socket.on("close", this.handle_close);
        this.socket.on("error", this.handle_error);
        return new Promise((resolve, reject) => {
            let temp_err_listener = (e: Error) => {
                this.socket.off("error", temp_err_listener);
                this.socket.off("connect", temp_connect_listener);
                this.connected = false;
                this.emit("error", e);
                reject(e);
            }
            let temp_connect_listener = () => {
                this.socket.off("error", temp_err_listener);
                this.socket.off("connect", temp_connect_listener);
                this.connected = true;
                this.emit("ready", this);
                resolve();
            }
            this.socket.on("error", temp_err_listener);
            this.socket.on("connect", temp_connect_listener);
            this.socket.connect(port, ip);
        });
    }
    /**
     * Directly send a raw TTELCP message.
     */
    private send_raw (payload: TTELCPMessagePayload): Promise<void> {
        if (!this.connected) throw new Error("Not connected to server.");
        return new Promise((resolve, reject) => {
            this.socket.write(JSON.stringify(payload), (err) => {
                if (typeof err !== "undefined") reject(err);
                else resolve();
            });
        })
    }
    /**
     * Send a message to the remote server.
     */
    public send (options: SendOptions): Promise<void> {
        if (options.content.length === 0) throw new Error("Got you! Spamming enter never be that easy. Being annoying in order to prevent future actions >~<\nActually prevented a timer bomb in TS: Cannot send empty messages");
        return this.send_raw({
            uuid: make_uuid(),
            content: options.content
        });
    }
}

/**
 * Interface type check for TTELCPMessagePayload.
 */
function is_TTELCPMessagePayload (message: any): message is TTELCPMessagePayload {
    if (typeof message !== "object") return false;
    if (Object.keys(message).length > 2) return false;
    if (!("uuid" in message)) return false;
    if (!("content" in message)) return false;
    return true;
}

/**
 * Returns an array of psuedorandom bytes.
 */
function randomBytes (length: number, max: number = 255) {
    let result = Buffer.allocUnsafe(length);
    let n = max + 1;
    for (let i = 0; i < length; i++) {
        result[i] = Math.floor(Math.random() * n);
    }
    return result;
}

/**
 * Returns a new TTELCP ID.
 */
function make_uuid () {
    let final_uuid = Buffer.allocUnsafe(8 + 4 + 4 + 8);
    final_uuid.copy(randomBytes(8, 16), 0, 8, 0);
    final_uuid.copy(randomBytes(4, 16), 0, 4, 0 + 8);
    final_uuid.copy(randomBytes(4, 16), 0, 4, 0 + 8 + 4);
    final_uuid.copy(randomBytes(8, 16), 0, 8, 0 + 8 + 4 + 4);
    return Array.from(final_uuid).map(n => n.toString(16)).join("-");
}

// Main process.
;(async function mainnnnnne () {
    // Check TTY.
    if (!stdin.isTTY) {
        error("Standard input is not a TTY.");
        exit(1);
    }
    // ReadLine API.
    const rl = createInterface({
        input: stdin,
        output: stdout,
        prompt: "> "
    });
    const cursor = new Readline(stdout);
    // Set username.
    const username = await rl.question("username: ");
    // Connect to server.
    let client = new Client(username);;
    try { await client.connect(); }
    catch (e) {
        error("Failed to reach server.");
        exit(1);
    }
    // Print messages.
    client.on("message", (payload: TTELCPMessagePayload) => {
        cursor.clearLine(-1);
        rl.write(`[received]: ${payload.content}\n`);
        rl.prompt();
    });
    // Process user input.
    rl.prompt();
    for await (const line of rl) {
        let content = line.trim();
        if (content !== "") await client.send({ content });
        rl.prompt();
    }
})();