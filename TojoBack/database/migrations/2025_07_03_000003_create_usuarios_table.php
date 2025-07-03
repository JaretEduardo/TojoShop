<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('usuarios', function (Blueprint $table) {
            $table->id('usuario_id');
            $table->string('nombre', 100);
            $table->string('email', 100)->unique();
            $table->string('password_hash', 255);
            $table->enum('rol', ['admin', 'user', 'manager']);
            $table->string('rfid_tag', 50)->nullable();
            $table->unsignedBigInteger('sucursal_id');
            $table->timestamps();

            $table->foreign('sucursal_id')->references('sucursal_id')->on('sucursales')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('usuarios');
    }
};
