<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('pensioners', function (Blueprint $table) {
            $table->decimal('overpayment_amount', 12, 2)->default(0)->after('whole_months');
        });
    }

    public function down(): void
    {
        Schema::table('pensioners', function (Blueprint $table) {
            $table->dropColumn('overpayment_amount');
        });
    }
};
