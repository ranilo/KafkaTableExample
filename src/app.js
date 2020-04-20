const express = require('express')
const kafka = require('kafka-node')
const _ = require('lodash');
const path = require('path');
const router = express.Router();

const topic = 'topic1';

const Producer = kafka.Producer,
    KeyedMessage = kafka.KeyedMessage,
    client = new kafka.KafkaClient(),
    producer = new Producer(client),
    km = new KeyedMessage('key', 'message')


const Consumer = kafka.Consumer,
    consumer = new Consumer(
        client,
        [
            { topic: topic, partition: 0 }
        ],
        {
            autoCommit: true
        }
    );

const publish = async (producer, payloads) => {
    producer.send(payloads, function (err, data) {
        console.log(data);
        if (err) console.error("Error on send", err);
    });
}


const app = express()
app.use('/', router);
const port = 3000

router.get('/pub', (req, res) => {
    const statuses = ['started', 'processing', 'finished'];
    statuses.forEach((status) => {
        const payloads = [
            {
                topic: topic,
                messages: JSON.stringify({
                    value: status,
                    key: req.query.val
                })
            }
        ];
        publish(producer, payloads)
    })
    res.status(200).send('ok')
})
router.get('/', (req, res) => res.sendFile((path.join(__dirname + '/index.html'))))

consumer.on('message', (message) => {
    console.log("Consume", message);
})

producer.on('error', function (err) { console.error("Error on producer", err) })
producer.on('ready', function () {
    console.log('producer ready');
});

app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`))