const kafka = require('kafka-node');
const Consumer = kafka.Consumer;

exports.consume = (client, topics) => {
    console.log(topics);
    const consumer = new Consumer(
        client, [],
        {
            autoCommit: true
        });

    consumer.addTopics(topics, (err, added) => {
        console.error("error adding topics to consume", err);
        console.log("added topics", added);
    })
    console.log("consumer ready", consumer.ready);

    consumer.on('message', (message) => {
        console.log("Consume", message);
    })
    consumer.on("error", (error) => {
        console.error("Consumer error:", error)
    })
}