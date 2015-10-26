var fs = require('fs'),
    lineno=0,
    Reader = require('../lib/server/nuanceASRSender').sender,
    https = require('https'),
    util = require('util');

var nuanceReqOpt = {
    path: "/NMDPAsrCmdServlet/dictation?appId=NMDPTRIAL_SpeechTrans_Inc_speechtransbeta20110505112836&appKey=d5e1755d571ff693d2e70b8bb866b73b004b9a619346cad37be830625cdab331bb288e124784a5196bb0a423175c5e17a7f8783a3e430eb92b3e1c8718cfb8d4&id=speechtranstest",
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

var filePath = '../files/9e619638-5762-4ead-a65a-9367823f7297.raw';
// var stream = fs.createWriteStream(filePath, {flags:'a'});



// stream.on('open', function() {
//     console.log('Stream opened, will start writing in 2 secs');
//     setInterval(function() { stream.write((++lineno)+' oi!\n'); }, 2000);
// });

var req = https.request(nuanceReqOpt, function(res) {
	// console.log("Nuance Response: " + util.inspect(res));
	console.log('STATUS: ' + res.statusCode);
	res.setEncoding('utf8');
	res.on('data', function (chunk) {
		console.log('BODY: ' + chunk);
	});
}).on('error', function(err) {
	console.log("Nuance Req error: " + err);
})
function handleData(dataObj) {
	console.log("Read Data from file: " + dataObj.buffer.toString());
	req.write(dataObj.buffer);
}

var reader = Reader.create();
console.log("Setting timeout...");
setTimeout(function() {
	reader.stop();
	req.end();
	console.log("Stopping reader...");
}, 7000);
reader.start(filePath, {byteSize : 256, waitTime : 240, onData: handleData}, function(err, res) {
	if (err) {
		console.log(err);
	} else {
		console.log("File read started.");
	}
});

console.log("Checking if writer is blocking...");