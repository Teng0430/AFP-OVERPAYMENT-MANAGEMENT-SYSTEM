import { useEffect, useState } from 'react';
import { Search, ChevronDown, ChevronRight, Plus } from 'lucide-react';
import { list } from '@/services/pensioners';
import { getInstallments, addInstallment } from '@/services/recovery';
import type { Pensioner, RecoveryInstallment, InstallmentSummary } from '@/types';
import { STATUS_OPTIONS, AGENCY_OPTIONS } from '@/types';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

const statusBadgeVariant: Record<string, 'default' | 'destructive' | 'secondary' | 'outline'> = {
  recovered: 'default',
  'not-yet-recovered': 'destructive',
  'recovered-but-inc': 'secondary',
};

interface ExpandedRow {
  pensionerId: number;
  installments: RecoveryInstallment[];
  summary: InstallmentSummary | null;
  loading: boolean;
}

function RecoveryLedgerPage() {
  const [pensioners, setPensioners] = useState<Pensioner[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [agencyFilter, setAgencyFilter] = useState('');
  const [expanded, setExpanded] = useState<Record<number, ExpandedRow>>({});
  const [selectedPensioner, setSelectedPensioner] = useState<Pensioner | null>(null);
  const [collectionAmount, setCollectionAmount] = useState('');
  const [collectionDate, setCollectionDate] = useState('');
  const [collectionRemarks, setCollectionRemarks] = useState('');
  const [collectionLoading, setCollectionLoading] = useState(false);
  const [error, setError] = useState('');
  const perPage = 10;

  async function fetchPensioners() {
    try {
      setLoading(true);
      setError('');
      const filters: PensionerFilters = {
        page,
        per_page: perPage,
        search: search || undefined,
        status: statusFilter ? [statusFilter] : undefined,
        agency_name: agencyFilter ? [agencyFilter] : undefined,
      };
      const data = await list(filters);
      setPensioners(data.pensioners);
      setTotal(data.meta.total);
    } catch {
      setError('Failed to load recovery ledger.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchPensioners();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  async function toggleExpand(pensionerId: number) {
    if (expanded[pensionerId]) {
      const newExpanded = { ...expanded };
      delete newExpanded[pensionerId];
      setExpanded(newExpanded);
      return;
    }

    setExpanded((prev) => ({
      ...prev,
      [pensionerId]: { pensionerId, installments: [], summary: null, loading: true },
    }));

    try {
      const data = await getInstallments(pensionerId);
      setExpanded((prev) => ({
        ...prev,
        [pensionerId]: {
          pensionerId,
          installments: data.installments,
          summary: data.summary,
          loading: false,
        },
      }));
    } catch {
      setExpanded((prev) => ({
        ...prev,
        [pensionerId]: { pensionerId, installments: [], summary: null, loading: false },
      }));
    }
  }

  async function handleAddCollection() {
    if (!selectedPensioner || !collectionAmount || !collectionDate) return;
    try {
      setCollectionLoading(true);
      await addInstallment(selectedPensioner.id, {
        date_paid: collectionDate,
        amount_paid: Number(collectionAmount),
        remarks: collectionRemarks || undefined,
      });
      setSelectedPensioner(null);
      setCollectionAmount('');
      setCollectionDate('');
      setCollectionRemarks('');
      if (expanded[selectedPensioner.id]) {
        toggleExpand(selectedPensioner.id);
      }
      fetchPensioners();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add collection.');
    } finally {
      setCollectionLoading(false);
    }
  }

  const lastPage = Math.ceil(total / perPage);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Recovery Ledger</h1>
        <p className="text-sm text-muted-foreground">Track installment collections and recovery progress.</p>
      </div>

      {error && (
        <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Search and filter recovery records.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-end gap-3">
            <div className="flex-1 min-w-[200px]">
              <label className="text-sm font-medium mb-1 block">Search</label>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search pensioner name..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8"
                  onKeyDown={(e) => e.key === 'Enter' && (setPage(1), fetchPensioners())}
                />
              </div>
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
            <Button variant="secondary" onClick={() => { setPage(1); fetchPensioners(); }}>
              Apply
            </Button>
          </div>
        </CardContent>
      </Card>

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
                <TableRow>
                  <TableHead className="w-10"></TableHead>
                  <TableHead>Pensioner Name</TableHead>
                  <TableHead>Serial #</TableHead>
                  <TableHead>Overpayment Total</TableHead>
                  <TableHead>Amount Collected</TableHead>
                  <TableHead>Balance</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Installments</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pensioners.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="h-24 text-center">
                      No records found.
                    </TableCell>
                  </TableRow>
                ) : (
                  pensioners.map((p) => {
                    const isExpanded = !!expanded[p.id];
                    return (
                      <>
                        <TableRow key={p.id} className="cursor-pointer" onClick={() => toggleExpand(p.id)}>
                          <TableCell>
                            {isExpanded ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                          </TableCell>
                          <TableCell className="font-medium">{p.name}</TableCell>
                          <TableCell>{p.serial_number}</TableCell>
                          <TableCell>₱{p.overpayment_total.toLocaleString()}</TableCell>
                          <TableCell>₱{p.amount_collected.toLocaleString()}</TableCell>
                          <TableCell>₱{p.balance.toLocaleString()}</TableCell>
                          <TableCell>
                            <Badge variant={statusBadgeVariant[p.status] ?? 'outline'}>
                              {STATUS_OPTIONS.find((s) => s.value === p.status)?.label ?? p.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{p.id in expanded ? (expanded[p.id]?.installments.length ?? 0) : '-'}</TableCell>
                          <TableCell>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedPensioner(p);
                                  }}
                                >
                                  <Plus className="mr-1 h-3 w-3" /> Add Collection
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Add Collection</DialogTitle>
                                  <DialogDescription>
                                    Record a collection for {p.name}.
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4 py-2">
                                  <div>
                                    <label className="text-sm font-medium">Amount Paid</label>
                                    <Input
                                      type="number"
                                      min="0"
                                      step="0.01"
                                      value={collectionAmount}
                                      onChange={(e) => setCollectionAmount(e.target.value)}
                                      placeholder="0.00"
                                    />
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">Date Paid</label>
                                    <Input
                                      type="date"
                                      value={collectionDate}
                                      onChange={(e) => setCollectionDate(e.target.value)}
                                    />
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">Remarks</label>
                                    <Input
                                      value={collectionRemarks}
                                      onChange={(e) => setCollectionRemarks(e.target.value)}
                                      placeholder="Optional remarks"
                                    />
                                  </div>
                                </div>
                                <DialogFooter>
                                  <Button variant="outline" onClick={() => setSelectedPensioner(null)}>
                                    Cancel
                                  </Button>
                                  <Button onClick={handleAddCollection} disabled={collectionLoading}>
                                    {collectionLoading ? 'Saving...' : 'Save'}
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                          </TableCell>
                        </TableRow>
                        {isExpanded && (
                          <TableRow key={`${p.id}-detail`}>
                            <TableCell colSpan={9} className="bg-muted/30 p-4">
                              {expanded[p.id]?.loading ? (
                                <div className="space-y-2">
                                  <Skeleton className="h-6 w-full" />
                                  <Skeleton className="h-6 w-full" />
                                </div>
                              ) : (
                                <div className="space-y-3">
                                  {expanded[p.id]?.summary && (
                                    <div className="flex flex-wrap gap-6 text-sm">
                                      <div>
                                        <span className="text-muted-foreground">Total Overpayment:</span>{' '}
                                        <span className="font-medium">₱{expanded[p.id]!.summary!.total_overpayment.toLocaleString()}</span>
                                      </div>
                                      <div>
                                        <span className="text-muted-foreground">Total Collected:</span>{' '}
                                        <span className="font-medium">₱{expanded[p.id]!.summary!.total_collected.toLocaleString()}</span>
                                      </div>
                                      <div>
                                        <span className="text-muted-foreground">Remaining:</span>{' '}
                                        <span className="font-medium">₱{expanded[p.id]!.summary!.remaining_balance.toLocaleString()}</span>
                                      </div>
                                      <div>
                                        <span className="text-muted-foreground">Recovery Rate:</span>{' '}
                                        <span className="font-medium">{expanded[p.id]!.summary!.collection_percentage.toFixed(1)}%</span>
                                      </div>
                                    </div>
                                  )}
                                  {expanded[p.id]?.installments.length ? (
                                    <Table>
                                      <TableHeader>
                                        <TableRow>
                                          <TableHead>#</TableHead>
                                          <TableHead>Date Paid</TableHead>
                                          <TableHead>Amount</TableHead>
                                          <TableHead>Running Balance</TableHead>
                                          <TableHead>Collector</TableHead>
                                          <TableHead>Remarks</TableHead>
                                        </TableRow>
                                      </TableHeader>
                                      <TableBody>
                                        {expanded[p.id]!.installments.map((inst) => (
                                          <TableRow key={inst.id}>
                                            <TableCell>{inst.installment_no}</TableCell>
                                            <TableCell>{new Date(inst.date_paid).toLocaleDateString()}</TableCell>
                                            <TableCell>₱{inst.amount_paid.toLocaleString()}</TableCell>
                                            <TableCell>₱{inst.running_balance.toLocaleString()}</TableCell>
                                            <TableCell>{inst.collector ?? '-'}</TableCell>
                                            <TableCell>{inst.remarks ?? '-'}</TableCell>
                                          </TableRow>
                                        ))}
                                      </TableBody>
                                    </Table>
                                  ) : (
                                    <p className="text-sm text-muted-foreground">No installments recorded.</p>
                                  )}
                                </div>
                              )}
                            </TableCell>
                          </TableRow>
                        )}
                      </>
                    );
                  })
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

export default RecoveryLedgerPage;
