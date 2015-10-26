var http = require("http");
var fs = require('fs');

var filesDir = __dirname + "/files/"
var fileNum = 1;

var server = http.createServer(function(req, res) {
	var filePath = filesDir + "file" + fileNum + ".raw";
	fileNum = fileNum + 1;
	var fileStream = fs.createWriteStream(filePath);
	req.pipe(fileStream);
	req.on("end", function() {
		res.end("File saved. Path: " + filePath);
		console.log("File saved. Path: " + filePath)
	})
	req.on("data", function(data) {
		console.log("Date: " + data);
	});
})
server.listen(2121);
