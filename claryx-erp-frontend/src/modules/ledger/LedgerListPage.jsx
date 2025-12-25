import React from 'react';
import PageHeader from '../../components/layout/PageHeader';
import DataTable from '../../components/table/DataTable';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import { useLedgerList } from './useLedgerList';
import { ledgerColumns } from './ledgerColumns';

const LedgerListPage = () => {
  const {
    status,
    data,
    searchQuery,
    groupFilter,
    sort,
    pagination,
    actions
  } = useLedgerList();

  const primaryActions = [
    {
      label: 'Create Ledger',
      onClick: () => {},
      disabled: true
    }
  ];

  const EmptyComponent = () => (
    <EmptyState
      title="No ledgers found"
      description="Get started by creating your first ledger account."
      actionLabel="Create Ledger"
      onAction={() => {}}
      disabled
    />
  );

  const ErrorComponent = () => (
    <ErrorState
      title="Failed to load ledgers"
      description="There was an error loading the ledger data. Please try again."
      actionLabel="Retry"
      onAction={actions.refresh}
    />
  );

  return (
    <div className="h-full flex flex-col">
      <PageHeader
        title="Chart of Accounts"
        primaryActions={primaryActions}
      />
      
      <div className="flex-1 p-6">
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search ledgers..."
              value={searchQuery}
              onChange={(e) => actions.handleSearch(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div className="sm:w-48">
            <select
              value={groupFilter}
              onChange={(e) => actions.handleGroupFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Groups</option>
              <option value="assets">Assets</option>
              <option value="liabilities">Liabilities</option>
              <option value="income">Income</option>
              <option value="expenses">Expenses</option>
            </select>
          </div>
        </div>

        <DataTable
          columns={ledgerColumns}
          data={data}
          status={status}
          pagination={pagination}
          sort={sort}
          onSortChange={actions.handleSort}
          onPageChange={actions.handlePageChange}
          emptyComponent={EmptyComponent}
          errorComponent={ErrorComponent}
          getRowId={(row) => row.id}
        />
      </div>
    </div>
  );
};

export default LedgerListPage;