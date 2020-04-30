const {SecretManagerServiceClient} = require('@google-cloud/secret-manager');
let config = require('./config')
let mysql = require('mysql');
var fs = require('fs');
const client = new SecretManagerServiceClient();
async function createAndAccessSecret() {

   const version_ca = 'projects/240998304781/secrets/madchef-ca/versions/latest';
   const version_cert = 'projects/240998304781/secrets/madchef-cert/versions/latest';
   const version_key = 'projects/240998304781/secrets/madchef-key/versions/latest';
   const [version] = await client.accessSecretVersion({
     name: version_ca,
   });
   const payload1 = version.payload.data.toString('utf8');
 
   console.info(`Payload: ${payload1}`);

   const [version1] = await client.accessSecretVersion({
      name: version_cert,
    });

    const payload2 = version1.payload.data.toString('utf8');
    console.info(`Payload2: ${payload2}`);

    const [version2] = await client.accessSecretVersion({
      name: version_key,
    });

    const payload3 = version2.payload.data.toString('utf8');
    console.info(`Payload3: ${payload3}`);
 
 }
 createAndAccessSecret();
var sql_conn = mysql.createPool({
   connectionLimit: 10, //important
   host: config.dbhost,
   user: config.dbusername,
   password: config.dbpassword,
   database: config.dbname,
   ssl:
   {
      ca: payload1,
      key: payload3,
      cert: payload2,
   },
   multipleStatements: true
});


module.exports = sql_conn;