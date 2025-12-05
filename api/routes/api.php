<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\TicketController;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// Public Routes
Route::get('/tickets', [TicketController::class, 'indexPublic']);
Route::post('/tickets', [TicketController::class, 'store']);
Route::get('/tickets/{uuid}', [TicketController::class, 'show']);
Route::put('/tickets/{uuid}', [TicketController::class, 'updateClient']);
Route::delete('/tickets/{uuid}', [TicketController::class, 'destroyClient']);
Route::patch('/tickets/{uuid}/feedback', [TicketController::class, 'feedback']);

// Comment Routes
Route::get('/tickets/{uuid}/comments', [TicketController::class, 'getComments']);
Route::post('/tickets/{uuid}/comments', [TicketController::class, 'addComment']);

// Client Auto-Login (creates user if not exists)
Route::post('/client/auto-login', function (Request $request) {
    $request->validate([
        'name' => 'required|string|min:2|max:100',
    ]);

    $name = $request->name;
    $email = strtolower(str_replace(' ', '.', $name)) . '@client.local';
    
    // Find or create user
    $user = User::firstOrCreate(
        ['email' => $email],
        [
            'name' => $name,
            'password' => Hash::make($name), // Deterministic password based on name
            'is_employee' => false,
        ]
    );

    // Create token
    $token = $user->createToken('client-token')->plainTextToken;

    return response()->json([
        'token' => $token,
        'user' => $user
    ]);
});

// Auth Route (Simple login for demo purposes)
Route::post('/login', function (Request $request) {
    $request->validate([
        'email' => 'required|email',
        'password' => 'required',
    ]);

    $user = User::where('email', $request->email)->first();

    if (! $user || ! Hash::check($request->password, $user->password)) {
        throw ValidationException::withMessages([
            'email' => ['As credenciais fornecidas estão incorretas.'],
        ]);
    }

    if (! $user->is_employee) {
         throw ValidationException::withMessages([
            'email' => ['Acesso restrito a funcionários.'],
        ]);
    }

    return response()->json([
        'token' => $user->createToken('employee-token')->plainTextToken,
        'user' => $user
    ]);
});

// Protected Routes (Employee)
Route::middleware(['auth:sanctum'])->group(function () {
    Route::get('/admin/tickets', [TicketController::class, 'index']);
    Route::put('/admin/tickets/{uuid}', [TicketController::class, 'update']);
    Route::delete('/admin/tickets/{uuid}', [TicketController::class, 'destroy']);

    // Notifications
    Route::get('/notifications', [App\Http\Controllers\NotificationController::class, 'index']);
    Route::put('/notifications/{id}/read', [App\Http\Controllers\NotificationController::class, 'markAsRead']);
    Route::put('/notifications/read-all', [App\Http\Controllers\NotificationController::class, 'markAllAsRead']);
});
