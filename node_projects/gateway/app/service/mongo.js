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
module.exports = (() => {

    'user strict';

    class Mongo {

        constructor() {
            const fileConfig = require("../config/global.js");
            this.config = fileConfig;
            this.urlMongo = 'mongodb+srv://' + this.config.mongodb.user + ':' + this.config.mongodb.pass + '@' + this.config.mongodb.host + ':' + this.config.mongodb.db+"?retryWrites=true&w=majority";
        }

        /**
         * Login Action
         * @param params {Object} params login action
         * @returns {Object}
         */
        agreggate(collection, pipline, params) {
            let parent = this;
            return new Promise(async (resolve, reject) => {
                //getClient
                let mongo = await parent.getClient().catch(e => {
                    reject(e);
                });

                //Select collection
                let col = mongo.collection(collection);
                col.aggregate(pipline).toArray(function (err, docs) {
                    assert.equal(null, err);
                    resolve(docs);
                });

            });
        }

        create(collection, data) {
            let parent = this;
            return new Promise(async (resolve, reject) => {
                //getClient
                let mongo = await parent.getClient();
                //Select collection
                let col = mongo.collection(collection);
                col.insertOne(data, function (err, resp) {
                    assert.equal(null, err);
                    resolve(resp);
                });

            });
        }

        getClient() {
            let parent = this;
            return new Promise((resolve, reject) => {

                MongoClient.connect(parent.urlMongo, { useNewUrlParser: true }, function (err, client) {
                    //assert.equal(null, err);
                    if (err !== null) {
                        console.error(err);
                        reject({ status: -1, err: "Mongo DB service error, notify product administrator." });
                    } else {
                        resolve(client.db(parent.config.mongodb.db));
                    }
                    return;
                });

                return;
            });
        }
    }

    return new Mongo();
})();

