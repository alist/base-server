var auth = require('./auth');
var edbModule = require("eris-db");
var config = require('../core/config');
var eris = require("eris-contracts");
var async = require('async');

var cfg = config.edb;
var cnames = config.contracts;

//Set up
var edb;
var contracts = {};

//EDB connection creation
function makeEDB(cb){
	edb = edbModule.createInstance("ws://"+cfg.host+":"+cfg.port+"/socketrpc")
	edb.start(function(err){
		if(err) return cb(err);
		return cb(null);
	})
}

function loadContracts(cb){
    async.each(cnames, loadContract, function(err){
        if (err) return cb(err);
        cb(null)
    })
}

//Contract Info retrieval
function loadContract(cname, cb){
	getContractData(cname, function(err, contract){
		if (err) {
            return cb(err)
        } else {
            contracts[cname] = contract;
            return cb(null)
        }
	})
}

//contract object creation
function getCff(account){
	if (!edb) throw new Error("ErisDB not connected ")
    var pipe = new eris.pipes.DevPipe(edb, account);
    return eris.contracts(pipe);
}

function getContract(cname, account){
	if (!account) return null;
    cff = getCff(account);
    contractFactory = cff(contracts[cname].abi);
    contractFactory.setOutputFormatter(eris.outputFormatters.jsonStrings)
    contract = contractFactory.at(contracts[cname].address);
    return contract
}

//Status check
function checkStatus(cb){
    edb.blockchain().getChainId(function(err, data){
        return cb(err)
    })
}


//Namereg functionality
function getEntry(name, cb){
    if (!edb) return cb(new Error("ErisDB not connected "))
    edb.namereg().getEntry(name, function(error, data){
        if(error){
            return cb(error, null)
        }

        try{
            parsed = JSON.parse(data.data);
        } catch (err) {
            return cb(err, null)
        }

        return cb(null, parsed)
    });
}

function getEntryUnparsed(name, cb){
    if (!edb) return cb(new Error("ErisDB not connected "))
    edb.namereg().getEntry(name, cb);
}

function getUser(username, cb){
    //Read username entry from namereg. verify its a user etc.
    getEntry(username, function(error, user){
        if (error || !user || !user.isUser) {
            return cb(new Error("Username could not be resolved"), null)
        } else {
            return cb(null, user);
        }
    });
}

function getContractData(cname, cb){
    getEntry(cname, function(error, contract){
        if(error || !contract || !contract.isContract){
            return cb(new Error("Contract " + cname + " could not be found in the name registry"), null)
        } else {
            return cb(null, contract)
        }
    });
}

function resolveUsername(username, cb){
    //Read username entry from namereg. verify its a user etc.
    getEntry(username, function(error, user){
        if (error || !user || !user.isUser) {
            return cb(new Error("Username could not be resolved"), null)
        } else {
            return cb(null, user.address);
        }
    });
}

function resolveAddress(address, cb){
    getEntry("addresses", function(error, addresses){
        if (error || !addresses || !addresses[address]) {
            return cb(new Error("Address could not be resolved"), null)
        } else {
            return cb(null, addresses[address]);
        }
    });
}



//Contract interaction helpers
module.exports = {
	makeEDB: makeEDB,
    loadContracts: loadContracts,
	loadContract: loadContract,
	getContract: getContract,
    checkStatus: checkStatus,
	namereg: {
		getEntry: getEntry,
	    getUser: getUser,
	    getContract: getContractData,
	    resolveUsername: resolveUsername,
	    resolveAddress: resolveAddress,
	},
    utils: eris.utils,
};