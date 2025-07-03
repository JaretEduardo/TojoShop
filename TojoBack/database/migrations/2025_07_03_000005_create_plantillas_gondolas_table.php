<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('plantillas_gondolas', function (Blueprint $table) {
            $table->id('plantilla_id');
            $table->unsignedBigInteger('sucursal_id');
            $table->string('nombre_gondola', 100);
            $table->text('descripcion')->nullable();
            $table->timestamps();

            $table->foreign('sucursal_id')->references('sucursal_id')->on('sucursales')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('plantillas_gondolas');
    }
};
