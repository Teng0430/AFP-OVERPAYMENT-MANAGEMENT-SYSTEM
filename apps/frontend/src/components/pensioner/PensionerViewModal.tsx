import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { get } from '@/services/pensioners';
import { formatCurrency, formatDisplayDate } from '@/lib/financial-calculations';
import { STATUS_OPTIONS } from '@/types';
import type { Pensioner } from '@/types';

interface PensionerViewModalProps {
  pensionerId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const statusBadgeVariant: Record<string, 'default' | 'destructive' | 'secondary' | 'outline'> = {
  recovered: 'default',
  'not-yet-recovered': 'destructive',
  'recovered-but-inc': 'secondary',
};

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="grid grid-cols-3 gap-2 py-1.5 text-sm">
      <span className="font-medium text-muted-foreground">{label}</span>
      <span className="col-span-2">{value ?? '—'}</span>
    </div>
  );
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border p-4">
      <h3 className="mb-3 text-sm font-semibold">{title}</h3>
      <div className="divide-y">{children}</div>
    </div>
  );
}

export function PensionerViewModal({ pensionerId, open, onOpenChange }: PensionerViewModalProps) {
  const [pensioner, setPensioner] = useState<Pensioner | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    setError('');
    setPensioner(null);

    get(pensionerId)
      .then(setPensioner)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load pensioner.'))
      .finally(() => setLoading(false));
  }, [pensionerId, open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Pensioner Details</DialogTitle>
          <DialogDescription>Complete record information</DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[70vh] pr-4">
          {loading ? (
            <div className="space-y-4 p-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-6 w-full" />
              ))}
            </div>
          ) : error ? (
            <div className="rounded-lg bg-destructive/10 p-4 text-sm text-destructive">{error}</div>
          ) : pensioner ? (
            <div className="space-y-4">
              <SectionCard title="Personal Information">
                <InfoRow label="Rank" value={pensioner.rank} />
                <InfoRow label="Name" value={pensioner.name} />
                <InfoRow label="Serial Number" value={pensioner.serial_number} />
                <InfoRow label="Account Number" value={pensioner.account_number} />
                <InfoRow label="Date of Death" value={formatDisplayDate(pensioner.date_of_death)} />
              </SectionCard>

              <SectionCard title="Agency Information">
                <InfoRow label="Agency Name" value={pensioner.agency_name} />
                <InfoRow label="Crediting Agency" value={pensioner.crediting_agency_name} />
                <InfoRow
                  label="Agency Deductions"
                  value={
                    pensioner.agency_deductions?.length
                      ? pensioner.agency_deductions.map((d) => (
                          <div key={d.agency_name} className="text-sm">
                            {d.agency_name}: {formatCurrency(d.amount)}
                            {d.crediting_agency && (
                              <Badge variant="outline" className="ml-1 text-[10px]">Crediting</Badge>
                            )}
                          </div>
                        ))
                      : '—'
                  }
                />
              </SectionCard>

              <SectionCard title="Overpayment Details">
                <InfoRow label="Monthly Pension" value={formatCurrency(pensioner.monthly_pension)} />
                <InfoRow label="Whole Months" value={pensioner.whole_months} />
                <InfoRow label="Fractional Days" value={pensioner.fractional_days} />
                <InfoRow label="Computation (Months)" value={formatCurrency(pensioner.computation_in_months)} />
                <InfoRow label="Computation (Days)" value={formatCurrency(pensioner.computation_of_days)} />
                <InfoRow label="Overpayment Subtotal" value={formatCurrency(pensioner.overpayment_subtotal)} />
                <InfoRow label="Overpayment Total" value={formatCurrency(pensioner.overpayment_total)} />
                <InfoRow label="Balance" value={formatCurrency(pensioner.balance)} />
              </SectionCard>

              <SectionCard title="Collection History">
                <InfoRow label="Amount Collected" value={formatCurrency(pensioner.amount_collected)} />
                <InfoRow label="Date Collected" value={formatDisplayDate(pensioner.date_collected)} />
              </SectionCard>

              <SectionCard title="Recovery Status">
                <InfoRow
                  label="Status"
                  value={
                    <Badge variant={statusBadgeVariant[pensioner.status] ?? 'outline'}>
                      {STATUS_OPTIONS.find((s) => s.value === pensioner.status)?.label ?? pensioner.status}
                    </Badge>
                  }
                />
              </SectionCard>

              <SectionCard title="Recovery Timeline">
                <InfoRow label="Start Date" value={formatDisplayDate(pensioner.start_date)} />
                <InfoRow label="End Date" value={formatDisplayDate(pensioner.end_date)} />
                <InfoRow
                  label="Last Collection"
                  value={
                    pensioner.date_collected
                      ? `${formatDisplayDate(pensioner.date_collected)} — ${formatCurrency(pensioner.amount_collected)}`
                      : 'No collections recorded'
                  }
                />
                <InfoRow label="Whole Months" value={pensioner.whole_months} />
                <InfoRow label="Fractional Days" value={pensioner.fractional_days} />
                <InfoRow label="Daily Rate" value={pensioner.daily_rate ? formatCurrency(pensioner.daily_rate) : '—'} />
                <InfoRow label="Total Overpayment Days" value={pensioner.total_overpayment_days ?? '—'} />
              </SectionCard>

              <SectionCard title="Supporting Documents">
                <InfoRow label="Documents" value="No supporting documents available." />
              </SectionCard>

              <SectionCard title="Audit Information">
                <InfoRow label="Created" value={formatDisplayDate(pensioner.created_at)} />
                <InfoRow label="Last Updated" value={formatDisplayDate(pensioner.updated_at)} />
                <InfoRow label="Created By" value={pensioner.created_by ?? '—'} />
              </SectionCard>
            </div>
          ) : null}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
