var restify = require('restify');
var restifyjwt = require('restify-jwt');
var auth = require('../modules/auth');
var cfg = require('./config');
var edb = require('../modules/edb');

var name = "Base Server";

function start(cb){
	setup(function(err){
		if (err) throw new Error("Server could not be set up: " + err)
		var server = restify.createServer();
		server.use(restify.queryParser());
		server.use(restify.bodyParser({mapParams: true, mapFiles: true}));

		server.use(restifyjwt({secret: cfg.security.tokenSecret, getToken: auth.fromHeader, processPayload: auth.tokenParser}).unless({path: ['/login',/\/public\/?.*/, '/status']}))

		//Add route middlewares here

		//Serve static files
		server.get(/\/public\/?.*/, restify.serveStatic({
			directory: './ui',
			default: 'index.html'
		}))

		require('../routes/routes').addRoutes(server);
		//Add routes to your server here

		server.listen(cfg.server.port);

		console.log("");
		console.log("Welcome to: " + name + ".");
		console.log("");
		return cb(null)
	})
}

function setup(cb){
	edb.makeEDB(function(err){
	    if (err) return cb(err)
	    edb.loadContracts(function(err){
	        if (err) return cb(err);
        	//If you have other setup to do. You should do it here
        	return cb(null)
        })
	})
}


module.exports = {
	start: start,
	setup: setup
}

