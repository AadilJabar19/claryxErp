import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import ContentLayout from '../layouts/ContentLayout';

const Dashboard = () => (
  <ContentLayout title="Dashboard">
    <div className="text-gray-600">Dashboard content will be implemented here.</div>
  </ContentLayout>
);

const Router = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/*" element={<MainLayout />}>
          <Route index element={<Dashboard />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default Router;