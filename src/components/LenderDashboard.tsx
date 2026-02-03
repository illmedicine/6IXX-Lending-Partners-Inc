import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { LoanRequest } from '@/types';
import { getAllLoans, updateLoanStatus } from '@/lib/firestore';
import LoanCard from '@/components/LoanCard';

export default function LenderDashboard() {
  const { user, signOut } = useAuth();
  const [loans, setLoans] = useState<LoanRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'active'>('pending');

  useEffect(() => {
    loadLoans();
  }, []);

  const loadLoans = async () => {
    setLoading(true);
    try {
      const allLoans = await getAllLoans();
      setLoans(allLoans);
    } catch (error) {
      console.error('Error loading loans:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (loanId: string) => {
    if (!user) return;

    try {
      await updateLoanStatus(loanId, 'approved', user.uid);
      alert('Loan approved successfully!');
      loadLoans();
    } catch (error) {
      console.error('Error approving loan:', error);
      alert('Failed to approve loan');
    }
  };

  const handleReject = async (loanId: string) => {
    if (!user) return;

    const reason = prompt('Please provide a reason for rejection (optional):');
    
    try {
      await updateLoanStatus(loanId, 'rejected', user.uid, reason || undefined);
      alert('Loan rejected');
      loadLoans();
    } catch (error) {
      console.error('Error rejecting loan:', error);
      alert('Failed to reject loan');
    }
  };

  const handleRequestCollateral = async (loanId: string) => {
    if (!user) return;

    const message = prompt('Add a message to the borrower about collateral (optional):');
    
    try {
      await updateLoanStatus(loanId, 'collateral_requested', user.uid, message || 'Please provide collateral information');
      alert('Collateral request sent to borrower');
      loadLoans();
    } catch (error) {
      console.error('Error requesting collateral:', error);
      alert('Failed to request collateral');
    }
  };

  const filteredLoans = loans.filter(loan => {
    if (filter === 'all') return true;
    if (filter === 'pending') return loan.status === 'pending' || loan.status === 'collateral_submitted';
    if (filter === 'approved') return loan.status === 'approved';
    if (filter === 'active') return loan.status === 'active';
    return true;
  });

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { color: string; text: string }> = {
      pending: { color: 'bg-yellow-100 text-yellow-800', text: 'Pending' },
      approved: { color: 'bg-green-100 text-green-800', text: 'Approved' },
      rejected: { color: 'bg-red-100 text-red-800', text: 'Rejected' },
      collateral_requested: { color: 'bg-orange-100 text-orange-800', text: 'Collateral Requested' },
      collateral_submitted: { color: 'bg-blue-100 text-blue-800', text: 'Collateral Submitted' },
      active: { color: 'bg-purple-100 text-purple-800', text: 'Active' },
      repaid: { color: 'bg-gray-100 text-gray-800', text: 'Repaid' },
    };
    
    const badge = badges[status] || badges.pending;
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${badge.color}`}>
        {badge.text}
      </span>
    );
  };

  const stats = {
    pending: loans.filter(l => l.status === 'pending' || l.status === 'collateral_submitted').length,
    approved: loans.filter(l => l.status === 'approved').length,
    active: loans.filter(l => l.status === 'active').length,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Lender Dashboard</h1>
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

      {/* Stats */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow p-4">
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            <div className="text-sm text-gray-600">Pending Review</div>
          </div>
          <div className="bg-white rounded-xl shadow p-4">
            <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
            <div className="text-sm text-gray-600">Approved</div>
          </div>
          <div className="bg-white rounded-xl shadow p-4">
            <div className="text-2xl font-bold text-purple-600">{stats.active}</div>
            <div className="text-sm text-gray-600">Active Loans</div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap ${
              filter === 'pending'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Pending ({stats.pending})
          </button>
          <button
            onClick={() => setFilter('approved')}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap ${
              filter === 'approved'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Approved ({stats.approved})
          </button>
          <button
            onClick={() => setFilter('active')}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap ${
              filter === 'active'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Active ({stats.active})
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap ${
              filter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            All ({loans.length})
          </button>
        </div>

        {/* Loans List */}
        <div>
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredLoans.length === 0 ? (
            <div className="bg-white rounded-xl shadow p-8 text-center">
              <p className="text-gray-600">No loans found in this category.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredLoans.map((loan) => (
                <div key={loan.id} className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-xs font-mono bg-purple-50 text-purple-700 px-3 py-1 rounded-full border border-purple-200">
                          LOAN-{loan.id.substring(0, 8).toUpperCase()}
                        </span>
                        {getStatusBadge(loan.status)}
                      </div>
                      <div className="text-2xl font-bold text-gray-900">
                        ${loan.amount.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-600">
                        {loan.borrowerName} • {loan.borrowerPhone}
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-4 space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Interest Rate:</span>
                      <span className="font-semibold">{loan.interestRate}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Total Repayment:</span>
                      <span className="font-semibold">${loan.totalRepayment.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Requested:</span>
                      <span>{new Date(loan.requestedAt).toLocaleDateString()}</span>
                    </div>
                    {loan.collateralType && (
                      <>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Collateral Type:</span>
                          <span className="font-semibold">{loan.collateralType}</span>
                        </div>
                        {loan.collateralDetails && (
                          <div className="mt-2 p-3 bg-blue-50 rounded-lg">
                            <p className="text-sm text-gray-700">
                              <span className="font-medium">Collateral Details:</span><br />
                              {loan.collateralDetails}
                            </p>
                          </div>
                        )}
                      </>
                    )}
                    {loan.notes && (
                      <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-700">
                          <span className="font-medium">Note:</span> {loan.notes}
                        </p>
                      </div>
                    )}
                  </div>

                  {(loan.status === 'pending' || loan.status === 'collateral_submitted') && (
                    <div className="flex gap-2 mb-4">
                      <button
                        onClick={() => handleApprove(loan.id)}
                        className="flex-1 py-2 px-4 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleRequestCollateral(loan.id)}
                        className="flex-1 py-2 px-4 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 transition-colors"
                      >
                        Request Collateral
                      </button>
                      <button
                        onClick={() => handleReject(loan.id)}
                        className="flex-1 py-2 px-4 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
                      >
                        Reject
                      </button>
                    </div>
                  )}

                  <LoanCard loanId={loan.id} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
