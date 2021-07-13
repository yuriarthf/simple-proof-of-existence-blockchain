class BlockchainController {
    // The constructor receive the instance of the express.js app and the Blockchain class
    constructor(app, blockchainObj) {
        this.app = app;
        this.blockchain = blockchainObj;
        // All the endpoints methods needs to be called in the constructor to initialize the route.
        this.getBlockByHeight();
        this.requestOwnership();
        this.submitStar();
        this.getBlockByHash();
        this.getStarsByOwner();
        this.validateChain();
    }

    // Endpoint to Get a Block by Height (GET Endpoint)
    getBlockByHeight() {
        this.app.get("/block/height/:height", async (req, res) => {
            try {
                if (req.params.height) {
                    const height = parseInt(req.params.height);
                    let block = await this.blockchain.getBlockByHeight(height);
                    if (block) {
                        return res.status(200).json(block);
                    } else {
                        return res.status(404).send("Block Not Found!");
                    }
                } else {
                    return res
                        .status(404)
                        .send("Block Not Found! Review the Parameters!");
                }
            } catch (error) {
                res.status(404).send(error);
            }
        });
    }

    // Endpoint that allows user to request Ownership of a Wallet address (POST Endpoint)
    requestOwnership() {
        this.app.post("/requestValidation", async (req, res) => {
            if (req.body.address) {
                const address = req.body.address;
                const message =
                    await this.blockchain.requestMessageOwnershipVerification(
                        address
                    );

                if (message) {
                    res.status(200).json(message);
                } else {
                    res.status(500).send("An error happened!");
                }
            } else {
                res.status(500).send("Check the Body Parameter!");
            }
        });
    }

    // Endpoint that allow Submit a Star, you need first to `requestOwnership`to have the message (POST endpoint)
    submitStar() {
        this.app.post("/submitstar", async (req, res) => {
            if (
                req.body.address &&
                req.body.message &&
                req.body.signature &&
                req.body.star
            ) {
                const address = req.body.address;
                const message = req.body.message;
                const signature = req.body.signature;
                const star = req.body.star;

                try {
                    let block = await this.blockchain.submitStar(
                        address,
                        message,
                        signature,
                        star
                    );

                    if (block) {
                        return res.status(200).json(block);
                    } else {
                        return res.status(500).send("An error happened!");
                    }
                } catch (error) {
                    return res.status(500).send(error);
                }
            } else {
                return res.status(500).send("Check the Body Parameters!");
            }
        });
    }

    // This endpoint allows you to retrieve the block by hash (GET endpoint)
    getBlockByHash() {
        this.app.get("/block/hash/:hash", async (req, res) => {
            if (req.params.hash) {
                const hash = req.params.hash;
                let block = await this.blockchain.getBlockByHash(hash);
                if (block) {
                    return res.status(200).json(block);
                } else {
                    return res.status(404).send("Block Not Found!");
                }
            } else {
                return req
                    .status(404)
                    .send("Block Not Found! Review the Parameters!");
            }
        });
    }

    // This endpoint allows you to request the list of Stars registered by an owner (GET endpoint)
    getStarsByOwner() {
        this.app.get("/blocks/:address", async (req, res) => {
            if (req.params.address) {
                const address = req.params.address;
                try {
                    let stars = await this.blockchain.getStarsByWalletAddress(
                        address
                    );
                    if (stars) {
                        return res.status(200).json(stars);
                    } else {
                        return res.status(404).send("Block Not Found!");
                    }
                } catch (error) {
                    return res.status(500).send("An error happened!");
                }
            } else {
                return res
                    .status(500)
                    .send("Block Not Found! Review the Parameters!");
            }
        });
    }

    // This endpoint allows you to scan the blockchain for invalid blocks (GET endpoint)
    validateChain() {
        this.app.get("/chain/validateChain", async (req, res) => {
            try {
                let hasError = await this.blockchain.validateChain();
                if (hasError) {
                    return res.status(202).json({ hasError: hasError });
                } else {
                    res.status(404).send(
                        "There are no blocks in the blockchain."
                    );
                }
            } catch (error) {
                res.status(500).send(error.message);
            }
        });
    }
}

module.exports = (app, blockchainObj) =>
    new BlockchainController(app, blockchainObj);
