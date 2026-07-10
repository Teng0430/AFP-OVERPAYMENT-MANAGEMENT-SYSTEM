import { useEffect, useState } from 'react';
import { get } from '@/services/pensioners';
import { formatCurrency, formatDisplayDate } from '@/lib/financial-calculations';
import { STATUS_OPTIONS } from '@/types';
import type { Pensioner } from '@/types';

interface PensionerPrintViewProps {
  pensionerId: number;
  onClose?: () => void;
}

export function PensionerPrintView({ pensionerId, onClose }: PensionerPrintViewProps) {
  const [pensioner, setPensioner] = useState<Pensioner | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    get(pensionerId)
      .then(setPensioner)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load pensioner.'))
      .finally(() => setLoading(false));
  }, [pensionerId]);

  useEffect(() => {
    if (!loading && pensioner) {
      const timer = setTimeout(() => window.print(), 300);
      return () => clearTimeout(timer);
    }
  }, [loading, pensioner]);

  const statusLabel = STATUS_OPTIONS.find((s) => s.value === pensioner?.status)?.label ?? pensioner?.status ?? '';

  if (loading) {
    return <div className="p-8 text-center text-muted-foreground">Loading...</div>;
  }

  if (error || !pensioner) {
    return (
      <div className="p-8 text-center">
        <p className="text-destructive">{error || 'Pensioner not found.'}</p>
        {onClose && (
          <button onClick={onClose} className="mt-4 text-sm underline">
            Close
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="p-8 max-w-3xl mx-auto print:p-0">
      <div className="text-center mb-8 border-b pb-4">
        <h1 className="text-xl font-bold">AFP Pension Overpayment Monitoring System</h1>
        <p className="text-sm text-muted-foreground">Pensioner Summary</p>
      </div>

      <section className="mb-6">
        <h2 className="text-base font-semibold border-b pb-1 mb-3">Pensioner Details</h2>
        <table className="w-full text-sm">
          <tbody>
            <tr><td className="w-48 font-medium py-1">Rank</td><td>{pensioner.rank}</td></tr>
            <tr><td className="w-48 font-medium py-1">Name</td><td>{pensioner.name}</td></tr>
            <tr><td className="w-48 font-medium py-1">Serial Number</td><td>{pensioner.serial_number}</td></tr>
            <tr><td className="w-48 font-medium py-1">Account Number</td><td>{pensioner.account_number ?? '—'}</td></tr>
            <tr><td className="w-48 font-medium py-1">Date of Death</td><td>{formatDisplayDate(pensioner.date_of_death)}</td></tr>
            <tr><td className="w-48 font-medium py-1">Last Payment</td><td>{formatDisplayDate(pensioner.last_payment)}</td></tr>
            <tr><td className="w-48 font-medium py-1">Cause of Stoppage</td><td>{pensioner.cause_of_stoppage}</td></tr>
            <tr><td className="w-48 font-medium py-1">Agency Name</td><td>{pensioner.agency_name}</td></tr>
          </tbody>
        </table>
      </section>

      {pensioner.agency_deductions && pensioner.agency_deductions.length > 0 && (
        <section className="mb-6">
          <h2 className="text-base font-semibold border-b pb-1 mb-3">Agency Summary</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-1 font-medium">Agency</th>
                <th className="text-right py-1 font-medium">Amount</th>
                <th className="text-left py-1 font-medium">Type</th>
              </tr>
            </thead>
            <tbody>
              {pensioner.agency_deductions.map((d) => (
                <tr key={d.agency_name}>
                  <td className="py-1">{d.agency_name}</td>
                  <td className="text-right py-1">{formatCurrency(d.amount)}</td>
                  <td className="py-1">{d.crediting_agency ? 'Crediting' : 'Non-Crediting'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      <section className="mb-6">
        <h2 className="text-base font-semibold border-b pb-1 mb-3">Financial Summary</h2>
        <table className="w-full text-sm">
          <tbody>
            <tr><td className="w-48 font-medium py-1">Monthly Pension</td><td>{formatCurrency(pensioner.monthly_pension)}</td></tr>
            <tr><td className="w-48 font-medium py-1">Overpayment Total</td><td>{formatCurrency(pensioner.overpayment_total)}</td></tr>
            <tr><td className="w-48 font-medium py-1">Amount Collected</td><td>{formatCurrency(pensioner.amount_collected)}</td></tr>
            <tr className="font-semibold"><td className="w-48 py-1">Remaining Balance</td><td>{formatCurrency(pensioner.balance)}</td></tr>
            <tr><td className="w-48 font-medium py-1">Status</td><td>{statusLabel}</td></tr>
          </tbody>
        </table>
      </section>

      <div className="text-xs text-muted-foreground text-center pt-4 border-t">
        Generated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
      </div>

      <style>{`
        @media print {
          body { font-size: 12pt; }
          @page { margin: 1.5cm; }
          .no-print { display: none !important; }
        }
      `}</style>
    </div>
  );
}
