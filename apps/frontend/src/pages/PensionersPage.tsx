import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  type ColumnDef,
  type RowSelectionState,
  type SortingState,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import {
  Plus,
  Search,
  Trash2,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { list, remove, bulkDelete, bulkUpdate } from '@/services/pensioners';
import { formatCurrency, formatDisplayDate } from '@/lib/financial-calculations';
import { toast } from '@/hooks/use-toast';
import type { Pensioner } from '@/types';
import { RANK_OPTIONS, STATUS_OPTIONS, AGENCY_OPTIONS, CAUSE_OF_STOPPAGE_OPTIONS } from '@/types';
import type { PensionerFilters } from '@/services/pensioners';
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { PensionerViewModal } from '@/components/pensioner/PensionerViewModal';
import { PensionerActionsMenu } from '@/components/pensioner/PensionerActionsMenu';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

const statusBadgeVariant: Record<string, 'default' | 'destructive' | 'secondary' | 'outline'> = {
  recovered: 'default',
  'not-yet-recovered': 'destructive',
  'recovered-but-inc': 'secondary',
};

function PensionersPage() {
  const navigate = useNavigate();
  const [pensioners, setPensioners] = useState<Pensioner[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [perPage] = useState(10);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [search, setSearch] = useState('');
  const [rankFilter, setRankFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [agencyFilter, setAgencyFilter] = useState('');
  const [causeFilter, setCauseFilter] = useState('');
  const [viewModalId, setViewModalId] = useState<number | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const fetchPensioners = useCallback(async () => {
    try {
      setLoading(true);
      const filters: PensionerFilters = {
        page,
        per_page: perPage,
        search: search || undefined,
        rank: rankFilter ? [rankFilter] : undefined,
        status: statusFilter ? [statusFilter] : undefined,
        agency_name: agencyFilter ? [agencyFilter] : undefined,
        cause_of_stoppage: causeFilter ? [causeFilter] : undefined,
        sort_by: sorting[0]?.id,
        sort_dir: sorting[0] ? (sorting[0].desc ? 'desc' : 'asc') : undefined,
      };
      const data = await list(filters);
      setPensioners(data.pensioners);
      setTotal(data.meta.total);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load pensioners.';
      toast({ title: 'Error', description: message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [page, perPage, search, rankFilter, statusFilter, agencyFilter, causeFilter, sorting]);

  useEffect(() => {
    fetchPensioners();
  }, [fetchPensioners, page, sorting]);

  const selectedIds = useMemo(
    () => Object.keys(rowSelection).map(Number),
    [rowSelection],
  );

  const handlePrint = useCallback((id: number) => {
    const win = window.open(`/pensioners/${id}/print`, '_blank', 'width=800,height=600');
    if (win) win.focus();
  }, []);

  const confirmDelete = useCallback(async () => {
    if (deleteConfirmId === null) return;
    try {
      await remove(deleteConfirmId);
      setDeleteConfirmId(null);
      setDeleteDialogOpen(false);
      toast({ title: 'Success', description: 'Pensioner deleted successfully.' });
      fetchPensioners();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete pensioner.';
      toast({ title: 'Error', description: message, variant: 'destructive' });
      setDeleteConfirmId(null);
      setDeleteDialogOpen(false);
    }
  }, [deleteConfirmId, fetchPensioners]);

  const initiateDelete = useCallback((id: number) => {
    setDeleteConfirmId(id);
    setDeleteDialogOpen(true);
  }, []);

  async function handleBulkDelete() {
    if (!selectedIds.length) return;
    if (!window.confirm(`Delete ${selectedIds.length} pensioner(s)?`)) return;
    try {
      await bulkDelete(selectedIds);
      setRowSelection({});
      toast({ title: 'Success', description: `${selectedIds.length} pensioner(s) deleted.` });
      fetchPensioners();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete pensioners.';
      toast({ title: 'Error', description: message, variant: 'destructive' });
    }
  }

  async function handleBulkStatus(status: string) {
    if (!selectedIds.length) return;
    try {
      await bulkUpdate(selectedIds, { status: status as Pensioner['status'] });
      setRowSelection({});
      toast({ title: 'Success', description: `${selectedIds.length} pensioner(s) status updated.` });
      fetchPensioners();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update status.';
      toast({ title: 'Error', description: message, variant: 'destructive' });
    }
  }

  const columns: ColumnDef<Pensioner>[] = useMemo(
    () => [
      {
        id: 'select',
        header: ({ table }) => (
          <input
            type="checkbox"
            checked={table.getIsAllRowsSelected()}
            onChange={table.getToggleAllRowsSelectedHandler()}
            className="h-4 w-4"
          />
        ),
        cell: ({ row }) => (
          <input
            type="checkbox"
            checked={row.getIsSelected()}
            onChange={row.getToggleSelectedHandler()}
            className="h-4 w-4"
          />
        ),
      },
      {
        accessorKey: 'rank',
        header: ({ column }) => (
          <button
            className="flex items-center gap-1"
            onClick={() => column.toggleSorting()}
          >
            Rank <ArrowUpDown className="h-3 w-3" />
          </button>
        ),
        cell: ({ row }) => <span className="whitespace-nowrap">{row.original.rank}</span>,
      },
      {
        accessorKey: 'name',
        header: 'Name',
        cell: ({ row }) => <span className="max-w-[180px] min-w-[120px] truncate block" title={row.original.name}>{row.original.name}</span>,
      },
      {
        accessorKey: 'serial_number',
        header: 'Serial #',
        cell: ({ row }) => <span className="whitespace-nowrap min-w-[100px]">{row.original.serial_number}</span>,
      },
      {
        accessorKey: 'cause_of_stoppage',
        header: 'Cause',
        cell: ({ row }) => <span className="max-w-[180px] truncate block" title={row.original.cause_of_stoppage}>{row.original.cause_of_stoppage}</span>,
      },
      {
        accessorKey: 'agency_name',
        header: 'Agency',
        cell: ({ row }) => <span className="max-w-[180px] truncate block" title={row.original.agency_name}>{row.original.agency_name}</span>,
      },
      { accessorKey: 'last_payment', header: 'Last Payment',
        cell: ({ row }) => <span className="whitespace-nowrap">{formatDisplayDate(row.original.last_payment)}</span>,
      },
      { accessorKey: 'agency_deductions', header: 'Agencies',
        cell: ({ row }) => {
          const deps = row.original.agency_deductions;
          if (!deps || deps.length === 0) return '—';
          const names = deps.map((d: { agency_name: string }) => d.agency_name).join(', ');
          const details = deps.map((d: { agency_name: string; amount: number }) => `${d.agency_name}: ${formatCurrency(d.amount)}`).join('\n');
          return <span title={details} className="cursor-help max-w-[200px] truncate block">{names}</span>;
        },
      },
      {
        accessorKey: 'monthly_pension',
        header: 'Monthly Pension',
        cell: ({ row }) => <span className="whitespace-nowrap">{formatCurrency(row.original.monthly_pension)}</span>,
      },
      {
        accessorKey: 'overpayment_total',
        header: 'Overpayment',
        cell: ({ row }) => <span className="whitespace-nowrap">{formatCurrency(row.original.overpayment_total)}</span>,
      },
      {
        accessorKey: 'amount_collected',
        header: 'Collected',
        cell: ({ row }) => <span className="whitespace-nowrap">{formatCurrency(row.original.amount_collected)}</span>,
      },
      {
        accessorKey: 'balance',
        header: 'Balance',
        cell: ({ row }) => <span className="whitespace-nowrap">{formatCurrency(row.original.balance)}</span>,
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => (
          <Badge variant={statusBadgeVariant[row.original.status] ?? 'outline'} className="whitespace-nowrap">
            {STATUS_OPTIONS.find((s) => s.value === row.original.status)?.label ?? row.original.status}
          </Badge>
        ),
      },
      {
        id: 'actions',
        cell: ({ row }) => (
          <PensionerActionsMenu
            pensioner={row.original}
            onView={setViewModalId}
            onEdit={(id) => navigate(`/pensioners/${id}/edit`)}
            onPrint={handlePrint}
            onDelete={initiateDelete}
          />
        ),
      },
    ],
    [navigate, setViewModalId, handlePrint, initiateDelete],
  );

  const table = useReactTable({
    data: pensioners,
    columns,
    getRowId: (row) => String(row.id),
    state: { sorting, rowSelection },
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: true,
    pageCount: Math.ceil(total / perPage),
  });

  function handleApplyFilters() {
    setPage(1);
    fetchPensioners();
  }

  const lastPage = Math.ceil(total / perPage);

  return (
    <div className="space-y-6 w-full max-w-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Pensioners</h1>
          <p className="text-sm text-muted-foreground">Manage pensioner overpayment records.</p>
        </div>
        <Button onClick={() => navigate('/pensioners/add')}>
          <Plus className="mr-2 h-4 w-4" /> Add Pensioner
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Search and filter pensioner records.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            <div className="w-full">
              <label className="text-sm font-medium mb-1 block">Search</label>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Name, serial #, account..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8 w-full"
                  onKeyDown={(e) => e.key === 'Enter' && handleApplyFilters()}
                />
              </div>
            </div>
            <div className="w-full">
              <label className="text-sm font-medium mb-1 block">Rank</label>
              <Select value={rankFilter} onValueChange={setRankFilter}>
                <SelectTrigger className="w-full"><SelectValue placeholder="All" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value=" ">All</SelectItem>
                  {RANK_OPTIONS.map((r) => (
                    <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-full">
              <label className="text-sm font-medium mb-1 block">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full"><SelectValue placeholder="All" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value=" ">All</SelectItem>
                  {STATUS_OPTIONS.map((s) => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-full">
              <label className="text-sm font-medium mb-1 block">Agency</label>
              <Select value={agencyFilter} onValueChange={setAgencyFilter}>
                <SelectTrigger className="w-full"><SelectValue placeholder="All" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value=" ">All</SelectItem>
                  {AGENCY_OPTIONS.map((a) => (
                    <SelectItem key={a.value} value={a.value}>{a.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-full">
              <label className="text-sm font-medium mb-1 block">Cause</label>
              <Select value={causeFilter} onValueChange={setCauseFilter}>
                <SelectTrigger className="w-full"><SelectValue placeholder="All" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value=" ">All</SelectItem>
                  {CAUSE_OF_STOPPAGE_OPTIONS.map((c) => (
                    <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-full flex items-end">
              <Button onClick={handleApplyFilters} variant="secondary" className="w-full sm:w-auto">
                Apply
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {selectedIds.length > 0 && (
        <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
          <span className="text-sm font-medium">{selectedIds.length} selected</span>
          <Button variant="destructive" size="sm" onClick={handleBulkDelete}>
            <Trash2 className="mr-1 h-4 w-4" /> Bulk Delete
          </Button>
          <div className="flex items-center gap-1">
            <span className="text-sm text-muted-foreground">Set status:</span>
            <Select onValueChange={(v) => handleBulkStatus(v)}>
              <SelectTrigger className="h-8 w-[180px]">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((s) => (
                  <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="space-y-3 p-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : (
            <><div className="hidden md:block overflow-x-auto">
              <Table>
                <TableHeader>
                  {table.getHeaderGroups().map((hg) => (
                    <TableRow key={hg.id}>
                      {hg.headers.map((h) => {
                        const isStickyLeft = h.id === 'select' || h.id === 'name' || h.id === 'serial_number';
                        const isStickyRight = h.id === 'actions';
                        const stickyClass = isStickyLeft
                          ? 'sticky left-0 bg-background z-20 shadow-[2px_0_8px_-2px_rgba(0,0,0,0.1)]'
                          : isStickyRight
                            ? 'sticky right-0 bg-background z-20 shadow-[-2px_0_8px_-2px_rgba(0,0,0,0.1)]'
                            : '';
                        return (
                          <TableHead key={h.id} className={stickyClass}>
                            {h.isPlaceholder ? null : flexRender(h.column.columnDef.header, h.getContext())}
                          </TableHead>
                        );
                      })}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {table.getRowModel().rows.length ? (
                    table.getRowModel().rows.map((row) => (
                      <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'} className="hover:bg-muted/50 transition-colors">
                        {row.getVisibleCells().map((cell) => {
                          const isStickyLeft = cell.column.id === 'select' || cell.column.id === 'name' || cell.column.id === 'serial_number';
                          const isStickyRight = cell.column.id === 'actions';
                          const stickyClass = isStickyLeft
                            ? 'sticky left-0 bg-background z-10 shadow-[2px_0_8px_-2px_rgba(0,0,0,0.1)]'
                            : isStickyRight
                              ? 'sticky right-0 bg-background z-10 shadow-[-2px_0_8px_-2px_rgba(0,0,0,0.1)]'
                              : '';
                          return (
                            <TableCell key={cell.id} className={stickyClass}>
                              {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={columns.length} className="h-24 text-center">
                        No pensioners found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            <div className="block md:hidden space-y-3 p-4">
              {table.getRowModel().rows.length ? (
                table.getRowModel().rows.map((row) => (
                  <div key={row.id} className="rounded-lg border p-4 space-y-2">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <p className="font-semibold text-sm">{row.original.name}</p>
                        <p className="text-xs text-muted-foreground">{row.original.serial_number}</p>
                      </div>
                      {row.getVisibleCells().find((c) => c.column.id === 'actions') && (
                        <PensionerActionsMenu
                          pensioner={row.original}
                          onView={setViewModalId}
                          onEdit={(id) => navigate(`/pensioners/${id}/edit`)}
                          onPrint={handlePrint}
                          onDelete={initiateDelete}
                        />
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground text-xs">Rank:</span>
                        <p>{row.original.rank}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground text-xs">Status:</span>
                        <Badge variant={statusBadgeVariant[row.original.status] ?? 'outline'} className="whitespace-nowrap">
                          {STATUS_OPTIONS.find((s) => s.value === row.original.status)?.label ?? row.original.status}
                        </Badge>
                      </div>
                      <div>
                        <span className="text-muted-foreground text-xs">Balance:</span>
                        <p>{formatCurrency(row.original.balance)}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground text-xs">Monthly Pension:</span>
                        <p>{formatCurrency(row.original.monthly_pension)}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-sm text-muted-foreground py-8">No pensioners found.</p>
              )}
            </div></>
          )}
        </CardContent>
      </Card>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">
          Showing {(page - 1) * perPage + 1}–{Math.min(page * perPage, total)} of {total}
        </p>
        <div className="flex items-center gap-1">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(1)} title="First page">
            <ChevronLeft className="h-4 w-4" />
            <ChevronLeft className="h-4 w-4 -ml-2" />
          </Button>
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
            Previous
          </Button>
          {Array.from({ length: Math.min(5, lastPage) }, (_, i) => {
            const start = Math.max(1, Math.min(page - 2, lastPage - 4));
            const n = start + i;
            if (n > lastPage) return null;
            return (
              <Button
                key={n}
                variant={n === page ? 'default' : 'outline'}
                size="sm"
                onClick={() => setPage(n)}
                className="min-w-[32px]"
              >
                {n}
              </Button>
            );
          })}
          <Button variant="outline" size="sm" disabled={page >= lastPage} onClick={() => setPage((p) => Math.min(lastPage, p + 1))}>
            Next
          </Button>
          <Button variant="outline" size="sm" disabled={page >= lastPage} onClick={() => setPage(lastPage)} title="Last page">
            <ChevronRight className="h-4 w-4" />
            <ChevronRight className="h-4 w-4 -ml-2" />
          </Button>
        </div>
      </div>

      {viewModalId !== null && (
        <PensionerViewModal
          pensionerId={viewModalId}
          open={viewModalId !== null}
          onOpenChange={(open) => { if (!open) setViewModalId(null); }}
        />
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Pensioner</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this pensioner?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => { setDeleteConfirmId(null); setDeleteDialogOpen(false); }}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default PensionersPage;
