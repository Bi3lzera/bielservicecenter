<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Ticket extends Model
{
    use HasFactory, HasUuids;

    protected $primaryKey = 'uuid';

    protected $fillable = [
        'title',
        'description',
        'reason',
        'urgency',
        'client_name',
        'status',
        'deadline',
    ];

    protected $casts = [
        'deadline' => 'datetime',
    ];
}
