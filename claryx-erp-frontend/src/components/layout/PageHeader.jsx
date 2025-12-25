const PageHeader = ({ 
  title, 
  primaryActions = [], 
  secondaryActions = [] 
}) => {
  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
        
        <div className="flex items-center space-x-3">
          {secondaryActions.map((action, index) => (
            <button
              key={index}
              onClick={action.onClick}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              {action.label}
            </button>
          ))}
          
          {primaryActions.map((action, index) => (
            <button
              key={index}
              onClick={action.onClick}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
            >
              {action.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PageHeader;