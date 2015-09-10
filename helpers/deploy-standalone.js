var toml = require('toml');
var async = require('async');
var fs = require('fs-extra');
var edbModule = require('eris-db');
var erisC = require('eris-contracts');
var config = require('../core/config');

var erisdbURL = "http://" + config.edb.host + ":" + config.edb.port + "/rpc"

var toDeploy = config.contracts;

//Private key for deploying
var PrivKey = config.security.serverKey;
var contracts = erisC.contractsDev(erisdbURL, PrivKey);
var edb = edbModule.createInstance(erisdbURL);

async.map(toDeploy, deploy, function(err){
	if(err) {
		console.log("An error occured: " + err)
		throw err
	}
})

function deploy(cname, cb){
	console.log("Deploying " + cname)
	contract = {}
	contract.abi = fs.readJsonSync("./contracts/" + cname + ".abi")
	contract.isContract = true;

	contractCode = fs.readFileSync('./contracts/' + cname +'.binary').toString();

	contractFactory = contracts(contract.abi);

	contractFactory.new({data: contractCode}, function (error, _contract) {
	    if (error) {
	        cb(error);
	    }
	    contract.address = _contract.address;

	    edb.namereg().setEntry(PrivKey, cname, JSON.stringify(contract), 100, function(error, result){
	    	if (error) {
	    		cb(error)
	    	}
	    	cb(null)
	    })
	});
}
