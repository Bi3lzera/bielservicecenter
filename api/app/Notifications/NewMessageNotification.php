<?php

namespace App\Notifications;

use App\Models\Ticket;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Broadcasting\Channel;

class NewMessageNotification extends Notification implements ShouldBroadcast
{
    use Queueable;

    public $ticket;
    public $senderName;
    public $message;

    /**
     * Create a new notification instance.
     */
    public function __construct(Ticket $ticket, string $senderName, string $message)
    {
        $this->ticket = $ticket;
        $this->senderName = $senderName;
        $this->message = $message;
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
     * Broadcast on public notifications channel
     */
    public function broadcastOn(): array
    {
        return [
            new Channel('notifications'),
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
            'ticket_id' => $this->ticket->id,
            'title' => $this->ticket->title,
            'sender' => $this->senderName,
            'message' => 'New message from ' . $this->senderName . ': ' . substr($this->message, 0, 50) . '...',
            'type' => 'new_message',
        ];
    }
}
