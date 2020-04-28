const express = require('express');
const app = express();
const { google } = require('googleapis');
const {SecretManagerServiceClient} = require('@google-cloud/secret-manager');
// const {GoogleAuth} = require('google-auth-library')
const client = new SecretManagerServiceClient();

// async function getProjectId(){
//   const auth = new GoogleAuth({
//     scopes: 'https://www.googleapis.com/auth/cloud-platform',
//   })

//   const projectId = await auth.getProjectId().catch(()=>{
//     return projectId
//   })
  
// }


// client.accessSecretVersion('projects/626923387764/secrets/testcred/versions/1')
// .then(data=>{
//     console.log(data)
// })

// exports.secrets ={}

// exports.load = async () => {
//   const [data] = await client.accessSecretVersion({ name: 'projects/626923387764/secrets/testcred/versions/latest'})
//   const secret = data.payload.data.toString()
//   console.log(secret)
//   module.exports.secrets ['testcred']
// }






// const client = new SecretManagerServiceClient();
// const name = getSecretName('projects/626923387764/secrets/testcred');

// const auth = new google.auth.GoogleAuth({});


// const SECRET_KEYS = {
//   ENV: `secrets/test-env/versions/latest`
// }
// projects/240998304781/secrets/sa-key-dev/versions/1
// Promise to get current projectID from with the server
// const getProjectIdPromise = new Promise(async function (resolve) {
//   try {
//     const projectId = await auth.getProjectId();
//     return resolve(projectId);
//   } catch (e) {
//     console.log(e);
//     process.exit(1);
//   }
// });

// Async method to get the full key identifier
// async function getSecretName(keySuffix) {
//   const projectId = await getProjectIdPromise();

//   return `projects/${projectId}/${keySuffix}`
// }

// Method to extract the secret
// You can run this in build, deployment or run time! (Anytime!)
// exports.getEnvAsync = async function() {
//   const name = await getSecretName(SECRET_KEYS.ENV);
//   const [secret] = await client.accessSecretVersion({ name });
//    console.log("requestforname",name);
//   const payload = secret.payload.data.toString('utf8');
// 	console.log(payload);
//   return payload
// }


app.get('/', (req, res) => {


/**
 * TODO(developer): Uncomment these variables before running the sample.
 */
// parent = 'projects/my-project', // Project for which to manage secrets.
// secretId = 'foo', // Secret ID.
// payload = 'hello world!' // String source data.

async function createAndAccessSecret() {
  // Create the secret with automation replication.
  // const [secret] = await client.createSecret({
  //   parent: parent,
  //   secret: {
  //     name: secretId,
  //     replication: {
  //       automatic: {},
  //     },
  //   },
  //   secretId,
  // });

  // console.info(`Created secret ${secret.name}`);

  // Add a version with a payload onto the secret.
  // const [version] = await client.addSecretVersion({
  //   parent: secret.name,
  //   payload: {
  //     data: Buffer.from(payload, 'utf8'),
  //   },
  // });

  // console.info(`Added secret version ${version.name}`);

  // Access the secret.
  const [accessResponse] = await client.accessSecretVersion({
    name: 'projects/626923387764/secrets/testcred/versions/1',
  });

  const responsePayload = accessResponse.payload.data.toString('utf8');
  console.info(`Payload: ${responsePayload}`);
}
createAndAccessSecret();





  console.log('Hello world newreceived a request.');
  
  const target = process.env.TARGET || 'World test1';
   console.log()
  res.send(`Hello dstestwew}!`);
});

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log('Hello world lidsdsstening on port', port);
});
