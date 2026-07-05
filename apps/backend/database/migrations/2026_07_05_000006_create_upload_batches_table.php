<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('upload_batches', function (Blueprint $table) {
            $table->id();
            $table->string('file_name', 255);
            $table->string('file_type', 10);
            $table->integer('file_size');
            $table->integer('total_rows');
            $table->integer('success_count')->default(0);
            $table->integer('error_count')->default(0);
            $table->integer('duplicate_count')->default(0);
            $table->json('errors')->nullable();
            $table->json('column_mapping')->nullable();
            $table->enum('status', ['pending', 'processing', 'completed', 'failed']);
            $table->foreignId('uploaded_by')->constrained('users');
            $table->timestamps();

            $table->index('uploaded_by');
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('upload_batches');
    }
};
