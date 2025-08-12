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
        Schema::create('sensor_data', function (Blueprint $table) {
            $table->id();
            // Relación por clave externa lógica (sensor.key)
            $table->string('sensor_key');
            // Información del feed Adafruit
            $table->string('feed_key');
            $table->unsignedBigInteger('feed_id');
            // Valor leído: puede ser hexadecimal, numérico, texto => se almacena como string
            $table->string('value', 255);
            // Marca de tiempo opcional del momento en que recibimos el dato internamente
            $table->timestamp('received_at')->useCurrent();
            $table->timestamps();

            // Índices y FK
            $table->foreign('sensor_key')
                ->references('key')
                ->on('sensors')
                ->onUpdate('cascade')
                ->onDelete('cascade');
            $table->index(['sensor_key', 'feed_key']);
            $table->index('feed_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('sensor_data')) {
            Schema::dropIfExists('sensor_data');
        }
    }
};
