/**
* @fileoverview Controller for utilization view
*
* @author Cesar Rojas
* @version 1.0.0
*/
const loginModel = require("../models/login.js");
const passwordHash = require('password-hash');
const redis = require("redis");
const assert = require("assert");
module.exports = (function () {

    'use strict';

    class Redis {

        constructor() {

            const fileConfig = require("../config/global.js");
            this.config = fileConfig;

        }

        /**
         * Get client Action
         * @returns {Object}
         */
        getClient() {

            return new Promise((resolve, reject) => {
                //Busca que el usuario tenga sesión
                let configRedis = { host: this.config.redis.host, port: this.config.redis.port, db: this.config.redis.db };
                if (typeof this.config.redis.password)
                    configRedis.password = this.config.redis.password;
                let client = redis.createClient(configRedis);
                client.on("error", function (err) {
                    console.log("Error " + err);
                    resolve(err);
                });
                client.on("connect", function (err) {
                    resolve(client);
                });
                //client.del("crojass");

            });
        }

        async isLogged(response) {
            return new Promise(async (resolve, reject) => {
                let client = await this.getClient();
                let token = passwordHash.generate("OK" + response.request.data.user + Date());
                //client.set("crojas", "OK", "EX", 60)
                client.get(response.request.data.user, function (err, reply) {
                    //console.log(reply);
                    if (reply === null) {
                        response.response.message = "User successfully logged in.";
                        client.set(response.request.data.user, token, "EX", 60 * 30);
                        response.response.typeLogin = 1;
                    }
                    else {
                        response.response.message = "The user already had a session but a new token was generated.";
                        client.del(response.request.data.user);
                        client.set(response.request.data.user, token, "EX", 60 * 30);
                        response.response.typeLogin = 2;
                    }
                    response.response.token = token;
                    resolve(response);
                });
            });
        }

        async isLoggedByToken(token, getUser = false) {
            return new Promise(async (resolve, reject) => {
                let client = await this.getClient();
                let flagSession = false;

                client.keys("*", async (err, keys) => {
                    if (keys.length !== 0) {

                        let searchUser = new Promise((resolve, reject) => {
                            let success = false;

                            for (let index in keys) {
                                client.get(keys[index], function (err, tokenRedis) {

                                    if (getUser === false && tokenRedis === token) {
                                        flagSession = true;
                                        success = true;
                                    } else if (getUser) {
                                        flagSession = keys[index];
                                        success = true;
                                    }

                                    if (parseInt(keys.length) == parseInt(index) + 1 || flagSession === true)
                                        resolve(flagSession);
                                });
                            }
                        });

                        flagSession = await searchUser;

                        resolve(flagSession);

                        /*/if (getUser === false)
                            resolve(tokenRedis === token);
                        else
                            resolve(keys[index]);/*/

                    } else {
                        resolve(false);
                    }

                });
            });
        }



    }

    return new Redis();
})();
