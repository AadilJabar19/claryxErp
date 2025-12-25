import { useState, useCallback } from 'react';
import { createEmptyVoucher, VOUCHER_STATUS } from './voucherTypes';

export const useVoucherState = (initialVoucher = null, voucherType = 'Journal') => {
  const [voucher, setVoucher] = useState(
    initialVoucher || createEmptyVoucher(voucherType)
  );
  const [isReadOnly, setIsReadOnly] = useState(false);

  // Update voucher header fields
  const updateVoucherField = useCallback((field, value) => {
    setVoucher(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  // Add new line
  const addLine = useCallback(() => {
    setVoucher(prev => ({
      ...prev,
      lines: [
        ...prev.lines,
        { 
          id: Math.max(...prev.lines.map(l => l.id)) + 1,
          account: '',
          description: '',
          debit: '',
          credit: ''
        }
      ]
    }));
  }, []);

  // Remove line
  const removeLine = useCallback((lineId) => {
    setVoucher(prev => ({
      ...prev,
      lines: prev.lines.filter(line => line.id !== lineId)
    }));
  }, []);

  // Update line field
  const updateLine = useCallback((lineId, field, value) => {
    setVoucher(prev => ({
      ...prev,
      lines: prev.lines.map(line =>
        line.id === lineId ? { ...line, [field]: value } : line
      )
    }));
  }, []);

  // Calculate totals (UI only - no business logic)
  const calculateTotals = useCallback(() => {
    const totals = voucher.lines.reduce(
      (acc, line) => ({
        debit: acc.debit + (parseFloat(line.debit) || 0),
        credit: acc.credit + (parseFloat(line.credit) || 0)
      }),
      { debit: 0, credit: 0 }
    );
    
    setVoucher(prev => ({ ...prev, totals }));
  }, [voucher.lines]);

  // Check if voucher is balanced
  const isBalanced = voucher.totals.debit === voucher.totals.credit && voucher.totals.debit > 0;

  // Check if voucher can be edited
  const canEdit = voucher.status === VOUCHER_STATUS.DRAFT && !isReadOnly;

  return {
    voucher,
    setVoucher,
    isReadOnly,
    setIsReadOnly,
    canEdit,
    isBalanced,
    updateVoucherField,
    addLine,
    removeLine,
    updateLine,
    calculateTotals
  };
};