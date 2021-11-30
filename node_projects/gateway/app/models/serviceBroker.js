/**
* @fileoverview Class to get current config of project
*
* @author Cesar Rojas
* @version 1.0.0
*/

module.exports = (() => {

    'user strict';

    class Config {


        constructor() {

            const fileConfig = require("../config/global.js");
            this.config = fileConfig;

        }
        /**
         * Gets config broker
         * @returns {Object}
         */
        getConfig() {
            return {
                nodeID: "ares-central",
                namespace: "aresAPI",
                /*/transporter: {
                    type: "NATS",
                    options: {
                        url: this.config.nats
                        //user: "admin",
                        //pass: "1234"
                    }
                },/*/
                logLevel : this.config.logLevel,
                //Verifica umbral de peticiones fallidas y bloquea el servicio, para evitar peticiones seguidas que fallaran y consumiran CPU
                circuitBreaker: {
                    enabled: false,
                    umbral: 0.5,
                    minRequestCount: 20,
                    windowTime: 30, // en segundos
                    halfOpenTime: 5 * 1000, // en milisegundos
                    check: err => err && err.code >= 500
                },
                //Reintentos para recuperar peticiones fallidas
                retryPolicy: {
                    enabled: false,
                    retries: 3,
                    delay: 100,
                    maxDelay: 2000,
                    factor: 2,
                    check: err => err && !!err.retryable
                }
            }
        }
    }

    return new Config();
})();