import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  UserPlus,
  Upload,
  Activity,
  Wallet,
  BarChart3,
  Bell,
  ScrollText,
  Shield,
  Settings,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useSidebar } from '@/contexts/SidebarContext';

const navItems = [
  { label: 'Dashboard', path: '/', icon: LayoutDashboard },
  { label: 'Pensioners', path: '/pensioners', icon: Users },
  { label: 'Add Pensioner', path: '/pensioners/add', icon: UserPlus },
  { label: 'Upload Reports', path: '/upload', icon: Upload },
  { label: 'Monitoring', path: '/monitoring', icon: Activity },
  { label: 'Recovery Ledger', path: '/recovery-ledger', icon: Wallet },
  { label: 'Reports', path: '/reports', icon: BarChart3 },
  { label: 'Alerts', path: '/alerts', icon: Bell },
  { label: 'Activity Logs', path: '/activity-logs', icon: ScrollText },
  { label: 'User Management', path: '/users', icon: Shield },
  { label: 'Settings', path: '/settings', icon: Settings },
] as const;

function Sidebar() {
  const { collapsed, toggleCollapsed, mobileOpen, setMobileOpen } = useSidebar();

  return (
    <div
      className={cn(
        'relative flex h-full flex-col bg-afp-navy text-white transition-all duration-300',
        collapsed ? 'w-16' : 'w-64',
      )}
    >
      {/* Branding */}
      <div className="flex h-16 shrink-0 items-center justify-center border-b border-white/10">
        {collapsed ? (
          <span className="text-xl font-bold tracking-wider">AFP</span>
        ) : (
          <div className="text-center">
            <div className="text-lg font-bold tracking-wider">AFP</div>
            <div className="text-[10px] font-medium uppercase tracking-widest text-afp-gold">
              Finance Center
            </div>
          </div>
        )}
      </div>

      {/* Mobile close button */}
      {mobileOpen && (
        <button
          onClick={() => setMobileOpen(false)}
          className="absolute right-2 top-2 rounded p-1 text-white/60 hover:text-white lg:hidden"
          aria-label="Close sidebar"
        >
          <X className="h-5 w-5" />
        </button>
      )}

      {/* Navigation */}
      <ScrollArea className="flex-1">
        <nav className="space-y-1 p-2">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              title={collapsed ? item.label : undefined}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  collapsed && 'justify-center px-2',
                  isActive
                    ? 'bg-afp-blue text-afp-gold'
                    : 'text-white/80 hover:bg-afp-blue/50 hover:text-afp-gold',
                )
              }
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </NavLink>
          ))}
        </nav>
      </ScrollArea>

      {/* Collapse toggle (desktop only) */}
      <div className="hidden shrink-0 border-t border-white/10 p-2 lg:block">
        <button
          onClick={toggleCollapsed}
          className="flex w-full items-center justify-center rounded-lg px-3 py-2 text-white/60 transition-colors hover:bg-afp-blue/50 hover:text-white"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? (
            <ChevronRight className="h-5 w-5" />
          ) : (
            <ChevronLeft className="h-5 w-5" />
          )}
        </button>
      </div>
    </div>
  );
}

export default Sidebar;
