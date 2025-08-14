<?php

namespace App\Events;

use App\Models\SensorData;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class SensorDataIngested implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public string $sensor_key;
    public string $feed_key;
    public string $value;
    public string $received_at;

    public function __construct(SensorData $data)
    {
        $this->sensor_key = $data->sensor_key;
        $this->feed_key = $data->feed_key;
        $this->value = (string)$data->value;
        $this->received_at = $data->received_at?->toIso8601String() ?? now()->toIso8601String();
    }

    public function broadcastOn(): Channel
    {
        return new Channel('sensors');
    }

    public function broadcastAs(): string
    {
        return 'sensor.data';
    }
}
