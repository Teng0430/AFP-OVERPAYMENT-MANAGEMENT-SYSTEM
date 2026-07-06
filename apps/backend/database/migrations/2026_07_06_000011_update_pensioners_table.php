<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('pensioners', function (Blueprint $table): void {
            $table->date('last_payment')->nullable()->after('date_of_death');
            $table->json('agency_deductions')->nullable()->after('agency_deduction');
        });
    }

    public function down(): void
    {
        Schema::table('pensioners', function (Blueprint $table): void {
            $table->dropColumn(['last_payment', 'agency_deductions']);
        });
    }
};
