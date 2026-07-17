<?php

namespace Database\Factories;

use App\Models\Pensioner;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Pensioner>
 */
class PensionerFactory extends Factory
{
    protected $model = Pensioner::class;

    public function definition(): array
    {
        $ranks = ['LCDR', 'CDR', 'CAPT', 'LT', 'ENS', 'PO1', 'PO2', 'SN'];
        $agencies = ['LBP', 'DBP', 'AFPSLAI', 'PVB', 'ACDI'];
        $dateOfDeath = fake()->dateTimeBetween('-2 years', '-1 month')->format('Y-m-d');

        return [
            'rank' => fake()->randomElement($ranks),
            'name' => fake()->name(),
            'serial_number' => strtoupper(fake()->bothify('??-####')),
            'account_number' => fake()->optional()->numerify('########'),
            'date_of_death' => $dateOfDeath,
            'last_payment' => fake()->dateTimeBetween($dateOfDeath, '+6 months')->format('Y-m-d'),
            'cause_of_stoppage' => fake()->randomElement(['Late Death Reporting', 'Remarried', 'Termination of Benefits']),
            'agency_name' => fake()->randomElement($agencies),
            'monthly_pension' => fake()->randomFloat(2, 10000, 100000),
            'fractional_days' => fake()->randomFloat(3, 0, 30),
            'whole_months' => fake()->numberBetween(0, 12),
            'amount_collected' => fake()->randomFloat(2, 0, 50000),
            'status' => fake()->randomElement(['recovered', 'not-yet-recovered', 'recovered-but-inc']),
        ];
    }
}
