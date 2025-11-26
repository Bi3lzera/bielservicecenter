<?php

namespace App\Http\Controllers;

use App\Models\Ticket;
use App\Models\TicketComment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class TicketController extends Controller
{
    // Public: Create Ticket
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'reason' => 'required|string',
            'urgency' => 'required|in:Baixa,Média,Alta',
            'client_name' => 'required|string|max:100',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $ticket = Ticket::create([
            'title' => $request->title,
            'description' => $request->description,
            'reason' => $request->reason,
            'urgency' => $request->urgency,
            'client_name' => $request->client_name,
            'status' => 'Aberto',
        ]);

        return response()->json(['uuid' => $ticket->uuid], 201);
    }

    // Public: Get Ticket + Queue Position
    public function show($uuid)
    {
        $ticket = Ticket::where('uuid', $uuid)->firstOrFail();

        $position = 0;
        if ($ticket->status === 'Aberto') {
            $position = Ticket::where('status', 'Aberto')
                ->where('created_at', '<', $ticket->created_at)
                ->count();
        }

        return response()->json([
            'ticket' => $ticket,
            'queue_position' => $position,
        ]);
    }

    // Public: Feedback
    public function feedback(Request $request, $uuid)
    {
        $ticket = Ticket::where('uuid', $uuid)->firstOrFail();

        if ($ticket->status !== 'Resolvido') {
            return response()->json(['message' => 'Feedback only allowed for Resolved tickets.'], 403);
        }

        $request->validate([
            'satisfaction' => 'required|in:Satisfeito,Insatisfeito',
        ]);

        $newStatus = $request->satisfaction === 'Satisfeito' ? 'Fechado_Satisfeito' : 'Fechado_Insatisfeito';
        $ticket->update(['status' => $newStatus]);

        return response()->json(['message' => 'Feedback recorded.']);
    }

    // Public: List All Tickets with Pagination
    public function indexPublic(Request $request)
    {
        $perPage = $request->input('per_page', 15);
        
        // Order by status priority: Aberto and Em Andamento first, then Resolvido/Rejeitado last
        $tickets = Ticket::orderByRaw("
            CASE 
                WHEN status = 'Aberto' THEN 1
                WHEN status = 'Em Andamento' THEN 2
                WHEN status = 'Rejeitado' THEN 3
                WHEN status LIKE 'Fechado%' THEN 4
                WHEN status = 'Resolvido' THEN 5
                ELSE 6
            END
        ")
        ->orderBy('created_at', 'desc')
        ->paginate($perPage);

        return response()->json($tickets);
    }

    // Admin: List All Tickets
    public function index()
    {
        // Order by status priority: Aberto and Em Andamento first, then Resolvido/Rejeitado last
        $tickets = Ticket::orderByRaw("
            CASE 
                WHEN status = 'Aberto' THEN 1
                WHEN status = 'Em Andamento' THEN 2
                WHEN status = 'Rejeitado' THEN 3
                WHEN status LIKE 'Fechado%' THEN 4
                WHEN status = 'Resolvido' THEN 5
                ELSE 6
            END
        ")
        ->orderBy('created_at', 'desc')
        ->get();

        return response()->json($tickets);
    }

    // Admin: Update Status/Deadline
    public function update(Request $request, $uuid)
    {
        $ticket = Ticket::where('uuid', $uuid)->firstOrFail();

        $request->validate([
            'status' => 'sometimes|in:Aberto,Em Andamento,Resolvido,Rejeitado',
            'deadline' => 'sometimes|date',
        ]);

        $ticket->update($request->only(['status', 'deadline']));

        return response()->json($ticket);
    }

    // Client: Update Own Ticket (only if status is Aberto)
    public function updateClient(Request $request, $uuid)
    {
        $ticket = Ticket::where('uuid', $uuid)->firstOrFail();

        // Only allow editing if ticket is still open
        if ($ticket->status !== 'Aberto') {
            return response()->json(['message' => 'Cannot edit ticket that is not open'], 403);
        }

        $request->validate([
            'title' => 'sometimes|string|max:255',
            'description' => 'sometimes|string',
            'reason' => 'sometimes|string',
            'urgency' => 'sometimes|in:Baixa,Média,Alta',
        ]);

        $ticket->update($request->only(['title', 'description', 'reason', 'urgency']));

        return response()->json($ticket);
    }

    // Client: Delete Own Ticket
    public function destroyClient($uuid)
    {
        $ticket = Ticket::where('uuid', $uuid)->firstOrFail();
        $ticket->delete();

        return response()->json(['message' => 'Ticket deleted successfully']);
    }

    // Admin: Delete Ticket
    public function destroy($uuid)
    {
        $ticket = Ticket::where('uuid', $uuid)->firstOrFail();
        $ticket->delete();

        return response()->json(['message' => 'Ticket deleted successfully']);
    }

    // Get all comments for a ticket
    public function getComments($uuid)
    {
        $comments = TicketComment::where('ticket_uuid', $uuid)
            ->orderBy('created_at', 'asc')
            ->get();

        return response()->json($comments);
    }

    // Add a comment to a ticket
    public function addComment(Request $request, $uuid)
    {
        $request->validate([
            'message' => 'required|string',
            'sender_name' => 'required|string',
            'sender_type' => 'required|in:client,admin',
        ]);

        $comment = TicketComment::create([
            'ticket_uuid' => $uuid,
            'message' => $request->message,
            'sender_name' => $request->sender_name,
            'sender_type' => $request->sender_type,
        ]);

        return response()->json($comment, 201);
    }
}
