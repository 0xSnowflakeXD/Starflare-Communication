// Run on a server or computer to test performance

const crypto = require("crypto")
const worker = require("worker_threads")
const path = require("path")

// Compute hashes
function hash() {
    return crypto.createHash("sha3-512").update(crypto.createHash("sha3-512")
                .update(crypto.createHash("sha3-512")
                    .update(crypto.createHmac("sha3-512", crypto.randomBytes(16)).update(crypto.createHash("sha3-512").update(Date.now().toString().repeat(1000)).digest("base64").toString().repeat(5000)).toString().repeat(50000))
                    .digest("hex")
            .replace(/e/gi, Date.now().toString().repeat(80))
            .toString()
            .repeat(6000))
            .digest("hex")
            .toString()
            .repeat(5005))
        .digest("hex")
        .toString()
        .repeat(5000) // Longer strings might work on stdout (stdout stress)
}

function multithread() {
    for(let i = 0; i < 7; i++) { // 7 threads
        const w = new worker.Worker(path.resolve("./hash.js"))
        w.on("message", (m) => {
            process.stdout.write("OMG! " + m + "\n")
        })
    }
}

multithread()

setInterval(() => {
    process.stdout.write(hash() + "\n")
}, 1)