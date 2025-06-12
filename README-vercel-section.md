## Deploying to Vercel

This API is set up to work seamlessly with Vercel's serverless platform. Follow these steps to deploy:

### Prerequisites

- Install Vercel CLI: `npm install -g vercel`
- Make sure you're logged in: `vercel login`

### Quick Deployment

1. **Set up environment variables**:
   ```bash
   ./scripts/setup-vercel-env.sh
   ```

2. **Deploy to Vercel**:
   ```bash
   # For preview deployment:
   ./scripts/deploy-vercel.sh
   
   # For production deployment:
   ./scripts/deploy-vercel.sh production
   ```

3. **Verify your deployment**:
   - Test the health endpoint: `https://<your-vercel-url>/health`
   - Check detailed diagnostics: `https://<your-vercel-url>/diagnostics`

### Troubleshooting Vercel Deployments

If your deployment is experiencing issues:

1. **Check your MongoDB connection**:
   - Ensure your MongoDB URL is correctly set in the Vercel environment variables
   - Make sure your MongoDB instance allows connections from Vercel's IP ranges
   - Verify that you're not hitting connection limits on your MongoDB plan

2. **Check API logs**:
   - Go to the Vercel dashboard
   - Select your project
   - Navigate to "Deployments" > [Select deployment] > "Functions logs"

3. **Run diagnostic endpoints**:
   - `/health` for a quick status check
   - `/diagnostics` for detailed system information

4. **Common Issues**:
   - **500 FUNCTION_INVOCATION_FAILED**: Could be due to MongoDB connection issues, missing environment variables, or exceeding function execution limits
   - **Timeout errors**: Consider increasing function duration limit in vercel.json
   - **Memory errors**: Consider increasing memory allocation in vercel.json

### Understanding the Serverless Architecture

This API is designed to work in both traditional server and serverless environments:

- In serverless mode, WebSockets are disabled
- Function execution is limited to 10 seconds by default
- MongoDB connections are optimized for a serverless environment
- File system operations use the `/tmp` directory in Vercel

For more information, see [Vercel Serverless Functions documentation](https://vercel.com/docs/concepts/functions/serverless-functions).
