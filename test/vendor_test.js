'use strict';

var assert = require('assert');
var chai = require('chai');
var CryptoJS = require("crypto-js");
var expect = chai.expect;
var handler = require('../src/controllers/vendor.js')
var config = require('../src/config/config.js');
var message = require('../src/helper/message');
var mysql = require('mysql');
var should = require('chai').should();
var fs = require('fs');
var token = "bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl9rZXkiOiJlTVY0M043aFlvb1VnYXx2ZW5kb3JAZ21haWwuY29tfFZlbmRvclVzZXIiLCJpYXQiOjE1ODgxNTkwNTN9.JTdrMIW6KtLO3qroAYKnCUtbRaAUgRRkcCzgWljPG0E"
var wrong_token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl9rZXkiOiJIbEpERmp6ZHBCSlRHTHx2ZW5kb3JAZ21haWwuY29tfFZlbmRvclVzZXIiLCJpYXQiOjE1ODgxNTI3NDV9.TJir0TikCt810OfVqAIV_EbD0-j5467cYbJFab3l-Yk";
var new_token = "bearer " + wrong_token;
var user_token = "bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl9rZXkiOiJ4aEJYUXB1c25uNFFCT3xuZXdAZ21haWwuY29tfFZlbmRvclVzZXIiLCJpYXQiOjE1ODgxNTczOTl9.nk5y8c_voE6zQEbvdxYJDxxtFaFFk6jyySb_RX0Ow78"


