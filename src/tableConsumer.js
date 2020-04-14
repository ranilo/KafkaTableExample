const express = require('express')
const kafka = require('kafka-node')
const { KafkaStreams } = require("kafka-streams");
const _ = require('lodash');
const path = require('path');
const router = express.Router();

const config = {
    "noptions": {
        "metadata.broker.list": "localhost:9092",
        "group.id": "kafka-streams-test-native",
        "client.id": "kafka-streams-test-name-native",
        "event_cb": true,
        "compression.codec": "snappy",
        "api.version.request": true,
        "socket.keepalive.enable": true,
        "socket.blocking.max.ms": 100,
        "enable.auto.commit": false,
        "auto.commit.interval.ms": 100,
        "heartbeat.interval.ms": 250,
        "retry.backoff.ms": 250,
        "fetch.min.bytes": 100,
        "fetch.message.max.bytes": 2 * 1024 * 1024,
        "queued.min.messages": 100,
        "fetch.error.backoff.ms": 100,
        "queued.max.messages.kbytes": 50,
        "fetch.wait.max.ms": 1000,
        "queue.buffering.max.ms": 1000,
        "batch.num.messages": 10000
    },
    "tconf": {
        "auto.offset.reset": "earliest",
        "request.required.acks": 1
    },
    "batchOptions": {
        "batchSize": 5,
        "commitEveryNBatch": 1,
        "concurrency": 1,
        "commitSync": false,
        "noBatchCommits": false
    }
}
const topic = 'topic1';

const kafkaStreams = new KafkaStreams(config);
kafkaStreams.on("error", (error) => console.error("stream error", error));

const toKv = message => {
    const value = message.value.toString("utf8");
    const elements = JSON.parse(value);
    return {
        key: 'val',
        value: elements.val
    };
};

const table = kafkaStreams.getKTable(topic, toKv);
table.consumeUntilCount(100, () => {
    console.log("topic has been consumed until count of 100 messages.");
});
table.start().then(() => {
    console.log("table stream started, as kafka consumer is ready.");
}, error => {
    console.log("table streamed failed to start: " + error);
});

const app = express()
app.use('/', router);
const port = 3001

router.get('/cons', (req, res) => {
    table.getTable().then(map => {
        res.send(map)
    })
})
router.get('/', (req, res) => res.sendFile((path.join(__dirname + '/index.html'))))

app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`))