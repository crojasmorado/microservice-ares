/**
* @fileoverview Class to get current Login of project
*
* @author Cesar Rojas
* @version 1.0.0
*/
const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
const loginController = require("../controllers/login.js");
const mongoService = require('../service/mongo.js');
const redisService = require("../service/redis.js");
module.exports = (() => {

    'user strict';

    class Login {

        constructor() {

            const fileConfig = require("../config/global.js");
            this.config = fileConfig;

        }

        /**
         * findUser get one user 
         * @param params {Object} params login action
         * @returns {Object}
         */
        findUser(response) {
            return new Promise(async (resolve, reject) => {
                try {
                    let match = {
                        "$match": {
                            _id: response.request.data.user
                        }
                    }
                    let userSearch = await mongoService.agreggate("login", [match], response.request);

                    if (userSearch.length > 0 && typeof userSearch.status == "undefined") {
                        response.response.message = "Usuario encontrado.";
                        response.extra = { message: "datos de colsulta", data: userSearch[0] };
                    } else if (typeof userSearch.status == "undefined") {
                        response.status = -1;
                        response.response.message = "El usuario no existe en la base de datos.";
                    }


                    resolve(response);
                } catch (e) {
                    reject(e);
                }

            });
        }

        async getUserByToken(token) {
            let user = await redisService.isLoggedByToken(token, true);
            return user;
        }

    }

    return new Login();
})();

