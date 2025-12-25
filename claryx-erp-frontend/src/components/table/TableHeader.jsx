import { SORT_DIRECTIONS } from './tableTypes';

const TableHeader = ({ 
  columns, 
  sort, 
  onSort, 
  selectable, 
  selectedRows, 
  totalRows, 
  onSelectAll 
}) => {
  const isAllSelected = selectedRows.length === totalRows && totalRows > 0;
  const isIndeterminate = selectedRows.length > 0 && selectedRows.length < totalRows;

  const getSortIcon = (column) => {
    if (!column.sortable) return null;
    
    if (sort.field !== column.key) {
      return (
        <svg className="w-4 h-4 ml-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      );
    }

    return sort.direction === SORT_DIRECTIONS.ASC ? (
      <svg className="w-4 h-4 ml-1 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
      </svg>
    ) : (
      <svg className="w-4 h-4 ml-1 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    );
  };

  const getAlignmentClass = (align) => {
    switch (align) {
      case 'center': return 'text-center';
      case 'right': return 'text-right';
      default: return 'text-left';
    }
  };

  return (
    <thead className="bg-gray-50">
      <tr>
        {selectable && (
          <th className="px-6 py-3 w-12">
            <input
              type="checkbox"
              checked={isAllSelected}
              ref={input => {
                if (input) input.indeterminate = isIndeterminate;
              }}
              onChange={(e) => onSelectAll(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
          </th>
        )}
        {columns.map((column) => (
          <th
            key={column.key}
            className={`px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider ${getAlignmentClass(column.align)} ${
              column.sortable ? 'cursor-pointer hover:bg-gray-100' : ''
            }`}
            onClick={column.sortable ? () => onSort(column.key) : undefined}
          >
            <div className="flex items-center">
              <span>{column.label}</span>
              {getSortIcon(column)}
            </div>
          </th>
        ))}
      </tr>
    </thead>
  );
};

export default TableHeader;