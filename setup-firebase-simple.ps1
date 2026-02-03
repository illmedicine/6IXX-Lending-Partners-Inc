# Simple Firebase Setup Script
# Run with: .\setup-firebase-simple.ps1

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Firebase Setup for 6IXX Lending Partners" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Check Firebase CLI
Write-Host "[1/7] Checking Firebase CLI..." -ForegroundColor Yellow
$firebase = Get-Command firebase -ErrorAction SilentlyContinue

if (-not $firebase) {
    Write-Host "Installing Firebase CLI..." -ForegroundColor Red
    npm install -g firebase-tools
}
Write-Host "Firebase CLI ready" -ForegroundColor Green
Write-Host ""

# Step 2: Login
Write-Host "[2/7] Firebase Login (browser will open)..." -ForegroundColor Yellow
firebase login --no-localhost
Write-Host ""

# Step 3: Select Project
Write-Host "[3/7] Your Firebase Projects:" -ForegroundColor Yellow
firebase projects:list
Write-Host ""
$projectId = Read-Host "Enter your Project ID (e.g., lending-partners-e8106)"

# Step 4: Create config files
Write-Host ""
Write-Host "[4/7] Creating Firebase config files..." -ForegroundColor Yellow

# Create .firebaserc
$firebaserc = @"
{
  "projects": {
    "default": "$projectId"
  }
}
"@
$firebaserc | Out-File -FilePath ".firebaserc" -Encoding UTF8
Write-Host "Created .firebaserc" -ForegroundColor Green

# Create firebase.json
$firebaseJson = @"
{
  "hosting": {
    "public": "dist",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  },
  "functions": {
    "source": "functions",
    "predeploy": [
      "npm --prefix \`$RESOURCE_DIR run build"
    ]
  }
}
"@
$firebaseJson | Out-File -FilePath "firebase.json" -Encoding UTF8
Write-Host "Created firebase.json" -ForegroundColor Green
Write-Host ""

# Step 5: Get Firebase Web Config
Write-Host "[5/7] Firebase Web App Configuration" -ForegroundColor Yellow
Write-Host ""
Write-Host "IMPORTANT: Create a Web App first!" -ForegroundColor Red
Write-Host "1. Go to: https://console.firebase.google.com/project/$projectId/settings/general" -ForegroundColor White
Write-Host "2. Scroll to 'Your apps' section" -ForegroundColor White
Write-Host "3. Click the </> (Web) icon" -ForegroundColor Yellow
Write-Host "4. App nickname: 6IXX Lending Partners" -ForegroundColor White
Write-Host "5. Check 'Also set up Firebase Hosting'" -ForegroundColor White
Write-Host "6. Click 'Register app'" -ForegroundColor White
Write-Host "7. Copy the firebaseConfig values below" -ForegroundColor White
Write-Host ""
Write-Host "Press Enter after creating the web app..." -ForegroundColor Cyan
Read-Host
Write-Host ""

$apiKey = Read-Host "Enter API Key"
$authDomain = Read-Host "Enter Auth Domain"
$storageBucket = Read-Host "Enter Storage Bucket"
$messagingSenderId = Read-Host "Enter Messaging Sender ID"
$appId = Read-Host "Enter App ID"

# Create .env file
$envContent = @"
VITE_FIREBASE_API_KEY=$apiKey
VITE_FIREBASE_AUTH_DOMAIN=$authDomain
VITE_FIREBASE_PROJECT_ID=$projectId
VITE_FIREBASE_STORAGE_BUCKET=$storageBucket
VITE_FIREBASE_MESSAGING_SENDER_ID=$messagingSenderId
VITE_FIREBASE_APP_ID=$appId
"@
$envContent | Out-File -FilePath ".env" -Encoding UTF8
Write-Host "Created .env file" -ForegroundColor Green
Write-Host ""

# Step 6: GitHub Secrets
Write-Host "[6/7] GitHub Secrets Setup" -ForegroundColor Yellow
Write-Host "Add these secrets at:" -ForegroundColor Cyan
Write-Host "https://github.com/illmedicine/6IXX-Lending-Partners-Inc/settings/secrets/actions" -ForegroundColor White
Write-Host ""
Write-Host "VITE_FIREBASE_API_KEY = $apiKey" -ForegroundColor Gray
Write-Host "VITE_FIREBASE_AUTH_DOMAIN = $authDomain" -ForegroundColor Gray
Write-Host "VITE_FIREBASE_PROJECT_ID = $projectId" -ForegroundColor Gray
Write-Host "VITE_FIREBASE_STORAGE_BUCKET = $storageBucket" -ForegroundColor Gray
Write-Host "VITE_FIREBASE_MESSAGING_SENDER_ID = $messagingSenderId" -ForegroundColor Gray
Write-Host "VITE_FIREBASE_APP_ID = $appId" -ForegroundColor Gray
Write-Host ""
Write-Host "Press Enter after adding secrets to GitHub..."
Read-Host

# Step 7: Twilio Setup (Optional)
Write-Host ""
Write-Host "[7/7] SMS Setup with Twilio (Optional)" -ForegroundColor Yellow
$setupSMS = Read-Host "Setup SMS notifications? (Y/n)"

if ($setupSMS -ne "n") {
    Write-Host ""
    Write-Host "Sign up at: https://www.twilio.com/try-twilio" -ForegroundColor Cyan
    Write-Host ""
    $twilioSid = Read-Host "Twilio Account SID"
    $twilioToken = Read-Host "Twilio Auth Token"
    $twilioPhone = Read-Host "Twilio Phone (+1234567890)"
    $lenderPhone = Read-Host "Lender Phone (default: +17245587342)"
    
    if (-not $lenderPhone) { $lenderPhone = "+17245587342" }
    
    Write-Host "Configuring Twilio..." -ForegroundColor Yellow
    firebase functions:config:set twilio.account_sid="$twilioSid" --project $projectId
    firebase functions:config:set twilio.auth_token="$twilioToken" --project $projectId
    firebase functions:config:set twilio.phone_number="$twilioPhone" --project $projectId
    firebase functions:config:set lender.phone_number="$lenderPhone" --project $projectId
    Write-Host "Twilio configured" -ForegroundColor Green
}

# Deploy Functions
Write-Host ""
$deployFunctions = Read-Host "Deploy Firebase Functions now? (Y/n)"
if ($deployFunctions -ne "n") {
    Write-Host "Installing functions dependencies..." -ForegroundColor Yellow
    Set-Location functions
    npm install
    Set-Location ..
    
    Write-Host "Deploying..." -ForegroundColor Yellow
    firebase deploy --only functions --project $projectId
}

# Summary
Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "Setup Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Enable Google Sign-In at:" -ForegroundColor White
Write-Host "   https://console.firebase.google.com/project/$projectId/authentication/providers" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Add illmedicine.github.io to authorized domains" -ForegroundColor White
Write-Host ""
Write-Host "3. Set Firestore rules at:" -ForegroundColor White
Write-Host "   https://console.firebase.google.com/project/$projectId/firestore/rules" -ForegroundColor Gray
Write-Host ""
Write-Host "4. Commit and push:" -ForegroundColor White
Write-Host "   git add ." -ForegroundColor Gray
Write-Host "   git commit -m 'Add Firebase configuration'" -ForegroundColor Gray
Write-Host "   git push origin main" -ForegroundColor Gray
Write-Host ""
Write-Host "Your app: https://illmedicine.github.io/6IXX-Lending-Partners-Inc/" -ForegroundColor Cyan
Write-Host ""
