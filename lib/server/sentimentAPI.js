var request = require("request");
var unirest = require('unirest');
var nlp = {
	getSentiment : function(text, cb) {
	unirest.post("https://community-sentiment.p.mashape.com/text/")
	.header("X-Mashape-Key", "DoC8tyEMJnmshpfqjIKW4cDIbXMop1B4Z1zjsnt50ANa5e7VfU")
	.header("Content-Type", "application/x-www-form-urlencoded")
	.header("Accept", "application/json")
	.send("txt="+text)
	.end(function (result) {
		if (result.body) {
			var res = {
				confidence : result.body.result.confidence, 
				sentiment : result.body.result.sentiment
			};
			cb(null,res);
			//console.log(result.status, result.headers, result.body.result.confidence);
		} else {
			cb("error occured");
		}
	})
}
}
exports.nlp = nlp;