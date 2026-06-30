import { defineFunction, secret } from '@aws-amplify/backend'

// The deployed twin of server/index.js. The OpenAI key is injected as a
// SECRET (set once in the Amplify console / sandbox, never committed and
// never bundled into the browser), so it only ever lives inside this Lambda.
export const chat = defineFunction({
  name: 'chat',
  entry: './handler.ts',
  timeoutSeconds: 30,
  environment: {
    OPENAI_API_KEY: secret('OPENAI_API_KEY'),
    OPENAI_MODEL: 'gpt-4o-mini',
  },
})