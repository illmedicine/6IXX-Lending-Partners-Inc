# Firebase Cloud Function for SMS Notifications

This directory contains the Firebase Cloud Function that handles loan request notifications via SMS and Google Calendar.

## Setup

1. **Install Firebase CLI**:
   ```bash
   npm install -g firebase-tools
   firebase login
   ```

2. **Initialize Firebase Functions**:
   ```bash
   firebase init functions
   ```
   - Select your Firebase project
   - Choose TypeScript
   - Install dependencies

3. **Configure Environment Variables**:
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

4. **Deploy Functions**:
   ```bash
   firebase deploy --only functions
   ```

## Function: sendLoanNotification

Triggered when a new loan request is submitted. Sends SMS notification to the lender and creates a Google Calendar event.

### Parameters:
- `loanId`: String - Loan request ID
- `borrowerName`: String - Name of borrower
- `borrowerEmail`: String - Email of borrower
- `borrowerPhone`: String - Phone number of borrower
- `amount`: Number - Loan amount requested
- `interestRate`: Number - Interest rate percentage
- `totalRepayment`: Number - Total amount to be repaid

### Response:
- `success`: Boolean
- `message`: String
- `calendarEventId`: String (if successful)
