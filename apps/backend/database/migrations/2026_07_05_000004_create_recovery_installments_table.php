<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('recovery_installments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('pensioner_id')->constrained('pensioners')->cascadeOnDelete();
            $table->integer('installment_no');
            $table->date('date_paid');
            $table->decimal('amount_paid', 12, 2);
            $table->decimal('running_balance', 12, 2);
            $table->string('collector')->nullable();
            $table->text('remarks')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index('pensioner_id');
            $table->index('date_paid');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('recovery_installments');
    }
};
