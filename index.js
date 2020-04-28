const express = require('express');
const app = express();
const { google } = require('googleapis');
const {SecretManagerServiceClient} = require('@google-cloud/secret-manager');
const client = new SecretManagerServiceClient();
const name = getSecretName('projects/626923387764/secrets/testcred');

const auth = new google.auth.GoogleAuth({});


const SECRET_KEYS = {
  ENV: `secrets/test-env/versions/latest`
}
// projects/240998304781/secrets/sa-key-dev/versions/1
// Promise to get current projectID from with the server
const getProjectIdPromise = new Promise(async function (resolve) {
  try {
    const projectId = await auth.getProjectId();
    return resolve(projectId);
  } catch (e) {
    console.log(e);
    process.exit(1);
  }
});

// Async method to get the full key identifier
async function getSecretName(keySuffix) {
  const projectId = await getProjectIdPromise();

  return `projects/${projectId}/${keySuffix}`
}

// Method to extract the secret
// You can run this in build, deployment or run time! (Anytime!)
exports.getEnvAsync = async function() {
  const name = await getSecretName(SECRET_KEYS.ENV);
  const [secret] = await client.accessSecretVersion({ name });
   console.log("requestforname",name);
  const payload = secret.payload.data.toString('utf8');
	console.log(payload);
  return payload
}


app.get('/', (req, res) => {
  console.log('Hello world newreceived a request.');
  var test = getEnvAsync();
  console.log(test);
  const target = process.env.TARGET || 'World test1';
   console.log()
  res.send(`Hello dstestwew}!`);
});

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log('Hello world lidsdsstening on port', port);
});
