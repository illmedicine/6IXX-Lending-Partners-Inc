# Setup & Deployment Script for GitHub Pages

## ⚠️ UNC Path Issue

If you're getting UNC path errors, you need to map the network drive or run from a local path.

### Quick Fix:

1. **Map the network drive** (if on Windows network share):
   ```powershell
   net use Z: \\illmedicine-wb\Users\demar /persistent:yes
   cd Z:\Documents\GitHub\6IXX-Lending-Partners-Inc
   ```

2. **Or copy to local drive**:
   ```powershell
   xcopy "\\illmedicine-wb\Users\demar\Documents\GitHub\6IXX-Lending-Partners-Inc" "C:\6IXX-Lending" /E /I
   cd C:\6IXX-Lending
   ```

### After fixing path:

```bash
# Install dependencies
npm install

# Create .env file
cp .env.example .env
# Edit .env with your Firebase credentials

# Test locally
npm run dev

# Build for production
npm run build

# Deploy to GitHub Pages
npm run deploy
```

## Alternative: Deploy from GitHub Actions

If local deployment continues to fail, set up GitHub Actions to deploy automatically:

1. Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        
    - name: Install dependencies
      run: npm install
      
    - name: Build
      env:
        VITE_FIREBASE_API_KEY: ${{ secrets.VITE_FIREBASE_API_KEY }}
        VITE_FIREBASE_AUTH_DOMAIN: ${{ secrets.VITE_FIREBASE_AUTH_DOMAIN }}
        VITE_FIREBASE_PROJECT_ID: ${{ secrets.VITE_FIREBASE_PROJECT_ID }}
        VITE_FIREBASE_STORAGE_BUCKET: ${{ secrets.VITE_FIREBASE_STORAGE_BUCKET }}
        VITE_FIREBASE_MESSAGING_SENDER_ID: ${{ secrets.VITE_FIREBASE_MESSAGING_SENDER_ID }}
        VITE_FIREBASE_APP_ID: ${{ secrets.VITE_FIREBASE_APP_ID }}
      run: npm run build
      
    - name: Deploy to GitHub Pages
      uses: peaceiris/actions-gh-pages@v3
      with:
        github_token: ${{ secrets.GITHUB_TOKEN }}
        publish_dir: ./dist
```

2. Add secrets in GitHub:
   - Go to repository Settings → Secrets and variables → Actions
   - Add each Firebase environment variable as a secret

3. Push to main branch - deployment happens automatically!

## Manual Deploy (Without npm)

If npm continues to fail:

1. **Build locally on a working machine**
2. **Copy `dist` folder**
3. **Push `dist` contents to `gh-pages` branch manually**:

```bash
cd dist
git init
git add .
git commit -m "Deploy to GitHub Pages"
git remote add origin https://github.com/illmedicine/6IXX-Lending-Partners-Inc.git
git push -f origin main:gh-pages
```

## Success Checklist

- [ ] Firebase project created
- [ ] `.env` file configured
- [ ] `npm install` successful
- [ ] `npm run dev` works locally
- [ ] `npm run build` creates `dist` folder
- [ ] `npm run deploy` pushes to GitHub Pages
- [ ] App accessible at: `https://illmedicine.github.io/6IXX-Lending-Partners-Inc/`

## Support

If issues persist, try:
1. Use a local directory (not network share)
2. Use GitHub Actions for deployment
3. Build on another machine and copy dist folder
