const {SecretManagerServiceClient} = require('@google-cloud/secret-manager');
let config = require('./config')
let mysql = require('mysql');
var fs = require('fs');
const client = new SecretManagerServiceClient();
var payload3,payload2,payload1;
async function createAndAccessSecret() {

   const certVersionname = 'projects/240998304781/secrets/ssl-key-dev-client-cert/versions/latest';
   const [certVersion] = await client.accessSecretVersion({
     name: certVersionname,
   });
   payload1 = certVersion.payload.data.toString('utf8');
 
   console.info(`Payload: ${payload1}`);

   const keyVersionname = 'projects/240998304781/secrets/ssl-key-dev-client-key/versions/latest';
   const [keyVersion] = await client.accessSecretVersion({
     name: keyVersionname,
   });
   payload2 = keyVersion.payload.data.toString('utf8');
 
   console.info(`Payload: ${payload2}`);
 
   const caVersionname = 'projects/240998304781/secrets/ssl-key-dev-client-key/versions/latest';
   const [caVersion] = await client.accessSecretVersion({
     name: caVersionname,
   });
   payload3 = caVersion.payload.data.toString('utf8');
 
   console.info(`Payload: ${payload3}`);
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
      ca: payload3,
      key: payload2,
      cert: payload1,
   },
   multipleStatements: true
});


module.exports = sql_conn;