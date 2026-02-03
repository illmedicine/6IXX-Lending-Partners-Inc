import { 
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  Timestamp
} from 'firebase/firestore';
import { db } from './firebase';
import { LoanRequest, Message, User, LoanStatus, CollateralType } from '@/types';

// Convert Firestore timestamp to Date
const convertTimestamp = (timestamp: any): Date => {
  if (timestamp?.toDate) {
    return timestamp.toDate();
  }
  return new Date(timestamp);
};

// User operations
export async function createUser(user: Omit<User, 'createdAt'>) {
  const userRef = await addDoc(collection(db, 'users'), {
    ...user,
    createdAt: Timestamp.now(),
  });
  return userRef.id;
}

export async function getUserByUid(uid: string): Promise<User | null> {
  const q = query(collection(db, 'users'), where('uid', '==', uid));
  const snapshot = await getDocs(q);
  
  if (snapshot.empty) return null;
  
  const userData = snapshot.docs[0].data();
  return {
    ...userData,
    createdAt: convertTimestamp(userData.createdAt),
  } as User;
}

export async function updateUser(uid: string, data: Partial<User>) {
  const q = query(collection(db, 'users'), where('uid', '==', uid));
  const snapshot = await getDocs(q);
  
  if (!snapshot.empty) {
    const userDoc = snapshot.docs[0];
    await updateDoc(doc(db, 'users', userDoc.id), data);
  }
}

// Loan operations
export async function createLoanRequest(loanData: Omit<LoanRequest, 'id' | 'requestedAt' | 'updatedAt'>): Promise<string> {
  const loanRef = await addDoc(collection(db, 'loans'), {
    ...loanData,
    requestedAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });
  return loanRef.id;
}

export async function getLoanRequest(loanId: string): Promise<LoanRequest | null> {
  const loanDoc = await getDoc(doc(db, 'loans', loanId));
  
  if (!loanDoc.exists()) return null;
  
  const data = loanDoc.data();
  return {
    id: loanDoc.id,
    ...data,
    requestedAt: convertTimestamp(data.requestedAt),
    updatedAt: convertTimestamp(data.updatedAt),
    approvedAt: data.approvedAt ? convertTimestamp(data.approvedAt) : undefined,
    rejectedAt: data.rejectedAt ? convertTimestamp(data.rejectedAt) : undefined,
    collateralRequestedAt: data.collateralRequestedAt ? convertTimestamp(data.collateralRequestedAt) : undefined,
  } as LoanRequest;
}

export async function getLoansByBorrower(borrowerId: string): Promise<LoanRequest[]> {
  try {
    const q = query(
      collection(db, 'loans'), 
      where('borrowerId', '==', borrowerId),
      orderBy('requestedAt', 'desc')
    );
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        requestedAt: convertTimestamp(data.requestedAt),
        updatedAt: convertTimestamp(data.updatedAt),
        approvedAt: data.approvedAt ? convertTimestamp(data.approvedAt) : undefined,
        rejectedAt: data.rejectedAt ? convertTimestamp(data.rejectedAt) : undefined,
        collateralRequestedAt: data.collateralRequestedAt ? convertTimestamp(data.collateralRequestedAt) : undefined,
      } as LoanRequest;
    });
  } catch (error: any) {
    // If index doesn't exist, fall back to query without orderBy
    if (error.message?.includes('index') || error.code === 'failed-precondition') {
      console.warn('Composite index not found, using simple query. Loans may not be sorted.');
      const q = query(
        collection(db, 'loans'), 
        where('borrowerId', '==', borrowerId)
      );
      const snapshot = await getDocs(q);
      
      const loans = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          requestedAt: convertTimestamp(data.requestedAt),
          updatedAt: convertTimestamp(data.updatedAt),
          approvedAt: data.approvedAt ? convertTimestamp(data.approvedAt) : undefined,
          rejectedAt: data.rejectedAt ? convertTimestamp(data.rejectedAt) : undefined,
          collateralRequestedAt: data.collateralRequestedAt ? convertTimestamp(data.collateralRequestedAt) : undefined,
        } as LoanRequest;
      });
      
      // Sort manually in JavaScript
      return loans.sort((a, b) => b.requestedAt.getTime() - a.requestedAt.getTime());
    }
    throw error;
  }
}

export async function getAllLoans(): Promise<LoanRequest[]> {
  const q = query(collection(db, 'loans'), orderBy('requestedAt', 'desc'));
  const snapshot = await getDocs(q);
  
  return snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      requestedAt: convertTimestamp(data.requestedAt),
      updatedAt: convertTimestamp(data.updatedAt),
      approvedAt: data.approvedAt ? convertTimestamp(data.approvedAt) : undefined,
      rejectedAt: data.rejectedAt ? convertTimestamp(data.rejectedAt) : undefined,
      collateralRequestedAt: data.collateralRequestedAt ? convertTimestamp(data.collateralRequestedAt) : undefined,
    } as LoanRequest;
  });
}

export async function updateLoanStatus(
  loanId: string, 
  status: LoanStatus, 
  lenderId?: string,
  notes?: string
) {
  const updates: any = {
    status,
    updatedAt: Timestamp.now(),
  };
  
  if (lenderId) updates.lenderId = lenderId;
  if (notes) updates.notes = notes;
  
  if (status === 'approved') {
    updates.approvedAt = Timestamp.now();
  } else if (status === 'rejected') {
    updates.rejectedAt = Timestamp.now();
  } else if (status === 'collateral_requested') {
    updates.collateralRequestedAt = Timestamp.now();
  }
  
  await updateDoc(doc(db, 'loans', loanId), updates);
}

export async function submitCollateral(
  loanId: string,
  collateralType: CollateralType,
  collateralDetails: string
) {
  await updateDoc(doc(db, 'loans', loanId), {
    collateralType,
    collateralDetails,
    status: 'collateral_submitted',
    updatedAt: Timestamp.now(),
  });
}

// Message operations
export async function sendMessage(messageData: Omit<Message, 'id' | 'timestamp' | 'read'>): Promise<string> {
  const messageRef = await addDoc(collection(db, 'messages'), {
    ...messageData,
    timestamp: Timestamp.now(),
    read: false,
  });
  return messageRef.id;
}

export async function getMessagesByLoan(loanId: string): Promise<Message[]> {
  const q = query(
    collection(db, 'messages'),
    where('loanId', '==', loanId),
    orderBy('timestamp', 'asc')
  );
  const snapshot = await getDocs(q);
  
  return snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      timestamp: convertTimestamp(data.timestamp),
    } as Message;
  });
}

export async function markMessageAsRead(messageId: string) {
  await updateDoc(doc(db, 'messages', messageId), {
    read: true,
  });
}
