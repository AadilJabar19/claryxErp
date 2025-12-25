import React from 'react';
import { VOUCHER_TYPES, VOUCHER_STATUS } from './voucherTypes';

const VoucherHeader = ({ voucher, onFieldChange, canEdit }) => {
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case VOUCHER_STATUS.DRAFT:
        return 'bg-yellow-100 text-yellow-800';
      case VOUCHER_STATUS.POSTED:
        return 'bg-green-100 text-green-800';
      case VOUCHER_STATUS.REVERSED:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Voucher Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Voucher Type
          </label>
          <select
            value={voucher.type}
            onChange={(e) => onFieldChange('type', e.target.value)}
            disabled={!canEdit}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
          >
            {Object.entries(VOUCHER_TYPES).map(([key, value]) => (
              <option key={key} value={value}>
                {value}
              </option>
            ))}
          </select>
        </div>

        {/* Voucher Number */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Voucher Number
          </label>
          <input
            type="text"
            value={voucher.number}
            onChange={(e) => onFieldChange('number', e.target.value)}
            disabled={!canEdit}
            placeholder="Auto-generated"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
          />
        </div>

        {/* Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Date
          </label>
          <input
            type="date"
            value={voucher.date}
            onChange={(e) => onFieldChange('date', e.target.value)}
            disabled={!canEdit}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
          />
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <div className="flex items-center h-10">
            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeClass(voucher.status)}`}>
              {voucher.status}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoucherHeader;