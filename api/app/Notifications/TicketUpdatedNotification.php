<?php

namespace App\Notifications;

use App\Models\Ticket;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Broadcasting\Channel as BroadcastChannel;

class TicketUpdatedNotification extends Notification implements ShouldBroadcast
{
    use Queueable;

    public $ticket;
    public $status;

    /**
     * Create a new notification instance.
     */
    public function __construct(Ticket $ticket, string $status)
    {
        $this->ticket = $ticket;
        $this->status = $status;
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
            new BroadcastChannel('notifications'),
        ];
    }

    /**
     * Get the data to broadcast
     */
    public function toBroadcast(object $notifiable): array
    {
        return [
            'notifiable_id' => $notifiable->id,
            'notifiable_type' => get_class($notifiable),
            'ticket_id' => $this->ticket->uuid,
            'title' => $this->ticket->title,
            'message' => $this->getStatusMessage(),
            'status' => $this->status,
        ];
    }

    /**
     * Get user-friendly message based on status
     */
    private function getStatusMessage(): string
    {
        $messages = [
            'Aberto' => '📋 Seu chamado foi reaberto',
            'Em Andamento' => '🚀 Ótimas notícias! Sua tarefa iniciou e está em andamento',
            'Resolvido' => '✅ Seu chamado foi resolvido! Verifique se está tudo ok',
            'Rejeitado' => '❌ Seu chamado foi rejeitado. Veja os detalhes',
            'Fechado_Satisfeito' => '😊 Chamado fechado - Obrigado pelo feedback positivo!',
            'Fechado_Insatisfeito' => '😔 Chamado fechado - Lamentamos não ter atendido suas expectativas',
        ];

        return $messages[$this->status] ?? "Status atualizado para: {$this->status}";
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
            'message' => $this->getStatusMessage(),
            'status' => $this->status,
        ];
    }
}
