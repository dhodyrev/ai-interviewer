import AWS from 'aws-sdk';

const secretsManager = new AWS.SecretsManager({
  region: process.env.AWS_REGION
});

interface Secrets {
  dbCredentials?: {
    username: string;
    password: string;
  };
  jwtSecret?: {
    secret: string;
  };
  openaiApiKey?: {
    key: string;
  };
  emailCredentials?: {
    smtp_host: string;
    smtp_port: string;
    smtp_user: string;
    smtp_password: string;
  };
  redisCredentials?: {
    host: string;
    port: string;
    password: string;
  };
}

let cachedSecrets: Secrets = {};

export async function getSecret(secretName: string): Promise<any> {
  try {
    // Check if secret is already cached
    if (cachedSecrets[secretName as keyof Secrets]) {
      return cachedSecrets[secretName as keyof Secrets];
    }

    const data = await secretsManager.getSecretValue({
      SecretId: `ai-interviewer/${secretName}`
    }).promise();

    if (!data.SecretString) {
      throw new Error(`Secret ${secretName} not found`);
    }

    const secret = JSON.parse(data.SecretString);
    cachedSecrets[secretName as keyof Secrets] = secret;
    return secret;
  } catch (error) {
    console.error(`Error retrieving secret ${secretName}:`, error);
    throw error;
  }
}

export async function getDatabaseCredentials() {
  return getSecret('db-credentials');
}

export async function getJwtSecret() {
  return getSecret('jwt-secret');
}

export async function getOpenAIApiKey() {
  return getSecret('openai-api-key');
}

export async function getEmailCredentials() {
  return getSecret('email-credentials');
}

export async function getRedisCredentials() {
  return getSecret('redis-credentials');
} 