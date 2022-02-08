# KafkaTableExample
Kafka table example
 
## 2 node services:
_app.js_
Publish (and subscribe) to a topic1 that creates a set of events for each GET request sent to :3000/pub?val={payload}
 
_tableConsumer.js_
Creates a simple table for the {payload} and holds the latest status as the value. The table is consumed only when:
* Call to :3001/cons is called
* Request to :3001/async?val{payload} is called, a sync call to :3000/pub will be called, and the status of the table will be returned after 500ms. (only one call is generated between the services, and the information from the table will be consumed once)

Running local Kafka:
> zkserver
> .\bin\windows\kafka-server-start.bat .\config\server.properties


using c:\work\POC\cp-all-in-one\cp-all-in-one>docker-compose up -d

list topics on broker
docker exec -it broker1B /bin/bash
kafka-topics --bootstrap-server broker1A:29092 --list

start miror maker
docker exec -it mirror-maker /bin/bash
connect-mirror-maker /tmp/kafka/config/mm2.properties

node src/app3.js step kafka-host kafka-port other-cluster-initial
node src/app3.js 1 localhost 9092 B
node src/app3.js 2 localhost 8092 A


 
 