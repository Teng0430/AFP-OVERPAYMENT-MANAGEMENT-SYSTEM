<<<<<<< HEAD
import { useState, useMemo, useCallback, useEffect } from 'react';
=======
import { useEffect, useState, useMemo, useCallback } from 'react';
>>>>>>> 885f6e46fde5ccc3d66d67570c482cdded90d7da
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, FormProvider, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft } from 'lucide-react';
import { get, update } from '@/services/pensioners';
import { RANK_OPTIONS, STATUS_OPTIONS, AGENCY_OPTIONS } from '@/types';
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
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
<<<<<<< HEAD
import { AgencyDeductionRepeater } from '@/components/pensioner/AgencyDeductionRepeater';
import { OverpaymentComputationBreakdown } from '@/components/pensioner/OverpaymentComputationBreakdown';
import { computeFullBreakdown } from '@/lib/financial-calculations';
import type { Pensioner } from '@/types';
=======
import { Skeleton } from '@/components/ui/skeleton';
import { AgencyDeductionRepeater } from '@/components/pensioner/AgencyDeductionRepeater';
import { OverpaymentComputationBreakdown } from '@/components/pensioner/OverpaymentComputationBreakdown';
import { computeFullBreakdown } from '@/lib/financial-calculations';
>>>>>>> 885f6e46fde5ccc3d66d67570c482cdded90d7da

const pensionerSchema = z.object({
  rank: z.string().min(1, 'Rank is required'),
  name: z.string().min(1, 'Name is required'),
  serial_number: z.string().min(1, 'Serial number is required'),
  account_number: z.string().optional(),
  date_of_death: z.string().min(1, 'Date of death is required'),
  last_payment: z.string().min(1, 'Last payment is required'),
  cause_of_stoppage: z.string().min(1, 'Cause of stoppage is required'),
  agency_name: z.string().min(1, 'Agency name is required'),
  monthly_pension: z.coerce.number().gt(0, 'Must be greater than 0'),
  agency_deductions: z.array(z.object({
    agency_name: z.string().min(1, 'Agency is required'),
    amount: z.coerce.number().min(0, 'Cannot be negative'),
  })).min(1).max(10).optional(),
  amount_collected: z.coerce.number().min(0).optional(),
  date_collected: z.string().optional(),
  status: z.string().min(1, 'Status is required'),
}).refine(
  (data) => {
    if (!data.date_of_death || !data.last_payment) return true;
    return new Date(data.last_payment) >= new Date(data.date_of_death);
  },
  { message: 'Last payment must be on or after date of death', path: ['last_payment'] },
);

type PensionerFormData = z.infer<typeof pensionerSchema>;

function EditPensionerPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
<<<<<<< HEAD
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [pensioner, setPensioner] = useState<Pensioner | null>(null);
=======
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [fetchError, setFetchError] = useState('');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
>>>>>>> 885f6e46fde5ccc3d66d67570c482cdded90d7da

  const form = useForm<PensionerFormData>({
    resolver: zodResolver(pensionerSchema) as Resolver<PensionerFormData>,
    defaultValues: {
      rank: '',
      name: '',
      serial_number: '',
      account_number: '',
      date_of_death: '',
      last_payment: '',
      cause_of_stoppage: '',
      agency_name: '',
      monthly_pension: 0,
      agency_deductions: [{ agency_name: '', amount: 0 }],
      amount_collected: 0,
      date_collected: '',
      status: '',
    },
  });

  useEffect(() => {
<<<<<<< HEAD
    async function loadPensioner() {
      if (!id) return;
      try {
        setLoading(true);
        const data = await get(Number(id));
        setPensioner(data);
        form.reset({
          rank: data.rank,
          name: data.name,
          serial_number: data.serial_number,
          account_number: data.account_number ?? '',
          date_of_death: data.date_of_death ?? '',
          last_payment: data.last_payment ?? '',
          cause_of_stoppage: data.cause_of_stoppage,
          agency_name: data.agency_name,
          monthly_pension: data.monthly_pension,
          agency_deductions: data.agency_deductions?.length
            ? data.agency_deductions.map((d) => ({ agency_name: d.agency_name, amount: d.amount }))
            : [{ agency_name: '', amount: 0 }],
          amount_collected: data.amount_collected,
          date_collected: data.date_collected ?? '',
          status: data.status,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load pensioner.');
      } finally {
        setLoading(false);
      }
    }
    loadPensioner();
=======
    if (!id) return;
    const numId = Number(id);
    if (isNaN(numId)) {
      setFetchError('Invalid pensioner ID.');
      setLoading(false);
      return;
    }

    get(numId)
      .then((p) => {
        form.reset({
          rank: p.rank ?? '',
          name: p.name ?? '',
          serial_number: p.serial_number ?? '',
          account_number: p.account_number ?? '',
          date_of_death: p.date_of_death ? p.date_of_death.split('T')[0] : '',
          last_payment: p.last_payment ? p.last_payment.split('T')[0] : '',
          cause_of_stoppage: p.cause_of_stoppage ?? '',
          agency_name: p.agency_name ?? '',
          monthly_pension: p.monthly_pension,
          agency_deductions: p.agency_deductions?.length ? p.agency_deductions : [{ agency_name: '', amount: 0 }],
          amount_collected: p.amount_collected ?? 0,
          date_collected: p.date_collected ? p.date_collected.split('T')[0] : '',
          status: p.status ?? '',
        });
      })
      .catch((err) => setFetchError(err instanceof Error ? err.message : 'Failed to load pensioner.'))
      .finally(() => setLoading(false));
>>>>>>> 885f6e46fde5ccc3d66d67570c482cdded90d7da
  }, [id, form]);

  const watchedDoD = form.watch('date_of_death');
  const watchedLP = form.watch('last_payment');
  const watchedMP = form.watch('monthly_pension');
  const watchedDeductions = form.watch('agency_deductions');

  const creditingAgencyName = useMemo(() => {
    const first = watchedDeductions?.[0];
<<<<<<< HEAD
    if (first?.agency_name) {
      return first.agency_name;
    }
=======
    if (first?.agency_name) return first.agency_name;
>>>>>>> 885f6e46fde5ccc3d66d67570c482cdded90d7da
    return null;
  }, [watchedDeductions]);

  const breakdown = useMemo(() => {
    if (watchedDoD && watchedLP && watchedMP > 0) {
      const dod = new Date(watchedDoD);
      const lp = new Date(watchedLP);
      if (!isNaN(dod.getTime()) && !isNaN(lp.getTime())) {
        try {
          const deductions = (watchedDeductions ?? []).filter((d) => d.agency_name !== '');
<<<<<<< HEAD
          return computeFullBreakdown(
            watchedMP,
            deductions,
            dod,
            lp,
          );
=======
          return computeFullBreakdown(watchedMP, deductions, dod, lp);
>>>>>>> 885f6e46fde5ccc3d66d67570c482cdded90d7da
        } catch {
          return null;
        }
      }
    }
    return null;
  }, [watchedDoD, watchedLP, watchedMP, watchedDeductions]);

  const onSubmit = useCallback(async (data: PensionerFormData) => {
    if (!id) return;
    try {
      setSubmitting(true);
      setError('');
      setFieldErrors({});

      const validDeductions = (data.agency_deductions ?? []).filter((d) => d.agency_name !== '');
      const payload: Record<string, unknown> = {
        ...data,
        agency_deductions: validDeductions,
      };

      const firstValid = validDeductions[0];
      if (firstValid) {
        payload.crediting_agency_name = firstValid.agency_name;
      }

      await update(Number(id), payload);
      navigate('/pensioners');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to update pensioner.';
      setError(msg);

      const validationData = (err as Record<string, unknown>).validationErrors;
      if (validationData && typeof validationData === 'object') {
        setFieldErrors(validationData as Record<string, string[]>);
      }
    } finally {
      setSubmitting(false);
    }
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/pensioners')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Edit Pensioner</h1>
            <p className="text-sm text-muted-foreground">Loading pensioner data...</p>
          </div>
        </div>
<<<<<<< HEAD
=======
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              {Array.from({ length: 10 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
>>>>>>> 885f6e46fde5ccc3d66d67570c482cdded90d7da
      </div>
    );
  }

<<<<<<< HEAD
  if (!pensioner) {
=======
  if (fetchError) {
>>>>>>> 885f6e46fde5ccc3d66d67570c482cdded90d7da
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/pensioners')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Edit Pensioner</h1>
<<<<<<< HEAD
            <p className="text-sm text-destructive">Pensioner not found.</p>
          </div>
        </div>
=======
          </div>
        </div>
        <div className="rounded-lg bg-destructive/10 p-4 text-sm text-destructive">{fetchError}</div>
        <Button variant="outline" onClick={() => navigate('/pensioners')}>Back to List</Button>
>>>>>>> 885f6e46fde5ccc3d66d67570c482cdded90d7da
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/pensioners')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Edit Pensioner</h1>
<<<<<<< HEAD
          <p className="text-sm text-muted-foreground">Update overpayment record for {pensioner.name}.</p>
=======
          <p className="text-sm text-muted-foreground">Update overpayment record.</p>
>>>>>>> 885f6e46fde5ccc3d66d67570c482cdded90d7da
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
          <p className="font-medium">{error}</p>
          {Object.keys(fieldErrors).length > 0 && (
            <ul className="mt-2 list-inside list-disc space-y-1 text-xs">
              {Object.entries(fieldErrors).map(([field, messages]) => (
                <li key={field}>
                  <span className="font-medium">{field}:</span> {messages.join(', ')}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Pensioner Details</CardTitle>
              <CardDescription>Update the pensioner information below.</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <FormProvider {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      <FormField
                        name="rank"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Rank <span className="text-destructive">*</span></FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger><SelectValue placeholder="Select rank" /></SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {RANK_OPTIONS.map((r) => (
                                  <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Name <span className="text-destructive">*</span></FormLabel>
                            <FormControl><Input placeholder="Full name" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        name="serial_number"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Serial # <span className="text-destructive">*</span></FormLabel>
                            <FormControl><Input placeholder="Serial number" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        name="account_number"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Account #</FormLabel>
                            <FormControl><Input placeholder="Account number" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        name="agency_name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Agency Name (AGDB's / FI's) <span className="text-destructive">*</span></FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger><SelectValue placeholder="Select agency" /></SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {AGENCY_OPTIONS.map((a) => (
                                  <SelectItem key={a.value} value={a.value}>{a.label}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        name="cause_of_stoppage"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Cause of Stoppage <span className="text-destructive">*</span></FormLabel>
                            <FormControl><Input placeholder="Cause of stoppage" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        name="monthly_pension"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Monthly Pension <span className="text-destructive">*</span></FormLabel>
                            <FormControl><Input type="number" min="0" step="0.01" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        name="date_of_death"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Date of Death / Due Date <span className="text-destructive">*</span></FormLabel>
                            <FormControl><Input type="date" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        name="last_payment"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Last Payment <span className="text-destructive">*</span></FormLabel>
                            <FormControl><Input type="date" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        name="amount_collected"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Amount Collected</FormLabel>
                            <FormControl><Input type="number" min="0" step="0.01" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        name="date_collected"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Date Collected</FormLabel>
                            <FormControl><Input type="date" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        name="status"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Status <span className="text-destructive">*</span></FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {STATUS_OPTIONS.map((s) => (
                                  <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <AgencyDeductionRepeater name="agency_deductions" />

                    <div className="flex items-center gap-3">
                      <Button type="submit" disabled={submitting}>
<<<<<<< HEAD
                        {submitting ? 'Saving...' : 'Update Pensioner'}
=======
                        {submitting ? 'Saving...' : 'Save Changes'}
>>>>>>> 885f6e46fde5ccc3d66d67570c482cdded90d7da
                      </Button>
                      <Button type="button" variant="outline" onClick={() => navigate('/pensioners')}>
                        Cancel
                      </Button>
                    </div>
                  </form>
                </FormProvider>
              </Form>
            </CardContent>
          </Card>
        </div>

        {breakdown && (
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Computation Breakdown</CardTitle>
                <CardDescription>Multi-component overpayment calculation</CardDescription>
              </CardHeader>
              <CardContent>
                <OverpaymentComputationBreakdown
                  breakdown={breakdown}
                  grossPension={watchedMP}
                  creditingAgencyName={creditingAgencyName}
                />
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

export default EditPensionerPage;
