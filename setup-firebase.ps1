# Firebase Automated Setup Script for 6IXX Lending Partners
# This script automates the Firebase configuration process

param(
    [string]$ProjectId = "lending-partners-e8106",
    [string]$LenderPhone = "+17245587342"
)

$ErrorActionPreference = "Continue"

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "  Firebase Automated Setup - 6IXX Lending Partners" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""

# Check if Firebase CLI is installed
Write-Host "Checking Firebase CLI installation..." -ForegroundColor Yellow
$firebaseInstalled = Get-Command firebase -ErrorAction SilentlyContinue

if (-not $firebaseInstalled) {
    Write-Host "Firebase CLI not found. Installing..." -ForegroundColor Red
    npm install -g firebase-tools
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Failed to install Firebase CLI. Please install manually: npm install -g firebase-tools" -ForegroundColor Red
        exit 1
    }
}

Write-Host "✓ Firebase CLI is installed" -ForegroundColor Green
Write-Host ""

# Login to Firebase
Write-Host "Logging into Firebase..." -ForegroundColor Yellow
Write-Host "A browser window will open for authentication." -ForegroundColor Cyan
firebase login --no-localhost

if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to login to Firebase. Please try again." -ForegroundColor Red
    exit 1
}

Write-Host "✓ Successfully logged into Firebase" -ForegroundColor Green
Write-Host ""

# List available projects
Write-Host "Fetching your Firebase projects..." -ForegroundColor Yellow
firebase projects:list

Write-Host ""
Write-Host "Current project ID: $ProjectId" -ForegroundColor Cyan
$confirmProject = Read-Host "Is this correct? (Y/n)"

if ($confirmProject -eq "n" -or $confirmProject -eq "N") {
    $ProjectId = Read-Host "Enter your Firebase Project ID"
}

# Create .firebaserc file
Write-Host ""
Write-Host "Creating .firebaserc file..." -ForegroundColor Yellow
$firebaserc = @{
    projects = @{
        default = $ProjectId
    }
} | ConvertTo-Json

$firebaserc | Out-File -FilePath ".firebaserc" -Encoding UTF8
Write-Host "✓ Created .firebaserc" -ForegroundColor Green

# Create firebase.json file
Write-Host "Creating firebase.json configuration..." -ForegroundColor Yellow
$firebaseJson = @{
    hosting = @{
        public = "dist"
        ignore = @(
            "firebase.json",
            "**/.*",
            "**/node_modules/**"
        )
        rewrites = @(
            @{
                source = "**"
                destination = "/index.html"
            }
        )
    }
    functions = @{
        source = "functions"
        predeploy = @(
            "npm --prefix `"`$RESOURCE_DIR`" run build"
        )
    }
} | ConvertTo-Json -Depth 10

$firebaseJson | Out-File -FilePath "firebase.json" -Encoding UTF8
Write-Host "✓ Created firebase.json" -ForegroundColor Green

# Initialize Functions
Write-Host ""
Write-Host "Setting up Firebase Functions..." -ForegroundColor Yellow

if (-not (Test-Path "functions\package.json")) {
    Write-Host "Functions directory not fully set up. Initializing..." -ForegroundColor Cyan
    
    # This will guide through interactive setup
    firebase init functions --project $ProjectId
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Warning: Functions initialization had issues. You may need to run manually." -ForegroundColor Yellow
    }
}

Write-Host "✓ Functions directory ready" -ForegroundColor Green

# Get Twilio credentials
Write-Host ""
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "  SMS Configuration (Twilio)" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "To enable SMS notifications, you need Twilio credentials." -ForegroundColor Yellow
Write-Host "Sign up at: https://www.twilio.com/try-twilio" -ForegroundColor Cyan
Write-Host ""

$setupTwilio = Read-Host "Do you have Twilio credentials? (Y/n)"

