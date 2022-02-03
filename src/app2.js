const express = require('express')
const kafka = require('kafka-node')
const _ = require('lodash');
const path = require('path');
const { time } = require('console');
const router = express.Router();
const consumeImpl = require('./consumer');
const streamimpl = require('./stream');


const topic = 'topic';
// const topic2 = 'topic2';

const Producer = kafka.Producer,
    KeyedMessage = kafka.KeyedMessage,
    client = new kafka.KafkaClient(),
    producer = new Producer(client),
    km = new KeyedMessage('key', 'message'),
    admin = new kafka.Admin(client)


client.createTopics([{
    topic: topic,
    partitions: 1,
    replicationFactor: 1
}], (error, res) => {
    console.log("Topics to create res:", res);
    console.error("Topics to create error:", error);
})

const publish = async (producer, payloads, topic) => {
    const payload = { topic: topic, ...payloads }
    producer.send([payload], function (err, data) {
        if (err) console.error("Error on send", err);
    });
}


const app = express()
app.use('/', router);
const port = 3001

router.get('/pub', (req, res) => {
    const statuses = ['started', 'processing', 'finished'];
    let timeout = 100;
    [...Array(5).keys()].forEach((val) => {

        statuses.forEach((status) => {
            const payload =
            {
                messages: `${status} ${val} ${timeout}`,
                key: val
            };
            setTimeout(() => {
                publish(producer, payload, topic)
            }, timeout);
            timeout *= 2;
        })
    })
    res.status(200).send('ok')
})
router.get('/', (req, res) => res.sendFile((path.join(__dirname + '/index.html'))))

producer.on('error', function (err) { console.error("Error on producer", err) })
producer.on('ready', function () {
    console.log('producer ready');
    consumeImpl.consume(client, [topic]);
    streamimpl.consume(topic, topic)

});

app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`))