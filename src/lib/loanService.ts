import { httpsCallable } from 'firebase/functions';
import { functions } from './firebase';
import { createLoanRequest } from './firestore';

export interface LoanRequestData {
  borrowerId: string;
  borrowerName: string;
  borrowerEmail: string;
  borrowerPhone: string;
  amount: number;
  interestRate: number;
  totalRepayment: number;
  term: number;
}

export async function submitLoanRequest(data: LoanRequestData): Promise<string> {
  try {
    // Create loan in Firestore
    const loanId = await createLoanRequest({
      ...data,
      status: 'pending',
    });

    // Call Firebase Cloud Function to send SMS notification
    try {
      const sendNotification = httpsCallable(functions, 'sendLoanNotification');
      await sendNotification({
        loanId,
        ...data,
      });
    } catch (error) {
      console.warn('Notification sending failed, but loan was created:', error);
      // Don't fail the whole request if notification fails
    }

    return loanId;
  } catch (error) {
    console.error('Error submitting loan request:', error);
    throw error;
  }
}
