const { isUtf8 } = require('buffer')

process.on("uncaughtException", (e) => {
    stdin.setRawMode(true)
    console.log(e)
    console.log("Press any key to exit...")
    stdin.resume()
    stdin.on("data", d => {
        process.exit(0)
    })
})
try {
    process.title = "TCP SERVER - NullifiedTheDev"
    // TCP Server designed to work with 0xSnowflakeXD/tcp-toolkit/tcp-client
    // Used built-in features. Nice!
    // Only limited to run on the SAME computer/anything refers to the 127.0.0.1 where the server run
    // NOTICE: tcp-client ONLY PARTIALLY WORK WITH tcp-server UNTOUCHED! PLEASE DON'T CHANGE THE SERVER PORT OTHERWISE IT'LL CORRUPT!

    const net = require('net')
    const fs = require('fs')
    const path = require('path')
    const decrypt = require("../lib-strfucker/lib-strfucker").strfde
    const { stdout: stdout, stdin: stdin } = require('process')

    class PacketUtil {
        constructor() {}
        /**
         * Internal UUID verificator brought from TCP-client. See `Payload().internalVerificator` (tcp-client/index.js).
         * 
         * *Verify if the input is a valid UUID that is acceptable by TTELCP verification system.*
         * @param {string} input 
         * @returns boolean
         */
        verificator(input) {
            let _verfrx = /([a-f]|[0-9]){8}-([a-f]|[0-9]){4}-([a-f]|[0-9]){4}-([a-f]|[0-9]){8}/gm
            if(_verfrx.test(input)) {
                return true
            } else {
                return false
            }
        }
        /**
         * Is this a packet? I wonder...
         * Validates CON and MSG packet, while MSG needs additional field `content`. This is checked by the socket data listener itself.
         * @param {object} input 
         * @returns 
         */
        isPacket(input) {
            if(typeof input !== "object") {
                return false
            } else if(input.header && input.uuid) {
                return true
            } else {
                return false
            }
        }
    }

    console.log(`
________  ______  _______          ______                                               
|        \\/      \\|       \\        /      \\                                              
\\$$$$$$$|  $$$$$$| $$$$$$$\\       | $$$$$$\\ ______   ______ __     __  ______   ______  
    | $$  | $$   \\$| $$__/ $$      | $$___\\$$/      \\ /      |  \\   /  \\/      \\ /       
    | $$  | $$     | $$    $$       \\$$    \\|  $$$$$$|  $$$$$$\\$$\\ /  $|  $$$$$$|  $$$$$$
    | $$  | $$   __| $$$$$$$        _\\$$$$$$| $$    $| $$   \\$$\\$$\\  $$| $$    $| $$   \\$$
    | $$  | $$__/  | $$            |  \\__| $| $$$$$$$| $$       \\$$ $$ | $$$$$$$| $$      
    | $$   \\$$    $| $$             \\$$    $$\\$$     | $$        \\$$$   \\$$     | $$      
     \\$$    \\$$$$$$ \\$$              \\$$$$$$  \\$$$$$$$\\$$         \\$     \\$$$$$$$\\$$      
                                                        
Brought to you like a miracle. (Is it? According to kiwibirb - my best friend and a software engineer)
Credits to NullifiedTheDev

Parsing packets according to TTELCP (TCP Toolkit Exclusively Live Communication Protocol) standards
    `)

    if(!fs.existsSync(path.resolve('./cfg.json'))) {
        fs.appendFileSync(path.resolve('./cfg.json'), JSON.stringify({backlog: 256, port: 55674}))
        console.log("Created configuration file %s", path.resolve("./cfg.json"))
    }
    const options = require('./cfg.json')
    const conns = []
    const cids = []

    const server = net.createServer()
    server.on("connection", (socket) => {
        conns.push(socket)
        socket.setKeepAlive(5000)
        socket.setNoDelay(true)
        socket.allowHalfOpen = true
        stdout.write("Client connected!" + '\n')
        socket.on("data", (d) => {
            // Referrence only!
            try {
                let data = d.toString("utf-8")
                if(!JSON.parse(data).name || JSON.parse(data).name.length > 12) {
                    socket.end(() => {console.log("Ended %s", socket.address)})
                    socket.destroy("Your client sent invalid data.")
                }
                if(JSON.parse(data).uuid && JSON.parse(data).content) {
                    let UUIDValidateRegEx = /([a-f]|[0-9]){8}-([a-f]|[0-9]){4}-([a-f]|[0-9]){4}-([a-f]|[0-9]){8}/gm
                    if(UUIDValidateRegEx.test(JSON.parse(d.toString("utf-8")).uuid)) {
                        conns.forEach(c => {
                            stdout.write(d.toString('utf-8') + "\n")
                            c.write(d.toString('utf-8'))
                        })
                    }
                }
            } catch(e) {
                socket.end(() => {console.log("Ended %s", socket.address)})
                socket.destroy("Your client sent invalid data.")
                return false
            }
        })
        socket.on("error", (err) => {console.log("An error occured with the client.")})
        socket.on("close", () => {
            console.log("Connection closed!")
        })
    })

    server.listen(options.port, '0.0.0.0', options.backlog, () => {
        stdout.write('Sucess! Listening on ' + server.address().address + ':' + server.address().port + '\nNotice: Packets sent by client will not be parsed.\n')
    }).on("error", (e) => {
        stdin.setRawMode(true)
        console.log(e)
        console.log("Press any key to exit...")
        stdin.resume()
        stdin.on("data", d => {
            process.exit(0)
        })
    })
} catch(e) {
    stdin.setRawMode(true)
    console.log(e)
    console.log("Press any key to exit...")
    stdin.resume()
    stdin.on("data", d => {
        process.exit(0)
    })
}