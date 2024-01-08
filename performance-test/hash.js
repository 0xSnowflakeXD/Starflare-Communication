const crypto = require("crypto")

function hash() {
    return crypto.createHash("sha512")
        .update(crypto.createHash("sha512")
            .update(Date.now().toString())
            .digest("hex")
            .replace(/e/gi, Date.now().toString().repeat(57))
            .toString()
            .repeat(6000))
        .digest("hex")
        .toString()
        .repeat(5000)
}

setInterval(() => {
    require("worker_threads").parentPort.postMessage(hash() + "\n")
}, 1)
