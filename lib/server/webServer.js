var express = require("express");
var bodyParser = require("body-parser");
var cookieParser = require("cookie-parser");
var session = require("cookie-session");
var morgan = require("morgan");
var responseTime = require("response-time");
var serveStatic = require("serve-static");
var favicon = require("serve-favicon");
var io = require("socket.io");

var server = express();
var httpServ = require('http').Server(server);
var socketIO  = io(httpServ);

// server.use(bodyParser.urlencoded({extended: false}));
// server.use(bodyParser.json());
server.set("trust proxy", 1);
server.set("view engine", "jade");
server.set("views", "../../views/")

server.use(responseTime());
server.use(favicon("../../public/favicon.ico"));
server.use(serveStatic("../../public/", {
	dotfiles: "ignore",
	etag: true,
	extensions: false,
	index: "index.html",
	lastModified: true,
	maxAge: 0, // Caching age
	redirect: true
}));
server.use(cookieParser());
server.use(session({
	name: "samaritan",
	keys: ["hello", "world"],
	// maxAge: 
	// expires: 
	path: "/",
	secure: false, // Only HTTPS cookie?
	httpOnly: true, // Allow cookie over javascript client?
	signed: true, // Digital signature with cookie
	overwrite: false
}));
server.use(morgan("combined"));


server.get("/", function(req, res) {
	res.render('index');
})

httpServ.listen(8000);