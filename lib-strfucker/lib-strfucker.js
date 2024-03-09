let crypto = require("crypto")
module.exports = {
    /**
     * Encrypts input in an algorithm called strfucker.
     */
    strfe: (i) => {
        let istr;
        if(typeof i === "object") {
            istr = JSON.stringify(i)
        } else {
            istr = i.toString()
            let saltify = function(input) {
                return input + "___!SALT-" + crypto.createHash("sha256").update(crypto.randomBytes(4).toString()).digest("hex").slice(5,13)
            }
            let partiallyready = Buffer.from(Buffer.from(Buffer.from(saltify(i)).toString("hex")).toString("base64url")).toString("hex")
            return partiallyready.split('').map(char => {
                return char.charCodeAt(0).toString(2);
            }).join(' ');
        }
    },
    /**
     * Decrypts strfucker, keep the salt
     * 
     * Barely say, a reverse-engineering of it.
     */
    strfder: (i) => {
        let istr = i
            .split(' ')
            .map(bin => String.fromCharCode(parseInt(bin, 2)))
            .join('');
        let s1 = Buffer.from(istr, "hex").toString("utf-8")
        let s2 = Buffer.from(s1, "base64url").toString("utf-8")
        let last = Buffer.from(s2, "hex").toString("utf-8")
        return last
    },
    /**
     * Decrypts strfucker, remove salt
     * 
     * Barely say, a (complete) reverse-engineering of it.
     */
    strfde: (i) => {
        let istr = i
            .split(' ')
            .map(bin => String.fromCharCode(parseInt(bin, 2)))
            .join('');
        let s1 = Buffer.from(istr, "hex").toString("utf-8")
        let s2 = Buffer.from(s1, "base64url").toString("utf-8")
        let last = Buffer.from(s2, "hex").toString("utf-8").split("___!SALT-")[0]
        return last
    }
}