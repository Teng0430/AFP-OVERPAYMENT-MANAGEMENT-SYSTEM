import type { FullBreakdownResult } from '@/lib/financial-calculations';
import { formatCurrency } from '@/lib/financial-calculations';

interface OverpaymentComputationBreakdownProps {
  breakdown: FullBreakdownResult;
  grossPension: number;
  creditingAgencyName: string | null;
}

export function OverpaymentComputationBreakdown({
  breakdown,
  grossPension,
  creditingAgencyName,
}: OverpaymentComputationBreakdownProps) {
  const totalAgencyOverpayments = breakdown.agencyOverpayments.reduce((s, a) => s + a.overpayment, 0);

  return (
    <div className="space-y-4">
      {/* A. Pension Summary */}
      <div className="rounded-lg border p-4">
        <h4 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wide">Pension Summary</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Gross Monthly Pension</span>
            <span className="font-medium">{formatCurrency(grossPension)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Total Agency</span>
            <span className="font-medium">{formatCurrency(breakdown.totalNonCrediting)}</span>
          </div>
          <div className="flex justify-between border-t pt-2 font-semibold">
            <span>Net Monthly Pension</span>
            <span>{formatCurrency(breakdown.netMonthlyPension)}</span>
          </div>
          {creditingAgencyName && (
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Crediting Agency</span>
              <span className="font-medium text-primary">{creditingAgencyName}</span>
            </div>
          )}
        </div>
      </div>

      {/* B. Net Pension Breakdown */}
      <div className="rounded-lg border p-4">
        <h4 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wide">Net Pension Overpayment</h4>
        <div className="space-y-2 text-sm">
          {(() => {
            const factor = breakdown.netPensionOverpayment;
            if (!factor) {
              return <div className="text-muted-foreground">₱0.00</div>;
            }
            return (
              <div className="flex justify-between font-semibold">
                <span>Net Pension Overpayment</span>
                <span>{formatCurrency(factor)}</span>
              </div>
            );
          })()}
        </div>
      </div>

      {/* C. Agency Breakdown */}
      {breakdown.agencyOverpayments.length > 0 && (
        <div className="rounded-lg border p-4">
          <h4 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wide">Agency Overpayments</h4>
          <div className="space-y-3">
            {breakdown.agencyOverpayments.map((agency) => (
              <div key={agency.agency_name} className="rounded-md bg-muted/50 p-3 text-sm">
                <div className="mb-2 flex items-center justify-between">
                  <span className="font-medium">{agency.agency_name}</span>
                  {creditingAgencyName === agency.agency_name && (
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                      Crediting Agency
                    </span>
                  )}
                </div>
                <div className="space-y-1 text-xs text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Monthly Deduction</span>
                    <span className="font-medium text-foreground">{formatCurrency(agency.amount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Agency Overpayment</span>
                    <span className="font-medium text-foreground">{formatCurrency(agency.overpayment)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* D. Final Summary */}
      <div className="rounded-lg border bg-primary/5 p-4">
        <h4 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wide">Final Summary</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Net Pension Overpayment</span>
            <span className="font-medium">{formatCurrency(breakdown.netPensionOverpayment)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Total Agency Overpayments</span>
            <span className="font-medium">{formatCurrency(totalAgencyOverpayments)}</span>
          </div>
          <div className="flex justify-between border-t pt-2 text-base font-bold">
            <span>Grand Total Overpayment</span>
            <span className="text-primary">{formatCurrency(breakdown.grandTotalOverpayment)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
