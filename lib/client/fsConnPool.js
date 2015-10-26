"use strict";
var util = require("util");
var esl = require("modesl");

var remoteESL = false;

var ipAddr 	= "127.0.0.1";
var port 	= 8021;
var pwd 	= "ClueCon";
if (remoteESL) {
	ipAddr = "10.197.54.81";
}

var pool = {
	getConn: function(callback) {
		if (callback && typeof(callback) == "function" ) {
			console.log("Initiating a connection to FS. IP: %s, port: %s, pwd: %s.", ipAddr, port, pwd);
			var conn = new esl.Connection(ipAddr, port, pwd, function(err, con) {
				if (err) {
					console.log("Unable to make an esl connection." + err);
					callback(err);
				} else {
					if (con) {
						console.log("Got eslCon: " + util.inspect(con));
						console.log("Created an esl connection from cb");
						callback(null, con);
					} else if (conn) {
						console.log("Got eslCon: " + util.inspect(conn));
						console.log("Created an esl connection from return val");
						callback(null, conn);
					}
				}
			});
		} else {
			console.log("fsPool: invalid cb on getConn");
		}
	}
};

exports.esl = pool;
