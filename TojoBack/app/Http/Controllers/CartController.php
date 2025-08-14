<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\kart; // existing model (lowercase class name)
use App\Models\Products;
use App\Models\Orders;
use App\Models\OrderItem;
use Illuminate\Support\Facades\DB;

class CartController extends Controller
{
    // List cart items for the authenticated user
    public function index(Request $request)
    {
        $user = $request->user();
        $items = kart::with(['product:id,name,price,description,stock,category_id'])
            ->where('user_id', $user->id)
            ->get()
            ->map(function ($item) {
                return [
                    'product_id' => $item->product->id,
                    'name' => $item->product->name,
                    'price' => $item->product->price,
                    'description' => $item->product->description,
                    'stock' => $item->product->stock,
                    'category_id' => $item->product->category_id,
                    'quantity' => $item->quantity ?? 1,
                ];
            });

        return response()->json([
            'message' => 'Carrito obtenido correctamente',
            'data' => $items,
        ], 200);
    }

    // Add or increment a product in the cart
    public function store(Request $request)
    {
        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
            'quantity' => 'sometimes|integer|min:1'
        ]);
        $user = $request->user();

        $quantity = $validated['quantity'] ?? 1;

        $item = kart::firstOrCreate([
            'user_id' => $user->id,
            'product_id' => $validated['product_id'],
        ], [
            'quantity' => $quantity,
        ]);

        if (!$item->wasRecentlyCreated) {
            $item->quantity = ($item->quantity ?? 0) + $quantity;
            $item->save();
        }

        return response()->json([
            'message' => 'Producto agregado al carrito',
            'data' => $item,
        ], 201);
    }

    // Remove a product from the cart
    public function destroy(Request $request, int $productId)
    {
        $user = $request->user();
        kart::where('user_id', $user->id)->where('product_id', $productId)->delete();

        return response()->json([
            'message' => 'Producto removido del carrito',
        ], 200);
    }

    // Update a product quantity in the cart
    public function update(Request $request, int $productId)
    {
        $validated = $request->validate([
            'quantity' => 'required|integer|min:1'
        ]);
        $user = $request->user();

        $item = kart::updateOrCreate(
            ['user_id' => $user->id, 'product_id' => $productId],
            ['quantity' => $validated['quantity']]
        );

        return response()->json([
            'message' => 'Cantidad actualizada',
            'data' => $item,
        ], 200);
    }

    // Proceed to checkout: create an order from cart, decrease stock, and clear cart
    public function checkout(Request $request)
    {
        $user = $request->user();

        // Load cart items
        $cartItems = kart::where('user_id', $user->id)->get();

        if ($cartItems->isEmpty()) {
            return response()->json([
                'message' => 'El carrito está vacío',
            ], 422);
        }

        try {
            // Use transaction to ensure atomicity
            $order = DB::transaction(function () use ($user, $cartItems) {
                $total = 0;

                // Re-check stock with row-level locks and compute total
                $lockedProducts = [];
                foreach ($cartItems as $item) {
                    $qty = max(1, (int)($item->quantity ?? 1));
                    $product = Products::where('id', $item->product_id)->lockForUpdate()->firstOrFail();
                    if ($product->stock < $qty) {
                        throw new \RuntimeException('Stock insuficiente para el producto: ' . $product->name);
                    }
                    $lockedProducts[] = [$product, $qty];
                    $total += ($product->price * $qty);
                }

                // Create order
                $order = Orders::create([
                    'user_id' => $user->id,
                    'order_number' => 'ORD-' . now()->format('Ymd-His') . '-' . $user->id,
                    'status' => 'processing',
                    'total' => $total,
                ]);

                // Create items and decrease stock
                foreach ($lockedProducts as [$product, $qty]) {
                    OrderItem::create([
                        'order_id' => $order->id,
                        'product_id' => $product->id,
                        'quantity' => $qty,
                        'price' => $product->price,
                    ]);

                    // Decrease stock
                    $product->decrement('stock', $qty);
                }

                // Clear cart
                kart::where('user_id', $user->id)->delete();

                return $order->load(['items.product:id,name,price']);
            });

            return response()->json([
                'message' => 'Pedido creado correctamente',
                'data' => $order,
            ], 201);
        } catch (\RuntimeException $e) {
            return response()->json([
                'message' => $e->getMessage(),
            ], 422);
        }
    }
}
