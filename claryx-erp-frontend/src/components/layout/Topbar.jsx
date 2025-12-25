import { useCompanyContext } from '../../hooks/useCompanyContext';
import { usePeriodContext } from '../../hooks/usePeriodContext';
import { PERIOD_STATUS, TOPBAR_HEIGHT } from '../../config/constants';

const Topbar = () => {
  const { company } = useCompanyContext();
  const { period } = usePeriodContext();

  return (
    <div className={`${TOPBAR_HEIGHT} bg-white border-b border-gray-200 flex items-center justify-between px-6`}>
      <div className="flex items-center space-x-4">
        <h1 className="text-lg font-semibold text-gray-900">Claryx ERP</h1>
      </div>
      
      <div className="flex items-center space-x-6">
        <div className="text-sm">
          <span className="text-gray-600">Company:</span>
          <span className="ml-2 font-medium text-gray-900">{company.name}</span>
        </div>
        
        <div className="text-sm">
          <span className="text-gray-600">Period:</span>
          <span className="ml-2 font-medium text-gray-900">{period.name}</span>
        </div>
        
        <div className="flex items-center">
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
            period.status === PERIOD_STATUS.OPEN 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {period.status === PERIOD_STATUS.OPEN ? 'Open' : 'Locked'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default Topbar;