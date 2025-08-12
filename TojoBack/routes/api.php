<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ProductsController;
use App\Http\Controllers\FavoritesController;
use App\Http\Controllers\CartController;
use App\Http\Controllers\OrdersController;
use App\Http\Controllers\SensorController;

// Auth routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');

// Products routes
Route::get('/products', [ProductsController::class, 'index']);
Route::get('/products/categories', [ProductsController::class, 'categories']);
Route::get('/products/search', [ProductsController::class, 'search']);
// POS action: only employees can decrement stock via POS
Route::middleware(['auth:sanctum', 'role:employee'])->post('/products/decrement-stock', [ProductsController::class, 'decrementStock']);

// Favorites routes (auth required)
// Customer features: only 'user' role (not employee) can use favorites/cart/orders
Route::middleware(['auth:sanctum', 'role:user'])->group(function () {
	Route::get('/favorites', [FavoritesController::class, 'index']);
	Route::post('/favorites', [FavoritesController::class, 'store']);
	Route::delete('/favorites/{productId}', [FavoritesController::class, 'destroy']);
	// Cart routes
	Route::get('/cart', [CartController::class, 'index']);
	Route::post('/cart', [CartController::class, 'store']);
	Route::patch('/cart/{productId}', [CartController::class, 'update']);
	Route::delete('/cart/{productId}', [CartController::class, 'destroy']);
	// Checkout
	Route::post('/cart/checkout', [CartController::class, 'checkout']);

	// Orders
	Route::get('/orders', [OrdersController::class, 'index']);
});


Route::middleware(['auth:sanctum', 'role:encargado'])->group(function () {
	Route::get('/allfeeds', [SensorController::class, 'AllFeeds']);
	Route::post('/createfeed', [SensorController::class, 'CreateFeed']);
	Route::put('/updatefeed/{key}', [SensorController::class, 'UpdateFeed']);
	Route::delete('/deletefeed/{key}', [SensorController::class, 'DeleteFeed']);
});
