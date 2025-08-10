<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Products;
use App\Models\Categories;

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
        if (mb_strlen(trim($q)) < 2) {
            return response()->json([
                'message' => 'Query too short',
                'data' => [],
            ], 200);
        }

        $products = Products::query()
            ->search($q)
            ->orderBy('name')
            ->limit(10)
            ->get(['id', 'name', 'price', 'description', 'stock']);

        return response()->json([
            'message' => 'OK',
            'data' => $products,
        ], 200);
    }
}
