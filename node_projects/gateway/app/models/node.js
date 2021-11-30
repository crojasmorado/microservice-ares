/**
* @fileoverview Class to get current config of project
*
* @author Cesar Rojas
* @version 1.0.0
*/
const loginClass = require("../controllers/login.js");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const { createUser } = require("../controllers/login.js");

module.exports = (() => {

    'user strict';

    class Node {

        constructor() {

            this.session = true;

            const fileConfig = require("../config/global.js");
            this.config = fileConfig;

            this.callbackGlobal = function (broker, functionName, params) {

                return new Promise((resolve, reject) => {
                    try {
                        let resp = broker.call(functionName, params, { timeout: 100000, retryCount: 2 });
                        resolve(resp);
                    } catch (Exception) {
                        resolve(Exception);
                    }

                });

            };

            this.returnResponse = async function (broker, ctx, microservice) {

                let validate = await this.callbackGlobal(broker, "ares.validateParams", ctx.params);


                if (validate.status !== -1) {
                    //let resp = await this.callbackGlobal(broker, microservice, ctx.params);
                    //return resp;
                    return true;
                } else
                    return validate

            };

        }

        /**
         * Gets config broker
         * @param broker {Object} Object broker Instance
         * @param ApiService {Object} Object ApiService Instance moleculer-web
         * @returns {Object}
         */
        getConfig(broker, ApiService) {
            let parent = this;
            return {
                name: "ares",
                mixins: [ApiService],
                settings: {
                    port: this.config.port,

                    use: [
                        cookieParser(),
                        helmet(),
                        async (req, res, next) => {
                            //console.log(req.body.actionName);
                            if (req.body.actionName !== "userLogIn") {
                                let isLogged = await loginClass.middleware(req.body.token, next);
                                //console.log(isLogged);
                                if (isLogged)
                                    next();
                                else
                                    res.end("El token es incorrecto, inicie sesión por favor.");
                            } else {
                                next();
                            }

                        }
                    ],

                    routes: [{
                        path: "/api/v1",
                        aliases: {
                            "POST userLogin": "ares.login",
                            "POST createUser": "ares.createUserSystem",
                            "POST resetPasswordRequest": "ares.resetPasswordRequest"
                        }
                    }]
                },
                actions: {
                    async login(ctx) {
                        try {
                            return await loginClass.loginAction(ctx.params, new Date());
                        } catch (e) {
                            return e;
                        }
                    },
                    async createUserSystem(ctx) {
                        return loginClass.createUser(ctx.params, new Date());
                    },
                    async validateSesion(ctx) {

                        ctx.params.validate = {
                            token: "String"
                        };

                        let validate = await parent.callbackGlobal(broker, "ares.validateParams", ctx.params);

                        if(validate.status !== -1) {
                            return true;
                        }else{
                            return validate;
                        }

                    },
                    async validateParams(ctx) {
                        try {
                            let response = { status: 1, response: {} };
                            let data = ctx.params.validate;
                            delete ctx.params.validate;
                            let params = ctx.params;
                            //Ejemplo de todos los datos
                            /*/let data = {
                                token: "String",
                                name: "Number",
                                cluster: { type: "String", values: ["CUAD", "cloudPBX"] },
                                serviceProviderName: { type: "String", maxLength: 80 },
                                serviceProviderId: { type: "String", maxLength: 30 },
                                domain: { type: "String", maxLength: 80 },
                                number: { type: "String", maxLength: 23 },
                                nuevo: "Number"
                            };/*/
                            var setResponse = function (status, message) {
                                response.response.timestamp = new Date();
                                response.response.message = message;
                                response.status = status;
                            }
                            //Validación de tamaño.
                            if (Object.keys(data).length == Object.keys(params).length) {
                                //Validación de nombre de atributos
                                let validationNames = new Promise((resolve, reject) => {
                                    let steps = -1;
                                    for (let key in params) {
                                        steps += 1;

                                        if (typeof data[key] == "undefined") {
                                            setResponse(-1, "The '" + key + "' attribute is not supported in this data schema");
                                            throw response;
                                        } else {

                                            //Validación de tipo de dato buscando un objeto
                                            if (typeof data[key] == "object") {
                                                //Valida el tipo de dato.
                                                let validationTypeData = data[key].type.toLowerCase() == typeof params[key];

                                                if (!validationTypeData) {
                                                    setResponse(-1, "The data type of the '" + key + "' key is not the expected one (" + data[key].type + ").");
                                                    throw response;
                                                }


                                                if (typeof data[key].maxLength != "undefined") {
                                                    let validationMaxLength = data[key].maxLength >= params[key].length;
                                                    if (!validationMaxLength) {
                                                        setResponse(-1, "The length of the value of the key '" + key + "' is not as expected by schema (" + data[key].maxLength + ").");
                                                        throw response;
                                                    }
                                                }

                                                if (typeof data[key].minLength != "undefined") {
                                                    let validationMinLength = data[key].minLength <= params[key].length;
                                                    if (!validationMaxLength) {
                                                        setResponse(-1, "The Minimum length of the value of the key '" + key + "' is not as expected by schema (" + data[key].mLength + ").");
                                                        throw response;
                                                    }
                                                }


                                                if (typeof data[key].values != "undefined") {
                                                    let maxSteps = parseInt(data[key].values.length);
                                                    let hit = false;

                                                    for (let index = 0; index < maxSteps; index++) {

                                                        if (data[key].values[index] == params[key])
                                                            hit = true;

                                                        if (index == maxSteps - 1) {

                                                            if (!hit) {
                                                                setResponse(-1, "The data of the key '" + key + "' is not what is expected by the schema.");
                                                                throw response;
                                                            } else if (Object.keys(params).length == steps + 1) {
                                                                //console.log("Se valido todo el proceso y termino en values");
                                                                setResponse(1, "Success");
                                                                resolve(true);
                                                            }

                                                        }
                                                    }
                                                } else if (Object.keys(params).length == steps + 1) {
                                                    //console.log("Termina proceso sin entrar a values ");
                                                    setResponse(1, "Success");
                                                    resolve(true);
                                                }

                                            } else {//Si no es un objeto se compara el parametro con el tipo de dato que viene en el valor del data. (Lo vuelve minusculas por seguridad)
                                                let typeData = data[key];
                                                if (typeof params[key] != data[key].toLowerCase() && typeData != "Array") {
                                                    setResponse(-1, "The data type of the '" + key + "' key is not the expected one (" + data[key] + ").");
                                                    throw response;
                                                } else if (typeData == "Array" && !Array.isArray(params[key])) {
                                                    setResponse(-1, "The data type of the '" + key + "' key is not the expected one (" + data[key] + ").");
                                                    throw response;
                                                } else if ((Object.keys(params).length == steps + 1)) {
                                                    setResponse(1, "Success");
                                                    resolve(true);
                                                }

                                            }

                                        }
                                    }

                                });

                                await validationNames;
                            } else {
                                setResponse(-1, "The number of attributes is not as expected");
                                throw response;
                            }

                            return response;
                        } catch (e) {
                            //console.log("Entre");
                            return e;
                        }
                    }

                }
            }
        }
    }

    return new Node();
})();