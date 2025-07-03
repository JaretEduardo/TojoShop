<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('lecturas_sensor', function (Blueprint $table) {
            $table->id('lectura_id');
            $table->unsignedBigInteger('sensor_id');
            $table->dateTime('fecha_hora');
            $table->float('valor');
            $table->boolean('estado_alerta')->default(false);
            $table->timestamps();

            $table->foreign('sensor_id')->references('sensor_id')->on('sensores')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('lecturas_sensor');
    }
};
