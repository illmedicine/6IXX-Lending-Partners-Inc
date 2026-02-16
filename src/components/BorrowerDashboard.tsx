import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { LoanRequest, calculateInterestRate, calculateAPR, calculateTotalRepayment } from '@/types';
import { getLoansByBorrower, submitCollateral } from '@/lib/firestore';
import LoanPackageSelector from '@/components/LoanPackageSelector';
import CollateralSelector from '@/components/CollateralSelector';
import LoanCard from '@/components/LoanCard';
import DisclosureModal from '@/components/DisclosureModal';

export default function BorrowerDashboard() {
  const { user, signOut } = useAuth();
  const [loans, setLoans] = useState<LoanRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [showDisclosure, setShowDisclosure] = useState(false);
  const [disclosureAccepted, setDisclosureAccepted] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || '');
  const [loanTermDays, setLoanTermDays] = useState(14); // Default 14 days
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
      console.log('Loading loans for borrower:', user.uid);
      const userLoans = await getLoansByBorrower(user.uid);
      console.log('Loaded loans:', userLoans);
      setLoans(userLoans);
    } catch (error: any) {
      console.error('Error loading loans:', error);
      if (error.message?.includes('index')) {
        console.error('Firestore index required. Creating index...');
        alert('Setting up database. Please wait a moment and refresh the page.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitLoanRequest = async (skipDisclosure = false) => {
    console.log('handleSubmitLoanRequest called', { 
      skipDisclosure, 
      selectedLoan, 
      phoneNumber, 
      user: !!user,
      disclosureAccepted 
    });
    
    // Require a selected loan and a signed-in user before proceeding to disclosure
    if (!selectedLoan || !user) {
      alert('Please select a loan package before submitting');
      return;
    }

    // Show the disclosure (loan terms) first — allow the modal to open even if phone
    // is empty so users can review terms. Final phone validation occurs after acceptance.
    if (!skipDisclosure && !disclosureAccepted) {
      console.log('Showing disclosure modal');
      setShowDisclosure(true);
      return;
    }

    // After disclosure acceptance (or when skipping disclosure), require phone number
    if (!phoneNumber.trim()) {
      alert('Please provide your phone number');
      return;
    }

    try {
      console.log('Submitting loan request...');
      const { submitLoanRequest } = await import('@/lib/loanService');
      const loanId = await submitLoanRequest({
        borrowerId: user.uid,
        borrowerName: user.displayName || '',
        borrowerEmail: user.email || '',
        borrowerPhone: phoneNumber,
        amount: selectedLoan.amount,
        interestRate: selectedLoan.interestRate,
        totalRepayment: selectedLoan.totalRepayment,
        term: loanTermDays,
      });

      console.log('Loan request created with ID:', loanId);
      alert(`Loan request submitted successfully!\n\nYour Loan ID: ${loanId.substring(0, 8).toUpperCase()}\n\nSave this ID for reference.`);
      setShowRequestForm(false);
      setSelectedLoan(null);
      setDisclosureAccepted(false);
      
      // Wait a moment for Firestore to sync, then reload
      setTimeout(() => {
        loadLoans();
      }, 1000);
    } catch (error: any) {
      console.error('Error submitting loan request:', error);
      alert('An error occurred: ' + (error.message || 'Please try again.'));
    }
  };

  const handleDisclosureAccept = () => {
    setDisclosureAccepted(true);
    setShowDisclosure(false);
    // Automatically proceed with submission after acceptance
    setTimeout(() => handleSubmitLoanRequest(true), 100);
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
              onSelectPackage={(amount) => {
                const newInterestRate = calculateInterestRate(loanTermDays, amount);
                const newTotalRepayment = calculateTotalRepayment(amount, newInterestRate);
                setSelectedLoan({ amount, interestRate: newInterestRate, totalRepayment: newTotalRepayment });
              }}
            />

            {selectedLoan && (
              <div className="mt-6 space-y-6">
                {/* Loan Term Slider */}
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 border-2 border-blue-200">
                  <label className="block text-sm font-bold text-gray-900 mb-3">
                    Loan Repayment Term
                  </label>
                  
                  <div className="space-y-4">
                    {/* Keypoints for notches and snapping */}
                    {/* 1, 14 (default), 30, 90 */}
                    {/** Slider input **/}
                    <input
                      type="range"
                      min="1"
                      max="90"
                      value={loanTermDays}
                      onChange={(e) => {
                        const newTerm = parseInt(e.target.value);
                        setLoanTermDays(newTerm);
                        const newInterestRate = calculateInterestRate(newTerm, selectedLoan.amount);
                        const newTotalRepayment = calculateTotalRepayment(selectedLoan.amount, newInterestRate);
                        setSelectedLoan({
                          ...selectedLoan,
                          interestRate: newInterestRate,
                          totalRepayment: newTotalRepayment
                        });
                      }}
                      onMouseUp={() => {
                        // snap on mouse release
                        const keypoints = [1, 14, 30, 90];
                        const closest = keypoints.reduce((a, b) => Math.abs(b - loanTermDays) < Math.abs(a - loanTermDays) ? b : a);
                        const threshold = 3; // days within which to snap
                        if (Math.abs(closest - loanTermDays) <= threshold) {
                          setLoanTermDays(closest);
                          const newInterestRate = calculateInterestRate(closest, selectedLoan.amount);
                          const newTotalRepayment = calculateTotalRepayment(selectedLoan.amount, newInterestRate);
                          setSelectedLoan({
                            ...selectedLoan,
                            interestRate: newInterestRate,
                            totalRepayment: newTotalRepayment
                          });
                        }
                      }}
                      onTouchEnd={() => {
                        const keypoints = [1, 14, 30, 90];
                        const closest = keypoints.reduce((a, b) => Math.abs(b - loanTermDays) < Math.abs(a - loanTermDays) ? b : a);
                        const threshold = 3;
                        if (Math.abs(closest - loanTermDays) <= threshold) {
                          setLoanTermDays(closest);
                          const newInterestRate = calculateInterestRate(closest, selectedLoan.amount);
                          const newTotalRepayment = calculateTotalRepayment(selectedLoan.amount, newInterestRate);
                          setSelectedLoan({
                            ...selectedLoan,
                            interestRate: newInterestRate,
                            totalRepayment: newTotalRepayment
                          });
                        }
                      }}
                      className="w-full h-3 bg-gradient-to-r from-green-400 via-blue-400 to-red-400 rounded-lg appearance-none cursor-pointer slider"
                      aria-label="Loan repayment term in days"
                      style={{
                        background: `linear-gradient(to right, #10b981 0%, #3b82f6 ${(14/90)*100}%, #ef4444 100%)`
                      }}
                    />

                    {/* subtle notches / marks */}
                    <div className="relative h-6">
                      {([1, 14, 30, 90] as number[]).map((kp) => {
                        const left = ((kp - 1) / (90 - 1)) * 100;
                        const isPrimary = kp === 14;
                        return (
                          <div
                            key={kp}
                            className={`absolute -bottom-1 transform -translate-x-1/2 flex flex-col items-center`}
                            style={{ left: `${left}%` }}
                          >
                            <div
                              className={`w-0.5 ${isPrimary ? 'h-5 bg-blue-400' : 'h-3 bg-gray-300'} rounded-sm`}
                            />
                            <div className={`text-[10px] mt-1 ${isPrimary ? 'text-blue-600 font-semibold' : 'text-gray-500'}`}>
                              {kp === 1 ? '1d' : kp === 14 ? '14d' : kp === 30 ? '30d' : '90d'}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="flex justify-between text-xs text-gray-600 font-medium">
                      <span>1 day</span>
                      <span className="text-blue-600 font-bold">14 days (Default)</span>
                      <span>90 days (3 months)</span>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-3xl font-bold text-gray-900">
                        {loanTermDays} day{loanTermDays !== 1 ? 's' : ''}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        {loanTermDays <= 3 && '⚡ Express Repayment - Lowest Rate!'}
                        {loanTermDays > 3 && loanTermDays <= 14 && '✓ Standard Term'}
                        {loanTermDays > 14 && loanTermDays <= 30 && '📅 Extended Term'}
                        {loanTermDays > 30 && '📆 Long-Term Financing'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Loan Summary Card */}
                <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Loan Summary</h3>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center pb-3 border-b">
                      <span className="text-gray-600">Loan Amount:</span>
                      <span className="text-xl font-bold text-gray-900">${selectedLoan.amount.toFixed(2)}</span>
                    </div>
                    
                    <div className="flex justify-between items-center pb-3 border-b">
                      <span className="text-gray-600">Repayment Term:</span>
                      <span className="text-lg font-semibold text-blue-600">{loanTermDays} days</span>
                    </div>
                    
                    <div className="flex justify-between items-center pb-3 border-b">
                      <span className="text-gray-600">Interest Rate:</span>
                      <span className={`text-lg font-semibold ${
                        selectedLoan.interestRate <= 10 ? 'text-green-600' :
                        selectedLoan.interestRate <= 20 ? 'text-blue-600' :
                        selectedLoan.interestRate <= 30 ? 'text-orange-600' : 'text-red-600'
                      }`}>
                        {selectedLoan.interestRate.toFixed(2)}%
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center pb-3 border-b">
                      <span className="text-gray-600">APR (Annual):</span>
                      <span className="text-lg font-semibold text-purple-600">
                        {calculateAPR(selectedLoan.interestRate, loanTermDays).toFixed(2)}%
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center pt-2 bg-gradient-to-r from-blue-50 to-purple-50 -mx-6 px-6 py-4 mt-4 rounded-b-xl">
                      <span className="text-lg font-bold text-gray-900">Total Repayment:</span>
                      <span className="text-2xl font-bold text-blue-600">${selectedLoan.totalRepayment.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

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
                  onClick={() => {
                    console.log('Button clicked!');
                    handleSubmitLoanRequest();
                  }}
                  className="w-full py-3 px-6 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Submit Loan Request
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Disclosure Modal (inside showRequestForm branch) */}
        <DisclosureModal
          isOpen={showDisclosure}
          onClose={() => setShowDisclosure(false)}
          onAccept={handleDisclosureAccept}
          loanAmount={selectedLoan?.amount}
          interestRate={selectedLoan?.interestRate}
          apr={selectedLoan ? calculateAPR(selectedLoan.interestRate, loanTermDays) : undefined}
          termDays={loanTermDays}
          totalRepayment={selectedLoan?.totalRepayment}
        />
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
                <div key={loan.id} className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-xs font-mono bg-blue-50 text-blue-700 px-3 py-1 rounded-full border border-blue-200">
                          ID: {loan.id.substring(0, 8).toUpperCase()}
                        </span>
                        {getStatusBadge(loan.status)}
                      </div>
                      <div className="text-2xl font-bold text-gray-900">
                        ${loan.amount.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-600 space-x-2">
                        <span className={`font-semibold ${
                          loan.interestRate <= 10 ? 'text-green-600' :
                          loan.interestRate <= 20 ? 'text-blue-600' :
                          loan.interestRate <= 30 ? 'text-orange-600' : 'text-red-600'
                        }`}>
                          {loan.interestRate}% interest
                        </span>
                        <span>•</span>
                        <span className="font-medium text-blue-600">
                          {loan.term} day{loan.term !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Total Repayment:</span>
                      <span className="font-semibold">${loan.totalRepayment.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Loan Term:</span>
                      <span className="font-semibold">{loan.term} day{loan.term !== 1 ? 's' : ''}</span>
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

      {/* Disclosure Modal */}
      <DisclosureModal
        isOpen={showDisclosure}
        onClose={() => setShowDisclosure(false)}
        onAccept={handleDisclosureAccept}
        loanAmount={selectedLoan?.amount}
        interestRate={selectedLoan?.interestRate}
        apr={selectedLoan ? calculateAPR(selectedLoan.interestRate, loanTermDays) : undefined}
        termDays={loanTermDays}
        totalRepayment={selectedLoan?.totalRepayment}
      />
    </div>
  );
}
