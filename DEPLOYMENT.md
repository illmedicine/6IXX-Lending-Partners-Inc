# Deployment Guide - GitHub Pages

## 🚀 Deploy to GitHub Pages (Static Hosting)

This application is now configured to deploy to GitHub Pages as a static React app.

### Prerequisites:
- GitHub repository set up
- Firebase project configured
- Node.js 18+ installed

### Step-by-Step Deployment:

#### 1. **Set Up Environment Variables**

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Fill in your Firebase credentials:

```env
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

#### 2. **Install Dependencies**

```bash
npm install
```

#### 3. **Test Locally**

```bash
npm run dev
```

Visit http://localhost:5173 to test the app.

#### 4. **Deploy to GitHub Pages**

```bash
npm run deploy
```

This command will:
- Build the production bundle
- Deploy to GitHub Pages automatically
- Your app will be live at: `https://[username].github.io/6IXX-Lending-Partners-Inc/`

#### 5. **Configure GitHub Pages**

1. Go to your repository on GitHub
2. Settings → Pages
3. Source should be set to: `gh-pages` branch
4. Wait a few minutes for deployment

#### 6. **Update Firebase Authorized Domains**

1. Go to Firebase Console → Authentication → Settings
2. Add your GitHub Pages domain:
   - `[username].github.io`
3. Save changes

### 🔧 Firebase Cloud Functions (For SMS Notifications)

To enable SMS notifications to the lender:

#### 1. **Initialize Firebase Functions**

```bash
cd functions
npm install
cd ..
firebase init functions
```

#### 2. **Configure Environment Variables**

```bash
firebase functions:config:set \
  google.calendar_id="your_calendar_id" \
  google.service_email="service@project.iam.gserviceaccount.com" \
  google.private_key="-----BEGIN PRIVATE KEY-----..." \
  twilio.account_sid="your_twilio_sid" \
  twilio.auth_token="your_twilio_token" \
  twilio.phone_number="+1234567890" \
  lender.phone_number="+17245587342"
```

#### 3. **Deploy Functions**

```bash
firebase deploy --only functions
```

---

## 🌐 Alternative: Deploy to Netlify

If you prefer Netlify over GitHub Pages:

1. **Connect Repository**
   - Go to https://netlify.com
   - Click "New site from Git"
   - Select your repository

2. **Configure Build Settings**
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Add environment variables from `.env`

3. **Deploy**
   - Click "Deploy site"
   - Get your URL: `your-app.netlify.app`

---

## 📱 Post-Deployment Checklist

- [ ] App loads at GitHub Pages URL
- [ ] Google sign-in works
- [ ] Can create loan requests
- [ ] Can view dashboards (borrower/lender)
- [ ] Messaging system works
- [ ] Collateral submission works
- [ ] Firebase authorized domain added
- [ ] Cloud Functions deployed (optional)

---

## 🐛 Troubleshooting

### "Blank page after deployment"
- Check browser console for errors
- Verify `base` path in `vite.config.ts` matches your repo name
- Ensure all environment variables are set

### "Firebase auth not working"
- Add GitHub Pages domain to Firebase authorized domains
- Check that environment variables are correct
- Verify Firebase project is active

### "404 errors on page refresh"
- GitHub Pages doesn't support client-side routing perfectly
- Use hash router or configure 404.html redirect

---

## 🔄 Update Deployment

To update your deployed app:

```bash
# Make changes to your code
git add .
git commit -m "Your changes"
git push origin main

# Redeploy to GitHub Pages
npm run deploy
```

---

## 📊 Monitoring

- **GitHub Pages Status**: Check repo Settings → Pages
- **Firebase Console**: Monitor authentication and database
- **Browser DevTools**: Check for console errors

---

Your app is now live on GitHub Pages! 🎉

Vercel is the easiest way to deploy Next.js apps and it's made by the Next.js team.

