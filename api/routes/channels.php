<?php

use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

// Public channel for all notifications (filtered client-side)
Broadcast::channel('notifications', function () {
    return true;
});

// Public channel for ticket notifications (no auth required)
Broadcast::channel('ticket.{uuid}', function () {
    return true;
});
