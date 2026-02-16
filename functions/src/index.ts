import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import {google} from "googleapis";

admin.initializeApp();

interface LoanNotificationData {
  loanId: string;
  borrowerName: string;
  borrowerEmail: string;
  borrowerPhone: string;
  amount: number;
  interestRate: number;
  totalRepayment: number;
}

export const sendLoanNotification = functions.https.onCall(
  async (data: LoanNotificationData, context) => {
    // Verify authentication
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "Must be authenticated to send notifications"
      );
    }

    try {
      const {
        loanId,
        borrowerName,
        borrowerEmail,
        borrowerPhone,
        amount,
        interestRate,
        totalRepayment,
      } = data;

      // Get configuration
      const config = functions.config();
      const lenderPhone = config.lender?.phone_number || "+17245587342";

      // Create SMS message
      const smsMessage = `
🔔 New Loan Request #${loanId}

💰 Amount: $${amount.toLocaleString()}
📈 Interest: ${interestRate}%
💵 Repayment: $${totalRepayment.toLocaleString()}

👤 Borrower: ${borrowerName}
📞 Contact: ${borrowerPhone}
📧 Email: ${borrowerEmail}

Review the request in your dashboard.
      `.trim();

      // Send SMS via Twilio (if configured)
      if (config.twilio?.account_sid) {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const twilio = require("twilio");
        const client = twilio(
          config.twilio.account_sid,
          config.twilio.auth_token
        );

        await client.messages.create({
          body: smsMessage,
          from: config.twilio.phone_number,
          to: lenderPhone,
        });
      } else {
        console.log("Twilio not configured. SMS not sent.");
        console.log("Message would have been:", smsMessage);
      }

      // Create Google Calendar event (if configured)
      let calendarEventId = null;
      if (config.google?.calendar_id) {
        try {
          const auth = new google.auth.GoogleAuth({
            credentials: {
              client_email: config.google.service_email,
              private_key: config.google.private_key.replace(/\\n/g, "\n"),
            },
            scopes: ["https://www.googleapis.com/auth/calendar"],
          });

          const calendar = google.calendar({version: "v3", auth});
          const startTime = new Date();
          const endTime = new Date(startTime.getTime() + 30 * 60000);

          const event = await calendar.events.insert({
            calendarId: config.google.calendar_id,
            requestBody: {
              summary: `Loan Request: $${amount.toLocaleString()} from ${borrowerName}`,
              description: `
Loan Request Details:
- Amount: $${amount.toLocaleString()}
- Interest Rate: ${interestRate}%
- Total Repayment: $${totalRepayment.toLocaleString()}
- Term: 14 days

Borrower Information:
- Name: ${borrowerName}
- Email: ${borrowerEmail}
- Phone: ${borrowerPhone}

Loan ID: ${loanId}
              `.trim(),
              start: {
                dateTime: startTime.toISOString(),
                timeZone: "America/New_York",
              },
              end: {
                dateTime: endTime.toISOString(),
                timeZone: "America/New_York",
              },
            },
          });

          calendarEventId = event.data.id;
        } catch (calendarError) {
          console.error("Calendar event creation failed:", calendarError);
          // Don't fail the whole function if calendar fails
        }
      }

      return {
        success: true,
        message: "Notification sent successfully",
        calendarEventId,
      };
    } catch (error) {
      console.error("Error sending notification:", error);
      throw new functions.https.HttpsError(
        "internal",
        "Failed to send notification"
      );
    }
  }
);
