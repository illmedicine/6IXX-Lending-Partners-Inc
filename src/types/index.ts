export type UserRole = 'borrower' | 'lender';

export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: UserRole;
  phoneNumber?: string;
  createdAt: Date;
}

export type LoanStatus = 'pending' | 'approved' | 'rejected' | 'collateral_requested' | 'collateral_submitted' | 'active' | 'repaid';

export type CollateralType = 
  | 'Jewelry'
  | 'Hardware'
  | 'Auto Title'
  | 'Computer/PS5/XBOX'
  | 'Home Deed'
  | 'Pay Stub Proof';

export interface LoanPackage {
  amount: number;
  interestRate: number; // percentage
  term: number; // days (14 days default)
}

export interface LoanRequest {
  id: string;
  borrowerId: string;
  borrowerName: string;
  borrowerEmail: string;
  borrowerPhone: string;
  amount: number;
  interestRate: number;
  term: number;
  totalRepayment: number;
  status: LoanStatus;
  collateralType?: CollateralType;
  collateralDetails?: string;
  lenderId?: string;
  requestedAt: Date;
  updatedAt: Date;
  approvedAt?: Date;
  rejectedAt?: Date;
  collateralRequestedAt?: Date;
  notes?: string;
}

export interface Message {
  id: string;
  loanId: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  content: string;
  timestamp: Date;
  read: boolean;
}

export const LOAN_PACKAGES: LoanPackage[] = [
  { amount: 100, interestRate: 20, term: 14 },
  { amount: 250, interestRate: 18, term: 14 },
  { amount: 500, interestRate: 16, term: 14 },
  { amount: 1000, interestRate: 14, term: 14 },
  { amount: 2000, interestRate: 12, term: 14 },
  { amount: 5000, interestRate: 10, term: 14 },
];

export const COLLATERAL_OPTIONS: CollateralType[] = [
  'Jewelry',
  'Hardware',
  'Auto Title',
  'Computer/PS5/XBOX',
  'Home Deed',
  'Pay Stub Proof',
];

export function calculateTotalRepayment(amount: number, interestRate: number): number {
  return amount + (amount * interestRate / 100);
}
