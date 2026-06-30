import { defineBackend } from '@aws-amplify/backend'
import { FunctionUrlAuthType, HttpMethod } from 'aws-cdk-lib/aws-lambda'
import { chat } from './functions/chat/resource'

const backend = defineBackend({ chat })

// Give the relay a public HTTPS endpoint. There's no IAM auth — the Lambda
// itself holds the secret; the browser only ever sees this URL. CORS is open
// so the static frontend (served from the Amplify domain) can call it.
const chatUrl = backend.chat.resources.lambda.addFunctionUrl({
  authType: FunctionUrlAuthType.NONE,
  cors: {
    allowedOrigins: ['*'],
    allowedMethods: [HttpMethod.GET, HttpMethod.POST],
    allowedHeaders: ['content-type'],
  },
})

// Publish the URL into amplify_outputs.json so the frontend build (which runs
// AFTER the backend deploys) can read it — see amplify.yml.
backend.addOutput({
  custom: { chatApiUrl: chatUrl.url },
})