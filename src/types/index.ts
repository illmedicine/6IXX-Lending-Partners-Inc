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

// Calculate interest rate based on loan term (in days)
export function calculateInterestRate(termDays: number, baseAmount: number): number {
  // 1-3 days: 5% minimum
  if (termDays <= 3) return 5;
  
  // 3-14 days: Scale from 5% to default rates based on amount
  if (termDays <= 14) {
    const defaultRate = baseAmount >= 5000 ? 10 : 
                       baseAmount >= 2000 ? 12 : 
                       baseAmount >= 1000 ? 14 : 
                       baseAmount >= 500 ? 16 : 
                       baseAmount >= 250 ? 18 : 20;
    const progress = (termDays - 3) / (14 - 3);
    return 5 + (defaultRate - 5) * progress;
  }
  
  // 14-90 days: Scale from default to 40%
  const defaultRate = baseAmount >= 5000 ? 10 : 
                     baseAmount >= 2000 ? 12 : 
                     baseAmount >= 1000 ? 14 : 
                     baseAmount >= 500 ? 16 : 
                     baseAmount >= 250 ? 18 : 20;
  const progress = (termDays - 14) / (90 - 14);
  return defaultRate + (40 - defaultRate) * progress;
}

// Calculate APR from interest rate and term
export function calculateAPR(interestRate: number, termDays: number): number {
  // APR = (Interest Rate / Term in Days) * 365
  return (interestRate / termDays) * 365;
}
