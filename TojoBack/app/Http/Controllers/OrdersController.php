<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Orders;

class OrdersController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $orders = Orders::with(['items.product:id,name,price'])
            ->where('user_id', $user->id)
            ->orderByDesc('created_at')
            ->get();

        return response()->json([
            'message' => 'Historial de pedidos obtenido correctamente',
            'data' => $orders,
        ], 200);
    }
}
