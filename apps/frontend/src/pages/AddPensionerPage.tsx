import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft } from 'lucide-react';
import { create } from '@/services/pensioners';
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

const pensionerSchema = z.object({
  rank: z.string().min(1, 'Rank is required'),
  name: z.string().min(1, 'Name is required'),
  serial_number: z.string().min(1, 'Serial number is required'),
  account_number: z.string().optional(),
  date_of_death: z.string().optional(),
  cause_of_stoppage: z.string().min(1, 'Cause of stoppage is required'),
  agency_name: z.string().min(1, 'Agency is required'),
  monthly_pension: z.coerce.number().min(0, 'Must be >= 0'),
  agency_deduction: z.coerce.number().optional(),
  fractional_days: z.coerce.number().min(0).max(31).optional(),
  whole_months: z.coerce.number().min(0).optional(),
  amount_collected: z.coerce.number().min(0).optional(),
  date_collected: z.string().optional(),
  status: z.string().min(1, 'Status is required'),
});

type PensionerFormData = z.infer<typeof pensionerSchema>;

function AddPensionerPage() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const form = useForm<PensionerFormData>({
    resolver: zodResolver(pensionerSchema),
    defaultValues: {
      rank: '',
      name: '',
      serial_number: '',
      account_number: '',
      date_of_death: '',
      cause_of_stoppage: '',
      agency_name: '',
      monthly_pension: 0,
      agency_deduction: 0,
      fractional_days: 0,
      whole_months: 0,
      amount_collected: 0,
      date_collected: '',
      status: '',
    },
  });

  async function onSubmit(data: PensionerFormData) {
    try {
      setSubmitting(true);
      setError('');
      await create(data);
      navigate('/pensioners');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create pensioner.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/pensioners')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Add Pensioner</h1>
          <p className="text-sm text-muted-foreground">Create a new overpayment record.</p>
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Pensioner Details</CardTitle>
          <CardDescription>Fill in the pensioner information below.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <FormField
                  control={form.control}
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
                  control={form.control}
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
                  control={form.control}
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
                  control={form.control}
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
                  control={form.control}
                  name="agency_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Agency <span className="text-destructive">*</span></FormLabel>
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
                  control={form.control}
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
                  control={form.control}
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
                  control={form.control}
                  name="agency_deduction"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Agency Deduction</FormLabel>
                      <FormControl><Input type="number" min="0" step="0.01" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="fractional_days"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fractional Days</FormLabel>
                      <FormControl><Input type="number" min="0" max="31" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="whole_months"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Whole Months</FormLabel>
                      <FormControl><Input type="number" min="0" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
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
                  control={form.control}
                  name="date_of_death"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date of Death</FormLabel>
                      <FormControl><Input type="date" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
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
                  control={form.control}
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

              <div className="flex items-center gap-3">
                <Button type="submit" disabled={submitting}>
                  {submitting ? 'Saving...' : 'Create Pensioner'}
                </Button>
                <Button type="button" variant="outline" onClick={() => navigate('/pensioners')}>
                  Cancel
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

export default AddPensionerPage;
