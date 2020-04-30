'use strict';

var assert = require('assert');
var chai = require('chai');
var CryptoJS = require("crypto-js");
var expect = chai.expect;
var handler = require('../src/controllers/restaurant.js')
var config = require('../src/config/config.js');
var message = require('../src/helper/message');
var mysql = require('mysql');
var should = require('chai').should();
var fs = require('fs');
var token = "bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl9rZXkiOiJNcFZQaTl6MkszMjhVa3xyZXN0YXVyYW50QGdtYWlsLmNvbXxSZXN0YXVyYW50VXNlciIsImlhdCI6MTU4ODE2OTg0MX0.lez1MZQ9-JcFNnYtxoZ3ccZn1xqIU-lSWU_8RhpWRhU"
var wrong_token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl9rZXkiOiJyeEY1M3hXVjE4TDdOMnxyZXN0YXVyYW50QGdtYWlsLmNvbXxSZXN0YXVyYW50VXNlciIsImlhdCI6MTU4ODE3MjU3Nn0.GdPlh2-Z9pYIx520CwHjGYE7MITYA1wnJgm_BFCSRps"
var new_token = "bearer " + wrong_token;
var user_token = "bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl9rZXkiOiJiM1BOR2t2bUVJSjJhcXx0ZXN0QGdtYWlsLmNvbXxSZXN0YXVyYW50VXNlciIsImlhdCI6MTU4ODE3Mjk1MX0.MtmlTvnW91ueutRbI1Y9gAKP8-jsBirSCPmEmRoGAtk"


describe('Restaurant services', function () {
    var sql_con;
    var req;
    var user_id = "";
    req = {
        body: "",
        app: {
            get: function (param) {
                if (param == 'base64') {
                    var base64 = require('base-64');
                    return base64;
                } else if (param == 'randomstring') {
                    var randomstring = require('randomstring');
                    return randomstring;
                } else if (param === 'sql_con') {
                    return sql_con;
                } else if (param === 'restaurant_dao') {
                    var path = '../src/dao/' + param;
                    var dao = require(path);
                    return dao.restaurant_lib_obj;
                } else if (param === 'md5') {
                    var md5 = require('md5');
                    return md5;
                } else if (param === 'mailer') {
                    var nodemailer = require('nodemailer');
                    var mailer = nodemailer.createTransport({
                        service: 'Gmail',
                        host: "smtp.gmail.com",
                        port: 465,
                        auth: {
                            user: "developer@thesynapses.com",
                            pass: "Password#105"
                        }
                    });
                    return mailer;
                } else {
                    var path = '../src/dao/' + param;
                    var lib = require(path);
                    return lib;
                }
            }
        },
        connection: {
            remoteAddress: "127.0.0.1"
        }
    };

    before(function () {
        sql_con = mysql.createConnection({
            host: config.dbhost,
            user: config.dbusername,
            password: config.dbpassword,
            database: 'madchef_testdb',
            ssl:
            {
                ca: fs.readFileSync('./src/config/ssl/server-ca.pem'),
                key: fs.readFileSync('./src/config/ssl/client-key.pem'),
                cert: fs.readFileSync('./src/config/ssl/client-cert.pem'),
            }
        });

        sql_con.connect(function (err) {
            if (err) throw err;
            console.log("Connected!");
        });
    });
    after(function (done) {
        sql_con.end(done);
    })

   //test cases for view user
   it('No JWT token in  restaurant view user', function (done) {
    var res;
    req.headers = { authorization: 'bearer' }
    req.query = {
        "restaurant_user_id": "1",
    };

    res = {
        json: function (result) {
            result = result.res;
            var response = {
                "status": 403,
                "message": message.jwt_error,
            };
            expect(result.status).to.equal(response.status);
            expect(result.message).to.equal(response.message);
            expect(result.data).to.equal(null);
            done();
        }
    };
    handler.restaurantProfile.viewUser(req, res);
});

})
