const keys = require('./keys');

// setup express app
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors()); // allows us to make requests from other domains
app.use(bodyParser.json());

// postgres client setup
const { Pool } = require('pg');
const pgClient = new Pool({
    user: keys.pgUser,
    host: keys.pgHost,
    database: keys.pgDatabase,
    password: keys.pgPassword,
    port: keys.pgPort
});

pgClient.on('error', () => {
    console.log('Lost postgres connection');
});

// create table to store indecies in postgres
pgClient.query(`
    CREATE TABLE IF NOT EXISTS
    values (number INT)
`).catch((err) => {
    console.log(err);    
});

// redis client setup
const redis = require('redis');
const redisClient = redis.createClient({
    host: keys.redisHost,
    port: keys.redisPort,
    retry_strategy: () => 1000
});
// redis requires you to duplicate connection for each listener
const redisPublisher = redisClient.duplicate();

// express route handlers
app.get('/', (req, res) => {
    res.send('hi');
});

// gets all values from postgres
app.get('/values/all', async (req, res) => {
    const values = await pgClient.query('SELECT * from values');
    res.send(values.rows);
});

// gets all values from redis
app.get('/values/current', async (req, res) => {
    redisClient.hgetall('values', (err, values) => {
        res.send(values);
    });
});

app.post('/values', async (req, res) => {
    const index = req.body.index;
    if (parseInt(index) > 40)
    {
        return res.status(422).send('Index too high');
    }

    // set an initial value, before worker process
    // wakes up
    redisClient.hset('values', index, 'Nothing yet');
    // worker process listening for this message will
    // wake up and calculate the fib num
    redisPublisher.publish('insert', index);
    // store this index into postgres
    pgClient.query(`
        INSERT INTO values(number) 
        VALUES($1)`, [index]);
    res.send({working: true});
});

app.listen(5000, err => {
    console.log('listening');
});