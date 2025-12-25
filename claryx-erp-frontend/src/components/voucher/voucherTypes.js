// Voucher Types
export const VOUCHER_TYPES = {
  SALES: 'Sales',
  PURCHASE: 'Purchase', 
  JOURNAL: 'Journal',
  RECEIPT: 'Receipt',
  PAYMENT: 'Payment',
  CONTRA: 'Contra'
};

// Voucher Status
export const VOUCHER_STATUS = {
  DRAFT: 'Draft',
  POSTED: 'Posted',
  REVERSED: 'Reversed'
};

// Default voucher structure
export const createEmptyVoucher = (type) => ({
  id: null,
  type,
  number: '',
  date: new Date().toISOString().split('T')[0],
  status: VOUCHER_STATUS.DRAFT,
  lines: [
    { id: 1, account: '', description: '', debit: '', credit: '' }
  ],
  totals: {
    debit: 0,
    credit: 0
  }
});

// Validation rules
export const VOUCHER_RULES = {
  MIN_LINES: 2,
  REQUIRED_FIELDS: ['type', 'number', 'date'],
  LINE_REQUIRED_FIELDS: ['account']
};