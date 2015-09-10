#Base Server

##Description:
This is a basic framework for a server utilizing namereg-based log in. It comes with some helper scripts for deploying contracts and the namereg. No contracts are included.

If you want to have the contracts deployed put them in the contracts folder allong with the .abi and .binary. All helper scripts expect you to call them from the top folder.

##Make it Go
To start this server you will need to ensure the following are running
 - [erisdb](https://github.com/eris-ltd/eris-db) on the configuration provided in chaindata (NOTE: it is advised to make a copy of the local backackup configuration and use that instead )

Once those services are running locally `npm install` and run `node ./helpers/namereg.js` to load accounts from "./accounts.json" into the namereg. Once done run `node .` in this directory to start the server

Configuration options can be found in config.toml

If you wish to run the tests run `mocha`.

##API
For the api see the [api spec](https://github.com/eris-ltd/base-server/blob/master/apispec.md)
