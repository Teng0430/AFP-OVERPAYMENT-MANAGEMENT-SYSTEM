<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pensioners', function (Blueprint $table) {
            $table->id();
            $table->string('rank', 20);
            $table->string('name', 255);
            $table->string('serial_number', 50)->unique();
            $table->string('account_number', 50)->nullable();
            $table->date('date_of_death')->nullable();
            $table->string('cause_of_stoppage', 255);
            $table->string('agency_name', 50);
            $table->decimal('monthly_pension', 12, 2);
            $table->decimal('agency_deduction', 12, 2)->nullable()->default(0);
            $table->decimal('fractional_days', 5, 3)->default(0);
            $table->integer('whole_months')->default(0);
            $table->decimal('amount_collected', 12, 2)->default(0);
            $table->date('date_collected')->nullable();
            $table->enum('status', ['recovered', 'not-yet-recovered', 'recovered-but-inc']);
            $table->foreignId('upload_batch_id')->nullable()->index();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index('name');
            $table->index('serial_number');
            $table->index('account_number');
            $table->index('rank');
            $table->index('agency_name');
            $table->index('status');
            $table->index('cause_of_stoppage');
            $table->index('date_of_death');
            $table->index('created_by');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pensioners');
    }
};
