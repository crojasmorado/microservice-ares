
/**
* @fileoverview Class to get current Login of project
*
* @author Cesar Rojas
* @version 1.0.0
*/
const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
const loginController = require("../controllers/login.js");
const passwordHash = require('password-hash');
const mongoService = require('../service/mongo.js')
module.exports = (() => {

    'user strict';

    class LogsTransactions {

        constructor() {

            const fileConfig = require("../config/global.js");
            this.config = fileConfig;
            
        }

        async writeLog(response){
            let token = response.response.token;
            response.response.timestamp = new Date();
            delete response.extra;
            delete response.response.token;
            await mongoService.create("logsTransactions", response );
            response.response.token = token;
            return response;
        }

    }

    return new LogsTransactions();
})();

