const { SecretManagerServiceClient } = require("@google-cloud/secret-manager");
const { GoogleAuth } = require("google-auth-library");
const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");

const keyFilePath = path.join(__dirname, "gsm.json");
const isLocal = fs.existsSync(keyFilePath);

const client = isLocal
  ? new SecretManagerServiceClient({ keyFilename: keyFilePath })
  : new SecretManagerServiceClient(); 

async function getProjectId() {
  if (isLocal) {
    const auth = new GoogleAuth({ keyFilename: keyFilePath });
    return auth.getProjectId();
  }

  const auth = new GoogleAuth();
  return auth.getProjectId();
}

async function loadEnvFromSecret(secretName) {
  const projectId = await getProjectId();
  const name = `projects/${projectId}/secrets/${secretName}/versions/latest`;

  const [version] = await client.accessSecretVersion({ name });
  const envContent = version.payload.data.toString("utf8");

  const parsedEnv = dotenv.parse(envContent);
  for (const key in parsedEnv) {
    process.env[key] = parsedEnv[key];
  }

  console.log(`Loaded ${Object.keys(parsedEnv).length} env vars`);
}

module.exports = { loadEnvFromSecret };