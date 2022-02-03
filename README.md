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
 
 