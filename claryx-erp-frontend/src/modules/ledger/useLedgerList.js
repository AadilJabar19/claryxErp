import { useState, useCallback } from 'react';
import { TABLE_STATES } from '../../components/table/tableTypes';

export const useLedgerList = () => {
  const [status, setStatus] = useState(TABLE_STATES.SUCCESS);
  const [data, setData] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [groupFilter, setGroupFilter] = useState('');
  const [sort, setSort] = useState({ field: null, direction: 'asc' });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 25,
    total: 0
  });

  const buildApiRequest = useCallback(() => {
    const params = {
      page: pagination.page,
      limit: pagination.limit,
      search: searchQuery || undefined,
      group: groupFilter || undefined,
      sortBy: sort.field || undefined,
      sortOrder: sort.field ? sort.direction : undefined
    };

    // Remove undefined values
    return Object.fromEntries(
      Object.entries(params).filter(([_, value]) => value !== undefined)
    );
  }, [pagination, searchQuery, groupFilter, sort]);

  const handleSearch = useCallback((query) => {
    setSearchQuery(query);
    setPagination(prev => ({ ...prev, page: 1 }));
  }, []);

  const handleGroupFilter = useCallback((group) => {
    setGroupFilter(group);
    setPagination(prev => ({ ...prev, page: 1 }));
  }, []);

  const handleSort = useCallback((sortConfig) => {
    setSort(sortConfig);
    setPagination(prev => ({ ...prev, page: 1 }));
  }, []);

  const handlePageChange = useCallback((page) => {
    setPagination(prev => ({ ...prev, page }));
  }, []);

  const refresh = useCallback(() => {
    setStatus(TABLE_STATES.LOADING);
    // API call would go here
    // For now, just reset to success state
    setTimeout(() => {
      setStatus(TABLE_STATES.SUCCESS);
    }, 500);
  }, []);

  return {
    status,
    data,
    searchQuery,
    groupFilter,
    sort,
    pagination,
    actions: {
      handleSearch,
      handleGroupFilter,
      handleSort,
      handlePageChange,
      refresh
    },
    buildApiRequest
  };
};