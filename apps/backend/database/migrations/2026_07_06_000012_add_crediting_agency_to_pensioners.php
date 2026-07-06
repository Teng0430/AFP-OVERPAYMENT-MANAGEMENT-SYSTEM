<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('pensioners', function (Blueprint $table): void {
            $table->string('crediting_agency_name', 50)->nullable()->after('agency_deductions');
        });
    }

    public function down(): void
    {
        Schema::table('pensioners', function (Blueprint $table): void {
            $table->dropColumn('crediting_agency_name');
        });
    }
};
