<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ProductsController;
use App\Http\Controllers\FavoritesController;

// Auth routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');

// Products routes
Route::get('/products', [ProductsController::class, 'index']);
Route::get('/products/categories', [ProductsController::class, 'categories']);
Route::get('/products/search', [ProductsController::class, 'search']);

// Favorites routes (auth required)
Route::middleware('auth:sanctum')->group(function () {
	Route::get('/favorites', [FavoritesController::class, 'index']);
	Route::post('/favorites', [FavoritesController::class, 'store']);
	Route::delete('/favorites/{productId}', [FavoritesController::class, 'destroy']);
});