#!/usr/bin/env node

var util = require('util');
var eslPool = require('./lib/client/fsConnPool').esl;
var eslComm = require('./lib/client/eslComm').eslComm;

var uuid = process.argv[2];
if (uuid) {
	eslPool.getConn(function(err, conn) {
		if (err) {
			console.error(error);
		} else {
			var executeObj = {app: "conference", arg: "1234@@samaritan+flags{waste}", uuid: uuid};
			eslComm.testExecute(executeObj, conn, function(err, response) {
				if (err) {
					console.log("Execute Error.");
				} else {
					console.log(util.inspect(response));
					console.log("Got responce from command");
				}
			});
		}
	});
} else {
	console.error("No UUID Specified.")
}
