var auth = require('../modules/auth.js');
var async = require('async');
var edb = require('../modules/edb');
var cfg = require('../core/config');

module.exports = {
    addRoutes: addRoutes,
}

function addRoutes(server) {
    server.post({url:'/login'}, loginRoute);
    server.get('/status', statusRoute);
    server.get({url:'/hello'}, helloRoute_get);
}

function statusRoute(req, res, next) {
    status = {edb: "?"}
    async.parallel([
        function(cb){
            //edb query
            edb.checkStatus(function(err){
                if (err) {
                    status.edb = "down"
                    return cb(err)
                } else {
                    status.edb = "available"
                    return cb(null)
                }
            })
        }], //MORE tests can be added here if dependant on additional external services
    function(err){
        if (err) {
            res.json(500, status)
            return next()
        } else {
            res.json(200, status)
            return next()
        }
    })
} 

// POST /login
var loginRoute = function(req, res, next) {

    edb.namereg.getUser(req.body.username, function(error, data){
        if (error || data === undefined) {
            res.send(401, "Incorrect Username or Password1")
            return next()
        } else {
            //2) Decrypt using AES
            try {
                PrivKey = auth.decrypt(data.ekey, data.tag, auth.makeKey(req.body.password), data.iv)
            } catch (error) {
                res.send(401, "Incorrect Username or Password2")
                return next()
            }

            //3) Attach decrypted key to user session
            user = {address: data.address, username: req.body.username, PrivKey: PrivKey};
            var token = auth.makeToken(user)
            res.json({token: token});
            return next()
        }
    });
};

//These are for testing purposes ONLY 
// GET /hello
var helloRoute_get =function(req, res, next) {
    res.json(req.user);
    return next();
};

