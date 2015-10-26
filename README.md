# samaritan-core
Backend system for www.Samaritan.ai

Samaritan is a real time sentiment analysis tool that listens to your telephone calls and analyses spoken words and scores the call. Ideal for call center scenarios where you want to gauge the agent performance and how they deal with your customers, identify red flags on the fly.

To start you need a freeswitch server configured on the running machine. With nodesl configured for incoming connection.

You also need a Nuance NMDP account for HTTP ASR, modify the eslServer.js file and put your credentials in the asr request uris.

The server initialized an esl connection with FS to start listening on the incoming calls.

npm install.

node eslServer.js
