/**
* @fileoverview Class to get current config of project
*
* @author Cesar Rojas
* @version 1.0.0
*/

const { ServiceBroker } = require("moleculer");
const ApiService = require("moleculer-web");
const serviceBroker = require("./models/serviceBroker.js");
const node = require("./models/node.js");

module.exports = (() => {
    'use strict';

    class Server {

        /**
         * Start webServer
         * @returns {Object} Server Running
         */
        start() {
            const broker = new ServiceBroker(serviceBroker.getConfig());
            broker.createService(node.getConfig(broker, ApiService));
            broker.start();
        }
    }

    let server = new Server();
    server.start();

})();

