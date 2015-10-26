#!/usr/bin/env node
var util = require('util');
var esl = require('modesl');
var sift = require('sift');
var fs = require('fs');
var request = require('request');
var nlp = require("./lib/server/sentimentAPI").nlp;
var Reader = require('./lib/server/nuanceASRSender').sender;
var https = require('https');
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

var Winston = require('winston')

var winston = new (Winston.Logger)({
  transports: [
    new (Winston.transports.Console)({
      timestamp: function() {
        var d = new Date().toISOString().
              replace(/T/, ' ').      // replace T with a space
              replace(/\..+/, '')
        return d;
      },
      formatter: function(options) {
        // Return string will be passed to logger.
        return options.timestamp() +' '+ options.level.toUpperCase() +' '+ (undefined !== options.message ? options.message : '') +
          (options.meta && Object.keys(options.meta).length ? '\n\t'+ JSON.stringify(options.meta) : '' );
      }
    })]
});
var VadMachine = require('./lib/server/vadMachine').machinima;
var vadMachine = new VadMachine();

var nuanceReqOpt = {
    uri: "/NMDPAsrCmdServlet/dictation?appId=<your app ID>&appKey=<your app key>&id=<your id>",
    baseUrl: "https://dictation.nuancemobility.net/",
    // uri: "http://localhost:2121/",
    headers: {
        "Accept": "text/plain",
        "Accept-Language": "en-US",
        "Content-Type": "audio/x-wav;codec=pcm;bit=16;rate=8000",
        "Transfer-Encoding":"chunked",
        "User-Agent": "Mozilla/5.0"
    }
}

nuanceReqOpt = {
    path: "/NMDPAsrCmdServlet/dictation?appId=<your app id>&appKey=<your app key>&id=<your id>",
    hostname: "dictation.nuancemobility.net",
    port: 443,
    method: "POST",
    // uri: "http://localhost:2121/",
    headers: {
        "Accept": "text/plain",
        "Accept-Language": "en-US",
        "Content-Type": "audio/x-wav;codec=pcm;bit=16;rate=8000",
        "Transfer-Encoding":"chunked",
        "User-Agent": "Mozilla/5.0"
    }
}

var esl_server = new esl.Server({port: 8085, myevents:false}, function(){
    winston.log("info", "Samaritan esl server is up");
});

