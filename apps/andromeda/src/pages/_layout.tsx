import { BaseLayout } from '@/layouts/BaseLayout';
import { Outlet } from 'react-router';

const RootLayout = () => {
  return (
    <BaseLayout>
      <Outlet />
    </BaseLayout>
  );
};

export default RootLayout;
