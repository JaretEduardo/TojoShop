<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('order_items')) {
            Schema::create('order_items', function (Blueprint $table) {
                $table->id();
                $table->foreignId('order_id')->constrained('orders')->onDelete('cascade');
                $table->foreignId('product_id')->constrained('products')->onDelete('cascade');
                $table->unsignedInteger('quantity');
                $table->decimal('price', 12, 2); // price at purchase time
                $table->timestamps();
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('order_items')) {
            Schema::dropIfExists('order_items');
        }
    }
};
