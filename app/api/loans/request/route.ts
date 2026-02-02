import { NextRequest, NextResponse } from 'next/server';
import { createLoanRequest } from '@/lib/firestore';
import { createCalendarEvent } from '@/lib/calendar';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { amount, interestRate, totalRepayment, borrowerPhone } = body;

    // Get the authenticated user from the request
    // In production, you'd validate the Firebase token
    const authHeader = request.headers.get('authorization');
    
    // For now, we'll use the body data
    const borrowerData = {
      uid: body.borrowerId || 'temp-uid',
      name: body.borrowerName || 'Borrower',
      email: body.borrowerEmail || 'borrower@example.com',
      phone: borrowerPhone,
    };

    // Create loan request in Firestore
    const loanId = await createLoanRequest({
      borrowerId: borrowerData.uid,
      borrowerName: borrowerData.name,
      borrowerEmail: borrowerData.email,
      borrowerPhone: borrowerData.phone,
      amount,
      interestRate,
      term: 14,
      totalRepayment,
      status: 'pending',
    });

    // Create calendar event with SMS notification
    const lenderPhone = process.env.LENDER_PHONE_NUMBER || '17245587342';
    const startTime = new Date();
    const endTime = new Date(startTime.getTime() + 30 * 60000); // 30 minutes later

    const smsMessage = `
New Loan Request #${loanId}
Amount: $${amount.toLocaleString()}
Interest: ${interestRate}%
Total Repayment: $${totalRepayment.toLocaleString()}
Borrower: ${borrowerData.name}
Contact: ${borrowerData.phone}
Email: ${borrowerData.email}

Review at: ${process.env.NEXT_PUBLIC_APP_URL}/dashboard
    `.trim();

    try {
      await createCalendarEvent(
        `Loan Request: $${amount.toLocaleString()} from ${borrowerData.name}`,
        `Loan Amount: $${amount.toLocaleString()}\nInterest Rate: ${interestRate}%\nTotal Repayment: $${totalRepayment.toLocaleString()}\n\nBorrower Information:\nName: ${borrowerData.name}\nEmail: ${borrowerData.email}\nPhone: ${borrowerData.phone}`,
        startTime,
        endTime,
        smsMessage,
        lenderPhone
      );
    } catch (calendarError) {
      console.error('Calendar event creation failed, but loan was created:', calendarError);
      // Don't fail the whole request if calendar fails
    }

    return NextResponse.json({
      success: true,
      loanId,
      message: 'Loan request submitted successfully',
    });
  } catch (error) {
    console.error('Error creating loan request:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create loan request' },
      { status: 500 }
    );
  }
}
