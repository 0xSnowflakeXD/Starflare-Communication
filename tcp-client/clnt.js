const eem = require("./index.js").eem

eem.once('_r', (username) => {
    client = net.createConnection(55674, '127.0.0.1', () => {
        console.log("Connected to server.")
        client.allowHalfOpen = true
        client.setNoDelay(true)
        client.setKeepAlive(5000)
        client.write("Hi! I am " + (username || UUID) + '\n')
    })
    client.on("timeout", () => {
        client.end(() => {
            console.log("Ended connection due to timeout.")
            client.destroy()
        })
    })
    client.once("close", () => {
        console.log("The server closed the connection.")
    })
    client.once("end", () => {
        console.log("The server ended the connection.")
    })
    client.on("ready", () => {
        console.log("Connection ready!")
    })
    client.once("error", (e) => {
        console.log("We can't reach to the destination server. Please try again!\nPress ctrl+c to exit!")
    })
    client.on("data", (data) => {
        console.log("[CHAT] " + data.toString("utf-8").replace(/(\[.+\])*/gim, "").replace("\n", ""))
    })
    process.stdin.resume()

    process.stdin.on("data", (d) => {
        process.stdout.moveCursor(-d.length, -1)
        client.write("[CHAT] " + d)
    })
})