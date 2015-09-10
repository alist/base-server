var should = require('should'); 
var assert = require('assert');
var request = require('superagent');
var async = require('async');

var url = 'http://localhost:4545';

var shaggyToken;

describe('Routing', function(){	


	var oldToken = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ0b2tlbmRhdGEiOnsiZW5jcnlwdGVkIjoiOGY3YzdkMmVhNDc3M2Y1MWM4MDNlZDBhMzMxMDIwMTFmMDlmNTJmZTRkOWVkODE3MmMwYjFlZWFjNGM1ZTE4YjFmODY2MGY5YWNiMGMyMDE0MDAxMGUxOGExYWI3ZGI3ZWU3MmI5MmYzMWY1NWQwNWE0NTEzOGQyNTdlMDI2MTI2YmY1ZTg4MDdjYmJhMjZhZWI5MTkyZDU1NTQwMGQzMmMzMzgxYWMyZmZiOTFmNDAyMTE4MDE2ZDE4OTcwZTRiN2FiMDUzMWZkNGE2OGJkYjg4NjE4OWY5ZDdlNTA1ODU2ZmU3ZTNmYWMzN2JkMmYzYjNjYjgyMzczYTBjMGZjYzlkNGE4YWFmMTBlY2NlMTkxNzVjYTYwOGQxMzJkNzhkZTNjZDk5MWQxY2FhYTA2NmFiYzY5NDQwYWVjYTMzNGFkYWE2NjkwZDdkNTM2NmQzMmE1YWQxMDhkNDdjNzQyODQ5MTc0Njk4YmQxYmExN2ZlNjcxYTQ0MDcyZWU0YWExNWM0MWM0YjU1ZjRiYjBmYzVhODQ4ZmIyNjJkOTk3ZDZjOCIsInRhZyI6ImM5NGYzNDBiNmY3YjI4MmY4OWZkMTFkNjM3YzkzMDIxIiwiaXYiOiIzMWYzODQ2OTk4MzRlZjQ2MWMxZDA5MWEifSwiaWF0IjoxNDM4MDA3NDk2LCJleHAiOjE0MzgwMjU0OTZ9.UX87r45Nfc8CWUcHe4zE9HyLqfOzeef2qA2llF-iayQ";

	before(function(done){
		this.timeout(160000);
		//Do set up (make sure There are some shifts added)
		async.series([
			require('../helpers/deploy').deploy,
			require('../core/server.js').start, //Start up the server
			function(cb){
				request
					.post(url + '/login')
					.send({username: "shaggy", password: "letmein"})
					.end(function(err, res){
						if(err) {
							return cb(err)
						}

						shaggyToken = res.body.token
						return cb(null)
					})
			}],
			function(err, results){
				console.log(err)
				if (err) throw err;
				done()
			})

	})


	describe('Login', function(){
		this.timeout(5000)
		it('Should 401 if incorrect username', function(done){
			request
				.post(url + '/login')
				.send({username: "non-existant user", password: "letmein"})
				.end(function(err, res){
					res.status.should.be.exactly(401);
					done();
				})
		})

		it('Should 401 if incorrect password', function(done){
			request
				.post(url + '/login')
				.send({username: "shaggy", password: "junk"})
				.end(function(err, res){
					res.status.should.be.exactly(401);
					done();
				})
		})

		it('Should 200 and return token if correct username and password', function(done){
			request
				.post(url + '/login')
				.send({username: "shaggy", password: "letmein"})
				.end(function(err, res){
					res.status.should.be.exactly(200);
					res.body.should.have.property('token');
					dennisToken = res.body.token
					done()
				})
		})
	})

	describe('Token Correctness', function(){
		this.timeout(5000)
		it('Should 401 if token not provided', function(done){
			request
				.get(url + '/hello')
				.end(function(err, res){
					res.status.should.be.exactly(401);
					done()
				})
		})

		it('Should 401 if token corrupt', function(done){
			request
				.get(url + '/hello')
				.set('Authorization', shaggyToken.slice(2))
				.end(function(err, res){
					res.status.should.be.exactly(401);
					done()
				})
		})

		it('Should 401 if old token', function(done){
			request
				.get(url + '/hello')
				.set('Authorization', oldToken)
				.end(function(err, res){
					res.status.should.be.exactly(401);
					done()
				})
		})

		it('Should return token contents if valid', function(done){
			request
				.get(url + '/hello')
				.set("Authorization", shaggyToken)
				.end(function(err, res){
					res.status.should.be.exactly(200);
					res.body.should.have.property("address", "6719102E4EFC534F89EA4CE9FF35467CB7324B21");
					res.body.should.have.property("PrivKey", "262F794994776E88740F2E93F8F33267F1EBDB6A3B38697A7A20C15B897C056683AC84451E108D5DC5312FE9F3440568A965379358C5F6BC36ED040DB4F5BCD3")
					res.body.should.have.property("username", "shaggy")
					done()
				})
		})
	})
})