esl_server.on('connection::ready', function(conn, id) {
    var uuid = conn.parser.headers['Unique-ID'];
    var connectionMachine = {uuid: uuid};
    var reader = Reader.create();
    var req = {};

    winston.log("info", "UUID is : " + uuid);
    winston.log("info", 'new call ' + id);
    // console.log("Connection:" + util.inspect(conn));
    conn.call_start = new Date().getTime();

    conn.events("plain", "all", function() {
        winston.log("debug", 'events all');
    })
    conn.filter('Unique-ID', uuid, function() {
        winston.log("debug", 'Events filtered.');
    });
    conn.execute('answer');
    conn.api('uuid_setvar ' + uuid + " RECORD_MIN_SEC 0", function(res) {
        winston.log("debug", "Setting RECORD_MIN_SEC variable");
    });
    conn.api('uuid_setvar ' + uuid + " record_sample_rate 8000", function(res) {
        winston.log("debug", "Setting record_sample_rate 8000 variable");
    });
    // conn.api('uuid_setvar ' + uuid + " enable_file_write_buffering false", function(res) {
    //     winston.log("debug", "Setting enable_file_write_buffering variable to false");
    // });
    conn.execute('conference', "1234@samaritan", function() {
        winston.log("info", "Started Conference.");
    });
    conn.on('esl::end', function(evt, body) {
        this.call_end = new Date().getTime();
        var delta = (this.call_end - this.call_start) / 1000;
        winston.log("info", "Call duration " + delta + " seconds");
    });
    var rst = false;
    var fileBasePath = "/tmp/fsFiles/";
    // var vadMachine = new machinima();
    vadMachine.on("start-talking", function(machine) {
        var uuid = machine.uuid;
        var filePath = fileBasePath + uuid + ".raw";
        // filePath = "/tmp/testFifo";
        winston.log("info", "User: " + uuid + " - Started Talking");
        if (!rst) {
            conn.api('uuid_record', uuid + " start " + filePath , function(res) {
                winston.log("info", "Recording started for UUID: " + uuid);
            });
        }
    });
    vadMachine.on("stop-talking", function(machine) {
        var uuid = machine.uuid;
        var filePath = fileBasePath + uuid + ".raw";
        winston.log("info", "User: " + uuid + " - Stopped Talking");
        if (!rst) {
            conn.api('uuid_record', uuid + " stop " + filePath , function(res) {
                winston.log("info", "Recording stopped for UUID: " + uuid);
            });
        }
    });
    vadMachine.on("really-start-talking", function(machine) {
        var uuid = machine.uuid;
        var filePath = fileBasePath + uuid + ".raw";

        req = https.request(nuanceReqOpt, function(res) {
            // console.log("Nuance Response: " + util.inspect(res));
            winston.log("info", "STATUS: " + res.statusCode);
            res.setEncoding('utf8');
            res.on('data', function (chunk) {
                var recognized = chunk.substring(0, chunk.indexOf("\n") -1);
                winston.log("info", "ASR Best Response " + recognized);
                nlp.getSentiment(recognized, function(err, res) {
                    if (err) {
                        winston.log("error", "Error: " + err);
                    } else {
                        winston.log("info", "Sentiment: " + util.inspect(res));
                    }
                });
            });
        }).on('error', function(err) {
            winston.log("info", "Nuance Req error: " + err);
        })

        winston.log("info", "User: " + uuid + " - Really Started Talking");
        if (!rst) {
            rst = true;
            winston.log("info", "Creating read stream on file: " + filePath);
            
            reader.start(filePath, {byteSize : 4000, waitTime : 240, onData: function(dataObj) {
                // winston.log("debug", "Writing Data. " + dataObj.length + " Bytes");
                req.write(dataObj.buffer);
            }}, function(err, res) {
                if (err) {
                    winston.log('error', err);
                } else {
                    winston.log('info', 'File read started.');
                }
            });
        }
    });
    vadMachine.on("really-stop-talking", function(machine) {
        var uuid = machine.uuid;
        var filePath = fileBasePath + uuid + ".raw";
        winston.log("info", "User: " + uuid + " - Really Stopped Talking");
        rst = false;
        reader.stop(function() {
            winston.log("info", "File read Stopped. Ending nuance request.");
            req.end();
            vadMachine.processingDone(connectionMachine);
        });
        vadMachine.processing(connectionMachine);
        conn.api("uuid_record", uuid + " stop " + filePath , function(res) {
            winston.log("info", "Recording stopped for UUID: " + uuid);
        });
    });

    conn.on("esl::event::**", function(evt, body) {
        // console.log('ESL EVENT:\n ' + util.inspect(evt) + "\n\n" + util.inspect(body));
        if (evt.type) {
            if (evt.type.indexOf("CUSTOM") != -1) {
                var eventTypeRes = sift({name: {$eq: "Action"}}, evt.headers);
                if (eventTypeRes.length != 0) {
                    var eventType = eventTypeRes[0].value;

                    // console.log("Custom Event received:" + eventType);

                    if (eventType.indexOf("start-talking") != -1) {
                        winston.log("info", "EVENT: Started Talking");
                        // vadMachine.startTalking(connectionMachine);
                    } else if(eventType.indexOf('stop-talking') != -1) {
                        winston.log("info", "EVENT: Stopped Talking");
                        // vadMachine.stopTalking(connectionMachine);
                    }  else if (eventType.indexOf('dtmf') != -1) {
                        var dtmfKey = sift({name: {$eq: "DTMF-Key"}}, evt.headers);
                        if (dtmfKey.length != 0) {
                            var keyNum = dtmfKey[0].value;
                            if (keyNum == "1") {
                                winston.log("info", "Received 1 DTMF");
                                vadMachine.startTalking(connectionMachine);
                            } else if(keyNum == "2") {
                                winston.log("info", "Received 2 DTMF");
                                vadMachine.stopTalking(connectionMachine);
                            }
                        }
                    }
                } else {
                    winston.log("error", "Cannot find Action in headers.");
                }
            } else if (evt.type.indexOf("CHANNEL_HANGUP") != -1) {
                // console.log(util.inspect(evt));
                winston.log("log", "User hung up");
            } else if (evt.type.indexOf("") != -1) {

            }
        }
    });
});
