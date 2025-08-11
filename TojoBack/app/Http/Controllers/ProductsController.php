<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Products;
use App\Models\Categories;
use Illuminate\Support\Facades\DB;

class ProductsController extends Controller
{
    /**
     * GET /api/products
     * Paginated list of products with optional search and category filter.
     * Query params: page, per_page=12, q(optional), category_id(optional)
     */
    public function index(Request $request)
    {
        $perPage = (int) $request->query('per_page', 12);
        $perPage = $perPage > 0 ? min($perPage, 50) : 12; // safety cap
        $q = trim((string) $request->query('q', ''));
        $categoryId = $request->query('category_id');

        $query = Products::query()->with(['category:id,name']);
        if (mb_strlen($q) >= 2) {
            $query->search($q);
        }
        $query->category($categoryId)->orderBy('name');

        $paginator = $query->paginate($perPage);

        return response()->json([
            'message' => 'OK',
            'data' => $paginator->items(),
            'meta' => [
                'current_page' => $paginator->currentPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
                'last_page' => $paginator->lastPage(),
            ],
        ], 200);
    }

    /**
     * GET /api/products/categories
     * Returns existing categories for filters.
     */
    public function categories()
    {
        $categories = Categories::query()
            ->orderBy('name')
            ->get(['id', 'name']);

        return response()->json([
            'message' => 'OK',
            'data' => $categories,
        ], 200);
    }
    /**
     * GET /api/products/search?q=term
     * Returns up to 10 matching products for real-time search.
     */
    public function search(Request $request)
    {
    $q = (string) $request->query('q', '');
    $isNumeric = ctype_digit(trim($q));
    if (!$isNumeric && mb_strlen(trim($q)) < 2) {
            return response()->json([
                'message' => 'Query too short',
                'data' => [],
            ], 200);
        }

        $numericId = $isNumeric ? (int) trim($q) : null;
        $query = Products::query()->search($q);
        if ($isNumeric) {
            // Prioritize exact ID match first
            $query->orderByRaw('CASE WHEN id = ? THEN 0 ELSE 1 END', [$numericId]);
        }
        $products = $query
            ->orderBy('name')
            ->limit(10)
            ->get(['id', 'name', 'price', 'description', 'stock']);

        return response()->json([
            'message' => 'OK',
            'data' => $products,
        ], 200);
    }

    /**
     * POST /api/products/decrement-stock
     * Decrease stock for a list of products atomically. Intended for POS sales.
     * Body: { items: [{ product_id: number, quantity: number }, ...] }
     */
    public function decrementStock(Request $request)
    {
        $validated = $request->validate([
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|integer|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
        ]);

        $items = $validated['items'];
        // Aggregate quantities per product to handle duplicates
        $totals = [];
        foreach ($items as $it) {
            $pid = (int) $it['product_id'];
            $qty = (int) $it['quantity'];
            $totals[$pid] = ($totals[$pid] ?? 0) + $qty;
        }

        try {
            $result = DB::transaction(function () use ($totals) {
                // Lock rows for update to avoid race conditions
                $products = Products::whereIn('id', array_keys($totals))
                    ->lockForUpdate()
                    ->get(['id', 'name', 'stock']);

                // Check stock availability
                foreach ($products as $product) {
                    $need = $totals[$product->id] ?? 0;
                    if ($product->stock < $need) {
                        abort(response()->json([
                            'message' => 'Stock insuficiente',
                            'data' => [
                                'product_id' => $product->id,
                                'name' => $product->name,
                                'available' => $product->stock,
                                'requested' => $need,
                            ],
                        ], 422));
                    }
                }

                // Apply decrements
                $updated = [];
                foreach ($products as $product) {
                    $need = $totals[$product->id] ?? 0;
                    if ($need > 0) {
                        $product->stock = $product->stock - $need;
                        $product->save();
                        $updated[] = [
                            'id' => $product->id,
                            'name' => $product->name,
                            'stock' => $product->stock,
                        ];
                    }
                }

                return $updated;
            });

            return response()->json([
                'message' => 'Venta realizada',
                'data' => $result,
            ], 200);
        } catch (\Throwable $e) {
            return response()->json([
                'message' => 'Error al actualizar stock',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
