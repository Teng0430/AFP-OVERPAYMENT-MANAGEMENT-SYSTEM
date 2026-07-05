import { useEffect, useState } from 'react';
import { AlertTriangle, Info, XCircle, CheckCheck, Trash2, Eye, EyeOff } from 'lucide-react';
import { list, markRead, markAllRead } from '@/services/alerts';
import type { Alert } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';

const severityConfig: Record<string, { color: string; bg: string; icon: React.ReactNode }> = {
  critical: {
    color: 'bg-red-100 text-red-800 border-red-200',
    bg: 'border-l-red-500',
    icon: <XCircle className="h-5 w-5 text-red-500" />,
  },
  warning: {
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    bg: 'border-l-yellow-500',
    icon: <AlertTriangle className="h-5 w-5 text-yellow-500" />,
  },
  info: {
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    bg: 'border-l-blue-500',
    icon: <Info className="h-5 w-5 text-blue-500" />,
  },
};

function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('all');

  useEffect(() => {
    fetchAlerts();
  }, []);

  async function fetchAlerts() {
    try {
      setLoading(true);
      const data = await list();
      setAlerts(data.alerts);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }

  async function handleMarkRead(id: number) {
    try {
      await markRead(id);
      setAlerts((prev) =>
        prev.map((a) => (a.id === id ? { ...a, is_read: true, read_at: new Date().toISOString() } : a)),
      );
    } catch {
      // silent
    }
  }

  async function handleMarkAllRead() {
    try {
      await markAllRead();
      setAlerts((prev) => prev.map((a) => ({ ...a, is_read: true, read_at: new Date().toISOString() })));
    } catch {
      // silent
    }
  }

  function handleDelete(id: number) {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  }

  const filteredAlerts = tab === 'unread' ? alerts.filter((a) => !a.is_read) : alerts;
  const unreadCount = alerts.filter((a) => !a.is_read).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Alerts</h1>
          <p className="text-sm text-muted-foreground">
            Notifications and system alerts. {unreadCount > 0 && `${unreadCount} unread`}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={handleMarkAllRead}>
            <CheckCheck className="mr-1 h-4 w-4" /> Mark All Read
          </Button>
        )}
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="all">
            All <Badge variant="secondary" className="ml-1">{alerts.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="unread">
            Unread {unreadCount > 0 && <Badge className="ml-1">{unreadCount}</Badge>}
          </TabsTrigger>
        </TabsList>

        <TabsContent value={tab} className="mt-4 space-y-3">
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-24 w-full rounded-lg" />
              ))}
            </div>
          ) : filteredAlerts.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <CheckCheck className="h-12 w-12 text-muted-foreground mb-3" />
                <p className="text-lg font-medium text-muted-foreground">No alerts</p>
                <p className="text-sm text-muted-foreground">
                  {tab === 'unread' ? 'All alerts have been read.' : 'No alerts to display.'}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredAlerts.map((alert) => {
              const cfg = severityConfig[alert.severity] ?? severityConfig.info;
              return (
                <Card
                  key={alert.id}
                  className={`border-l-4 ${cfg.bg} ${!alert.is_read ? 'bg-muted/30' : ''}`}
                >
                  <CardContent className="flex items-start gap-4 p-4">
                    <div className="mt-0.5">{cfg.icon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-sm">{alert.title}</h3>
                        <Badge variant="outline" className={`text-xs ${cfg.color}`}>
                          {alert.severity}
                        </Badge>
                        {!alert.is_read && (
                          <Badge variant="secondary" className="text-xs">New</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{alert.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(alert.created_at).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {!alert.is_read ? (
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Mark as read"
                          onClick={() => handleMarkRead(alert.id)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      ) : (
                        <Button variant="ghost" size="icon" disabled className="opacity-30">
                          <EyeOff className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Delete"
                        onClick={() => handleDelete(alert.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default AlertsPage;
