import { Outlet } from 'react-router-dom';
import { AppHeader } from '@/components/layout/AppHeader';
import { Sidebar } from '@/components/layout/Sidebar';
import { Breadcrumb } from '@/components/layout/Breadcrumb';
import { Toast } from '@/components/common/Toast';

/** Shell for every authenticated screen: government header on top, navy rail on the left. */
export function AppLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-gov-bg">
      <AppHeader />
      <div className="flex flex-1">
        <Sidebar />
        <main id="main" className="min-w-0 flex-1">
          <div className="mx-auto max-w-[1280px] px-6 py-7">
            <Breadcrumb />
            <Outlet />
          </div>
        </main>
      </div>
      <Toast />
    </div>
  );
}
