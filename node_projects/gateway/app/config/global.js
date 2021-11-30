const path = require('path');
const fs = require('fs');

let config = {
    nats: 'nats://nats_bsft:4222',
    port: 3000,
    mongodb: {
        host: "mongos",
        user: "bsftAPI-Owner",
        pass: "",
        db: "bsftAPI",
        port: 27017
    },
    redis: {
        host: "redis_bsft",
        port: 6379,
        //password : "",
        db: 1
    },
    logLevel : "info"
};

// Checks if local configuration exists.
if (fs.existsSync(path.join(__dirname, 'local.js'))) {
    config = require('./local');
}


module.exports = config;