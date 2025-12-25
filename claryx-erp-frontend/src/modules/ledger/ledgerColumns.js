export const ledgerColumns = [
  {
    key: 'name',
    label: 'Ledger Name',
    sortable: true,
    align: 'left'
  },
  {
    key: 'group',
    label: 'Group',
    sortable: true,
    align: 'left'
  },
  {
    key: 'openingBalance',
    label: 'Opening Balance',
    sortable: true,
    align: 'right',
    render: (value) => value ? `₹${Number(value).toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '₹0.00'
  },
  {
    key: 'balanceType',
    label: 'Balance Type',
    sortable: false,
    align: 'center',
    render: (value) => (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
        value === 'Dr' 
          ? 'bg-red-100 text-red-800' 
          : 'bg-green-100 text-green-800'
      }`}>
        {value}
      </span>
    )
  },
  {
    key: 'status',
    label: 'Status',
    sortable: false,
    align: 'center',
    render: (value) => (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
        value === 'Active' 
          ? 'bg-green-100 text-green-800' 
          : 'bg-gray-100 text-gray-800'
      }`}>
        {value}
      </span>
    )
  }
];