import { useEffect, useState } from 'react';
import { Save, Loader2 } from 'lucide-react';
import { getAll, update } from '@/services/settings';
import type { Setting } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

function SettingsPage() {
  const [settings, setSettings] = useState<Setting[]>([]);
  const [edited, setEdited] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    try {
      setLoading(true);
      const data = await getAll();
      setSettings(data.settings);
      const init: Record<string, string> = {};
      data.settings.forEach((s) => {
        init[`${s.group}.${s.key}`] = s.value;
      });
      setEdited(init);
    } catch {
      setError('Failed to load settings.');
    } finally {
      setLoading(false);
    }
  }

  function handleChange(key: string, value: string) {
    setEdited((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSave(group: string) {
    try {
      setSaving(true);
      setError('');
      setSuccess('');

      const groupSettings = settings
        .filter((s) => s.group === group)
        .map((s) => ({
          group: s.group,
          key: s.key,
          value: edited[`${s.group}.${s.key}`] ?? s.value,
        }));

      await update(groupSettings);
      setSuccess(`"${group}" settings saved.`);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save settings.');
    } finally {
      setSaving(false);
    }
  }

  const grouped = settings.reduce<Record<string, Setting[]>>((acc, s) => {
    if (!acc[s.group]) acc[s.group] = [];
    acc[s.group].push(s);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">Configure system settings and preferences.</p>
      </div>

      {error && (
        <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
      )}
      {success && (
        <div className="rounded-lg bg-green-50 p-3 text-sm text-green-700 dark:bg-green-950 dark:text-green-400">
          {success}
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-48" />
              </CardHeader>
              <CardContent className="space-y-3">
                {Array.from({ length: 3 }).map((_, j) => (
                  <Skeleton key={j} className="h-10 w-full" />
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : Object.keys(grouped).length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No settings configured.
          </CardContent>
        </Card>
      ) : (
        Object.entries(grouped).map(([group, groupSettings]) => (
          <Card key={group}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="capitalize">{group}</CardTitle>
                  <CardDescription>
                    {groupSettings.find((s) => s.description)?.description ?? `Manage ${group} settings.`}
                  </CardDescription>
                </div>
                <Button
                  size="sm"
                  onClick={() => handleSave(group)}
                  disabled={saving}
                >
                  {saving ? (
                    <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="mr-1 h-4 w-4" />
                  )}
                  Save
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {groupSettings.map((setting) => {
                const editKey = `${setting.group}.${setting.key}`;
                const currentValue = edited[editKey] ?? setting.value;
                return (
                  <div key={setting.id}>
                    <label className="text-sm font-medium mb-1 block">
                      {setting.key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                    </label>
                    {setting.description && (
                      <p className="text-xs text-muted-foreground mb-1">{setting.description}</p>
                    )}
                    {setting.type === 'boolean' ? (
                      <Select
                        value={currentValue}
                        onValueChange={(v) => handleChange(editKey, v)}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="true">True</SelectItem>
                          <SelectItem value="false">False</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input
                        value={currentValue}
                        onChange={(e) => handleChange(editKey, e.target.value)}
                        type={setting.type === 'number' ? 'number' : 'text'}
                      />
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}

export default SettingsPage;
