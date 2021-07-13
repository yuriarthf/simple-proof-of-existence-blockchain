const express = require("express");
const morgan = require("morgan");

const Blockchain = require("./src/blockchain.js");

class ApplicationServer {
    constructor() {
        // Express application object
        this.app = express();
        // Blockchain class object
        this.blockchain = new Blockchain.Blockchain();
        // Method that initialized the express framework
        this.initExpress();
        // Method that initialized middleware modules
        this.initExpressMiddleWare();
        // Metho that initialized the controllers where you defined the endpoints
        this.initControllers();
        // Method that run the express application.
        this.start();
    }

    initExpress() {
        this.app.set("port", 8000);
    }

    initExpressMiddleWare() {
        this.app.use(morgan("dex"));
        this.app.use(express.urlencoded({ extended: true }));
        this.app.use(express.json());
    }

    initControllers() {
        require("./BlockchainController.js")(this.app, this.blockchain);
    }

    start() {
        let self = this;
        this.app.listen(this.app.get("port"), () => {
            console.log(`Server Listening for port: ${self.app.get("port")}`);
        });
    }
}

new ApplicationServer();
