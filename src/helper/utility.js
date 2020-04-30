
let utility = function () { };

const CryptoJS = require("crypto-js");
const jwt = require('jsonwebtoken');
const { jwt_key, swagger_origin } = require('../config/config');
const config = require('../config/config');

// JWT verify Function
utility.prototype.jwtVerify = (token, callback) => {
    token = token.split(' ')[1];
    let result = jwt.verify(token, jwt_key, (err, result) => {
        if (!err) {
            return callback(null, result);
        } else {
            return callback(null, err);
        }
    });
};

//Verify Admin Function
utility.prototype.token_verify = (sql_con, token_key, callback) => {
    console.log(token_key);
    let random_string = token_key.split("|");
    let user_type = random_string[2];
    random_string = random_string[0];
    const result = sql_con.query('Select * from user_login where token=? and user_type=?', [random_string, user_type], function (err, result) {
        if (err) {
            return callback(err);
        } else {
            // add user role check
            return callback(null, result);
        }

    });
};

// Creating Response Function 
utility.prototype.response = (res, status, message, result, token) => {
    let response;

    if (token == null) {
        response = {
            status: status,
            message: message,
            data: result
        };
    } else {
        response = {
            status: status,
            message: message,
            data: result,
            authToken: token
        };
    }
    if (global.origin == swagger_origin || global.origin == undefined) {
        console.log(global.origin);
        console.log('swagger_origin in');
        return res.json({ 'res': response });
    } else {
        console.log('swagger_origin out');
        console.log(global.origin);
        response = CryptoJS.AES.encrypt(JSON.stringify(response), 'idc_test_key').toString();
        return res.json({ 'res': response });
    }
};

utility.prototype.decode = (req) => {
    if ((Object.keys(req.body).length != 0)) {
        // Decrypt
        var bytes = CryptoJS.AES.decrypt(req.body.data, 'idc_test_key');
         req.body = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
         console.log(req.body);
        return req;
    } else {
        return req;
    }
};

utility.prototype.encode = (req) => {
    if ((Object.keys(req.body).length != 0)) {
        if ( req.headers.origin == swagger_origin) {
            // means the request is coming from swagger and req.body only
            //Encrypt the req and send the encoded data in data
             req.body.data = CryptoJS.AES.encrypt(JSON.stringify(req.body), 'idc_test_key').toString();
            console.log(req.body);
            return req;
        } else {
            return req;
        }
    } else {
        return req;
    }
};

//Image Upload Function
utility.prototype.image_upload = (base64Image, file_name, callback) => {
    var stream = require('stream');
    var bufferStream = new stream.PassThrough();
    bufferStream.end(new Buffer(base64Image, 'base64'));

    const {Storage} = require('@google-cloud/storage');
    const storage = new Storage({
        projectId: config.project_id,
        keyFilename: './GCP_credentials.json'
    });

      var bucket = storage.bucket(config.bucket_name);
      var file = bucket.file(file_name);

     bufferStream.pipe(file.createWriteStream({
        metadata: {
            contentType: 'image/jpg',
            cacheControl : 'private, max-age=5',
        },
        public : false
    })) 
      .on("error", (err) =>
      {
        console.log("err : "+err);
        return callback(err, null);
      })
      .on('finish', () =>
      {
          var url = config.storage_destination +config.bucket_name+"/"+file_name;
          return callback(null, url);
      });
};

//Signed URL Function
utility.prototype.get_signedUrl = (file_name, callback) => {
    console.log("file_name", file_name);
    const bucketName = config.bucket_name;
    const {Storage} = require('@google-cloud/storage');
    const storage = new Storage({
        projectId: config.project_id,
        keyFilename: './GCP_credentials.json'
    });

    // These options will allow temporary read access to the file
    const options = {
        action: 'read',
        expires: Date.now() + 1000 * 60 * 60 // one hour
    };

    // Get a signed URL for the file
    
    storage
        .bucket(bucketName)
        .file(file_name)
        .getSignedUrl(options)
        .then(results => {
        console.log(JSON.stringify(results));
        return callback(null, results[0]);
    })
    .catch(err => {
        console.error('ERROR:', err);
        return callback(err);
    });
}


//Create Email Template
utility.prototype.create_html_template = (content) =>{
    var date = new Date();
    var year = date.getFullYear();
    var email_template = '<head>'+
            '<style>'+
                'table table tr td, table table tr th{'+
                    'padding: 8px 20px;'+
                '}'+
            '</style>'+
        '</head>'+
    "<table width='100%' cellpadding='0' cellspacing='0' style='border: 1px solid #000000;'> " +
        "<tr> " +
        "<td colspan='5' bgcolor='#fff'><br>" +
        "<img src='' style='height: 45px;width: 120px;margin-left:12px;margin-bottom: 12px;'><br/>" +
        "</td> " +
        "</tr> " +
        "<tr>" +
        "<td colspan='3' style='padding-left:10px'>" +
        "<br><br>Greetings, " +
        "<br><br> Here is your temporary password <b>"+content +"</b>."+
        "<br><br>"+
        "<br><br><b>Regards,</b><br><b>IDC Support</b>" +
        "<br><br> " +
        "</td> " +
        "<td> </td>" +
        "</tr>" +
        "<tr>" +
        "<td colspan='5' bgcolor='#1B335F'>" +
        "<br><center><span style='color:#ffffff;'>MADCHEF ©"+year+"</span><br></center><br/>" +
        "</td>" +
        "</tr>" +
        "</table>";

    return email_template;
};



var utility_obj = new utility();

module.exports = { utility_obj };