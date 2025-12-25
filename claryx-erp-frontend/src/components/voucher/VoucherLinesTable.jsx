import React from 'react';

const VoucherLinesTable = ({ 
  lines, 
  onLineChange, 
  onAddLine, 
  onRemoveLine, 
  canEdit 
}) => {
  const handleKeyDown = (e, lineId, field) => {
    if (e.key === 'Tab' && !e.shiftKey) {
      // Auto-add new line when tabbing from last field of last row
      const isLastLine = lineId === Math.max(...lines.map(l => l.id));
      const isLastField = field === 'credit';
      
      if (isLastLine && isLastField && canEdit) {
        e.preventDefault();
        onAddLine();
        // Focus will be handled by React after re-render
      }
    }
  };

  const formatAmount = (value) => {
    if (!value) return '';
    const num = parseFloat(value);
    return isNaN(num) ? value : num.toFixed(2);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg mb-6">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Voucher Lines</h3>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-8">
                #
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Account
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Description
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                Debit
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                Credit
              </th>
              {canEdit && (
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
                  Action
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {lines.map((line, index) => (
              <tr key={line.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {index + 1}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="text"
                    value={line.account}
                    onChange={(e) => onLineChange(line.id, 'account', e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, line.id, 'account')}
                    disabled={!canEdit}
                    placeholder="Select account..."
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="text"
                    value={line.description}
                    onChange={(e) => onLineChange(line.id, 'description', e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, line.id, 'description')}
                    disabled={!canEdit}
                    placeholder="Description..."
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="number"
                    step="0.01"
                    value={line.debit}
                    onChange={(e) => onLineChange(line.id, 'debit', e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, line.id, 'debit')}
                    onBlur={(e) => onLineChange(line.id, 'debit', formatAmount(e.target.value))}
                    disabled={!canEdit}
                    className="w-full px-2 py-1 text-sm text-right border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="number"
                    step="0.01"
                    value={line.credit}
                    onChange={(e) => onLineChange(line.id, 'credit', e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, line.id, 'credit')}
                    onBlur={(e) => onLineChange(line.id, 'credit', formatAmount(e.target.value))}
                    disabled={!canEdit}
                    className="w-full px-2 py-1 text-sm text-right border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100"
                  />
                </td>
                {canEdit && (
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    {lines.length > 1 && (
                      <button
                        onClick={() => onRemoveLine(line.id)}
                        className="text-red-600 hover:text-red-800 text-sm"
                        title="Remove line"
                      >
                        ×
                      </button>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {canEdit && (
        <div className="px-6 py-4 border-t border-gray-200">
          <button
            onClick={onAddLine}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            + Add Line
          </button>
        </div>
      )}
    </div>
  );
};

export default VoucherLinesTable;