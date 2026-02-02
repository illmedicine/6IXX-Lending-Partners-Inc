import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';

const calendar = google.calendar('v3');

async function getAuthClient() {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/calendar'],
  });

  return await auth.getClient();
}

export async function createCalendarEvent(
  summary: string,
  description: string,
  startTime: Date,
  endTime: Date,
  smsMessage: string,
  phoneNumber: string
) {
  try {
    const authClient = await getAuthClient();

    const event = {
      summary,
      description: `${description}\n\n${smsMessage}`,
      start: {
        dateTime: startTime.toISOString(),
        timeZone: 'America/New_York',
      },
      end: {
        dateTime: endTime.toISOString(),
        timeZone: 'America/New_York',
      },
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'sms', minutes: 0 },
        ],
      },
      attendees: [
        {
          email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
          responseStatus: 'accepted',
        },
      ],
    };

    const response = await calendar.events.insert({
      auth: authClient as any,
      calendarId: process.env.GOOGLE_CALENDAR_ID || 'primary',
      requestBody: event,
      sendUpdates: 'all',
    });

    console.log('Calendar event created:', response.data.id);
    return response.data;
  } catch (error) {
    console.error('Error creating calendar event:', error);
    throw error;
  }
}

export async function sendSMSNotification(phoneNumber: string, message: string) {
  // This is a placeholder for SMS functionality
  // In production, you would integrate with Twilio, AWS SNS, or similar
  console.log(`SMS to ${phoneNumber}: ${message}`);
  
  // For Google Calendar SMS, the notification happens through the calendar event
  // The event's SMS reminder will send to the attendee's phone if configured
  return true;
}
