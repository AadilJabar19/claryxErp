import { Outlet } from 'react-router-dom';
import { useCompanyContext } from '../hooks/useCompanyContext';
import { usePeriodContext } from '../hooks/usePeriodContext';
import Sidebar from '../components/layout/Sidebar';
import Topbar from '../components/layout/Topbar';
import LoadingState from '../components/common/LoadingState';
import ErrorState from '../components/common/ErrorState';

const MainLayout = () => {
  const { company } = useCompanyContext();
  const { period } = usePeriodContext();

  // Enforce company context availability
  if (!company) {
    return (
      <div className="h-screen flex items-center justify-center">
        <ErrorState 
          title="Company Context Missing"
          message="Company information is required to access the application."
        />
      </div>
    );
  }

  // Enforce accounting period visibility
  if (!period) {
    return (
      <div className="h-screen flex items-center justify-center">
        <ErrorState 
          title="Accounting Period Missing"
          message="Accounting period information is required to access the application."
        />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <Topbar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;