<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Notifications\Notifiable;

class Ticket extends Model
{
    use HasFactory, HasUuids, Notifiable;

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

    /**
     * Get the channels that the model should broadcast on.
     *
     * @return string
     */
    public function receivesBroadcastNotificationsOn(): string
    {
        return 'ticket.'.$this->uuid;
    }
}
