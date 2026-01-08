import { defineConfig } from '@hey-api/openapi-ts';

export default defineConfig({
  input: 'http://localhost:3000/docs/openapi.json',
  output: 'src/utils/generatedApi',
  plugins: [{ name: '@hey-api/client-axios' }],
});
