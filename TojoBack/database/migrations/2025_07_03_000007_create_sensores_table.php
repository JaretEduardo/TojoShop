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
            $table->string('ubicacion', 255)->nullable();
            $table->unsignedBigInteger('charola_id');
            $table->timestamps();

            $table->foreign('charola_id')->references('charola_id')->on('charolas')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sensores');
    }
};
