const SHA256 = require("crypto-js/sha256");
const BlockClass = require("./block.js");
const bitcoinMessage = require("bitcoinjs-message");

class Blockchain {
    constructor() {
        this.chain = [];
        this.height = -1;
        this.initializeChain();
    }

    async initializeChain() {
        if (this.height === -1) {
            let block = new BlockClass.Block({ data: "Genesis Block" });
            await this._addBlock(block);
        }
    }

    getChainHeight() {
        return new Promise((resolve) => {
            resolve(this.height);
        });
    }

    _addBlock(block) {
        let self = this;
        return new Promise(async (resolve, reject) => {
            try {
                const errors = await self.validateChain();
                for (const [index, error] of errors.entries()) {
                    if (error) {
                        reject(`Block of height ${index} is invalid!`);
                    }
                }
                const height = await self.getChainHeight();
                if (self.height === -1) {
                    block.previousBlockHash = null;
                } else {
                    block.previousBlockHash = self.chain[height].hash;
                }
                self.height++;
                block.height = self.height;
                block.time = new Date().getTime().toString().slice(0, -3);
                block.hash = SHA256(await block.getBData()).toString();
                self.chain.push(block);
                resolve(block);
            } catch (error) {
                reject(error);
            }
        });
    }

    requestMessageOwnershipVerification(address) {
        return new Promise((resolve) => {
            resolve(
                `${address}:${new Date()
                    .getTime()
                    .toString()
                    .slice(0, -3)}:starRegistry`
            );
        });
    }

    submitStar(address, message, signature, star) {
        const self = this;
        return new Promise(async (resolve, reject) => {
            try {
                const messageTime = parseInt(message.split(":")[1]);
                const currentTime = parseInt(
                    new Date().getTime().toString().slice(0, -3)
                );
                if (currentTime - messageTime < 5 * 60) {
                    if (!bitcoinMessage.verify(message, address, signature))
                        reject("Bitcoin message verification failed!");
                    const data = { star: star, owner: message.split(":")[0] };
                    const block = new BlockClass.Block(data);
                    await self._addBlock(block);
                    resolve(block);
                }
                reject("Time elapsed is greater or equal to 5 minutes");
            } catch (error) {
                reject(error);
            }
        });
    }

    getBlockByHeight(height) {
        const self = this;
        return new Promise((resolve, reject) => {
            if (self.height < height) {
                reject(
                    "The height of the blockchain is lower than the given height"
                );
                return;
            }
            resolve(self.chain[height]);
        });
    }

    getBlockByHash(hash) {
        const self = this;
        return new Promise((resolve, reject) => {
            const blockWithMatchedHash = self.chain.filter((block) => {
                return block.hash === hash;
            });
            if (blockWithMatchedHash.length) {
                resolve(blockWithMatchedHash[0]);
                return;
            }
            reject("No block found with the given hash");
        });
    }

    async _checkIfBlockHasAddress(block, address) {
        try {
            let blockData = await block.getBData();
            return address === blockData.owner;
        } catch (error) {
            return false;
        }
    }

    getStarsByWalletAddress(address) {
        const self = this;

        return new Promise(async (resolve) => {
            let stars = [];
            for (const block of self.chain) {
                if (await self._checkIfBlockHasAddress(block, address))
                    stars.push(await block.getBData());
            }
            resolve(stars);
        });
    }

    validateChain() {
        const self = this;
        return new Promise(async (resolve, reject) => {
            try {
                let errors = [];
                let previousHash = null;
                let blockValidation;
                for (const block of self.chain) {
                    try {
                        blockValidation = await block.validate();
                        errors.push(
                            blockValidation
                                ? block.previousBlockHash === previousHash
                                    ? false
                                    : true
                                : true
                        );
                        previousHash = block.hash;
                    } catch (error) {
                        if (error === "This is the Genesis Block") {
                            errors.push(false);
                            continue;
                        }
                        errors.push(true);
                    }
                }
                resolve(errors);
            } catch (error) {
                reject(error);
            }
        });
    }
}

module.exports.Blockchain = Blockchain;
