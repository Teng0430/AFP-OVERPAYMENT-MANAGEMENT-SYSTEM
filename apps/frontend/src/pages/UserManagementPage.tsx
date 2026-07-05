import { useEffect, useState } from 'react';
import {
  Plus,
  Pencil,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Loader2,
} from 'lucide-react';
import { list, create, update, remove, getRoles } from '@/services/users';
import { useAuth } from '@/hooks/useAuth';
import type { User, Role } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface UserFormData {
  name: string;
  email: string;
  password: string;
  role_id: string;
  department: string;
}

const emptyForm: UserFormData = { name: '', email: '', password: '', role_id: '', department: '' };

function UserManagementPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [form, setForm] = useState<UserFormData>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const [userData, roleData] = await Promise.all([list(), getRoles()]);
      setUsers(userData.users);
      setRoles(roleData.roles);
    } catch {
      setError('Failed to load data.');
    } finally {
      setLoading(false);
    }
  }

  function openCreateDialog() {
    setEditingUser(null);
    setForm(emptyForm);
    setError('');
    setDialogOpen(true);
  }

  function openEditDialog(user: User) {
    setEditingUser(user);
    setForm({
      name: user.name,
      email: user.email,
      password: '',
      role_id: String(user.role_id ?? ''),
      department: user.department ?? '',
    });
    setError('');
    setDialogOpen(true);
  }

  async function handleSave() {
    if (!form.name || !form.email) {
      setError('Name and email are required.');
      return;
    }
    if (!editingUser && !form.password) {
      setError('Password is required for new users.');
      return;
    }

    try {
      setSaving(true);
      setError('');

      const payload: Record<string, unknown> = {
        name: form.name,
        email: form.email,
        role_id: form.role_id ? Number(form.role_id) : undefined,
        department: form.department || undefined,
      };

      if (editingUser) {
        if (form.password) payload.password = form.password;
        await update(editingUser.id, payload);
      } else {
        payload.password = form.password;
        await create(payload as { name: string; email: string; password: string; role_id: number; department?: string });
      }

      setDialogOpen(false);
      loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save user.');
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleActive(user: User) {
    try {
      await update(user.id, { is_active: !user.is_active });
      loadData();
    } catch {
      setError('Failed to toggle user status.');
    }
  }

  async function handleDelete(user: User) {
    if (currentUser?.id === user.id) {
      setError('You cannot delete your own account.');
      return;
    }
    if (!window.confirm(`Delete user "${user.name}"?`)) return;
    try {
      await remove(user.id);
      loadData();
    } catch {
      setError('Failed to delete user.');
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">User Management</h1>
          <p className="text-sm text-muted-foreground">Manage system users and roles.</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog}>
              <Plus className="mr-2 h-4 w-4" /> Add User
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingUser ? 'Edit User' : 'Add User'}</DialogTitle>
              <DialogDescription>
                {editingUser ? 'Update user details and role.' : 'Create a new user account.'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              {error && (
                <div className="rounded-lg bg-destructive/10 p-2 text-xs text-destructive">{error}</div>
              )}
              <div>
                <label className="text-sm font-medium">Name <span className="text-destructive">*</span></label>
                <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
              </div>
              <div>
                <label className="text-sm font-medium">Email <span className="text-destructive">*</span></label>
                <Input type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
              </div>
              <div>
                <label className="text-sm font-medium">
                  Password {!editingUser && <span className="text-destructive">*</span>}
                </label>
                <Input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  placeholder={editingUser ? 'Leave blank to keep current' : ''}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Role</label>
                <Select
                  value={form.role_id}
                  onValueChange={(v) => setForm((f) => ({ ...f, role_id: v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((r) => (
                      <SelectItem key={r.id} value={String(r.id)}>{r.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Department</label>
                <Input
                  value={form.department}
                  onChange={(e) => setForm((f) => ({ ...f, department: e.target.value }))}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : 'Save'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {error && !dialogOpen && (
        <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
      )}

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="space-y-3 p-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">No users found.</TableCell>
                  </TableRow>
                ) : (
                  users.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell className="font-medium">
                        {u.name}
                        {currentUser?.id === u.id && (
                          <Badge variant="secondary" className="ml-2 text-xs">You</Badge>
                        )}
                      </TableCell>
                      <TableCell>{u.email}</TableCell>
                      <TableCell>{u.role?.name ?? '-'}</TableCell>
                      <TableCell>{u.department ?? '-'}</TableCell>
                      <TableCell>
                        <Badge variant={u.is_active ? 'default' : 'secondary'}>
                          {u.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="icon" onClick={() => openEditDialog(u)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleToggleActive(u)}>
                            {u.is_active ? (
                              <ToggleRight className="h-4 w-4 text-green-500" />
                            ) : (
                              <ToggleLeft className="h-4 w-4 text-muted-foreground" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            disabled={currentUser?.id === u.id}
                            onClick={() => handleDelete(u)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default UserManagementPage;
