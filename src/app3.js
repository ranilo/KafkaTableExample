const express = require('express')
const kafka = require('kafka-node')
const _ = require('lodash');
const path = require('path');
// const { consume } = require('./consumer');
const router = express.Router();

const topic = 'topic1';
let kafkaHost = process.argv[3] || 'localhost';
let kafkaPort = process.argv[4] || '9092';
let cluster = process.argv[5] ? `cluster${process.argv[5]}` : null;
const port = 300 + process.argv[2]


const Producer = kafka.Producer,
    KeyedMessage = kafka.KeyedMessage,
    client = new kafka.KafkaClient({ kafkaHost: `${kafkaHost}:${kafkaPort}` });
const producer = new Producer(client);
let topicList = [
    { topic: topic, partition: 0 }
];
if (cluster) {
    topicList.push(
        { topic: `${cluster}.${topic}`, partition: 0 }
    )
}


const Consumer = kafka.Consumer,
    consumer = new Consumer(
        client,
        topicList,
        {
            autoCommit: true
        }
    );

const publish = async (producer, payloads) => {
    producer.send(payloads, function (err, data) {
        if (err) console.error("Error on send", err);
    });
}


const app = express()
app.use('/', router);

const publishMessages = (start, leap, loop) => {
    const statuses = [start];
    statuses.forEach((status) => {
        const payloads = [
            {
                topic: topic,
                messages: JSON.stringify({
                    value: status,
                    key: "status"
                })
            }
        ];
        publish(producer, payloads)
    })
    if (loop) {
        setTimeout(() => { publishMessages(statuses[statuses.length - 1] + leap, leap, loop); }, 10000);
    }
}


router.get('/stat', (req, res) => {
    client.loadMetadataForTopics([], (e, r) => {
        res.status(200).send(e || r);
    })
})

router.get('/stop', (req, res) => {
    consumer.pause();
    res.status(200).send("paused");
})

router.get('/start', (req, res) => {
    consumer.resume();
    res.status(200).send("resumed");
})


router.get('/', (req, res) => res.sendFile((path.join(__dirname + '/index.html'))))

consumer.on('message', (message) => {
    console.log(`value ${JSON.parse(message.value).value}`, `topic ${message.topic}`, `offset ${message.offset}`, `high Water Offset ${message.highWaterOffset}`);
})

consumer.on('error', (message) => {
    console.log("Consumer error", message);
})

producer.on('error', function (err) { console.error("Error on producer", err) })
producer.on('ready', function () {
    console.log('producer ready');
    publishMessages(Number.parseInt(process.argv[2]), 2, true);
});

app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`))
// consumer.addTopics(["clusterB.topic1", "clusterA.topic1"], (error, added) => { console.log(`add topic to consumer add: ${added}, error: ${error}`) })