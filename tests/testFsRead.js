var fs = require("fs");
var util = require("util");
var request = require('request');


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
};

function handleRequest(err, res, body) {
    if (err) {
        console.log("error - Error in making a request to server." + err);
    } else {
        if (res.statusCode == 200) {
            console.log("info - OK Server Response: " + body);
        } else {
            console.log("info - Response: " + util.inspect(res));
        }
    }
};

var path = "../files/df7df91c-800f-4afb-8bb7-1a2ae4427688.raw";
// path = "/tmp/fsFiles/6ca4df70-19ce-4098-9f9d-21a839480f8b.raw";
var file = fs.createReadStream(path);
file.pipe(request.post(nuanceReqOpt, handleRequest).on("end", function() {
	console.log("info - Closing Request Stream...");
}));

file.on("data", function(data) {
	console.log(util.inspect(data));
	console.log("data")
});
file.on("end", function() {
	console.log("info - Closing File Stream...");
})
