import { createContext, useContext, useState } from 'react';
import { PERIOD_STATUS } from '../config/constants';

const PeriodContext = createContext();

export const PeriodProvider = ({ children }) => {
  const [period, setPeriod] = useState({
    id: 1,
    name: 'FY 2024-25',
    start_date: '2024-04-01',
    end_date: '2025-03-31',
    status: PERIOD_STATUS.OPEN
  });

  return (
    <PeriodContext.Provider value={{ period, setPeriod }}>
      {children}
    </PeriodContext.Provider>
  );
};

export const usePeriodContext = () => {
  const context = useContext(PeriodContext);
  if (!context) {
    throw new Error('usePeriodContext must be used within PeriodProvider');
  }
  return context;
};