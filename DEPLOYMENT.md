# DEPLOYMENT

## Deployment Overview

This project is configured for automatic and manual deployment using Vercel. Currently,
that is the only supported platform.

### Automatic Deployment

This project is configured for automatic deployment using GitHub Actions to Vercel.
The automatic deployment follows the following channels.

- **`main` branch**: A push to the `main` branch will trigger a deployment to the production domain on Vercel.
- **`next` branch**: A push to the `next` branch will trigger a deployment to a `next` subdomain for testing upcoming changes.
- **Other branches**: Any other push triggers a Vercel preview deployment.

### Deployment Workflow

1. **Push to `next` branch** OR **Pull Request against `next` branch**:

   - Automatic deployment to `next` subdomain.
   - Used for testing new features before production release.

2. **Push to `main` branch**:

   - Automatic deployment to the production domain.

3. **Push to other branches**:
   - Triggers preview deployments with Vercel-provided unique URLs for testing isolated features.

---

## Manual Deployment Setup

Follow these steps to set up manual deployment using the Vercel CLI:

### Prerequisites

- Install Node.js (>= 22.x).
- Install the Vercel CLI:

  ```bash
  pnpm install -g vercel
  ```

### Step-by-Step Guide

#### 1. Create a Vercel Project

1. Login to Vercel:

   ```bash
   vercel login
   ```

2. Link your project to Vercel:

   ```bash
   vercel link
   ```

   Follow the prompts to select or create a new project.

#### 2. Build the Project Locally

1. Clone the repository

   ```bash
   git clone  https://github.com/Imamiland/banned_books_jeopardy.git
   cd banned_books_jeopardy
   ```

2. Install dependencies using PNPM:

   ```bash
   pnpm install
   ```

3. Build the project:

   ```bash
   pnpm build
   ```

   Ensure the build output is valid and error-free.

#### 3. Deploy the Project

##### For a Preview Deployment

1. Deploy to a unique preview URL:

   ```bash
   vercel deploy --prebuilt
   ```

   Vercel will use the locally built output to deploy.

##### For a Production Deployment

1. Deploy to the production domain:

   ```bash
   vercel deploy --prebuilt --prod
   ```

   This deploys the project as the live production version.

---

## Verifying Deployment

- **Preview Deployments**: Check the deployment at the Vercel-provided URL.
- **Production Deployments**: Verify the production domain reflects the latest changes.

### Notes

- Ensure the `vercel.json` file is correctly configured for automatic branch-based deployments.
- Use `vercel env` to manage environment variables for specific deployment environments if required.
