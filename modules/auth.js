var fs = require('fs-extra');
var jwt = require('jsonwebtoken')
var cfg = require('../core/config').security;

// Nodejs encryption with CTR
var crypto = require('crypto');
var algorithm = 'aes-256-gcm';


//Read these from file?
var salt = cfg.salt;
var tokenSecret = cfg.tokenSecret;
var encryptionSecret = cfg.encryptionSecret;


function fromHeader(req) {
    if (req.headers.authorization) {
        return req.headers.authorization;
    }
    return null;
}

function makeToken(user) {
    encUser = encrypt(JSON.stringify(user), makeKeyShort(encryptionSecret))
    tokenuser = {tokendata: encUser}

	return jwt.sign(tokenuser, tokenSecret, {expiresInMinutes: 60*5})
}

function tokenParser(token){
    data = token.tokendata;
    user = JSON.parse(decrypt(data.encrypted, data.tag, makeKeyShort(encryptionSecret), data.iv))
    user.account = {address: user.address, privKey: user.PrivKey}
    return user
}

//This function is just for cleanliness
function makeKey(password) {
    return crypto.pbkdf2Sync(password, salt, 204800, 32, 'sha256')
}

function makeKeyShort(password) {
    return crypto.pbkdf2Sync(password, salt, 16, 32, 'sha256')
}

function encrypt(data, secret){
    var iv = crypto.randomBytes(12)
    var cipher = crypto.createCipheriv('aes-256-gcm', secret, iv)
    var encrypted = cipher.update(data, 'utf8', 'hex')
    encrypted += cipher.final('hex');
    var tag = cipher.getAuthTag();
    return {
        encrypted: encrypted,
        tag: tag.toString('hex'),
        iv: iv.toString('hex')
    }
}

function decrypt(data, tag, secret, iv) {

    var decipher = crypto.createDecipheriv('aes-256-gcm', secret, new Buffer(iv, 'hex'))
    decipher.setAuthTag(new Buffer(tag,'hex'));
    var dec = decipher.update(data,'hex','utf8')
    dec += decipher.final('utf8');

    return dec
}

function createNameReg(accounts){

    namereg = {};
    namereg.registeredUsers = [];
    namereg.addresses = {};
    Object.keys(accounts).forEach(function(key){
        enc = encrypt(accounts[key].PrivKey, makeKey(accounts[key].password))

        namereg.registeredUsers.push(key);
        namereg.addresses[accounts[key].address] = key;

        namereg[key] = {};
        namereg[key].isUser = true;
        namereg[key].address = accounts[key].address;
        namereg[key].tag = enc.tag;
        namereg[key].ekey = enc.encrypted;
        namereg[key].iv = enc.iv;
    })

    return namereg
}

module.exports = {
    encrypt: encrypt,
    decrypt: decrypt,
    makeKey: makeKey,
    tokenParser: tokenParser,
    makeToken: makeToken,
    fromHeader: fromHeader,
    createNameReg: createNameReg
};