describe('Vendor services', function () {
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
                } else if (param === 'vendor_dao') {
                    var path = '../src/dao/' + param;
                    var dao = require(path);
                    return dao.vendor_lib_obj;
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

    //test case for view user
    it('No JWT token in view user', function (done) {
        var res;
        req.headers = { authorization: 'bearer' }
        req.query = {
            "vendor_user_id": "1",
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
        handler.vendorProfile.viewUser(req, res);
    });

    it('Invalid JWT token in View user', function (done) {
        var res;
        req.headers = { authorization: new_token }
        req.query = {
            "vendor_user_id": "1",
        };

        res = {
            json: function (result) {
                result = result.res;
                var response = {
                    "status": 403,
                    "message": message.invalid_token,
                };
                expect(result.status).to.equal(response.status);
                expect(result.message).to.equal(response.message);
                expect(result.data).to.equal(null);

                done();
            }
        };
        handler.vendorProfile.viewUser(req, res);
    });
    it('Invalid user_type in View user', function (done) {
        var res;
        req.headers = { authorization: user_token }
        req.query = {
            "vendor_user_id": "1",
        };

        res = {
            json: function (result) {
                result = result.res;
                var response = {
                    "status": 401,
                    "message": message.invalid_user_type,
                };
                expect(result.status).to.equal(response.status);
                expect(result.message).to.equal(response.message);
                expect(result.data).to.equal(null);

                done();
            }
        };
        handler.vendorProfile.viewUser(req, res);
    });

    it('Valid response in View user', function (done) {
        var res;
        req.headers = { authorization: token }
        req.query = {
            "vendor_user_id": "1",
        };

        res = {
            json: function (result) {
                result = result.res;
                var response = {
                    "status": 200,
                    "message": message.view_vendor_user,
                };
                expect(result.status).to.equal(response.status);
                expect(result.message).to.equal(response.message);
                expect(result.data).to.not.equal(null);

                done();
            }
        };
        handler.vendorProfile.viewUser(req, res);
    });

    it('Invalid user in View user', function (done) {
        var res;
        req.headers = { authorization: token }
        req.query = {
            "vendor_user_id": "15",
        };

        res = {
            json: function (result) {
                result = result.res;
                var response = {
                    "status": 401,
                    "message": message.data_not_present,
                };
                expect(result.status).to.equal(response.status);
                expect(result.message).to.equal(response.message);
                expect(result.data).to.equal(null);

                done();
            }
        };
        handler.vendorProfile.viewUser(req, res);
    });

    //test for user list
    it('No JWT token in List user', function (done) {
        var res;
        req.headers = { authorization: 'bearer' }
        req.query = "";

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
        handler.vendorProfile.userList(req, res);
    });

    it('Invalid JWT token in List user', function (done) {
        var res;
        req.headers = { authorization: new_token }
        req.query = "";

        res = {
            json: function (result) {
                result = result.res;
                var response = {
                    "status": 403,
                    "message": message.invalid_token,
                };
                expect(result.status).to.equal(response.status);
                expect(result.message).to.equal(response.message);
                expect(result.data).to.equal(null);

                done();
            }
        };
        handler.vendorProfile.userList(req, res);
    });

    it('Invalid user_type in List user', function (done) {
        var res;
        req.headers = { authorization: user_token }
        req.query = "";

        res = {
            json: function (result) {
                result = result.res;
                var response = {
                    "status": 401,
                    "message": message.invalid_user_type,
                };
                expect(result.status).to.equal(response.status);
                expect(result.message).to.equal(response.message);
                expect(result.data).to.equal(null);

                done();
            }
        };
        handler.vendorProfile.userList(req, res);
    });

    it('Valid response in List user', function (done) {
        var res;
        req.headers = { authorization: token }
        req.query = "";

        res = {
            json: function (result) {
                result = result.res;
                var response = {
                    "status": 200,
                    "message": message.user_list,
                };
                expect(result.status).to.equal(response.status);
                expect(result.message).to.equal(response.message);
                expect(result.data).to.not.equal(null);

                done();
            }
        };
        handler.vendorProfile.userList(req, res);
    });

    //test cases for add user
    it('No JWT token in add user', function (done) {
        var res;
        req.headers = { authorization: 'bearer' }
        req.body = {
            "name":"Test_user",
            "email":"test_user@gmail.com",
            "password":"Password#105",
            "contact_number":"789456123",
            "profile_pic" :  "Null",
            "user_type" : "Sales"

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
        handler.vendorProfile.addUser(req, res);
    });

    it('Invalid JWT token in add user', function (done) {
        var res;
        req.headers = { authorization: new_token }
        req.body = {
            "name":"Test_user",
            "email":"test_user@gmail.com",
            "password":"Password#105",
            "contact_number":"789456123",
            "profile_pic" :  "Null",
            "user_type" : "Sales"
        };

        res = {
            json: function (result) {
                result = result.res;
                var response = {
                    "status": 403,
                    "message": message.invalid_token,
                };
                expect(result.status).to.equal(response.status);
                expect(result.message).to.equal(response.message);
                expect(result.data).to.equal(null);

                done();
            }
        };
        handler.vendorProfile.addUser(req, res);
    });

    it('Invalid user_type in add user', function (done) {
        var res;
        req.headers = { authorization: user_token }
        req.body = {
            "name":"Test_user",
            "email":"test_user@gmail.com",
            "password":"Password#105",
            "contact_number":"789456123",
            "profile_pic" :  "Null",
            "user_type" : "Sales"
        };

        res = {
            json: function (result) {
                result = result.res;
                var response = {
                    "status": 401,
                    "message": message.invalid_user_type,
                };
                expect(result.status).to.equal(response.status);
                expect(result.message).to.equal(response.message);
                expect(result.data).to.equal(null);

                done();
            }
        };
        handler.vendorProfile.addUser(req, res);
    });
    it('Valid response in add user', function (done) {
        var res;
        req.headers = { authorization: token }
        req.body = {
            "name":"Test_user",
            "email":"test1@gmail.com",
            "password":"Password#105",
            "contact_number":"789456123",
            "profile_pic" :  "Null",
            "user_type" : "Sales"
        };

        res = {
            json: function (result) {
                sql_con.query('Delete from vendor_user where email = "test1@gmail.com"')
                result = result.res;
                var response = {
                    "status": 200,
                    "message": message.user_created,
                };
                expect(result.status).to.equal(response.status);
                expect(result.message).to.equal(response.message);
                expect(result.data).to.not.equal(null);
                sql_con.query('Delete from vendor_user where email = "test1@gmail.com"')
                done();
            }
        };
        handler.vendorProfile.addUser(req, res);
    });

    it('Existing user in add user', function (done) {
        var res;
        req.headers = { authorization: token }
        req.body = {
            "name":"Test_user",
            "email":"test_user1@gmail.com",
            "password":"Password#105",
            "contact_number":"789456123",
            "profile_pic" :  "Null",
            "user_type" : "Sales"
        };

        res = {
            json: function (result) {
                result = result.res;
                var response = {
                    "status": 401,
                    "message": message.user_exists,
                };
                expect(result.status).to.equal(response.status);
                expect(result.message).to.equal(response.message);
                expect(result.data).to.equal(null);

                done();
            }
        };
        handler.vendorProfile.addUser(req, res);
    });

  //test cases for delete user
  it('No JWT token in delete user', function (done) {
    var res;
    req.headers = { authorization: 'bearer' }
    req.body = {
        "user_id": "6",
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
    handler.vendorProfile.userDelete(req, res);
});

it('Invalid JWT token in delete user', function (done) {
    var res;
    req.headers = { authorization: new_token }
    req.body = {
        "user_id": "6",
    };

    res = {
        json: function (result) {
            result = result.res;
            var response = {
                "status": 403,
                "message": message.invalid_token,
            };
            expect(result.status).to.equal(response.status);
            expect(result.message).to.equal(response.message);
            expect(result.data).to.equal(null);

            done();
        }
    };
    handler.vendorProfile.userDelete(req, res);
});
it('Invalid user_type in delete user', function (done) {
    var res;
    req.headers = { authorization: user_token }
    req.body = {
        "user_id": "6",
    };

    res = {
        json: function (result) {
            result = result.res;
            var response = {
                "status": 401,
                "message": message.invalid_user_type,
            };
            expect(result.status).to.equal(response.status);
            expect(result.message).to.equal(response.message);
            expect(result.data).to.equal(null);

            done();
        }
    };
    handler.vendorProfile.userDelete(req, res);
});

it('Invalid user in delete user', function (done) {
        var res;
        req.headers = { authorization: token }
        req.body = {
            "user_id": "15",
        };

        res = {
            json: function (result) {
                result = result.res;
                var response = {
                    "status": 401,
                    "message": message.data_not_present,
                };
                expect(result.status).to.equal(response.status);
                expect(result.message).to.equal(response.message);
                expect(result.data).to.equal(null);

                done();
            }
        };
        handler.vendorProfile.viewUser(req, res);
    });

    it('Valid user in delete user', function (done) {
        var res;
        req.headers = { authorization: token }
        req.body = {
            "user_id": "4",
        };

        res = {
            json: function (result) {
                result = result.res;
                var response = {
                    "status": 200,
                    "message": message.user_deleted,
                };
                expect(result.status).to.equal(response.status);
                expect(result.message).to.equal(response.message);
                expect(result.data).to.equal(null);

                done();
            }
        };
        handler.vendorProfile.userDelete(req, res);
    });
    //test cases for edit user

    it('No JWT token in edit user', function (done) {
        var res;
        req.headers = { authorization: 'bearer' }
        req.body = {
            "user_id": 2,
            "name":"Tester",
            "email":"test_user@gmail.com",
            "password":"Password#105",
            "contact_number":"789456123",
            "profile_pic" :  "Null",
            "user_type" : "Sales",
            "status":0
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
        handler.vendorProfile.editUser(req, res);
    });

    it('Invalid JWT token in edit user', function (done) {
        var res;
        req.headers = { authorization: new_token }
        req.body = {
            "user_id": 2,
            "name":"Tester",
            "email":"test_user@gmail.com",
            "password":"Password#105",
            "contact_number":"789456123",
            "profile_pic" :  "Null",
            "user_type" : "Sales",
            "status":0
        }
        res = {
            json: function (result) {
                result = result.res;
                var response = {
                    "status": 403,
                    "message": message.invalid_token,
                };
                expect(result.status).to.equal(response.status);
                expect(result.message).to.equal(response.message);
                expect(result.data).to.equal(null);

                done();
            }
        };
        handler.vendorProfile.editUser(req, res);
    });

    it('Invalid user_type in edit user', function (done) {
        var res;
        req.headers = { authorization: user_token }
        req.body = {
            "user_id": 2,
            "name":"Tester",
            "email":"test_user@gmail.com",
            "password":"Password#105",
            "contact_number":"789456123",
            "profile_pic" :  "Null",
            "user_type" : "Sales",
            "status":0
        };

        res = {
            json: function (result) {
                result = result.res;
                var response = {
                    "status": 401,
                    "message": message.invalid_user_type,
                };
                expect(result.status).to.equal(response.status);
                expect(result.message).to.equal(response.message);
                expect(result.data).to.equal(null);

                done();
            }
        };
        handler.vendorProfile.editUser(req, res);
    });
    it('Valid response in edit user', function (done) {
        var res;
        req.headers = { authorization: token }
        req.body = {
            "user_id": 5,
            "name":"Tester",
            "email":"test_user1@gmail.com",
            "password":"Password#105",
            "contact_number":"789456123",
            "profile_pic" :  "Null",
            "user_type" : "Sales",
            "status":0
        };

        res = {
            json: function (result) {
                result = result.res;
                var response = {
                    "status": 200,
                    "message": message.detail_updated,
                };
                expect(result.status).to.equal(response.status);
                expect(result.message).to.equal(response.message);
                expect(result.data).to.equal(null);

                done();
            }
        };
        handler.vendorProfile.editUser(req, res);
    });
    it('Invalid request in edit user', function (done) {
        var res;
        req.headers = { authorization: token }
        req.body = {
            "user_id": 22,
            "name":"Tester",
            "email":"test_user@gmail.com",
            "password":"Password#105",
            "contact_number":"789456123",
            "profile_pic" :  "Null",
            "user_type" : "Sales",
            "status":0
        };

        res = {
            json: function (result) {
                result = result.res;
                var response = {
                    "status": 401,
                    "message": message.invalid_user,
                };
                expect(result.status).to.equal(response.status);
                expect(result.message).to.equal(response.message);
                expect(result.data).to.equal(null);

                done();
            }
        };
        handler.vendorProfile.editUser(req, res);
    });

})