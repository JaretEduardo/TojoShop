<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sensores', function (Blueprint $table) {
            $table->id('sensor_id');
            $table->enum('tipo_sensor', ['peso', 'temperatura', 'otro']);
            $table->integer('posicion_x')->nullable();
            $table->integer('posicion_y')->nullable();
            $table->unsignedBigInteger('gondola_id');
            $table->timestamps();

            $table->foreign('gondola_id')
                ->references('plantilla_id')
                ->on('plantillas_gondolas')
                ->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sensores');
    }
};
