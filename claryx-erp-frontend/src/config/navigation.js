export const NAVIGATION_ITEMS = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    path: '/',
    icon: 'home'
  },
  {
    id: 'vouchers',
    label: 'Vouchers',
    icon: 'document',
    children: [
      { id: 'sales', label: 'Sales', path: '/vouchers/sales' },
      { id: 'purchase', label: 'Purchase', path: '/vouchers/purchase' },
      { id: 'receipt', label: 'Receipt', path: '/vouchers/receipt' },
      { id: 'payment', label: 'Payment', path: '/vouchers/payment' }
    ]
  },
  {
    id: 'reports',
    label: 'Reports',
    icon: 'chart',
    children: [
      { id: 'ledger', label: 'Ledger', path: '/reports/ledger' },
      { id: 'trial-balance', label: 'Trial Balance', path: '/reports/trial-balance' },
      { id: 'tax-summary', label: 'Tax Summary', path: '/reports/tax-summary' },
      { id: 'gstr1', label: 'GSTR-1', path: '/reports/gst/gstr1' },
      { id: 'gstr3b', label: 'GSTR-3B', path: '/reports/gst/gstr3b' },
      { id: 'hsn', label: 'HSN Summary', path: '/reports/gst/hsn' }
    ]
  },
  {
    id: 'masters',
    label: 'Masters',
    icon: 'database',
    children: [
      { id: 'chart-of-accounts', label: 'Chart of Accounts', path: '/masters/chart-of-accounts' },
      { id: 'ledgers', label: 'Ledgers', path: '/masters/ledgers' },
      { id: 'items', label: 'Items', path: '/masters/items' }
    ]
  }
];