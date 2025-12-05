<?php

namespace App\Notifications;

use App\Models\Ticket;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Broadcasting\Channel;

class TicketDeletedNotification extends Notification implements ShouldBroadcast
{
    use Queueable;

    public $ticketTitle;
    public $ticketUuid;

    /**
     * Create a new notification instance.
     */
    public function __construct(string $ticketTitle, string $ticketUuid)
    {
        $this->ticketTitle = $ticketTitle;
        $this->ticketUuid = $ticketUuid;
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
     * Get the channels the event should broadcast on.
     */
    public function broadcastOn(): array
    {
        return [
            new Channel('ticket.'.$this->ticketUuid),
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
            'ticket_id' => $this->ticketUuid,
            'title' => $this->ticketTitle,
            'message' => 'Ticket deleted: ' . $this->ticketTitle,
            'type' => 'ticket_deleted',
        ];
    }
}
