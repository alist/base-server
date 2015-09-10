#!/usr/bin/env node

// Name reg creation
var toml = require('toml');
var fs = require('fs-extra');
var async = require('async');
var edbModule = require('eris-db');
var auth = require('../modules/auth');
var config = require('../core/config');

var erisdbURL = "http://" + config.edb.host + ":" + config.edb.port + "/rpc"
console.log(erisdbURL)

var edb = edbModule.createInstance(erisdbURL);
var nlen = 100;

// Private key for deploying
var PrivKey = config.security.serverKey;

var accounts = fs.readJsonSync("./accounts.json");
var namereg = auth.createNameReg(accounts);
var regUsers = namereg.registeredUsers;

// assuming openFiles is an array of file names
edb.namereg().setEntry(PrivKey, "registeredUsers", JSON.stringify(namereg["registeredUsers"]), nlen, function(error, result){
	if(error) {
        console.log('Error when transacting to namereg: ' + error.message);
        process.exit(1);
    }
    edb.namereg().setEntry(PrivKey, "addresses", JSON.stringify(namereg["addresses"]), nlen, function(error, result){
    	if(error) {
	        console.log('Error when transacting to namereg: ' + error.message);
	        process.exit(1);
	    }
	    async.each(regUsers, function(userName, callback) {
		    var data = namereg[userName];
		    edb.namereg().setEntry(PrivKey, userName, JSON.stringify(data), nlen, function(error, result){
		        if(error){
		        	console.log(error)
		        	console.log(userName)
		            callback(error);
		        }
		        callback(null);
		    });
		}, function(err){
		    // if any of the file processing produced an error, err would equal that error
		    if(err) {
		        console.log('Error when transacting to namereg: ' + err.message);
		        process.exit(1);
		    } else {
		        console.log('All entries added.');
		    }
		    // This is just a built in test to compare with 'namereg.json', should be in tests.
		    edb.namereg().getEntries(function(error, data){
		        process.exit(0);
		    });
		});

    })
})