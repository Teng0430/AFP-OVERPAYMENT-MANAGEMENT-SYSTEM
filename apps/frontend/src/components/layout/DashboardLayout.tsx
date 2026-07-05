import { Suspense } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { SidebarProvider, useSidebar } from '@/contexts/SidebarContext';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import { cn } from '@/lib/utils';

function ShellLayout() {
  const { collapsed, mobileOpen, setMobileOpen } = useSidebar();

  return (
    <div className="flex h-screen overflow-hidden">
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-30 hidden transition-all duration-300 lg:block',
          collapsed ? 'w-16' : 'w-64',
        )}
      >
        <Sidebar />
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
          <aside className="fixed inset-y-0 left-0 z-50 w-64">
            <Sidebar />
          </aside>
        </div>
      )}

      <div
        className={cn(
          'flex flex-1 flex-col transition-all duration-300',
          collapsed ? 'lg:ml-16' : 'lg:ml-64',
        )}
      >
        <Header />
        <main className="flex-1 overflow-y-auto p-6 pt-20">
          <Suspense
            fallback={
              <div className="flex items-center justify-center p-8 text-muted-foreground">
                Loading...
              </div>
            }
          >
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  );
}

function DashboardLayout() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <SidebarProvider>
      <ShellLayout />
    </SidebarProvider>
  );
}

export default DashboardLayout;
