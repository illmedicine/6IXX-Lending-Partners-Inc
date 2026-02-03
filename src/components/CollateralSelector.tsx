import { useState } from 'react';
import { COLLATERAL_OPTIONS, CollateralType } from '@/types';

interface CollateralSelectorProps {
  onSubmit: (collateralType: CollateralType, details: string) => void;
  onCancel: () => void;
}

export default function CollateralSelector({ onSubmit, onCancel }: CollateralSelectorProps) {
  const [selectedType, setSelectedType] = useState<CollateralType | null>(null);
  const [details, setDetails] = useState('');

  const handleSubmit = () => {
    if (!selectedType || !details.trim()) {
      alert('Please select a collateral type and provide details');
      return;
    }
    onSubmit(selectedType, details);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4">
        Submit Collateral Information
      </h3>

      <div className="space-y-3 mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Collateral Type
        </label>
        
        {COLLATERAL_OPTIONS.map((option) => (
          <button
            key={option}
            onClick={() => setSelectedType(option)}
            className={`w-full p-3 rounded-lg border-2 transition-all text-left ${
              selectedType === option
                ? 'border-blue-600 bg-blue-50'
                : 'border-gray-200 hover:border-blue-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-medium text-gray-900">{option}</span>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                selectedType === option
                  ? 'border-blue-600 bg-blue-600'
                  : 'border-gray-300'
              }`}>
                {selectedType === option && (
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Collateral Details
        </label>
        <textarea
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          placeholder="Provide detailed information about your collateral (make, model, condition, estimated value, etc.)"
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          rows={4}
        />
      </div>

      <div className="flex gap-3">
        <button
          onClick={handleSubmit}
          className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          Submit Collateral
        </button>
        <button
          onClick={onCancel}
          className="flex-1 py-3 px-4 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
