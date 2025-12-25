import { useState } from 'react';
import { NAVIGATION_ITEMS } from '../../config/navigation';
import { SIDEBAR_WIDTH } from '../../config/constants';

const Sidebar = () => {
  const [expandedItems, setExpandedItems] = useState({});

  const toggleExpanded = (itemId) => {
    setExpandedItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  const renderNavItem = (item) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems[item.id];

    return (
      <div key={item.id}>
        <div 
          className={`flex items-center justify-between px-4 py-2 text-sm cursor-pointer hover:bg-gray-100 ${
            hasChildren ? '' : 'text-gray-700'
          }`}
          onClick={() => hasChildren ? toggleExpanded(item.id) : null}
        >
          <div className="flex items-center">
            <span className="font-medium">{item.label}</span>
          </div>
          {hasChildren && (
            <svg 
              className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          )}
        </div>
        
        {hasChildren && isExpanded && (
          <div className="ml-4 border-l border-gray-200">
            {item.children.map(child => (
              <div 
                key={child.id}
                className="pl-4 py-2 text-sm text-gray-600 hover:bg-gray-50 cursor-pointer"
              >
                {child.label}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`${SIDEBAR_WIDTH} bg-white border-r border-gray-200 h-full overflow-y-auto`}>
      <div className="py-4">
        {NAVIGATION_ITEMS.map(renderNavItem)}
      </div>
    </div>
  );
};

export default Sidebar;