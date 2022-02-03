const kafka = require('kafka-node');
const ConsumerStream = kafka.ConsumerStream;

exports.consume = (client, topics) => {
    const kafkaStreams = new KafkaStreams();
kafkaStreams.on("error", (error) => console.error("stream error", error));
    const consumer = new ConsumerStream(
        client, topics,
        {
            autoCommit: true
        }
    );

    console.log("ConsumerStream ready", consumer.ready);

    consumer.on('message', (message) => {
        console.log("ConsumerStream", message);
    })
    consumer.on("error", (error) => {
        console.error("ConsumerStream error:", error)
    })
}