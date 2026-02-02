# Deployment Guide

## 🚀 Deploy to Vercel (Recommended)

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
