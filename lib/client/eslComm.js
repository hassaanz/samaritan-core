var util = require('util');
var extLen = 2;
var extraLogs = true;

var eslComm = {
	testExecute : function(commandObj, eslConn, callback) {
		if (eslConn) {
			if (callback && typeof(callback) == 'function') {
				if (eslConn && typeof(eslConn.execute) == 'function') {
					eslConn.execute(commandObj.app, commandObj.arg, commandObj.uuid, function(response) {
						//@TODO Parse error in response
						console.log("Got command response. %j", response);
						callback(null, response);
					});
					console.log("Sent Execute Command");
				} else {
					callback("ESL Connection not defined.", null);
				}
			} else {
				callback("Callback function not specified.", null);
			}
		}
	}
};
exports.eslComm = eslComm;