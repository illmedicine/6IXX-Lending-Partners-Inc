# 6IXX Lending Partners - Loan Management Platform

A mobile-optimized static web application for managing loans between borrowers and lenders with Google Sign-On, real-time messaging, and automated notifications. **Deployable to GitHub Pages!**

## Features

### For Borrowers
- 🔐 Google Sign-In authentication
- 💰 Select from 6 loan packages ($100 - $5,000)
- 📊 Dashboard showing loan request status
- 💬 Direct messaging with lenders
- 📋 Submit collateral information when requested
- 📱 Mobile-first responsive design

### For Lenders
- 🔐 Secure Google Sign-In with lender role
- 📊 Dashboard with loan statistics
- ✅ Approve or reject loan requests
- 🏦 Request collateral from borrowers
- 💬 Direct messaging with borrowers
- 📧 Automatic SMS notifications via Firebase Cloud Functions

### Loan Packages
- **$100** - 20% interest (14 days) = $120 repayment
- **$250** - 18% interest (14 days) = $295 repayment
- **$500** - 16% interest (14 days) = $580 repayment
- **$1,000** - 14% interest (14 days) = $1,140 repayment
- **$2,000** - 12% interest (14 days) = $2,240 repayment
- **$5,000** - 10% interest (14 days) = $5,500 repayment

### Collateral Options
- Jewelry
- Hardware
- Auto Title
- Computer/PS5/XBOX
- Home Deed
- Pay Stub Proof

## Tech Stack

- **Frontend**: React 18, Vite, TypeScript
- **Styling**: Tailwind CSS
- **Authentication**: Firebase Authentication (Google OAuth)
- **Database**: Firebase Firestore (client-side SDK)
- **Notifications**: Firebase Cloud Functions + Google Calendar API
- **Hosting**: GitHub Pages (Static)
- **Icons**: Lucide React

## Architecture

This is a **100% client-side** application that runs entirely in the browser:
- ✅ No Node.js server required
- ✅ All Firebase operations via client SDK
- ✅ Deployable to GitHub Pages
- ✅ Optional Firebase Cloud Functions for SMS

## Quick Start

### 1. Prerequisites

- Node.js 18+ installed
- Firebase account
- GitHub account

### 2. Clone & Install

```bash
git clone https://github.com/illmedicine/6IXX-Lending-Partners-Inc.git
cd 6IXX-Lending-Partners-Inc
npm install
```

### 3. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable **Authentication** → **Google Sign-In**
4. Enable **Firestore Database**
5. Get your Firebase config from Project Settings

### 4. Environment Variables

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Fill in your credentials:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

### 5. Run Development Server

```bash
npm run dev
```

Visit [http://localhost:5173](http://localhost:5173)

### 6. Deploy to GitHub Pages

```bash
npm run deploy
```

Your app will be live at: `https://[username].github.io/6IXX-Lending-Partners-Inc/`

## Firestore Security Rules

Add these security rules to your Firestore:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function getUserData() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data;
    }
    
    // Users collection
    match /users/{userId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated() && request.auth.uid == request.resource.data.uid;
      allow update: if isAuthenticated() && request.auth.uid == resource.data.uid;
      allow delete: if false;
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
      
      allow delete: if false;
    }
    
    // Messages collection
    match /messages/{messageId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated() && 
        request.resource.data.senderId == request.auth.uid;
      allow update: if isAuthenticated() && 
        request.auth.uid == resource.data.senderId;
      allow delete: if false;
    }
  }
}
```

## Usage

### As a Borrower

1. Sign in with Google and select "Borrower" role
2. Click "Request New Loan"
3. Select a loan package
4. Enter your phone number
5. Submit the request
6. Wait for lender to review
7. If collateral is requested, submit the required information
8. Use the messaging feature to communicate with the lender

### As a Lender

1. Sign in with Google and select "Lender" role
2. View pending loan requests on the dashboard
3. Review borrower information
4. Approve, reject, or request collateral
5. Use filters to manage different loan statuses
6. Message borrowers for additional information

## Project Structure

```
├── src/
│   ├── components/
│   │   ├── BorrowerDashboard.tsx
│   │   ├── CollateralSelector.tsx
│   │   ├── LenderDashboard.tsx
│   │   ├── LoanCard.tsx
│   │   ├── LoanPackageSelector.tsx
│   │   └── LoginPage.tsx
│   ├── contexts/
│   │   └── AuthContext.tsx
│   ├── lib/
│   │   ├── firebase.ts
│   │   ├── firestore.ts
│   │   └── loanService.ts
│   ├── types/
│   │   └── index.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── functions/         # Firebase Cloud Functions (optional)
│   └── src/
│       └── index.ts
├── index.html
├── vite.config.ts
├── package.json
└── tailwind.config.js
```

## Firebase Cloud Functions (Optional)

For SMS notifications to the lender (17245587342):

```bash
cd functions
npm install
firebase deploy --only functions
```

See `functions/README.md` for detailed setup.

## Mobile Optimization

- Responsive design optimized for mobile devices
- Touch-friendly interface elements
- Optimized font sizes for mobile screens
- Fast loading times
- Works offline with Firebase caching

## Deployment Options

1. **GitHub Pages** (Primary) - Free static hosting
2. **Netlify** - Alternative with easy CD
3. **Firebase Hosting** - Integrated with Firebase
4. **Vercel** - Fast global CDN

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed instructions.

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Deploy to GitHub Pages
npm run deploy
```

