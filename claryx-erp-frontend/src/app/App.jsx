import { CompanyProvider } from '../hooks/useCompanyContext';
import { PeriodProvider } from '../hooks/usePeriodContext';
import Router from './Router';

const App = () => {
  return (
    <CompanyProvider>
      <PeriodProvider>
        <Router />
      </PeriodProvider>
    </CompanyProvider>
  );
};

export default App;