import PageHeader from '../components/layout/PageHeader';

const ContentLayout = ({ 
  title, 
  primaryActions = [], 
  secondaryActions = [], 
  children 
}) => {
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <PageHeader 
        title={title}
        primaryActions={primaryActions}
        secondaryActions={secondaryActions}
      />
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

export default ContentLayout;