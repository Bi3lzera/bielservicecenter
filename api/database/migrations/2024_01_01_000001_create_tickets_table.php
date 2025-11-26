<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('tickets', function (Blueprint $table) {
            $table->uuid('uuid')->primary();
            $table->string('title');
            $table->text('description');
            $table->string('reason');
            $table->enum('urgency', ['Baixa', 'Média', 'Alta']);
            $table->enum('status', ['Aberto', 'Em Andamento', 'Resolvido', 'Rejeitado', 'Fechado_Satisfeito', 'Fechado_Insatisfeito'])->default('Aberto');
            $table->timestamp('deadline')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tickets');
    }
};
