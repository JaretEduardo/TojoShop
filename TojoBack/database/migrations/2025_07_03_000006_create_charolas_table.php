<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('charolas', function (Blueprint $table) {
            $table->id('charola_id');
            $table->unsignedBigInteger('plantilla_id');
            $table->string('nombre_charola', 100);
            $table->unsignedBigInteger('producto_id');
            $table->timestamps();

            $table->foreign('plantilla_id')->references('plantilla_id')->on('plantillas_gondolas')->onDelete('cascade');
            $table->foreign('producto_id')->references('producto_id')->on('productos')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('charolas');
    }
};
