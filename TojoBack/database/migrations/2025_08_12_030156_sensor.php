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
        Schema::create('sensors', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique(); // clave externa lógica usada por feeds Adafruit
            $table->string('name');          // nombre legible interno
            $table->boolean('status'); // estado normalizado
            $table->string('type_data');     // tipo de dato esperado (temperatura, distancia, etc.)
            // Rango esperado para generar alertas (nullable si no aplica)
            $table->decimal('min_value', 12, 4)->nullable();
            $table->decimal('max_value', 12, 4)->nullable();
            $table->timestamps();
            
            $table->index('type_data');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('sensors')) {
            Schema::dropIfExists('sensors');
        }
    }
};
