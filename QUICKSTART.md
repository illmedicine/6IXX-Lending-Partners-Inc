# Quick Start Guide - GitHub Pages Deployment

## 🚀 Deploy to GitHub Pages in 5 Steps

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Set Up Firebase

1. Visit https://console.firebase.google.com/
2. Create a new project named "6ixx-lending"
3. Click "Add app" → Web app (</>) 
4. Copy the Firebase configuration

### Step 3: Configure Environment

Create `.env` file in the root:

```bash
cp .env.example .env
```

Edit `.env` and add your Firebase config:
```env
VITE_FIREBASE_API_KEY=your_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_domain_here
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_bucket_here
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### Step 4: Enable Firebase Services

1. **Authentication**:
   - Firebase Console → Authentication → Get Started
   - Enable "Google" sign-in method
   - Add `[username].github.io` to authorized domains

2. **Firestore Database**:
   - Firebase Console → Firestore Database
   - Create database in "Test mode"
   - Choose a location

### Step 5: Deploy!

```bash
npm run deploy
```

🎉 Your app is live at: `https://[username].github.io/6IXX-Lending-Partners-Inc/`

## 📱 Test Locally First

Before deploying:

```bash
npm run dev
```

Visit http://localhost:5173 and test:
- ✅ Google sign-in works
- ✅ Can create loan requests
- ✅ Dashboards load
- ✅ Messaging works

## 🔧 Enable GitHub Pages

1. Go to your repo on GitHub
2. Settings → Pages
3. Source: `gh-pages` branch
4. Save

## 📧 Optional: SMS Notifications

To enable SMS to lender (17245587342):

1. Set up Firebase Cloud Functions:
   ```bash
   cd functions
   npm install
   firebase init functions
   ```

2. Deploy functions:
   ```bash
   firebase deploy --only functions
   ```

See `functions/README.md` for details.

## 🐛 Troubleshooting

### Build Errors
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Firebase Not Loading
- Check `.env` file exists and has correct values
- Restart dev server after changing `.env`

### Deploy Fails
```bash
npm install -g gh-pages
npm run deploy
```

## 🎨 Customization

### Change Loan Amounts/Rates
Edit `src/types/index.ts` → `LOAN_PACKAGES`

### Change Colors
Edit `tailwind.config.js` → `theme.extend.colors`

### Change Lender Phone
Edit `functions/src/index.ts` → `lenderPhone` default

---

**Next**: See [README.md](README.md) for full documentation!
```bash
npm install
```

### Step 2: Set Up Firebase

1. Visit https://console.firebase.google.com/
2. Create a new project named "6ixx-lending"
3. Click "Add app" → Web app (</>) 
4. Copy the Firebase configuration

### Step 3: Configure Environment

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and add your Firebase config:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_key_here
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain_here
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket_here
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   ```

### Step 4: Enable Firebase Services

1. **Authentication**:
   - In Firebase Console → Authentication
   - Click "Get Started"
   - Enable "Google" sign-in method
   - Add your domain to authorized domains

2. **Firestore Database**:
   - In Firebase Console → Firestore Database
   - Click "Create database"
   - Start in "Test mode" for development
   - Choose a location close to your users

### Step 5: Run the App
```bash
npm run dev
```

Open http://localhost:3000 🎉

## 📱 Testing the App

### Test as Borrower:
1. Sign in with Google
2. Select "Borrower" role
3. Request a loan (e.g., $500)
4. Enter your phone number
5. Submit the request

### Test as Lender:
1. Sign out and sign in again with a different Google account
2. Select "Lender" role
3. View the loan request
4. Approve/reject or request collateral
5. Try the messaging feature

## 🔧 Optional: Google Calendar SMS Setup

For SMS notifications to work:

1. Go to https://console.cloud.google.com/
2. Create a service account
3. Download the JSON key
4. Add credentials to `.env`:
   ```env
   GOOGLE_CALENDAR_ID=your_calendar_id
   GOOGLE_SERVICE_ACCOUNT_EMAIL=account@project.iam.gserviceaccount.com
   GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nkey\n-----END PRIVATE KEY-----\n"
   LENDER_PHONE_NUMBER=17245587342
   ```

**Note**: SMS through Google Calendar requires proper setup and may have limitations. Consider using Twilio for production.

## 📝 Firestore Collections Structure

The app will automatically create these collections:

- **users**: User profiles with roles (borrower/lender)
- **loans**: Loan requests and their status
- **messages**: Messages between borrowers and lenders

## 🐛 Troubleshooting

### "Firebase not initialized"
- Make sure `.env` has all Firebase credentials
- Restart the dev server after changing `.env`

### "Authentication error"
- Check that Google sign-in is enabled in Firebase Console
- Verify your domain is in the authorized domains list

### "Database permission denied"
- Set Firestore to "Test mode" during development
- Apply the security rules from README.md for production

## 📚 Next Steps

1. ✅ Test the app locally
2. 📧 Set up proper email notifications
3. 📱 Configure SMS with Twilio
4. 🔒 Add Firestore security rules
5. 🚀 Deploy to Vercel/Firebase Hosting

## 🎨 Customization

### Change Loan Packages
Edit `types/index.ts` → `LOAN_PACKAGES` array

### Modify Interest Rates
Adjust the `interestRate` values in `LOAN_PACKAGES`

### Add More Collateral Options
Update `COLLATERAL_OPTIONS` in `types/index.ts`

### Change Colors
Edit `tailwind.config.js` → `theme.extend.colors`

---

Need help? Check the main README.md for detailed documentation!
