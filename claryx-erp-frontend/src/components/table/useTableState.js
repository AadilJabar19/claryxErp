import { useState, useCallback, useMemo } from 'react';
import { TABLE_STATES, SORT_DIRECTIONS } from './tableTypes';

export const useTableState = ({
  initialSort = { field: null, direction: SORT_DIRECTIONS.ASC },
  initialPagination = { page: 1, limit: 10, total: 0 },
  onSortChange,
  onPageChange,
  onSearchChange,
  onSelectionChange
}) => {
  const [selectedRows, setSelectedRows] = useState([]);
  const [sort, setSort] = useState(initialSort);
  const [pagination, setPagination] = useState(initialPagination);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSort = useCallback((field) => {
    const newSort = {
      field,
      direction: sort.field === field && sort.direction === SORT_DIRECTIONS.ASC 
        ? SORT_DIRECTIONS.DESC 
        : SORT_DIRECTIONS.ASC
    };
    setSort(newSort);
    onSortChange?.(newSort);
  }, [sort, onSortChange]);

  const handlePageChange = useCallback((page) => {
    const newPagination = { ...pagination, page };
    setPagination(newPagination);
    onPageChange?.(newPagination);
  }, [pagination, onPageChange]);

  const handleSearch = useCallback((query) => {
    setSearchQuery(query);
    setPagination(prev => ({ ...prev, page: 1 }));
    onSearchChange?.(query);
  }, [onSearchChange]);

  const handleRowSelect = useCallback((rowId, isSelected) => {
    const newSelection = isSelected 
      ? [...selectedRows, rowId]
      : selectedRows.filter(id => id !== rowId);
    setSelectedRows(newSelection);
    onSelectionChange?.(newSelection);
  }, [selectedRows, onSelectionChange]);

  const handleSelectAll = useCallback((rowIds, isSelected) => {
    const newSelection = isSelected ? rowIds : [];
    setSelectedRows(newSelection);
    onSelectionChange?.(newSelection);
  }, [onSelectionChange]);

  const clearSelection = useCallback(() => {
    setSelectedRows([]);
    onSelectionChange?.([]);
  }, [onSelectionChange]);

  const updatePagination = useCallback((newPagination) => {
    setPagination(newPagination);
  }, []);

  const isRowSelected = useCallback((rowId) => {
    return selectedRows.includes(rowId);
  }, [selectedRows]);

  const state = useMemo(() => ({
    selectedRows,
    sort,
    pagination,
    searchQuery
  }), [selectedRows, sort, pagination, searchQuery]);

  return {
    state,
    actions: {
      handleSort,
      handlePageChange,
      handleSearch,
      handleRowSelect,
      handleSelectAll,
      clearSelection,
      updatePagination,
      isRowSelected
    }
  };
};