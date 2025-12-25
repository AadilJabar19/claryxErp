import { useMemo, useEffect, useCallback } from 'react';
import { useTableState } from './useTableState';
import TableHeader from './TableHeader';
import TableRow from './TableRow';
import TableFooter from './TableFooter';
import TableSkeleton from './TableSkeleton';
import { TABLE_STATES } from './tableTypes';

const DataTable = ({
  columns = [],
  data = [],
  status = TABLE_STATES.SUCCESS,
  pagination,
  sort,
  searchQuery = '',
  selectable = false,
  onSortChange,
  onPageChange,
  onSearchChange,
  onSelectionChange,
  getRowId = (row, index) => row.id || index,
  emptyComponent: EmptyComponent,
  errorComponent: ErrorComponent,
  className = ''
}) => {
  const tableState = useTableState({
    initialSort: sort,
    initialPagination: pagination,
    onSortChange,
    onPageChange,
    onSearchChange,
    onSelectionChange
  });

  // Update internal state when external props change
  useEffect(() => {
    if (pagination) {
      tableState.actions.updatePagination(pagination);
    }
  }, [pagination]);

  useEffect(() => {
    if (searchQuery !== tableState.state.searchQuery) {
      tableState.actions.handleSearch(searchQuery);
    }
  }, [searchQuery]);

  const rowIds = useMemo(() => 
    data.map((row, index) => getRowId(row, index)), 
    [data, getRowId]
  );

  const handleSelectAll = useCallback((isSelected) => {
    tableState.actions.handleSelectAll(rowIds, isSelected);
  }, [rowIds, tableState.actions]);

  const renderContent = () => {
    switch (status) {
      case TABLE_STATES.LOADING:
        return <TableSkeleton columns={columns} />;
        
      case TABLE_STATES.EMPTY:
        return EmptyComponent ? (
          <EmptyComponent />
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">No data available</p>
          </div>
        );
        
      case TABLE_STATES.ERROR:
        return ErrorComponent ? (
          <ErrorComponent />
        ) : (
          <div className="text-center py-12">
            <p className="text-red-500">Error loading data</p>
          </div>
        );
        
      case TABLE_STATES.SUCCESS:
        return (
          <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <TableHeader
                columns={columns}
                sort={tableState.state.sort}
                onSort={tableState.actions.handleSort}
                selectable={selectable}
                selectedRows={tableState.state.selectedRows}
                totalRows={data.length}
                onSelectAll={handleSelectAll}
              />
              <tbody className="bg-white divide-y divide-gray-200">
                {data.map((row, index) => {
                  const rowId = getRowId(row, index);
                  return (
                    <TableRow
                      key={rowId}
                      row={row}
                      columns={columns}
                      selectable={selectable}
                      isSelected={tableState.actions.isRowSelected(rowId)}
                      onSelect={tableState.actions.handleRowSelect}
                      rowId={rowId}
                    />
                  );
                })}
              </tbody>
            </table>
            {pagination && (
              <TableFooter
                pagination={tableState.state.pagination}
                onPageChange={tableState.actions.handlePageChange}
              />
            )}
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className={`w-full ${className}`}>
      {renderContent()}
    </div>
  );
};

export default DataTable;