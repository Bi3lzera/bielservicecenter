<?php

namespace App\Notifications;

use App\Models\Ticket;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Broadcasting\Channel;

class NewTicketNotification extends Notification implements ShouldBroadcast
{
    use Queueable;

    public $ticket;

    /**
     * Create a new notification instance.
     */
    public function __construct(Ticket $ticket)
    {
        $this->ticket = $ticket;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['database', 'broadcast'];
    }

    /**
     * Get the channels the event should broadcast on (public channel per user)
     */
    public function broadcastOn(): array
    {
        // Broadcast to public channel - each user has their own channel
        return [
            new Channel('notifications'),  // Global notification channel for now
        ];
    }

    /**
     * Get the data to broadcast with the notification
     */
    public function toBroadcast(object $notifiable): array
    {
        return [
            'notifiable_id' => $notifiable->id,
            'notifiable_type' => get_class($notifiable),
            'ticket_id' => $this->ticket->uuid,
            'title' => $this->ticket->title,
            'message' => 'New ticket created: ' . $this->ticket->title,
        ];
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'ticket_id' => $this->ticket->uuid,
            'title' => $this->ticket->title,
            'message' => 'New ticket created: ' . $this->ticket->title,
            'type' => 'new_ticket',
        ];
    }
}
