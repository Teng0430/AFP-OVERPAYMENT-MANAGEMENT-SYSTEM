<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('collections', function (Blueprint $table) {
            $table->id();
            $table->foreignId('pensioner_id')->constrained('pensioners')->cascadeOnDelete();
            $table->decimal('amount', 12, 2);
            $table->date('collection_date');
            $table->string('collection_type', 50);
            $table->string('reference')->nullable();
            $table->string('collector')->nullable();
            $table->text('remarks')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index('pensioner_id');
            $table->index('collection_date');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('collections');
    }
};
