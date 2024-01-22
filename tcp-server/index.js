// TCP Server designed to wirk with 0xSnowflakeXD/tcp-toolkit/tcp-client
// Who know how it works?
// I'll provide a wiki soon as i officially release this.
// NOTICE: tcp-client ONLY PARTIALLY WORK WITH tcp-server UNTOUCHED! PLEASE DON'T CHANGE THE SERVER PORT OTHERWISE IT'LL CORRUPT!

const net = require('net')
const fs = require('fs')
const path = require('path')
const { stdout: stdout, stdin: stdin } = require('process')

if(!fs.existsSync(path.resolve('./cfg.json'))) {
    fs.appendFileSync(path.resolve('./cfg.json'), JSON.stringify({backlog: 256, port: 55674}))
}
const options = require('./cfg.json')

const server = net.createServer()
server.on("connection", (socket) => {
    stdout.write("Client connected!" + '\n')
    socket.on("data", (d) => {
        console.log(d.toString('utf-8'))
    })
    socket.on("end", () => {
        console.log("Ended connection!")
    })
    socket.on("error", (err) => {})
})

server.listen(options.port, '0.0.0.0', options.backlog, () => {
    stdout.write('Server started! Listening on ' + server.address().address + ':' + server.address().port + '\n')
})