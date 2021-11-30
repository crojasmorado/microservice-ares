let config = {
    nats: 'nats://nats_bsft:4222',
    port: 3000,
    mongodb: {
        host: "ares-shop-intelligence.hyf0g.mongodb.net",
        user: "owner",
        pass: "iBGS7KLjKnN2pw1hTauY",
        db: "Ares-Shop",
        port: 27017
    },
    redis: {
        host: "redis-ares",
        port: 6379,
        //password : "",
        db: 7
    },
    logLevel : "info"
};

module.exports = config;