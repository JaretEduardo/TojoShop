<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('name', 100);
            $table->string('email', 100)->unique();
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password');
            $table->enum('rol', ['usuario', 'empleado', 'encargado'])->default('usuario');
            $table->string('rfid_tag', 50)->nullable();
            $table->unsignedBigInteger('sucursal_id')->nullable();
            $table->rememberToken();
            $table->timestamps();

            $table->foreign('sucursal_id')->references('sucursal_id')->on('sucursales')->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};