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
            $table->string('key')->unique(); // clave externa lógica usada por feeds
            $table->string('name');          // nombre legible interno
            $table->boolean('status');       // activo/inactivo
            $table->string('type_data');     // tipo semántico: temperatura, presencia, gas, peso, puerta, rfid
            $table->string('unit')->nullable(); // unidad física (°C, ppm, g, grados, bool, id, etc.)
            $table->string('data_format')->nullable(); // formato de dato recibido (number, boolean, string, id)
            // Rango esperado para generar alertas (nullable si no aplica)
            $table->decimal('min_value', 12, 4)->nullable(); // null si no aplica
            $table->decimal('max_value', 12, 4)->nullable(); // null si no aplica
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
