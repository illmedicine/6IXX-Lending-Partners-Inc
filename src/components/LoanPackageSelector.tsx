import { useState } from 'react';
import { LOAN_PACKAGES, calculateTotalRepayment } from '@/types';

interface LoanPackageSelectorProps {
  onSelectPackage: (amount: number, interestRate: number, totalRepayment: number) => void;
}

export default function LoanPackageSelector({ onSelectPackage }: LoanPackageSelectorProps) {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);

  const handleSelect = (amount: number, interestRate: number) => {
    setSelectedAmount(amount);
    const totalRepayment = calculateTotalRepayment(amount, interestRate);
    onSelectPackage(amount, interestRate, totalRepayment);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Select Loan Amount</h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {LOAN_PACKAGES.map((pkg) => {
          const totalRepayment = calculateTotalRepayment(pkg.amount, pkg.interestRate);
          const isSelected = selectedAmount === pkg.amount;
          
          return (
            <button
              key={pkg.amount}
              onClick={() => handleSelect(pkg.amount, pkg.interestRate)}
              className={`p-4 rounded-xl border-2 transition-all text-left ${
                isSelected
                  ? 'border-blue-600 bg-blue-50 shadow-lg'
                  : 'border-gray-200 hover:border-blue-300 hover:shadow-md'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <div className="text-2xl font-bold text-gray-900">
                  ${pkg.amount.toLocaleString()}
                </div>
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                  pkg.interestRate <= 12
                    ? 'bg-green-100 text-green-700'
                    : pkg.interestRate <= 16
                    ? 'bg-yellow-100 text-yellow-700'
                    : 'bg-orange-100 text-orange-700'
                }`}>
                  {pkg.interestRate}% APR
                </div>
              </div>
              
              <div className="text-sm text-gray-600 mb-2">
                14-day term
              </div>
              
              <div className="border-t border-gray-200 pt-2 mt-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total Repayment:</span>
                  <span className="font-semibold text-gray-900">
                    ${totalRepayment.toLocaleString()}
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {selectedAmount && (
        <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-800">
            <span className="font-medium">Selected:</span> ${selectedAmount.toLocaleString()} loan
          </p>
        </div>
      )}
    </div>
  );
}
