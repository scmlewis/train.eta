# GitHub Pages Setup Guide

## Overview
This project is configured for automatic deployment to GitHub Pages using GitHub Actions.

## Initial Setup

### 1. Configure GitHub Pages in Repository Settings
1. Go to your GitHub repository
2. Navigate to **Settings** → **Pages**
3. Under "Build and deployment":
   - **Source**: Select "GitHub Actions" (recommended for this setup)
   - This will automatically use the workflow defined in `.github/workflows/deploy.yml`

### 2. Repository Visibility
- For public repositories: Pages will be automatically published
- For private repositories: Enable GitHub Pages in settings

## Environment Variables (Optional)

If you need to change the base URL for deployment:
- Set `VITE_BASE_URL` environment variable in your GitHub Actions workflow
- Default is `/Train_ETA/` (adjust if your repository name is different)
- Use `/` if deploying to a user/organization page

Example for user/org page:
```yaml
- name: Build
  run: npm run build
  env:
    VITE_BASE_URL: /
```

## Deployment Triggers

The workflow automatically deploys when:
- Code is pushed to `main` or `master` branch
- Pull requests are created (builds to verify, but doesn't deploy)

## Manual Deployment

To manually trigger deployment:
1. Go to **Actions** tab in GitHub
2. Select "Deploy to GitHub Pages" workflow
3. Click "Run workflow"
4. Select the branch and click "Run workflow"

## Accessing Your Site

After successful deployment:
- **Project Repository**: `https://username.github.io/Train_ETA`
- **User/Org Page**: `https://username.github.io` (if configured as such)

Check the environment URL at the workflow run for the exact link.

## Troubleshooting

### Build Fails
1. Check the workflow logs in **Actions** tab
2. Verify `npm run build` works locally
3. Check Node.js and dependency versions

### Site Not Updating
1. Verify the workflow ran successfully (green checkmark in Actions)
2. Clear browser cache (Ctrl+Shift+R or Cmd+Shift+R)
3. Check that deployment step completed without errors

### Base URL Issues
- If assets don't load, verify the `base` setting in `vite.config.ts`
- Ensure it matches your deployment location
