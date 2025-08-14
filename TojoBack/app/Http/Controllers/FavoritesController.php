<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Favorite;
use App\Models\Products;

class FavoritesController extends Controller
{
    // Listar favoritos del usuario autenticado
    public function index(Request $request)
    {
        $user = $request->user();
        $favorites = Favorite::with(['product:id,name,price,description,stock,category_id'])
            ->where('user_id', $user->id)
            ->get()
            ->map(function ($fav) {
                return [
                    'id' => $fav->product->id,
                    'name' => $fav->product->name,
                    'price' => $fav->product->price,
                    'description' => $fav->product->description,
                    'stock' => $fav->product->stock,
                    'category_id' => $fav->product->category_id,
                ];
            });

        return response()->json([
            'message' => 'Favoritos obtenidos correctamente',
            'data' => $favorites,
        ], 200);
    }

    // Agregar un favorito
    public function store(Request $request)
    {
        $validated = $request->validate([
            'product_id' => 'required|exists:products,id'
        ]);
        $user = $request->user();

        $fav = Favorite::firstOrCreate([
            'user_id' => $user->id,
            'product_id' => $validated['product_id'],
        ]);

        return response()->json([
            'message' => 'Producto agregado a favoritos',
            'data' => $fav,
        ], 201);
    }

    // Remover un favorito
    public function destroy(Request $request, int $productId)
    {
        $user = $request->user();
        Favorite::where('user_id', $user->id)->where('product_id', $productId)->delete();

        return response()->json([
            'message' => 'Producto removido de favoritos',
        ], 200);
    }
}
