<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('alerts', function (Blueprint $table) {
            $table->id();
            $table->string('type', 50);
            $table->enum('severity', ['critical', 'warning', 'info', 'resolved']);
            $table->string('title', 255);
            $table->text('message');
            $table->foreignId('pensioner_id')->nullable()->constrained('pensioners')->nullOnDelete();
            $table->foreignId('assigned_to')->nullable()->constrained('users')->nullOnDelete();
            $table->boolean('is_read')->default(false);
            $table->timestamp('read_at')->nullable();
            $table->timestamps();

            $table->index('type');
            $table->index('severity');
            $table->index('is_read');
            $table->index('assigned_to');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('alerts');
    }
};
