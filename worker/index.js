// file containing keys to connect to redis
const keys = require('./keys.js');
const redis = require('redis');

// create connection to redis
const redisClient = redis.createClient({
    host: keys.redisHost,
    port: keys.redisPort,
    retry_strategy: () => 1000
});

const sub = redisClient.duplicate();

// calculate fib num at index
function fib(index)
{
    if (index < 2) return 1;
    return fib(index - 1) + fib(index - 2);
}

// listen for whenever redis gets a message
sub.on('message', (channel, message) => {
    // insert calculated value into hash set, keyed by the index
    redisClient.hset('values', message, fib(parseInt(message)));
});
sub.subscribe('insert');