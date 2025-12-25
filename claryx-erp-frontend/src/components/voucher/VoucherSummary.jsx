import React from 'react';

const VoucherSummary = ({ voucher, isBalanced }) => {
  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount || 0);
  };

  const difference = Math.abs(voucher.totals.debit - voucher.totals.credit);

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Summary</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Totals */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700">Total Debit:</span>
            <span className="text-sm font-mono text-gray-900">
              ₹ {formatAmount(voucher.totals.debit)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700">Total Credit:</span>
            <span className="text-sm font-mono text-gray-900">
              ₹ {formatAmount(voucher.totals.credit)}
            </span>
          </div>
          <div className="border-t pt-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">Difference:</span>
              <span className={`text-sm font-mono ${difference > 0 ? 'text-red-600' : 'text-green-600'}`}>
                ₹ {formatAmount(difference)}
              </span>
            </div>
          </div>
        </div>

        {/* Balance Status */}
        <div className="flex items-center justify-center">
          <div className={`inline-flex items-center px-3 py-2 rounded-full text-sm font-medium ${
            isBalanced 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            <div className={`w-2 h-2 rounded-full mr-2 ${
              isBalanced ? 'bg-green-400' : 'bg-red-400'
            }`}></div>
            {isBalanced ? 'Balanced' : 'Not Balanced'}
          </div>
        </div>

        {/* Tax Placeholder */}
        <div className="space-y-3">
          <div className="text-sm text-gray-500">
            <div className="flex justify-between items-center">
              <span>Tax Amount:</span>
              <span className="font-mono">₹ 0.00</span>
            </div>
            <div className="text-xs text-gray-400 mt-1">
              (Tax calculation not implemented)
            </div>
          </div>
        </div>
      </div>

      {/* Validation Messages */}
      {!isBalanced && voucher.totals.debit > 0 && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-800">
                Voucher is not balanced. Debit and Credit totals must be equal.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VoucherSummary;