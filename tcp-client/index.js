// Designed to run with tcp-toolkit/tcp-server
/**
 * Format:
 * {
 *  message: String
 *  handshake: String
 * }
 */

const crypto = require("crypto")

function UUIDGen() {
    let uuid = [,,,,]
    uuid[0] = crypto.createHash("sha256").update(Date.now().toString()).digest("hex").toString().slice(0, 26)
    uuid[1] = Buffer.from(crypto.randomBytes(8)).toString("hex").slice(0, 16)
    uuid[2] = (Buffer.from("12c-").toString("hex").slice(1, 3) + crypto.createHash("sha256").update(crypto.randomBytes(8)).digest("hex").toString()).slice(0, 16)
    uuid[3] = (crypto.createHash("sha512").update(Buffer.from(crypto.randomBytes(8))).digest("hex").toString().slice(1, 2) + Buffer.from(Date.now().toString(10)).toString("hex")).slice(0,8)
    return uuid.join('-')
}