if ($setupTwilio -ne "n" -and $setupTwilio -ne "N") {
    Write-Host ""
    $twilioSid = Read-Host "Enter Twilio Account SID"
    $twilioToken = Read-Host "Enter Twilio Auth Token"
    $twilioPhone = Read-Host "Enter Twilio Phone Number (format: +1234567890)"
    
    Write-Host ""
    Write-Host "Configuring Firebase Functions environment..." -ForegroundColor Yellow
    
    # Set Firebase Functions config
    firebase functions:config:set `
        twilio.account_sid="$twilioSid" `
        twilio.auth_token="$twilioToken" `
        twilio.phone_number="$twilioPhone" `
        lender.phone_number="$LenderPhone" `
        --project $ProjectId
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Twilio configuration saved" -ForegroundColor Green
    }
    else {
        Write-Host "Warning: Failed to set Twilio config. You can set it manually later." -ForegroundColor Yellow
    }
}
else {
    Write-Host "Skipping Twilio setup. SMS notifications will not work." -ForegroundColor Yellow
    Write-Host "You can configure later with:" -ForegroundColor Cyan
    Write-Host "  firebase functions:config:set twilio.account_sid=YOUR_SID" -ForegroundColor Gray
}

# Get Firebase Web App Config
Write-Host ""
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "  Web App Configuration" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "To get your Firebase web app config:" -ForegroundColor Yellow
Write-Host "1. Go to: https://console.firebase.google.com/project/$ProjectId/settings/general" -ForegroundColor Cyan
Write-Host "2. Scroll to 'Your apps' section" -ForegroundColor Cyan
Write-Host "3. Click on your web app (or create one)" -ForegroundColor Cyan
Write-Host "4. Copy the config values" -ForegroundColor Cyan
Write-Host ""

$setupConfig = Read-Host "Do you want to enter Firebase config now? (Y/n)"

if ($setupConfig -ne "n" -and $setupConfig -ne "N") {
    Write-Host ""
    $apiKey = Read-Host "Enter Firebase API Key"
    $authDomain = Read-Host "Enter Auth Domain (e.g., project-id.firebaseapp.com)"
    $storageBucket = Read-Host "Enter Storage Bucket (e.g., project-id.appspot.com)"
    $messagingSenderId = Read-Host "Enter Messaging Sender ID"
    $appId = Read-Host "Enter App ID"
    
    # Create .env file
    Write-Host ""
    Write-Host "Creating .env file..." -ForegroundColor Yellow
    
    $envContent = @"
# Firebase Configuration
VITE_FIREBASE_API_KEY=$apiKey
VITE_FIREBASE_AUTH_DOMAIN=$authDomain
VITE_FIREBASE_PROJECT_ID=$ProjectId
VITE_FIREBASE_STORAGE_BUCKET=$storageBucket
VITE_FIREBASE_MESSAGING_SENDER_ID=$messagingSenderId
VITE_FIREBASE_APP_ID=$appId
"@
    
    $envContent | Out-File -FilePath ".env" -Encoding UTF8
    Write-Host "✓ Created .env file" -ForegroundColor Green
    
    # Also provide instructions for GitHub Secrets
    Write-Host ""
    Write-Host "==================================================" -ForegroundColor Cyan
    Write-Host "  GitHub Secrets Setup" -ForegroundColor Cyan
    Write-Host "==================================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Add these secrets to GitHub for automatic deployment:" -ForegroundColor Yellow
    Write-Host "URL: https://github.com/illmedicine/6IXX-Lending-Partners-Inc/settings/secrets/actions" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Add these as GitHub Secrets:" -ForegroundColor White
    Write-Host "VITE_FIREBASE_API_KEY = $apiKey" -ForegroundColor Gray
    Write-Host "VITE_FIREBASE_AUTH_DOMAIN = $authDomain" -ForegroundColor Gray
    Write-Host "VITE_FIREBASE_PROJECT_ID = $ProjectId" -ForegroundColor Gray
    Write-Host "VITE_FIREBASE_STORAGE_BUCKET = $storageBucket" -ForegroundColor Gray
    Write-Host "VITE_FIREBASE_MESSAGING_SENDER_ID = $messagingSenderId" -ForegroundColor Gray
    Write-Host "VITE_FIREBASE_APP_ID = $appId" -ForegroundColor Gray
    Write-Host ""
}

# Deploy Functions
Write-Host ""
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "  Deploy Firebase Functions" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""

$deployFunctions = Read-Host "Deploy Firebase Functions now? (Y/n)"

if ($deployFunctions -ne "n" -and $deployFunctions -ne "N") {
    Write-Host "Installing functions dependencies..." -ForegroundColor Yellow
    Push-Location functions
    npm install
    Pop-Location
    
    Write-Host "Deploying functions to Firebase..." -ForegroundColor Yellow
    firebase deploy --only functions --project $ProjectId
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Functions deployed successfully!" -ForegroundColor Green
    } else {
     
      Write-Host "Warning: Functions deployment had issues." -ForegroundColor Yellow
    }
}

# Setup Firestore Security Rules
Write-Host ""
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "  Firestore Security Rules" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Important: Set up Firestore security rules manually:" -ForegroundColor Yellow
Write-Host "1. Go to: https://console.firebase.google.com/project/$ProjectId/firestore/rules" -ForegroundColor Cyan
Write-Host "2. Copy the rules from the README.md file" -ForegroundColor Cyan
Write-Host "3. Click 'Publish'" -ForegroundColor Cyan
Write-Host ""

# Enable Authentication
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "  Authentication Setup" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Enable Google Sign-In manually:" -ForegroundColor Yellow
Write-Host "1. Go to: https://console.firebase.google.com/project/$ProjectId/authentication/providers" -ForegroundColor Cyan
Write-Host "2. Click 'Google' → Enable" -ForegroundColor Cyan
Write-Host "3. Add support email" -ForegroundColor Cyan
Write-Host "4. Under Settings → Authorized domains, add: illmedicine.github.io" -ForegroundColor Cyan
Write-Host ""

# Summary
Write-Host ""
Write-Host "==================================================" -ForegroundColor Green
Write-Host "  Setup Complete!" -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Green
Write-Host ""
Write-Host "✓ Firebase CLI configured" -ForegroundColor Green
Write-Host "✓ Project connected: $ProjectId" -ForegroundColor Green
Write-Host "✓ Configuration files created" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Complete manual steps above (Firestore rules, Authentication)" -ForegroundColor White
Write-Host "2. Add secrets to GitHub Actions" -ForegroundColor White
Write-Host "3. Commit and push changes:" -ForegroundColor White
Write-Host "   git add ." -ForegroundColor Gray
Write-Host "   git commit -m 'Add Firebase configuration'" -ForegroundColor Gray
Write-Host "   git push origin main" -ForegroundColor Gray
Write-Host ""
$appUrl = "https://illmedicine.github.io/6IXX-Lending-Partners-Inc/"
Write-Host "Your app will be deployed to: $appUrl" -ForegroundColor Cyan
Write-Host ""
