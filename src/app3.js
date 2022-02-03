const express = require('express')
const kafka = require('kafka-node')
const _ = require('lodash');
const path = require('path');
const { consume } = require('./consumer');
const router = express.Router();

const topic = 'topic1';

const Producer = kafka.Producer,
    KeyedMessage = kafka.KeyedMessage,
    client = new kafka.KafkaClient(),
    producer = new Producer(client),
    km = new KeyedMessage('key', 'message'),
    statusList = [];


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
        if (err) console.error("Error on send", err);
    });
}


const app = express()
app.use('/', router);
const port = 3000

const publishMessages = (start, leap, loop) => {
    const statuses = [start, start+leap, start+(leap*2)];
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
    if(loop) {
        setTimeout(() => {  publishMessages(statuses[2]+leap, leap, loop); }, 10000);
    }
}

// router.get('/pub', (req, res) => {
//     publishMessages(1, 2, true);
//     res.status(200).send('ok')
// })

router.get('/stat', (req, res) => {
    
    client.loadMetadataForTopics([], (e, r) => {
        res.status(200).send(e  || r);

    })
})


router.get('/', (req, res) => res.sendFile((path.join(__dirname + '/index.html'))))

consumer.on('message', (message) => {
    console.log("Consume", message);
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
consumer.addTopics([topic], (error, added) => { console.log(`add topic to consumer add: ${added}, error: ${error}`) })