### Steps:

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit - 6IXX Lending Platform"
   git push origin main
   ```

2. **Deploy to Vercel**
   - Go to https://vercel.com
   - Click "New Project"
   - Import your GitHub repository
   - Add environment variables (copy from your `.env`)
   - Click "Deploy"

3. **Add Environment Variables in Vercel**
   - Go to Project Settings → Environment Variables
   - Add all variables from `.env`:
     - `NEXT_PUBLIC_FIREBASE_API_KEY`
     - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
     - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
     - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
     - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
     - `NEXT_PUBLIC_FIREBASE_APP_ID`
     - `GOOGLE_CALENDAR_ID`
     - `GOOGLE_SERVICE_ACCOUNT_EMAIL`
     - `GOOGLE_PRIVATE_KEY`
     - `LENDER_PHONE_NUMBER`
     - `NEXT_PUBLIC_APP_URL` (use your Vercel URL)

4. **Update Firebase Authorized Domains**
   - Go to Firebase Console → Authentication → Settings
   - Add your Vercel domain (e.g., `your-app.vercel.app`)

5. **Test Your Deployment**
   - Visit your Vercel URL
   - Test Google sign-in
   - Create a test loan request
   - Verify everything works

---

## 🔥 Deploy to Firebase Hosting (Alternative)

### Prerequisites:
```bash
npm install -g firebase-tools
firebase login
```

### Steps:

1. **Initialize Firebase Hosting**
   ```bash
   firebase init hosting
   ```
   - Select your Firebase project
   - Set public directory to `out`
   - Configure as single-page app: Yes
   - Don't overwrite existing files

2. **Update package.json scripts**
   Add this to your `scripts`:
   ```json
   "export": "next build && next export",
   "deploy": "npm run export && firebase deploy --only hosting"
   ```

3. **Build and Deploy**
   ```bash
   npm run deploy
   ```

4. **Configure Functions for API Routes** (if needed)
   Since Firebase Hosting doesn't support Next.js API routes directly, you'll need to:
   - Convert API routes to Firebase Cloud Functions
   - Or use Vercel instead (recommended)

---

## 🐳 Deploy with Docker (Advanced)

### Create Dockerfile:
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

### Create .dockerignore:
```
node_modules
.next
.git
.env
```

### Build and Run:
```bash
docker build -t 6ixx-lending .
docker run -p 3000:3000 --env-file .env 6ixx-lending
```

### Deploy to Cloud Platform:
- Google Cloud Run
- AWS ECS
- Azure Container Instances
- DigitalOcean App Platform

---

## 📱 Production Checklist

Before going live, make sure:

### Security
- [ ] All environment variables are set correctly
- [ ] Firebase security rules are applied
- [ ] HTTPS is enabled
- [ ] Authentication is working
- [ ] API endpoints are secured

### Performance
- [ ] Production build runs without errors
- [ ] Page load times are acceptable
- [ ] Mobile performance is optimized
- [ ] Images are optimized
- [ ] Caching is configured

### Features
- [ ] All loan packages work correctly
- [ ] Interest calculations are accurate
- [ ] Messaging system functions
- [ ] Email/SMS notifications work
- [ ] Collateral submission works
- [ ] Dashboard displays correct data

### Monitoring
- [ ] Set up error tracking (Sentry, LogRocket)
- [ ] Configure analytics (Google Analytics)
- [ ] Set up uptime monitoring
- [ ] Configure alerts for critical errors

---

## 🔒 Firestore Production Rules

**IMPORTANT**: Before going live, update your Firestore rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper function to check if user is authenticated
    function isAuthenticated() {
      return request.auth != null;
    }
    
    // Helper function to get user data
    function getUserData() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data;
    }
    
    // Users collection
    match /users/{userId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated() && request.auth.uid == request.resource.data.uid;
      allow update: if isAuthenticated() && request.auth.uid == resource.data.uid;
      allow delete: if false; // Prevent deletion
    }
    
    // Loans collection
    match /loans/{loanId} {
      allow read: if isAuthenticated() && (
        request.auth.uid == resource.data.borrowerId ||
        getUserData().role == 'lender'
      );
      
      allow create: if isAuthenticated() && 
        request.resource.data.borrowerId == request.auth.uid;
      
      allow update: if isAuthenticated() && (
        request.auth.uid == resource.data.borrowerId ||
        getUserData().role == 'lender'
      );
      
      allow delete: if false; // Prevent deletion
    }
    
    // Messages collection
    match /messages/{messageId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated() && 
        request.resource.data.senderId == request.auth.uid;
      allow update: if isAuthenticated() && 
        request.auth.uid == resource.data.senderId;
      allow delete: if false; // Prevent deletion
    }
  }
}
```

Apply these rules in Firebase Console → Firestore Database → Rules

---

## 🌐 Custom Domain Setup

### For Vercel:
1. Go to Project Settings → Domains
2. Add your custom domain
3. Update DNS records as shown
4. Wait for SSL certificate

### For Firebase:
1. Go to Hosting → Add custom domain
2. Follow the verification steps
3. Update DNS records
4. Wait for SSL provisioning

---

## 📊 Post-Deployment Monitoring

### What to Monitor:
- User sign-ups and logins
- Loan request volume
- Error rates
- Page load times
- API response times
- Database queries

### Tools:
- **Vercel Analytics** (built-in)
- **Firebase Performance Monitoring**
- **Google Analytics** for user tracking
- **Sentry** for error tracking
- **LogRocket** for session replay

---

## 🆘 Troubleshooting

### "Authentication Error"
- Verify domain is added to Firebase authorized domains
- Check environment variables are set correctly

### "Database Permission Denied"
- Apply production Firestore rules
- Verify user authentication is working

### "API Route Not Working"
- Vercel: Should work automatically
- Firebase Hosting: Requires Cloud Functions

### "Environment Variables Not Loading"
- Restart your build after adding variables
- Verify variable names match exactly
- Check for typos in `.env`

---

## 📞 Support

For deployment issues:
- Check Vercel documentation: https://vercel.com/docs
- Firebase Hosting docs: https://firebase.google.com/docs/hosting
- Next.js deployment guide: https://nextjs.org/docs/deployment

---

**Ready to deploy?** Start with Vercel for the easiest experience! 🚀
