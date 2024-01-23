// TCP Server designed to wirk with 0xSnowflakeXD/tcp-toolkit/tcp-client
// Who know how it works?
// I'll provide a wiki soon as i officially release this.
// Only limited to run on the SAME computer/anything refers to the 127.0.0.1 where the server run
// NOTICE: tcp-client ONLY PARTIALLY WORK WITH tcp-server UNTOUCHED! PLEASE DON'T CHANGE THE SERVER PORT OTHERWISE IT'LL CORRUPT!

const net = require('net')
const fs = require('fs')
const path = require('path')
const { stdout: stdout, stdin: stdin } = require('process')

if(!fs.existsSync(path.resolve('./cfg.json'))) {
    fs.appendFileSync(path.resolve('./cfg.json'), JSON.stringify({backlog: 256, port: 55674}))
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
        stdout.write(d.toString('utf-8'))
        conns.forEach(c => {c?.write(d.toString('utf-8'))})
    })
    socket.on("error", (err) => {console.log("An error occured with the client.")})
    socket.on("close", () => {
        console.log("Connection closed!")
    })
})

server.listen(options.port, '127.0.0.1', options.backlog, () => {
    stdout.write('Server started! Listening on ' + server.address().address + ':' + server.address().port + '\n')
})