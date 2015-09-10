var toml = require('toml');
var async = require('async');
var fs = require('fs-extra');
var edbModule = require('eris-db');
var erisC = require('eris-contracts');
var config = require('../core/config');


//Private key for deploying
var PrivKey = config.security.serverKey;
var contracts;
var edb;

exports.deploy = function(callback){
	var erisdbURL = "http://" + config.edb.host + ":" + config.edb.port + "/rpc"
	console.log(erisdbURL)

	var toDeploy = config.contracts; //put all contracts you want deployed here

	contracts = erisC.contractsDev(erisdbURL, PrivKey);
	edb = edbModule.createInstance(erisdbURL);

	async.map(toDeploy, deploy, function(err){
		if(err) {
			console.log("An error occured: " + err)
			return callback(err)
		}
		return callback(null)
	})
}


function deploy(cname, cb){
	console.log("Deploying " + cname)
	contract = {}
	contract.abi = fs.readJsonSync("./contracts/" + cname + ".abi")
	contract.isContract = true;

	contractCode = fs.readFileSync('./contracts/' + cname + '.binary').toString();

	contractFactory = contracts(contract.abi);

	contractFactory.new({data: contractCode}, function (error, _contract) {
	    if (error) {
	        return cb(error);
	    }
	    contract.address = _contract.address;

	    edb.namereg().setEntry(PrivKey, cname, JSON.stringify(contract), 100, function(error, result){
	    	if (error) {
	    		return cb(error)
	    	}
	    	return cb(null)
	    })
	});
}
