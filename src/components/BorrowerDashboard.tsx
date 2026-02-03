import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { LoanRequest } from '@/types';
import { getLoansByBorrower, submitCollateral } from '@/lib/firestore';
import LoanPackageSelector from '@/components/LoanPackageSelector';
import CollateralSelector from '@/components/CollateralSelector';
import LoanCard from '@/components/LoanCard';

export default function BorrowerDashboard() {
  const { user, signOut } = useAuth();
  const [loans, setLoans] = useState<LoanRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || '');
  const [selectedLoan, setSelectedLoan] = useState<{
    amount: number;
    interestRate: number;
    totalRepayment: number;
  } | null>(null);
  const [showCollateralForm, setShowCollateralForm] = useState<string | null>(null);

  useEffect(() => {
    loadLoans();
  }, [user]);

  const loadLoans = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const userLoans = await getLoansByBorrower(user.uid);
      setLoans(userLoans);
    } catch (error) {
      console.error('Error loading loans:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitLoanRequest = async () => {
    if (!selectedLoan || !phoneNumber.trim() || !user) {
      alert('Please select a loan package and provide your phone number');
      return;
    }

    try {
      const { submitLoanRequest } = await import('@/lib/loanService');
      await submitLoanRequest({
        borrowerId: user.uid,
        borrowerName: user.displayName,
        borrowerEmail: user.email,
        borrowerPhone: phoneNumber,
        amount: selectedLoan.amount,
        interestRate: selectedLoan.interestRate,
        totalRepayment: selectedLoan.totalRepayment,
      });

      alert('Loan request submitted successfully!');
      setShowRequestForm(false);
      setSelectedLoan(null);
      loadLoans();
    } catch (error) {
      console.error('Error submitting loan request:', error);
      alert('An error occurred. Please try again.');
    }
  };

  const handleSubmitCollateral = async (collateralType: any, details: string) => {
    if (!showCollateralForm) return;

    try {
      await submitCollateral(showCollateralForm, collateralType, details);
      alert('Collateral information submitted successfully!');
      setShowCollateralForm(null);
      loadLoans();
    } catch (error) {
      console.error('Error submitting collateral:', error);
      alert('Failed to submit collateral information');
    }
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { color: string; text: string }> = {
      pending: { color: 'bg-yellow-100 text-yellow-800', text: 'Pending Review' },
      approved: { color: 'bg-green-100 text-green-800', text: 'Approved' },
      rejected: { color: 'bg-red-100 text-red-800', text: 'Rejected' },
      collateral_requested: { color: 'bg-orange-100 text-orange-800', text: 'Collateral Requested' },
      collateral_submitted: { color: 'bg-blue-100 text-blue-800', text: 'Collateral Submitted' },
      active: { color: 'bg-purple-100 text-purple-800', text: 'Active Loan' },
      repaid: { color: 'bg-gray-100 text-gray-800', text: 'Repaid' },
    };
    
    const badge = badges[status] || badges.pending;
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${badge.color}`}>
        {badge.text}
      </span>
    );
  };

  if (showRequestForm) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-2xl mx-auto">
          <div className="mb-4">
            <button
              onClick={() => setShowRequestForm(false)}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              ← Back to Dashboard
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 mb-4">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Request a Loan</h1>

            <LoanPackageSelector
              onSelectPackage={(amount, interestRate, totalRepayment) => {
                setSelectedLoan({ amount, interestRate, totalRepayment });
              }}
            />

            {selectedLoan && (
              <div className="mt-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Phone Number
                  </label>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="(123) 456-7890"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <button
                  onClick={handleSubmitLoanRequest}
                  className="w-full py-3 px-6 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Submit Loan Request
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Borrower Dashboard</h1>
              <p className="text-sm text-gray-600">{user?.email}</p>
            </div>
            <button
              onClick={signOut}
              className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="mb-6">
          <button
            onClick={() => setShowRequestForm(true)}
            className="w-full sm:w-auto py-3 px-6 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-lg"
          >
            + Request New Loan
          </button>
        </div>

        {/* Loans List */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Your Loan Requests</h2>
          
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : loans.length === 0 ? (
            <div className="bg-white rounded-xl shadow p-8 text-center">
              <p className="text-gray-600">No loan requests yet. Click above to request your first loan!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {loans.map((loan) => (
                <div key={loan.id} className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="text-2xl font-bold text-gray-900">
                        ${loan.amount.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-600">
                        {loan.interestRate}% interest • 14 days
                      </div>
                    </div>
                    {getStatusBadge(loan.status)}
                  </div>

                  <div className="border-t border-gray-200 pt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Total Repayment:</span>
                      <span className="font-semibold">${loan.totalRepayment.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Requested:</span>
                      <span>{new Date(loan.requestedAt).toLocaleDateString()}</span>
                    </div>
                    {loan.notes && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-700">
                          <span className="font-medium">Note:</span> {loan.notes}
                        </p>
                      </div>
                    )}
                  </div>

                  {loan.status === 'collateral_requested' && (
                    <button
                      onClick={() => setShowCollateralForm(loan.id)}
                      className="mt-4 w-full py-2 px-4 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 transition-colors"
                    >
                      Submit Collateral Information
                    </button>
                  )}

                  <LoanCard loanId={loan.id} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Collateral Form Modal */}
      {showCollateralForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="max-w-md w-full">
            <CollateralSelector
              onSubmit={handleSubmitCollateral}
              onCancel={() => setShowCollateralForm(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
