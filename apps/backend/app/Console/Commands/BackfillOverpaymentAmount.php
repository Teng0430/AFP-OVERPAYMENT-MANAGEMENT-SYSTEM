<?php

namespace App\Console\Commands;

use App\Models\Pensioner;
use App\Services\OverpaymentCalculationService;
use Illuminate\Console\Command;

class BackfillOverpaymentAmount extends Command
{
    protected $signature = 'pensioners:backfill-overpayment';

    protected $description = 'Backfill overpayment_amount, whole_months, and fractional_days for existing pensioner records';

    public function handle(): int
    {
        $updated = 0;
        $skipped = 0;

        Pensioner::chunk(100, function ($pensioners) use (&$updated, &$skipped) {
            foreach ($pensioners as $pensioner) {
                if ($pensioner->date_of_death === null || $pensioner->last_payment === null) {
                    $skipped++;

                    continue;
                }

                $pensioner->timestamps = false;

                $pensioner->update([
                    'overpayment_amount' => OverpaymentCalculationService::overpaymentAmount(
                        (float) $pensioner->monthly_pension,
                        $pensioner->date_of_death,
                        $pensioner->last_payment,
                    ),
                    'whole_months' => OverpaymentCalculationService::wholeMonths(
                        $pensioner->date_of_death,
                        $pensioner->last_payment,
                    ),
                    'fractional_days' => OverpaymentCalculationService::fractionalDays(
                        $pensioner->date_of_death,
                        $pensioner->last_payment,
                    ),
                ]);

                $updated++;
            }
        });

        $this->info("Backfill complete: {$updated} updated, {$skipped} skipped.");

        return self::SUCCESS;
    }
}
