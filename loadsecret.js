import { SecretManagerServiceClient } from "@google-cloud/secret-manager";
import { GoogleAuth } from "google-auth-library";
import { existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

const __dirname = dirname(fileURLToPath(import.meta.url));
const keyFilePath = join(__dirname, "gsm.json");
const isLocal = existsSync(keyFilePath);

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

export async function loadEnvFromSecret(secretName) {
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