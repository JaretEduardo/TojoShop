<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('alertas_reabastecimiento', function (Blueprint $table) {
            $table->id('alerta_id');
            $table->unsignedBigInteger('producto_id');
            $table->unsignedBigInteger('sucursal_id');
            $table->unsignedBigInteger('charola_id');
            $table->dateTime('fecha_alerta');
            $table->enum('estado', ['pendiente', 'atendida', 'cancelada']);
            $table->timestamps();

            $table->foreign('producto_id')->references('producto_id')->on('productos')->onDelete('cascade');
            $table->foreign('sucursal_id')->references('sucursal_id')->on('sucursales')->onDelete('cascade');
            $table->foreign('charola_id')->references('charola_id')->on('charolas')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('alertas_reabastecimiento');
    }
};