## Support

For issues or questions, create an issue on GitHub.

## License

Proprietary - 6IXX Lending Partners Inc.

### For Borrowers
- 🔐 Google Sign-In authentication
- 💰 Select from 6 loan packages ($100 - $5,000)
- 📊 Dashboard showing loan request status
- 💬 Direct messaging with lenders
- 📋 Submit collateral information when requested
- 📱 Mobile-first responsive design

### For Lenders
- 🔐 Secure Google Sign-In with lender role
- 📊 Dashboard with loan statistics
- ✅ Approve or reject loan requests
- 🏦 Request collateral from borrowers
- 💬 Direct messaging with borrowers
- 📧 Automatic SMS notifications via Google Calendar

### Loan Packages
- **$100** - 20% interest (14 days) = $120 repayment
- **$250** - 18% interest (14 days) = $295 repayment
- **$500** - 16% interest (14 days) = $580 repayment
- **$1,000** - 14% interest (14 days) = $1,140 repayment
- **$2,000** - 12% interest (14 days) = $2,240 repayment
- **$5,000** - 10% interest (14 days) = $5,500 repayment

### Collateral Options
- Jewelry
- Hardware
- Auto Title
- Computer/PS5/XBOX
- Home Deed
- Pay Stub Proof

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS
- **Authentication**: Firebase Authentication (Google OAuth)
- **Database**: Firebase Firestore
- **Notifications**: Google Calendar API with SMS
- **Icons**: Lucide React

## Setup Instructions

### 1. Prerequisites

- Node.js 18+ installed
- Firebase account
- Google Cloud Platform account (for Calendar API)

### 2. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable **Authentication** → **Google Sign-In**
4. Enable **Firestore Database**
5. Get your Firebase config from Project Settings

### 3. Google Calendar API Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Enable **Google Calendar API**
3. Create a **Service Account**
4. Download the service account JSON key
5. Share your Google Calendar with the service account email

### 4. Environment Variables

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Fill in your credentials:
   ```env
   # Firebase Configuration
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

   # Google Calendar API
   GOOGLE_CALENDAR_ID=your_calendar_id
   GOOGLE_SERVICE_ACCOUNT_EMAIL=your_service_account@your_project.iam.gserviceaccount.com
   GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour key\n-----END PRIVATE KEY-----\n"

   # SMS Notification Phone
   LENDER_PHONE_NUMBER=17245587342

   # App URL
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

### 5. Install Dependencies

```bash
npm install
```

### 6. Run Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

### 7. Build for Production

```bash
npm run build
npm start
```

## Firestore Security Rules

Add these security rules to your Firestore:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == resource.data.uid;
    }
    
    // Loans collection
    match /loans/{loanId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update: if request.auth != null && 
        (request.auth.uid == resource.data.borrowerId || 
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'lender');
    }
    
    // Messages collection
    match /messages/{messageId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update: if request.auth != null && request.auth.uid == resource.data.senderId;
    }
  }
}
```

## Usage

### As a Borrower

1. Sign in with Google and select "Borrower" role
2. Click "Request New Loan"
3. Select a loan package
4. Enter your phone number
5. Submit the request
6. Wait for lender to review
7. If collateral is requested, submit the required information
8. Use the messaging feature to communicate with the lender

### As a Lender

1. Sign in with Google and select "Lender" role
2. View pending loan requests on the dashboard
3. Review borrower information
4. Approve, reject, or request collateral
5. Use filters to manage different loan statuses
6. Message borrowers for additional information

## API Routes

- `POST /api/loans/request` - Create a new loan request and send SMS notification

## Project Structure

```
├── app/
│   ├── api/
│   │   └── loans/
│   │       └── request/
│   │           └── route.ts
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── BorrowerDashboard.tsx
│   ├── CollateralSelector.tsx
│   ├── LenderDashboard.tsx
│   ├── LoanCard.tsx
│   ├── LoanPackageSelector.tsx
│   └── LoginPage.tsx
├── contexts/
│   └── AuthContext.tsx
├── lib/
│   ├── calendar.ts
│   ├── firebase.ts
│   └── firestore.ts
├── types/
│   └── index.ts
├── .env.example
├── .gitignore
├── next.config.js
├── package.json
├── postcss.config.js
├── tailwind.config.js
└── tsconfig.json
```

## Mobile Optimization

- Responsive design optimized for mobile devices
- Touch-friendly interface elements
- Optimized font sizes for mobile screens
- Fast loading times
- PWA-ready architecture

## Security Considerations

- All authentication handled through Firebase
- Firestore security rules protect user data
- Environment variables for sensitive credentials
- Server-side API routes for secure operations

## Support

For issues or questions, please contact the development team.

## License

Proprietary - 6IXX Lending Partners Inc.
