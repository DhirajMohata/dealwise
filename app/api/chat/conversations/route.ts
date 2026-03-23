import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { supabase } from "@/lib/supabase";

// GET: list user's conversations
export async function GET() {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { data, error } = await supabase
    .from('chat_conversations')
    .select('*')
    .eq('user_email', session.user.email)
    .order('updated_at', { ascending: false })
    .limit(50);

  if (error) return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  return NextResponse.json(data || []);
}

// POST: create new conversation
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const body = await request.json();
  const { contractId, contractSnippet, contractText, title } = body;

  const { data, error } = await supabase
    .from('chat_conversations')
    .insert({
      user_email: session.user.email,
      contract_id: contractId || null,
      contract_snippet: contractSnippet || null,
      contract_text: contractText || null,
      title: title || 'New Chat',
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: "Failed to create" }, { status: 500 });
  return NextResponse.json(data);
}

// DELETE: delete a conversation
export async function DELETE(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { id } = await request.json();
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  await supabase
    .from('chat_conversations')
    .delete()
    .eq('id', id)
    .eq('user_email', session.user.email);

  return NextResponse.json({ success: true });
}
