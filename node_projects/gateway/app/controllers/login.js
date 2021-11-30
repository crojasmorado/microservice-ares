/**
* @fileoverview Controller for utilization view
*
* @author Cesar Rojas
* @version 1.0.0
*/
const loginModel = require("../models/login.js");
const logsTransactionsModel = require("../models/logsTransactions.js");
const passwordHash = require('password-hash');
const redisService = require("../service/redis.js");
const mongoService = require("../service/mongo.js");
module.exports = (function () {

    'use strict';

    class Login {

        async middleware(token, next) {
            let response = await redisService.isLoggedByToken(token);
            return response;
        }

        /**
         * Login Action
         * @param params {Object} params login action
         * @returns {Object}
         */
        async loginAction(params, timestamp) {
            try {
                //Valida los datos
                var response = this.validateRequest(params, timestamp);
                //Si los datos son validos busca al usuario en la bd
                if (response.status === 0) {
                    response = await loginModel.findUser(response);
                    //Si el usuario existe valida su contraseña
                    if (response.status === 0) {
                        response = this.validatePassword(response);
                        //Si la contraseña es correcta busca la sesión.
                        if (response.status === 0)
                            response = await redisService.isLogged(response);
                    }
                }
                await logsTransactionsModel.writeLog(response);
                let responseUser = { status: response.status, response: response.response }
                return responseUser;
            } catch (e) {
                return e;
            }
        }

        /**
         * validateRequest
         * @param {Object}params params login action
         * @returns {Object}
         */
        validateRequest(params, timestamp) {
            let response = { status: 0, response: {}, request: {}, extra: {}, node: "bsft-central" };
            //Valida la estructura delk cuerpo de la peticion
            if (typeof params.actionName !== "undefined" && typeof params.data !== "undefined" && typeof params.data.user !== "undefined" && typeof params.data.password !== "undefined") {
                //valida el nombre de la accion 
                if (params.actionName === "userLogIn") {
                    //Valida la estrructura de los datos mandados.
                    let sizeDataElements = 0;
                    for (let key in params.data) {
                        sizeDataElements++;
                    }
                    if (sizeDataElements === 2 && typeof params.data.user !== "undefined" && typeof params.data.password !== "undefined") {
                        response.status = 0;
                        response.response.message = "Parámetros correctos.";
                    } else {
                        response.status = -1;
                        response.response.message = "El parámetro 'data' solo debe incluir 'user' y 'password'.";
                        response.response.code = 300;
                    }
                } else {
                    response.status = -1;
                    response.response.message = "El parametro actionName es incorrecto.";
                    response.response.code = 200;
                }
            } else {
                response.status = -1;
                response.response.message = "La estructura de los datos es incorrecta.";
                response.code = 100;
            }
            response.request = params;
            response.request.timestamp = timestamp;
            return response;
        }

        /**
         * Validate Hash password
         * @param {Object} response all data transaction
         * @returns {Object}
         */
        validatePassword(response) {
            if (passwordHash.verify(response.request.data.password, response.extra.data.password)) {
                response.response.message = "Credenciales correctas.";
            } else {
                response.status = -1;
                response.response.message = "Contraseña incorrecta";
            }
            response.request.data.password = passwordHash.generate(response.request.data.password);
            return response;
        }

        async createUser(params, date) {
            //Validar estructura 
            let response = { status: 1, response: { isAdmin: true }, request: params, extra: {}, node: "bsft-central" };
            response.request.timestamp = date;

            //let user = await loginModel.getUserByToken(params.token);

            /*/if (user !== "") {
                let match = {
                    $match: {
                        "_id": user
                    }
                };

                let userSearch = await mongoService.agreggate("login", [match]);

                if (userSearch.length > 0 && userSearch[0].admin === 0) {
                    response.response.isAdmin = true;
                }

            }/*/

            if (response.response.isAdmin) {
                let password = passwordHash.generate(response.request.data.password);
                response.response.password = password;
                //CRear USUARIO
            }

            return response;
        }



    }

    return new Login();
})();
