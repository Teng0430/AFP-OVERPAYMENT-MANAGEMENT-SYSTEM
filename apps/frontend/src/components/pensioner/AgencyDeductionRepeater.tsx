import { useFieldArray, useFormContext } from 'react-hook-form';
import { Plus, X, ChevronUp, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { AGENCY_OPTIONS } from '@/types';

const MAX_DEDUCTIONS = 10;

interface AgencyDeductionRepeaterProps {
  name: string;
}

export function AgencyDeductionRepeater({ name }: AgencyDeductionRepeaterProps) {
  const { control } = useFormContext();
  const { fields, append, remove, swap } = useFieldArray({ control, name });

  return (
    <div className="space-y-3">
      <FormLabel>Agency Deductions</FormLabel>
      {fields.map((field, index) => (
        <div key={field.id} className="flex items-end gap-2">
          <div className="flex flex-col gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              disabled={index === 0}
              onClick={() => swap(index, index - 1)}
              aria-label="Move up"
            >
              <ChevronUp className="h-3 w-3" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              disabled={index === fields.length - 1}
              onClick={() => swap(index, index + 1)}
              aria-label="Move down"
            >
              <ChevronDown className="h-3 w-3" />
            </Button>
          </div>
          <FormField
            control={control}
            name={`${name}.${index}.agency_name`}
            render={({ field: f }) => (
              <FormItem className="flex-1">
                {index === 0 && <FormLabel>Agency Name (AGDB's / FI's)</FormLabel>}
                <Select onValueChange={f.onChange} value={f.value}>
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
            control={control}
            name={`${name}.${index}.amount`}
            render={({ field: f }) => (
              <FormItem className="flex-1">
                {index === 0 && <FormLabel>Deduction Amount</FormLabel>}
                <FormControl>
                  <Input type="number" min="0" step="0.01" placeholder="0.00" {...f} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="mb-1 flex items-center gap-1">
            {index === 0 && (
              <Badge variant="outline" className="text-xs whitespace-nowrap">
                Crediting Agency
              </Badge>
            )}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              disabled={fields.length <= 1}
              onClick={() => remove(index)}
              aria-label="Remove agency deduction"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
      {fields.length < MAX_DEDUCTIONS && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => append({ agency_name: '', amount: '' })}
        >
          <Plus className="mr-2 h-4 w-4" /> Add Agency
        </Button>
      )}
      {fields.length >= MAX_DEDUCTIONS && (
        <p className="text-xs text-muted-foreground">Maximum of 10 agency deductions reached.</p>
      )}
    </div>
  );
}
