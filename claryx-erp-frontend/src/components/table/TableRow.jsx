const TableRow = ({ 
  row, 
  columns, 
  selectable, 
  isSelected, 
  onSelect, 
  rowId 
}) => {
  const getAlignmentClass = (align) => {
    switch (align) {
      case 'center': return 'text-center';
      case 'right': return 'text-right';
      default: return 'text-left';
    }
  };

  const getCellContent = (column, row) => {
    if (column.render && typeof column.render === 'function') {
      return column.render(row[column.key], row);
    }
    return row[column.key] || '';
  };

  return (
    <tr className={`hover:bg-gray-50 ${isSelected ? 'bg-blue-50' : ''}`}>
      {selectable && (
        <td className="px-6 py-4 w-12">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={(e) => onSelect(rowId, e.target.checked)}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
        </td>
      )}
      {columns.map((column) => (
        <td
          key={column.key}
          className={`px-6 py-4 whitespace-nowrap text-sm text-gray-900 ${getAlignmentClass(column.align)}`}
        >
          {getCellContent(column, row)}
        </td>
      ))}
    </tr>
  );
};

export default TableRow;