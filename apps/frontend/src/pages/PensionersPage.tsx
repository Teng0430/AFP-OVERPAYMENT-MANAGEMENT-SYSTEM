import { useEffect, useState, useMemo } from 'react';
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
  Pencil,
  ArrowUpDown,
} from 'lucide-react';
import { list, remove, bulkDelete, bulkUpdate } from '@/services/pensioners';
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
  const [error, setError] = useState('');

  async function fetchPensioners() {
    try {
      setLoading(true);
      setError('');
      const filters: PensionerFilters = {
        page,
        per_page: perPage,
        search: search || undefined,
        rank: rankFilter ? [rankFilter] : undefined,
        status: statusFilter ? [statusFilter] : undefined,
        agency_name: agencyFilter ? [agencyFilter] : undefined,
        cause_of_stoppage: causeFilter ? [causeFilter] : undefined,
        sort_by: sorting.length ? sorting[0].id : undefined,
        sort_dir: sorting.length ? (sorting[0].desc ? 'desc' : 'asc') : undefined,
      };
      const data = await list(filters);
      setPensioners(data.pensioners);
      setTotal(data.meta.total);
    } catch {
      setError('Failed to load pensioners.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchPensioners();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, sorting]);

  const selectedIds = useMemo(
    () => Object.keys(rowSelection).map(Number),
    [rowSelection],
  );

  async function handleDelete(id: number) {
    if (!window.confirm('Are you sure you want to delete this pensioner?')) return;
    try {
      await remove(id);
      fetchPensioners();
    } catch {
      setError('Failed to delete pensioner.');
    }
  }

  async function handleBulkDelete() {
    if (!selectedIds.length) return;
    if (!window.confirm(`Delete ${selectedIds.length} pensioner(s)?`)) return;
    try {
      await bulkDelete(selectedIds);
      setRowSelection({});
      fetchPensioners();
    } catch {
      setError('Failed to delete pensioners.');
    }
  }

  async function handleBulkStatus(status: string) {
    if (!selectedIds.length) return;
    try {
      await bulkUpdate(selectedIds, { status: status as Pensioner['status'] });
      setRowSelection({});
      fetchPensioners();
    } catch {
      setError('Failed to update status.');
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
      },
      { accessorKey: 'name', header: 'Name' },
      { accessorKey: 'serial_number', header: 'Serial #' },
      { accessorKey: 'agency_name', header: 'Agency' },
      {
        accessorKey: 'monthly_pension',
        header: 'Monthly Pension',
        cell: ({ row }) => `₱${row.original.monthly_pension.toLocaleString()}`,
      },
      {
        accessorKey: 'overpayment_total',
        header: 'Overpayment',
        cell: ({ row }) => `₱${row.original.overpayment_total.toLocaleString()}`,
      },
      {
        accessorKey: 'amount_collected',
        header: 'Collected',
        cell: ({ row }) => `₱${row.original.amount_collected.toLocaleString()}`,
      },
      {
        accessorKey: 'balance',
        header: 'Balance',
        cell: ({ row }) => `₱${row.original.balance.toLocaleString()}`,
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => (
          <Badge variant={statusBadgeVariant[row.original.status] ?? 'outline'}>
            {STATUS_OPTIONS.find((s) => s.value === row.original.status)?.label ?? row.original.status}
          </Badge>
        ),
      },
      {
        id: 'actions',
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(`/pensioners/${row.original.id}/edit`)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleDelete(row.original.id)}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [navigate],
  );

  const table = useReactTable({
    data: pensioners,
    columns,
    state: { sorting, rowSelection },
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: true,
    pageCount: Math.ceil(total / perPage),
  });

  const lastPage = Math.ceil(total / perPage);

  return (
    <div className="space-y-6">
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
          <div className="flex flex-wrap items-end gap-3">
            <div className="flex-1 min-w-[200px]">
              <label className="text-sm font-medium mb-1 block">Search</label>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Name, serial #, account..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8"
                  onKeyDown={(e) => e.key === 'Enter' && handleApplyFilters()}
                />
              </div>
            </div>
            <div className="w-[140px]">
              <label className="text-sm font-medium mb-1 block">Rank</label>
              <Select value={rankFilter} onValueChange={setRankFilter}>
                <SelectTrigger><SelectValue placeholder="All" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value=" ">All</SelectItem>
                  {RANK_OPTIONS.map((r) => (
                    <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-[160px]">
              <label className="text-sm font-medium mb-1 block">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger><SelectValue placeholder="All" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value=" ">All</SelectItem>
                  {STATUS_OPTIONS.map((s) => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-[180px]">
              <label className="text-sm font-medium mb-1 block">Agency</label>
              <Select value={agencyFilter} onValueChange={setAgencyFilter}>
                <SelectTrigger><SelectValue placeholder="All" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value=" ">All</SelectItem>
                  {AGENCY_OPTIONS.map((a) => (
                    <SelectItem key={a.value} value={a.value}>{a.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-[180px]">
              <label className="text-sm font-medium mb-1 block">Cause</label>
              <Select value={causeFilter} onValueChange={setCauseFilter}>
                <SelectTrigger><SelectValue placeholder="All" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value=" ">All</SelectItem>
                  {CAUSE_OF_STOPPAGE_OPTIONS.map((c) => (
                    <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleApplyFilters} variant="secondary">Apply</Button>
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

      {error && (
        <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
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
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((hg) => (
                  <TableRow key={hg.id}>
                    {hg.headers.map((h) => (
                      <TableHead key={h.id}>
                        {h.isPlaceholder ? null : flexRender(h.column.columnDef.header, h.getContext())}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
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
          )}
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {(page - 1) * perPage + 1}–{Math.min(page * perPage, total)} of {total}
        </p>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
            Previous
          </Button>
          <Button variant="outline" size="sm" disabled={page >= lastPage} onClick={() => setPage((p) => Math.min(lastPage, p + 1))}>
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}

export default PensionersPage;
