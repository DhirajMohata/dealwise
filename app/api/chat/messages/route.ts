import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { supabase } from "@/lib/supabase";

// GET: load messages for a conversation
export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const conversationId = request.nextUrl.searchParams.get('conversationId');
  if (!conversationId) return NextResponse.json({ error: "Missing conversationId" }, { status: 400 });

  // Verify user owns this conversation
  const { data: conv } = await supabase
    .from('chat_conversations')
    .select('user_email')
    .eq('id', conversationId)
    .single();

  if (!conv || conv.user_email !== session.user.email) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { data, error } = await supabase
    .from('chat_messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });

  if (error) return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  return NextResponse.json(data || []);
}

// POST: save a message
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { conversationId, role, content } = await request.json();
  if (!conversationId || !role || !content) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  // Verify user owns this conversation
  const { data: conv } = await supabase
    .from('chat_conversations')
    .select('user_email')
    .eq('id', conversationId)
    .single();

  if (!conv || conv.user_email !== session.user.email) {
    return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
  }

  const { data, error } = await supabase
    .from('chat_messages')
    .insert({ conversation_id: conversationId, role, content })
    .select()
    .single();

  // Update conversation's updated_at and title (from first user message)
  if (!error) {
    const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (role === 'user') {
      // Set title from first user message if title is still default
      const { data: conv } = await supabase
        .from('chat_conversations')
        .select('title')
        .eq('id', conversationId)
        .single();
      if (conv?.title === 'New Chat') {
        updateData.title = content.slice(0, 60).trim();
      }
    }
    await supabase
      .from('chat_conversations')
      .update(updateData)
      .eq('id', conversationId);
  }

  if (error) return NextResponse.json({ error: "Failed to save" }, { status: 500 });
  return NextResponse.json(data);
}
