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
        Schema::create('alerts', function (Blueprint $table) {
            $table->id();
            $table->string('sensor_key'); // FK lógica a sensors.key
            $table->unsignedBigInteger('feed_id'); // feed/dato específico
            $table->string('value', 255); // valor leído (snap)
            $table->timestamp('triggered_at')->useCurrent();
            $table->timestamps();

            $table->foreign('sensor_key')
                ->references('key')
                ->on('sensors')
                ->onUpdate('cascade')
                ->onDelete('cascade');
            $table->index(['sensor_key', 'feed_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('alerts')) {
            Schema::dropIfExists('alerts');
        }
    }
};
