<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ticket_comments', function (Blueprint $table) {
            $table->id();
            $table->string('ticket_uuid');
            $table->text('message');
            $table->string('sender_name'); // Can be client name or "Admin"
            $table->enum('sender_type', ['client', 'admin']); // Who sent it
            $table->timestamps();

            $table->foreign('ticket_uuid')->references('uuid')->on('tickets')->onDelete('cascade');
            $table->index('ticket_uuid');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ticket_comments');
    }
};
