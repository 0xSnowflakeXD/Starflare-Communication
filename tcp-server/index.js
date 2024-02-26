// TCP Server designed to work with 0xSnowflakeXD/tcp-toolkit/tcp-client
// Used built-in features. Nice!
// Only limited to run on the SAME computer/anything refers to the 127.0.0.1 where the server run
// NOTICE: tcp-client ONLY PARTIALLY WORK WITH tcp-server UNTOUCHED! PLEASE DON'T CHANGE THE SERVER PORT OTHERWISE IT'LL CORRUPT!

const net = require('net')
const fs = require('fs')
const path = require('path')
const { stdout: stdout, stdin: stdin } = require('process')

console.log(`
________  ______  _______          ______                                               
|        \\/      \\|       \\        /      \\                                              
 \\$$$$$$$|  $$$$$$| $$$$$$$\\      |  $$$$$$\\ ______   ______ __     __  ______   ______  
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

const server = net.createServer()
server.on("connection", (socket) => {
    conns.push(socket)
    socket.setKeepAlive(5000)
    socket.setNoDelay(true)
    socket.allowHalfOpen = true
    stdout.write("Client connected!" + '\n')
    socket.on("data", (d) => {
        try {
            if(JSON.parse(d.toString("utf-8")).uuid && JSON.parse(d.toString("utf-8")).content) {
                let UUIDValidateRegEx = /([a-f]|[0-9]){8}-([a-f]|[0-9]){4}-([a-f]|[0-9]){4}-([a-f]|[0-9]){8}/gm
                if(UUIDValidateRegEx.test(JSON.parse(d.toString("utf-8")).uuid)) {
                    conns.forEach(c => {
                        stdout.write(d.toString('utf-8'))
                        c.write(d.toString('utf-8'))
                    })
                }
            }
        } catch(e) {
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
})