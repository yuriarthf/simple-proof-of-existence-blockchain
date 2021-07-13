const SHA256 = require("crypto-js/sha256");
const hex2ascii = require("hex2ascii");

class Block {
    constructor(data) {
        this.hash = null;
        this.height = 0;
        this.body = Buffer.from(JSON.stringify(data)).toString("hex");
        this.time = 0;
        this.previousBlockHash = null;
    }

    validate() {
        const self = this;
        return new Promise(async (resolve, reject) => {
            try {
                const currentHash = SHA256(await self.getBData()).toString();
                if (currentHash === this.hash) {
                    resolve(true);
                } else {
                    resolve(false);
                }
            } catch (error) {
                reject(error);
            }
        });
    }

    getBData() {
        const self = this;
        return new Promise((resolve, reject) => {
            try {
                const dataObj = JSON.parse(hex2ascii(self.body));
                if (dataObj.data !== "Genesis Block") {
                    return resolve(dataObj);
                }
                resolve("This is the Genesis Block");
            } catch (error) {
                reject(error);
            }
        });
    }
}

module.exports.Block = Block;
