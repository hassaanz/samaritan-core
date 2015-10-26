/*
 * Watches a file already being written to and emits event when data is read.
 */

var fs = require("fs");
var request = require("request");
var events = require('events');
var https = require('https');

var byte_size = 256;
var fsTimeout = 2000;

var nuanceReqOpt = {
    uri: "/NMDPAsrCmdServlet/dictation?appId=NMDPTRIAL_SpeechTrans_Inc_speechtransbeta20110505112836&appKey=d5e1755d571ff693d2e70b8bb866b73b004b9a619346cad37be830625cdab331bb288e124784a5196bb0a423175c5e17a7f8783a3e430eb92b3e1c8718cfb8d4&id=speechtranstest",
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

var defaultOptions = {
    byteSize: 256,
    waitTime: 500
}


var sender = {
    create: function(id) {
        var snd = {}
        events.EventEmitter.call(snd);
        snd._fileStream = {};
        snd._fileDescriptor = {};
        snd._reqStream = {};
        snd._id = id;
        snd._readBytes = 0;
        snd._isReading = false;
        snd.onRead = {};
        snd.defOpt = defaultOptions;
        snd._onRead = {};
        snd.readsome = function() {
            var stats = fs.fstatSync(snd._fileDescriptor);
            if(stats.size < snd._readBytes + 1) {
                // console.log("True");
                // console.log('* File Size: ' + stats.size);
                // console.log("Read bytes: ", + snd._readBytes);
                // snd.emit('eof', {fileSize: stats.size});
                if (snd._isReading) {
                    setTimeout(snd.readsome, fsTimeout);
                } else {
                    if (snd._onStopHandler && typeof(snd._onStopHandler) == 'function') {
                        snd._onStopHandler();
                    }
                }
            } else {
                // console.log("False\nstats.size: " + stats.size + "\nRead Bytes: " + snd._readBytes + 1);
                fs.read(snd._fileDescriptor, new Buffer(snd.defOpt.byteSize), 0, snd.defOpt.byteSize, snd._readBytes, snd.processsome);
            }
        };
        snd.processsome = function(err, bytecount, buff) {
            // snd.emit('read', {bytes: bytecount, data: buff});
            // console.log('Read', bytecount, 'and will process it now.');
            
            // Here we will process our incoming data:
            // Just be careful about not using beyond the bytecount in buff.
            
            // console.log(buff.toString('utf-8', 0, bytecount));
            var dataObj = {buffer: buff, length: bytecount};
            // snd.emit('data', dataObj);
            if (snd._onDataHandler) {
                snd._onDataHandler(dataObj);
            }
            // So we continue reading from where we left:
            snd._readBytes += bytecount;
            setTimeout(function() {
                snd.readsome();
            }, snd.defOpt.waitTime);
        };
        snd.start = function(filePath, options, callback) {
            var cb = callback;
            var opt = options;
            if (opt == null && cb == null) {
                console.error('invalid params');
                return
            }
            if (typeof(opt) == 'function') {
                cb = opt;
                opt = snd._defOpt;
            } else if (options) {
                opt.byteSize = options.byteSize || snd.defOpt.byteSize;
                opt.waitTime = options.waitTime || snd.defOpt.waitTime;
                opt.onData = options.onData;
            } else {
                
            }
            if (opt.onData && typeof(opt.onData) == 'function') {
                snd._onDataHandler = opt.onData;
            }
            if (!snd._isReading) {
                if (filePath) {
                    snd._isReading = true;
                    snd._readBytes = 0;
                    snd._fileStream = fs.open(filePath, 'r', function(err, fd) {
                        if (err) {
                            cb(err);
                        } else {
                            cb(null, "File opened")
                            snd._fileDescriptor = fd;
                            snd.defOpt.waitTime = opt.waitTime;
                            snd.defOpt.byteSize = opt.byteSize;
                            snd.readsome();
                        }
                    });
                } else {
                    cb('No File Path specified.');
                }
            }
        };
        snd.stop = function(cb) {
            if (cb && typeof(cb) == 'function') {
                snd._onStopHandler = cb;
            }
            snd._isReading = false;
        };
        return snd;
    }
}

exports.sender = sender;